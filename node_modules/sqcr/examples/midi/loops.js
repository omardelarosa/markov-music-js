// Edit this file while running the server to update loops in real time

// Resets pulse to start loops together
pulse = 0;

loop('pulse', async ctx => {
    pulse++;
    ctx.sleep(t / 4);
});

loop('synth', async ctx => {
    let i = pulse % 4;

    synth()
        .playnote(notes[i], 1, { velocity: 0.3 })
        .stopnote(notes[i], 1, { time: '+100' });

    ctx.sleep(t / 4);
});

loop('kicks', async ctx => {
    if (!kicks[pulse % 16]) return ctx.sleep(t / 4);

    // play kick beat
    tr()
        .playnote(36, 1, { velocity: 0.9 })
        .stopnote(36, 1, { time: '+100' });

    ctx.sleep(t / 4);
});

loop('hats', async ctx => {
    if (!hats[pulse % 16]) return ctx.sleep(t / 4);

    tr()
        .playnote(42, 1, { velocity: 0.4 })
        .stopnote(42, 1, { time: '+100' });

    ctx.sleep(t / 4);
});

loop('snares', async ctx => {
    if (!snares[pulse % 16]) return ctx.sleep(t / 4);

    tr()
        .playnote(38, 1, { velocity: 0.4 })
        .stopnote(38, 1, { time: '+100' });

    ctx.sleep(t / 4);
});
