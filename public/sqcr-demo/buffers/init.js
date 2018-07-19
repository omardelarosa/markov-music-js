setTempo(60);
sqcr.stop();

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

kicks = [
    fmt('4040 0000 0004 0000'),
    fmt('4000 0040 0040 0000'),
    // fmt('4020 0000 4000 0000'),
    // fmt('4020 0010 4020 0020'),
    // fmt('4030 0020 4020 1000')
];

kick_pattern = _sample(kicks);

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
    fmt('0000 4000 0000 4000'),
    // fmt('0100 4000'),
    // fmt('1000 4000'),
    // fmt('0100 4100'),
    // fmt('0001 3011'),
];

snares_pattern = _sample(snares);

LETTERS = 'ABCDEFG';

KEY = ['F4', 'major'];

makeScale = note => Tonal.scale(KEY[1]).map(Tonal.transpose(note));

noteParse = note => {
    const parts = note.split('');
    let letter;
    let isSharp = false;
    let oct = 0;
    // Has flat
    if (parts.length === 3) {
        let idx = LETTERS.indexOf(parts[0]);
        if (idx === -1) throw new Error('Invalid note: ' + note);
        else if (idx === 0) {
            idx = LETTERS.length - 1;
        } else {
            idx = idx - 1;
        }
        letter = LETTERS[idx];
        isSharp = true;
        oct = parseInt(parts[2]);
    } else {
        letter = parts[0];
        oct = parseInt(parts[1]);
    }
    return {
        note: letter + (isSharp ? '#' : ''),
        oct,
    };
};

// Make an array of notes
scale = [
    ...makeScale('F3'),
    ...makeScale('F4'),
    ...makeScale('F5'),
    ...makeScale('F6'),
];
chords = [0, 3, 4, 3, 2];
chord = 0;
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
