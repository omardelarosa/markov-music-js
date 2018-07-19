// SQCR.OSC = osc;
// SQCR.MIDI = WebMidi;

// sqcr = new SQCR();

function sqcrToggle() {
    if (sqcr.hasStopped) {
        sqcr.start();
    } else {
        sqcr.stop();
    }
}
