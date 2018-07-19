colorLoopMapping = {
    synth: 3,
    leadSynth: 1,
    kicks: 2,
    hats: 0,
    snares: 4,
};

loop('levels', async ctx => {
    LOOPS.forEach(l => {
        // Update levels of each track
        LEVELS[l] = MC_LEVELS.next();
    });

    // Every measure
    ctx.sleep(M * 4);
});

loop('synth', async ctx => {
    // Update chord state
    chordId = MC_CHORDS.next();
    chordNotes = chordNotesOf(chordId);

    chordNotes.forEach(n => {
        const dur = 4 * 1000;
        playInst(synth, n, dur);
        const scaleNote = scale.indexOf(n) % 8;
        // Visualizer.blink(
        //     `/blink/${scaleNote}/${pulse}/${colorLoopMapping[ctx.name]}/${dur}`,
        // );
        for (let i = 0; i < 16; i++) {
            Visualizer.blink(
                `/blink/${scaleNote}/${i}/${colorLoopMapping[ctx.name]}/${dur}`,
            );
        }
    });

    ctx.sleep((M / 1) * 1);
});

since = Date.now();

loop('leadSynth', async ctx => {
    const pulse = beatFromTick(ctx.tick);
    const chordOffset = MC_CHORDS.peekID();
    const mNote = melody[pulse] + chordOffset;
    const scaleNote = scale[mNote]; // octave scaled
    if (LEVELS[ctx.name]) {
        Visualizer.blink(
            `/blink/${mNote % 8}/${pulse}/${colorLoopMapping[ctx.name]}/100`,
        );
        playInst(leadSynth, scaleNote, 100);
        ctx.sleep(T / 4);
    } else {
        playInst(leadSynth, scaleNote, 100);
        ctx.sleep(T / 2);
    }
});

loop('blinker', async ctx => {
    const pulse = beatFromTick(ctx.tick);
    for (let i = 0; i < 8; i++) {
        Visualizer.blink(`/blink/${i}/${pulse}/0/${sqcr.tickToMS() * (T / 4)}`);
    }
    ctx.sleep(T / 4);
});

loop('kicks', async ctx => {
    const pulse = beatFromTick(ctx.tick);
    // Switch pattern on the 0
    if (pulse === 0) MC_KICKS.next();
    if (!MC_KICKS.peek()[pulse]) return ctx.sleep(T / 4);

    // Play kick beat
    playInst(sampler, NOTE_KICK);

    ctx.sleep(T / 4);
});

loop('hats', async ctx => {
    hats_pattern = hats[MC_HATS.peekID()];
    max = hats_pattern[1];
    t = hats_pattern[0];

    // Never muted
    playInst(sampler, NOTE_HAT);

    // Visualizer
    for (let i = 0; i < 8; i++) {
        Visualizer.blink(`/blink/${i}/${h_counter}/2/${sqcr.tickToMS() * t}`);
    }

    if (h_counter >= max - 1) {
        MC_HATS.next();
        h_counter = 0;
    } else {
        h_counter++;
    }

    ctx.sleep(t);
});

loop('snares', async ctx => {
    const pulse = beatFromTick(ctx.tick);
    // // Switch pattern on the 0
    if (pulse % 8 === 0) MC_SNARES.next();
    if (!MC_SNARES.peek()[pulse] || !LEVELS[ctx.name]) return ctx.sleep(T / 4);
    playInst(sampler, NOTE_CLAP);
    ctx.sleep(T / 4);
});

loop('vocals', async ctx => {
    playInst(sampler, _sample(DRAKE), 8 * 1000);
    ctx.sleep(M * 4);
});

// Init dataviz
window.initViz();
