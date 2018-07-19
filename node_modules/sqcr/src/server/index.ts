import * as path from 'path';
import * as express from 'express';
import * as WebSocket from 'ws';
import * as fs from 'fs';
import { isEmpty } from 'lodash';

import { rootRenderer, Renderer } from './renderer';
import defaultTemplate from '../templates/default.html';
import { ASCII_TEXT } from '../templates/ascii';

// Non-TS modules
const MidiClock = require('midi-clock');
const watch = require('node-watch');
const clc = require('cli-color');

const debug = require('debug');

// DEBUGGERS
const D_BEAT = debug('beat');
const D_FILE = debug('file');
const D_SERVER = debug('server');

let osc;
let clock;
let clockIsRunning = false;
let fileChangesHashMap = {};
let configFileUsed;

// TODO: avoid loading the entire file into memory
const loadFile = fileparts =>
    fs.readFileSync(path.join(...fileparts)).toString();

// Libraries
const DEFAULT_LIBS = [
    '/node_modules/webmidi/webmidi.min.js',
    '/lib/browser.js',
    '/node_modules/osc/dist/osc-browser.js',
    '/node_modules/tonal/build/transpiled.js',
    '/node_modules/tone/build/Tone.min.js',
];

const getIPAddresses = () => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    const ipAddresses = [];

    for (let deviceName in interfaces) {
        const addresses = interfaces[deviceName];
        for (let i = 0; i < addresses.length; i++) {
            const addressInfo = addresses[i];
            if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

const sendMIDIBeat = async socket => {
    socket.send({
        address: '/midi/beat',
    });
};

const sendMIDITick = async socket => {
    socket.send({
        address: '/midi/tick',
    });
};

const readFileChanges = async socket => {
    if (!osc) return;
    if (isEmpty(fileChangesHashMap)) return;
    const packets = [];
    for (let f in fileChangesHashMap) {
        D_FILE('Detected change in buffer: ', f);
        packets.push({
            address: `/buffer/${f}`,
        });
    }
    // Clearing map
    socket.send({
        timeTag: osc.timeTag(0),
        packets,
    });

    fileChangesHashMap = {};
};

const stopClock = c => {
    if (clockIsRunning) {
        c.stop();
        clockIsRunning = false;
    }
};

const startClock = c => {
    if (!c) {
        clock = MidiClock();
        c = clock;
    }
    c.start();
    clockIsRunning = true;
};

const updateBpm = (c, bpm) => {
    if (c && clockIsRunning) {
        c.setTempo(bpm);
    }
};

interface ServerOptions {
    libs: string[];
    serverPath: string;
    port: number;
    rendererPath?: string;
    locals: Record<string, string | number>;
}

type ConfigFile = Partial<ServerOptions>;

const loadConfig = (pathToFile: string): ConfigFile => {
    let config = {};
    if (!pathToFile) {
        const defaultPath = path.join(process.cwd(), 'sqcr.json');
        // Try to load default config
        try {
            const configFileData = fs.readFileSync(defaultPath);
            const configJson = JSON.parse(configFileData.toString());
            config = configJson;
            configFileUsed = defaultPath;
        } catch (e) {
            // No config file found.  Ingnore error
        }
        return config;
    }

    try {
        const configFileData = fs.readFileSync(pathToFile);
        const configJson = JSON.parse(configFileData.toString());
        config = configJson;
        configFileUsed = pathToFile;
    } catch (e) {
        console.warn('Could not read config file: ' + pathToFile);
        console.log(e.message);
        console.log(e.stack);
    }

    return config;
};

const loadRenderer = (pathToFile: string): Renderer => {
    let renderer = defaultTemplate;
    if (!pathToFile) {
        // Silently use default renderer when no other is provided.
        return renderer;
    }

    try {
        renderer = require(path.join(process.cwd(), pathToFile));
        if (!renderer || typeof renderer !== 'function') {
            throw new Error(
                `Render file ${pathToFile} does not export a function.`,
            );
        }
    } catch (e) {
        console.warn('Could not read renderer from config file!');
        console.log(e.message);
        console.log(e.stack);
    }

    return renderer;
};

interface ServerInitOptions {
    port: number;
    serverPath?: string;
    currentDir?: string;
    buffers?: string;
    init?: string; // TODO: remove
    useServerClock: boolean;
    configPath: string;
    isLive: boolean;
}

// Create an Express-based Web Socket server to which OSC messages will be relayed.
export function startServer(opts: ServerInitOptions) {
    const {
        port = 8081,
        serverPath,
        currentDir,
        buffers,
        useServerClock,
        configPath,
        isLive,
    } = opts;

    const b = buffers || 'public/_buffers';
    const config = loadConfig(configPath);
    const renderer = loadRenderer(config.rendererPath);
    const SERVER_PATH = path.resolve(config.serverPath || serverPath);
    const BUFFERS_LOCATION = path.join(SERVER_PATH, b);
    const USE_SERVER_CLOCK = useServerClock;
    const CONFIG_BROWSER_LOCALS = config.locals || {};
    const IS_LIVE = isLive;

    const options: ServerOptions = {
        port: config.port || port,
        serverPath: SERVER_PATH,
        libs: config.libs || DEFAULT_LIBS,
        locals: config.locals || {},
    };

    console.log(ASCII_TEXT);

    D_SERVER('Starting server in: ', options.serverPath);
    D_SERVER('Using config file: %s', configFileUsed);
    D_SERVER('Using options: %o', options);

    if (!serverPath) throw new Error('Invalid root path!');

    let udpPort;

    if (IS_LIVE) {
        osc = require('osc');
        // Bind to a UDP socket to listen for incoming OSC events.
        udpPort = new osc.UDPPort({
            localAddress: '0.0.0.0',
            localPort: 57121,
        });

        udpPort.on('ready', () => {
            var ipAddresses = getIPAddresses();
            const msgParts = ['OSC over UDP host: '];
            ipAddresses.forEach(address => {
                msgParts.push(
                    clc.cyanBright(address + ':' + udpPort.options.localPort),
                );
            });
            console.log(...msgParts);
            console.log(
                'browser host: ',
                clc.cyanBright(`http://localhost:${port}`),
            );
            console.log('loops path: ', clc.cyanBright(`${buffers}`));
        });

        udpPort.open();
    }

    // Create an Express-based Web Socket server to which OSC messages will be relayed.
    const appResources = serverPath;
    // const nodeModules = path.join(__dirname, '..', '..', 'node_modules');
    const libPath = path.join(__dirname, '..', '..', 'lib');

    const app = express();
    const server = app.listen(port);

    let wss;

    if (IS_LIVE) {
        wss = new WebSocket.Server({
            server: server,
        });
    }

    app.use(express.json()); // Support JSON post body

    // static libs -- ignores index.html to avoid accidental rendering
    app.use('/', express.static(appResources, { index: false }));

    // Serve node_modules for libs, etc
    // app.use('/node_modules/', express.static(nodeModules));

    // Serve src for libs, etc
    app.use('/lib/', express.static(libPath));

    // fall back to example example page
    app.get('/', (req, res) => {
        const libs = options.libs || DEFAULT_LIBS;
        res.send(
            rootRenderer(
                {
                    BUFFER_PATH: b,
                    USE_SERVER_CLOCK,
                    ASCII_TEXT,
                    ...CONFIG_BROWSER_LOCALS, // Mixin user-provided local vars
                },
                libs,
                renderer,
            ),
        );
    });

    app.post('/startClock', (req, res) => {
        startClock(clock);
        res.send({ status: 'success' });
    });

    app.post('/stopClock', (req, res) => {
        stopClock(clock);
        res.send({ status: 'success' });
    });

    app.post('/updateBpm', (req, res) => {
        const { bpm } = req.body || { bpm: 120 };
        updateBpm(clock, bpm);
        D_BEAT('Tempo updated to: %d', bpm);
        res.send({ status: 'success' });
    });

    if (IS_LIVE) {
        wss.on('connection', socket => {
            if (!IS_LIVE) return;
            D_SERVER('A browser client has connected via WebSockets!');
            var socketPort = new osc.WebSocketPort({
                socket: socket,
            });

            var relay = new osc.Relay(udpPort, socketPort, {
                raw: true,
            });

            startClock(clock);

            const beatCallback = position => {
                const microPos = position % 24; // 24 ticks per event
                if (USE_SERVER_CLOCK) {
                    sendMIDITick(socketPort).catch(e => unbindCallback());
                }
                if (microPos === 0) {
                    // TODO: better handle closing of browser tabs
                    if (USE_SERVER_CLOCK) {
                        D_BEAT('Beat: %d', position / 24);
                        sendMIDIBeat(socketPort).catch(e => unbindCallback());
                    }
                    readFileChanges(socketPort).catch(e => unbindCallback());
                }
            };

            const unbindCallback = () => {
                clock.removeListener('position', beatCallback);
            };

            clock.on('position', beatCallback);
        });

        watch(`${BUFFERS_LOCATION}`, { recursive: false }, (evt, name) => {
            const bufferName = name.replace(options.serverPath, '');
            D_FILE('%s changed.', bufferName);
            fileChangesHashMap[bufferName] = true;
        });
    } else {
        console.log(
            'browser host: ',
            clc.cyanBright(`http://localhost:${port}`),
        );
        console.log('loops path: ', clc.cyanBright(`${buffers}`));
    }
}
