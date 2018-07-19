const path = require('path');

const startServer = require('./lib/server').startServer;

const SQCR = (input, flags) => {
    const serverPath = flags.path || process.cwd(); // Default to location process call
    const currentDir = __dirname;
    const port = flags.port;
    const buffers = input[0] || flags.buffers;
    const isLive = flags.live === undefined ? true : !!flags.live;
    const configPath = flags.config
        ? path.join(process.cwd(), flags.config)
        : '';
    const initFileName = flags.init || 'init.js';
    const useServerClock = flags.clock === undefined ? false : !!flags.browser;
    startServer({
        port,
        serverPath,
        currentDir,
        buffers,
        init: initFileName,
        useServerClock,
        configPath,
        isLive,
    });
};

module.exports = SQCR;
