## sqcr

a command-line sequencer 

```
 ______     ______     ______     ______
/\  ___\   /\  __ \   /\  ___\   /\  == \
\ \___  \  \ \ \/\_\  \ \ \____  \ \  __<
 \/\_____\  \ \___\_\  \ \_____\  \ \_\ \_\
  \/_____/   \/___/_/   \/_____/   \/_/ /_/

```

## Installation

```bash
npm install -g sqcr

sqcr buffers_path/
```

## Buffers
A buffer is a plain JS file to be evaluated in the browser in the sqcr context.  This context has a few helper functions outlined in the [Browser API]('#browser-api') section below.

You can use buffers to define loops.  Loops can play sounds or draw things in the browser or whatever you want synchronized to a clock.

You can even receive OSC events and respond to them accordingly.

## CLI
```
    Usage: 
        $ scqr <buffers-path>

    Options:
        --buffers, -bf  specify location of buffer.js files
        --port, -p      specify port number
        --bpm, -b       initial BPM
        --path, -d      specify root path of server
        --init, -i      specify init file name
```

## Browser API

### Libraries
A few libraries are already included in the browser context:

[OSC.js](https://github.com/colinbdclark/osc.js/) - For interacting with OSC events.

[WebMidi](https://github.com/djipco/webmidi) - For Interacting with MIDI

[Tonal](https://github.com/danigb/tonal) - For music/note transformation tasks

### Loops

Define loops to 

```typescript
loop(name: string, callback: (ctx: Loop) => void)
```

Example:

```javascript

// watchable_loops_dir/something.js

loop('quarterNotes', async (ctx) => {

    playNote(440);

    ctx.sleep(T);
});

```

### OSC Responder
COMING SOON...


### Examples

To run examples, clone this repo to your file system and run:

```
# MIDI example
./sqcr-cli.js examples/midi

# WebAudio example
./sqcr-cli.js examples/webaudio
```


## TODO
- Add more browser-utility methods
- Add better web-audio support
- Improve timing precision (it's about ~3-5 ms margin of error on each beat as of now)
- Configurable browser libraries
- TypeScript
