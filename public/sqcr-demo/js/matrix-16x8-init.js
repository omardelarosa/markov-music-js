setTempo(60);

// Global pulse counter
pulse = 0;

// Format pattern shorthand
fmt = s =>
    s
        .replace(/\s/g, '')
        .split('')
        .map(Number);
// Random element from arr
_sample = arr => arr[parseInt(Math.random() * arr.length)];

// Utility for generating infinite counters
nextOf = max => {
    let i = 0;
    return () => {
        return ++i % max;
    };
};

beatFromTick = t => Math.floor((t / (T / 4)) % 16);
tickToMS = t => SQCR.Transport.cl;
expectedMS = ticks => sqcr.tickToMS() * ticks;

next4 = nextOf(4);

LOOPS = ['synth', 'leadSynth', 'kicks', 'snares', 'hats', 'vocals'];
LEVELS = {
    synth: 1,
    leadSynth: 1,
    kicks: 1,
    snares: 0,
    hats: 1,
    vocals: 1,
};

MC_LEVELS = new MarkovChain(
    {
        '1': [1, 1, 1, 0, 0],
        '0': [0, 0, 1, 1, 1],
    },
    [1, 0],
    1,
);

kicks = [
    fmt('4000 0000 0040 0000'),
    fmt('4020 0000 4000 0000'),
    fmt('4023 0010 4020 0000'),
    fmt('4030 0020 4020 1000'),
];

MC_KICKS = new MarkovChain(
    {
        '0': [0, 1, 0, 2],
        '1': [0],
        '2': [1, 0, 3],
        '3': [0],
    },
    kicks,
    0,
);

hats = [
    [M / 16, 4],
    [M / 12, 3],
    [M / 24, 6],
    [M / 32, 4],
    [M / 48, 6],
    [M / 64, 8],
];

// Create markov chain for hats
MC_HATS = new MarkovChain(
    {
        '0': [0, 0, 0, 0, 0, 0, 1, 2, 3, 4],
        '1': [0, 0, 0, 3],
        '2': [0, 0, 0, 3],
        '3': [2, 5],
        '4': [2, 3, 4, 1],
        '5': [3, 2, 4, 2, 2],
    },
    hats,
    0,
);

// Keeps track of hi-hat hits (or tick substate)
h_counter = 0;

snares = [
    fmt('0000 4000'),
    fmt('0100 4000'),
    fmt('1000 4000'),
    fmt('0100 4100'),
    fmt('0001 3001'),
];

MC_SNARES = new MarkovChain(
    {
        '0': [0, 0, 0, 0, 1, 2, 3],
        '1': [0, 0, 1],
        '2': [1, 0, 4, 3],
        '3': [0],
        '4': [0],
    },
    snares,
    0,
);

LETTERS = 'ABCDEFG';

KEY = ['F4', 'major'];

makeScale = note => Tonal.scale(KEY[1]).map(Tonal.transpose(note));

// Make an array of notes
scale = [
    ...makeScale('F3'),
    ...makeScale('F4'),
    ...makeScale('F5'),
    ...makeScale('F6'),
];

chordNotesOf = deg => [
    scale[deg],
    scale[deg + 2],
    scale[deg + 4],
    scale[deg + 6],
];

chords = [0, 1, 2, 3, 4, 5, 6, 7, 8];

MC_CHORDS = new MarkovChain(
    {
        '0': [4],
        '1': [7],
        '2': [1],
        '3': [2, 2, 4, 4, 0],
        '4': [3, 3, 6, 6, 0],
        '7': [2, 5],
        '5': [1, 6],
        '6': [2],
    },
    chords,
    0,
);

melody = [];

for (let i = 0; i < 16; i++) {
    melody.push(Math.round(Math.random() * 16) % 8);
}

console.log('melody', melody);

notes = [0, 2, 4, 6];

// Get MIDI outputs
NOTE_KICK = 'A0';
NOTE_SNARE = 'A1';
NOTE_HAT = 'A2';
NOTE_CLAP = 'B1';

DRAKE = ['C2', 'D2', 'E2', 'F2', 'G2'];
THUG = ['C3', 'D3', 'E4'];

playInst = (inst, note, dur = 50) => {
    let timer;
    try {
        inst.triggerAttack(note);
        timer = setTimeout(() => {
            inst.triggerRelease(note);
        }, dur);
    } catch (e) {
        clearTimeout(timer);
        console.log('Instrument error!', e.message);
    }
};
