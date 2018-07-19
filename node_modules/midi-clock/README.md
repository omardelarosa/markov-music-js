midi-clock
===

Creates a virtual midi clock ticking at 24 PPQ

## Install

```bash
$ npm install midi-clock
```

## Example

```js
var MidiClock = require('midi-clock')

// in node just do this (uses process.hrtime):
var clock = MidiClock()

// in browser
var audioContext = new webkitAudioContext()
var clock = MidiClock(audioContext)

clock.start()

clock.on('position', function(position){

  // log on each beat, ignore the rest
  var microPosition = position % 24
  if (microPosition === 0){
    console.log('Beat:', position / 24)
  }

})

setTimeout(function(){
  // change to 120bpm after 10 seconds
  clock.setTempo(120)
}, 10000)

```