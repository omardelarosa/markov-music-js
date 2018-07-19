// Edit this file while running the server to update loops in real time

colorLoopMapping = {
    synth: 3,
    leadSynth: 1,
    kicks: 2,
    hats: 0,
    snares: 4,
};

loop('synth', async ctx => {
    // // Update chord state
    chord = chords[next4()];
    const chr = notes.map(n => scale[n + chord]);
    chr.forEach(n => {
        const dur = 2 * 1000;
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

    ctx.sleep((M / 1) * 2);
});

since = Date.now();

loop('leadSynth', async ctx => {
    const pulse = beatFromTick(ctx.tick);
    const n = _sample(
        notes.map(n => {
            return scale[n + chord];
        }),
    );
    const now = Date.now();
    console.log('since', now - since);
    since = now;
    const scaleNote = scale.indexOf(n) % 8;
    Visualizer.blink(
        `/blink/${scaleNote}/${pulse}/${colorLoopMapping[ctx.name]}/100`,
    );
    // console.log('N', scale.indexOf(n));
    playInst(leadSynth, n, 100);
    ctx.sleep(T / 4);
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
    if (pulse === 0) kick_pattern = _sample(kicks);
    if (!kick_pattern[pulse]) return ctx.sleep(T / 4);

    // Play kick beat
    playInst(sampler, NOTE_KICK);

    ctx.sleep(T / 4);
});

loop('hats', async ctx => {
    hats_pattern = hats[MC.get('HATS')];
    max = hats_pattern[1];
    t = hats_pattern[0];

    playInst(sampler, NOTE_HAT);

    // Visualizer
    for (let i = 0; i < 8; i++) {
        Visualizer.blink(`/blink/${i}/${h_counter}/2/${sqcr.tickToMS() * t}`);
    }

    if (h_counter >= max - 1) {
        MC.set('HATS');
        h_counter = 0;
    } else {
        h_counter++;
    }

    ctx.sleep(t);
});

loop('snares', async ctx => {
    const pulse = beatFromTick(ctx.tick);
    // // Switch pattern on the 0
    if (pulse === 0) snares_pattern = _sample(snares);
    if (!snares_pattern[pulse]) return ctx.sleep(T / 4);
    playInst(sampler, NOTE_CLAP);
    ctx.sleep(T / 4);
});
