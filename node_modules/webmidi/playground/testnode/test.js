// The `web-midi-api` module takes care of importing the `jazz-midi` module (which needs to be
// installed) and the WebMIDIAPI shim (which is already part of `web-midi-api`).
global.navigator = require('web-midi-api');

// WebMidi.js depends on the browser's performance.now() so we fake it with the `performance-now`
// Node module (which is installed as a dependency of `web-midi-api`).
global.performance = { now: require('performance-now') };

// To use WebMidi.js, you then simply need to require it.
var WebMidi = new require('webmidi');

// Usual stuff
WebMidi.enable(function (err) {

  if (err) return console.log("WebMidi could not be enabled.", err);
  console.log("WebMidi enabled!");

  console.log("*** Inputs:");

  WebMidi.inputs.forEach((o) => {
    console.log(o.name)

    o.addListener('noteon',  "all", (event) => {
      console.log(event.note)
    });

  });

  console.log("*** Outputs:");

  WebMidi.outputs.forEach( (o) => {
    console.log(o.name);
    o.playNote("G3")
  });

});
