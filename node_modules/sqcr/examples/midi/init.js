setTempo(60);

// Global pulse counter
pulse = 1;

// Format pattern shorthand
fmt = (s) => s.replace(/\s/g,'').split('').map(Number);

kicks =     fmt('1000 0010 0001 0010');
hats =      fmt('1111 1111 1111 1111');
snares =    fmt('0000 1000 0000 1000');

// Make an array of notes
notes = [
    'C4',
    'E4',
    'G4',
    'C5',
    'G5',
    'E5'
];

// Get MIDI outputs

// TR-08 - External USB device
TR = () => getOutputs()[2];

// D-05 - External USB device
SYNTH = () => getOutputs()[3];

// Define loops once on init
bufferQueue.push(`${BUFFER_PATH}/loops.js`);
