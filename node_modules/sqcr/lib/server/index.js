"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var express = require("express");
var WebSocket = require("ws");
var fs = require("fs");
var lodash_1 = require("lodash");
var renderer_1 = require("./renderer");
var default_html_1 = require("../templates/default.html");
var ascii_1 = require("../templates/ascii");
var MidiClock = require('midi-clock');
var watch = require('node-watch');
var clc = require('cli-color');
var debug = require('debug');
var D_BEAT = debug('beat');
var D_FILE = debug('file');
var D_SERVER = debug('server');
var osc;
var clock;
var clockIsRunning = false;
var fileChangesHashMap = {};
var configFileUsed;
var loadFile = function (fileparts) {
    return fs.readFileSync(path.join.apply(path, fileparts)).toString();
};
var DEFAULT_LIBS = [
    '/node_modules/webmidi/webmidi.min.js',
    '/lib/browser.js',
    '/node_modules/osc/dist/osc-browser.js',
    '/node_modules/tonal/build/transpiled.js',
    '/node_modules/tone/build/Tone.min.js',
];
var getIPAddresses = function () {
    var os = require('os');
    var interfaces = os.networkInterfaces();
    var ipAddresses = [];
    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];
        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];
            if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }
    return ipAddresses;
};
var sendMIDIBeat = function (socket) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        socket.send({
            address: '/midi/beat',
        });
        return [2];
    });
}); };
var sendMIDITick = function (socket) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        socket.send({
            address: '/midi/tick',
        });
        return [2];
    });
}); };
var readFileChanges = function (socket) { return __awaiter(_this, void 0, void 0, function () {
    var packets, f;
    return __generator(this, function (_a) {
        if (!osc)
            return [2];
        if (lodash_1.isEmpty(fileChangesHashMap))
            return [2];
        packets = [];
        for (f in fileChangesHashMap) {
            D_FILE('Detected change in buffer: ', f);
            packets.push({
                address: "/buffer/" + f,
            });
        }
        socket.send({
            timeTag: osc.timeTag(0),
            packets: packets,
        });
        fileChangesHashMap = {};
        return [2];
    });
}); };
var stopClock = function (c) {
    if (clockIsRunning) {
        c.stop();
        clockIsRunning = false;
    }
};
var startClock = function (c) {
    if (!c) {
        clock = MidiClock();
        c = clock;
    }
    c.start();
    clockIsRunning = true;
};
var updateBpm = function (c, bpm) {
    if (c && clockIsRunning) {
        c.setTempo(bpm);
    }
};
var loadConfig = function (pathToFile) {
    var config = {};
    if (!pathToFile) {
        var defaultPath = path.join(process.cwd(), 'sqcr.json');
        try {
            var configFileData = fs.readFileSync(defaultPath);
            var configJson = JSON.parse(configFileData.toString());
            config = configJson;
            configFileUsed = defaultPath;
        }
        catch (e) {
        }
        return config;
    }
    try {
        var configFileData = fs.readFileSync(pathToFile);
        var configJson = JSON.parse(configFileData.toString());
        config = configJson;
        configFileUsed = pathToFile;
    }
    catch (e) {
        console.warn('Could not read config file: ' + pathToFile);
        console.log(e.message);
        console.log(e.stack);
    }
    return config;
};
var loadRenderer = function (pathToFile) {
    var renderer = default_html_1.default;
    if (!pathToFile) {
        return renderer;
    }
    try {
        renderer = require(path.join(process.cwd(), pathToFile));
        if (!renderer || typeof renderer !== 'function') {
            throw new Error("Render file " + pathToFile + " does not export a function.");
        }
    }
    catch (e) {
        console.warn('Could not read renderer from config file!');
        console.log(e.message);
        console.log(e.stack);
    }
    return renderer;
};
function startServer(opts) {
    var _a = opts.port, port = _a === void 0 ? 8081 : _a, serverPath = opts.serverPath, currentDir = opts.currentDir, buffers = opts.buffers, useServerClock = opts.useServerClock, configPath = opts.configPath, isLive = opts.isLive;
    var b = buffers || 'public/_buffers';
    var config = loadConfig(configPath);
    var renderer = loadRenderer(config.rendererPath);
    var SERVER_PATH = path.resolve(config.serverPath || serverPath);
    var BUFFERS_LOCATION = path.join(SERVER_PATH, b);
    var USE_SERVER_CLOCK = useServerClock;
    var CONFIG_BROWSER_LOCALS = config.locals || {};
    var IS_LIVE = isLive;
    var options = {
        port: config.port || port,
        serverPath: SERVER_PATH,
        libs: config.libs || DEFAULT_LIBS,
        locals: config.locals || {},
    };
    console.log(ascii_1.ASCII_TEXT);
    D_SERVER('Starting server in: ', options.serverPath);
    D_SERVER('Using config file: %s', configFileUsed);
    D_SERVER('Using options: %o', options);
    if (!serverPath)
        throw new Error('Invalid root path!');
    var udpPort;
    if (IS_LIVE) {
        osc = require('osc');
        udpPort = new osc.UDPPort({
            localAddress: '0.0.0.0',
            localPort: 57121,
        });
        udpPort.on('ready', function () {
            var ipAddresses = getIPAddresses();
            var msgParts = ['OSC over UDP host: '];
            ipAddresses.forEach(function (address) {
                msgParts.push(clc.cyanBright(address + ':' + udpPort.options.localPort));
            });
            console.log.apply(console, msgParts);
            console.log('browser host: ', clc.cyanBright("http://localhost:" + port));
            console.log('loops path: ', clc.cyanBright("" + buffers));
        });
        udpPort.open();
    }
    var appResources = serverPath;
    var libPath = path.join(__dirname, '..', '..', 'lib');
    var app = express();
    var server = app.listen(port);
    var wss;
    if (IS_LIVE) {
        wss = new WebSocket.Server({
            server: server,
        });
    }
    app.use(express.json());
    app.use('/', express.static(appResources, { index: false }));
    app.use('/lib/', express.static(libPath));
    app.get('/', function (req, res) {
        var libs = options.libs || DEFAULT_LIBS;
        res.send(renderer_1.rootRenderer(__assign({ BUFFER_PATH: b, USE_SERVER_CLOCK: USE_SERVER_CLOCK,
            ASCII_TEXT: ascii_1.ASCII_TEXT }, CONFIG_BROWSER_LOCALS), libs, renderer));
    });
    app.post('/startClock', function (req, res) {
        startClock(clock);
        res.send({ status: 'success' });
    });
    app.post('/stopClock', function (req, res) {
        stopClock(clock);
        res.send({ status: 'success' });
    });
    app.post('/updateBpm', function (req, res) {
        var bpm = (req.body || { bpm: 120 }).bpm;
        updateBpm(clock, bpm);
        D_BEAT('Tempo updated to: %d', bpm);
        res.send({ status: 'success' });
    });
    if (IS_LIVE) {
        wss.on('connection', function (socket) {
            if (!IS_LIVE)
                return;
            D_SERVER('A browser client has connected via WebSockets!');
            var socketPort = new osc.WebSocketPort({
                socket: socket,
            });
            var relay = new osc.Relay(udpPort, socketPort, {
                raw: true,
            });
            startClock(clock);
            var beatCallback = function (position) {
                var microPos = position % 24;
                if (USE_SERVER_CLOCK) {
                    sendMIDITick(socketPort).catch(function (e) { return unbindCallback(); });
                }
                if (microPos === 0) {
                    if (USE_SERVER_CLOCK) {
                        D_BEAT('Beat: %d', position / 24);
                        sendMIDIBeat(socketPort).catch(function (e) { return unbindCallback(); });
                    }
                    readFileChanges(socketPort).catch(function (e) { return unbindCallback(); });
                }
            };
            var unbindCallback = function () {
                clock.removeListener('position', beatCallback);
            };
            clock.on('position', beatCallback);
        });
        watch("" + BUFFERS_LOCATION, { recursive: false }, function (evt, name) {
            var bufferName = name.replace(options.serverPath, '');
            D_FILE('%s changed.', bufferName);
            fileChangesHashMap[bufferName] = true;
        });
    }
    else {
        console.log('browser host: ', clc.cyanBright("http://localhost:" + port));
        console.log('loops path: ', clc.cyanBright("" + buffers));
    }
}
exports.startServer = startServer;
//# sourceMappingURL=index.js.map