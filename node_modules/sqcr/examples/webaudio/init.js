setTempo(60);

// Make an array of notes
notes = ['C4', 'E4', 'G4', 'C5', 'G5', 'E5'];

// Format pattern shorthand
fmt = s =>
    s
        .replace(/\s/g, '')
        .split('')
        .map(Number);

kicks = fmt('1000 0010 0001 0010');
hats = fmt('1111 1111 1111 1111');
snares = fmt('0000 1000 0000 1000');

NOTE_KICK = 'A0';
NOTE_SNARE = 'A1';
NOTE_HAT = 'A2';

synth = new Tone.PolySynth(6, Tone.Synth, {
    oscillator: {
        partials: [0, 2, 3, 4],
    },
}).toMaster();

sampler = new Tone.Sampler(
    {
        [NOTE_KICK]: 'BD.WAV', // Kick
        [NOTE_SNARE]: 'SD.WAV', // Snare
        [NOTE_HAT]: 'CH.WAV', // Closed Hats
    },
    {
        release: 1,
        baseUrl: '/examples/_wav/',
    },
).toMaster();

// Define loops once
sqcr.bufferQueue.push(`${BUFFER_PATH}/loops.js`);
