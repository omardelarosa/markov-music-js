// Edit this file while running the server to update loops in real time

// Resets pulse to start loops together
pulse = 0;

loop('pulse', async ctx => {
    pulse++;
    ctx.sleep(T / 4);
});

loop('synth', async ctx => {
    let i = pulse % 4;
    let n = notes[i];
    synth.triggerAttack(n);
    setTimeout(() => {
        synth.triggerRelease(n);
    }, 20);

    ctx.sleep(T / 4);
});

loop('kicks', async ctx => {
    if (!kicks[pulse % 16]) return ctx.sleep(T / 4);

    // play kick beat
    sampler.triggerAttack(NOTE_KICK);
    setTimeout(() => {
        sampler.triggerRelease(NOTE_KICK);
    }, 100);

    ctx.sleep(T / 4);
});

loop('hats', async ctx => {
    if (!hats[pulse % 16]) return ctx.sleep(T / 4);

    sampler.triggerAttack(NOTE_HAT);
    setTimeout(() => {
        sampler.triggerRelease(NOTE_HAT);
    }, 100);

    ctx.sleep(T / 4);
});

loop('snares', async ctx => {
    if (!snares[pulse % 16]) return ctx.sleep(T / 4);

    sampler.triggerAttack(NOTE_SNARE);
    setTimeout(() => {
        sampler.triggerRelease(NOTE_SNARE);
    }, 100);

    ctx.sleep(T / 4);
});
