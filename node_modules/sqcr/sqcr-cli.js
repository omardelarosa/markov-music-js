#!/usr/bin/env node
'use strict';

const meow = require('meow');
const sqcr = require('.');

const cli = meow(
    `
    Usage: 
        $ scqr <buffers-path>

    Options:
        --buffers, -bf  specify location of buffer.js files
        --port, -p      specify port number
        --bpm, -b       initial BPM
        --path, -d      specify root path of server
        --init, -i      init file name
        --clock, -sc    use server clock
        --config, -c    config file path
        --live, -l      enable live mode
`,
    {
        flags: {
            port: {
                type: 'number',
                alias: 'p',
            },
            bpm: {
                type: 'number',
                alias: 'b',
            },
            path: {
                type: 'string',
                alias: 'd',
            },
            buffers: {
                type: 'string',
                alias: 'bf',
            },
            init: {
                type: 'string',
                alias: 'i',
            },
            clock: {
                type: 'boolean',
                alias: 'sc',
            },
            config: {
                type: 'string',
                alias: 'c',
            },
            live: {
                type: 'boolean',
                alias: 'l',
            },
        },
    },
);

if (cli.flags.help || cli.flags.h || !cli.input[0]) {
    cli.showHelp();
} else {
    sqcr(cli.input, cli.flags);
}
