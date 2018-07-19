// Tone.js stuff
freeverb = new Tone.Freeverb({
    wet: 0.8,
    decay: '8n',
}).toMaster();

reverb = new Tone.Reverb({
    wet: 0.2,
    decay: '8n',
}).toMaster();

delay = new Tone.FeedbackDelay(0.1);

tremolo = new Tone.Tremolo(9, 0.75).toMaster().start();

feedbackDelay = new Tone.PingPongDelay({
    delayTime: '8n',
    feedback: 0.6,
    wet: 0.2,
}).toMaster();

synth = new Tone.PolySynth(6, Tone.Synth, {
    volume: 1,
    oscillator: {
        partials: [0, 2, 3, 4],
    },
})
    .set({
        filter: {
            type: 'highpass',
        },
        envelope: {
            attack: 0.1,
        },
    })
    // .chain(tremolo, freeverb)
    .toMaster();

leadSynth = new Tone.PolySynth(6, Tone.Synth, {
    oscillator: {
        partials: [0, 2, 3, 4],
    },
})
    .set({
        filter: {
            type: 'highpass',
        },
        envelope: {
            attack: 0.1,
        },
    })
    // .chain(delay, freeverb)
    // .connect(reverb)
    // .connect(feedbackDelay)
    .toMaster();

sampler = new Tone.Sampler(
    {
        [NOTE_KICK]: 'BD.WAV', // Kick
        [NOTE_SNARE]: 'SD.WAV', // Snare
        [NOTE_HAT]: 'CH.WAV', // Closed Hats
        [NOTE_CLAP]: 'CP.WAV', // Clap
        [DRAKE[0]]: 'hotline-1-4s.wav',
        [DRAKE[1]]: 'hotline-2-4s.wav',
        [DRAKE[2]]: 'hotline-3-7s.wav',
        [DRAKE[3]]: 'hotline-4-3.5s.wav',
        [DRAKE[4]]: 'hotline-5-3.5s.wav',
        [THUG[0]]: 'thug-01.wav',
        [THUG[1]]: 'thug-02.wav',
        [THUG[2]]: 'thug-03.wav',
    },
    {
        release: 1,
        baseUrl: '/public/samples/',
    },
)
    .connect(reverb)
    .toMaster();
