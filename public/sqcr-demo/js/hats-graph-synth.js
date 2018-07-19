var nodes = null;
var edges = null;
var network = null;
var selectedNodeId = 1;

var note = null;

var HATS = [
    [M / 16, 4],
    [M / 12, 3],
    [M / 24, 6],
    [M / 32, 4],
    [M / 48, 6],
    [M / 64, 8],
];

var HATS_STR = ['1/16', '1/12', '1/24', '1/32', '1/48', '1/64'];

var G = {
    '0': [0, 0, 0, 0, 0, 0, 1, 2, 3, 4],
    '1': [0, 0, 0, 3],
    '2': [0, 0, 0, 3],
    '3': [2, 5],
    '4': [2, 3, 4, 1],
    '5': [3, 2, 4, 2, 2],
};

var synth = new Tone.PolySynth(3, Tone.Synth, {
    oscillator: {
        type: 'amtriangle',
        harmonicity: 0.5,
        modulationType: 'sine',
    },
    envelope: {
        attackCurve: 'exponential',
        attack: 0.05,
        decay: 0.2,
        sustain: 0.2,
        release: 1.5,
    },
    portamento: 0.05,
}).toMaster();

var MC = new MarkovChain(G, HATS, 0);

// create an array with nodes
function makeNodes(obj, labels) {
    var nodeStyle = {
        font: {
            color: '#000000',
            face: 'sans-serif',
            size: 20,
        },
        color: {
            highlight: {
                border: '#ccfa99',
                background: '#faf099',
            },
        },
    };
    const ids = Object.keys(obj).map(Number);
    return ids.map(id => {
        return {
            id,
            value: obj[id].length, // how many edges
            label: labels[id],
            ...nodeStyle,
        };
    });
}

function makeEdges(obj) {
    const edgeOptions = {
        arrows: {
            to: {
                enabled: true,
            },
        },
        color: {
            highlight: '#99f9fa',
        },
    };

    const ids = Object.keys(obj).map(Number);
    const edges = [];

    // Make matrix
    ids.forEach(id => {
        let values = {};
        obj[id].forEach(edge => {
            if (!values[edge]) {
                values[edge] = 1;
            } else {
                values[edge] += 1;
            }
        });

        Object.keys(values).forEach(k => {
            edges.push({
                from: id,
                to: Number(k),
                value: values[k],
                ...edgeOptions,
            });
        });
    });

    return edges;
}

function draw() {
    nodes = makeNodes(G, HATS_STR);

    edges = makeEdges(G);

    // create a network
    var container = document.getElementById('graph');
    var data = {
        nodes: nodes,
        edges: edges,
    };
    var options = {
        nodes: {
            shape: 'dot',
            size: 10,
        },
    };
    network = new vis.Network(container, data, options);
}

draw();

network.fit(nodes.map(n => n.id));

network.selectNodes([MC.peekID()]);

// SQCR Stuff
setTempo(60);

// Get MIDI outputs
NOTE_HAT = 'A2';

sampler = new Tone.Sampler(
    {
        [NOTE_HAT]: 'CH.WAV', // Closed Hats
    },
    {
        release: 1,
        baseUrl: '/public/samples/',
    },
).toMaster();

h_counter = 0;

playInst = (inst, note, dur = 50) => {
    let timer;
    try {
        inst.triggerAttack(note);
    } catch (e) {
        console.log('Instrument error!', e.message);
    }
};

hats = [
    [M / 16, 4],
    [M / 12, 3],
    [M / 24, 6],
    [M / 32, 4],
    [M / 48, 6],
    [M / 64, 8],
];

loop('hats', async ctx => {
    hats_pattern = hats[MC.peekID()];
    max = hats_pattern[1];
    t = hats_pattern[0];

    playInst(sampler, NOTE_HAT);

    if (h_counter >= max - 1) {
        const nid = MC.nextID();
        network.selectNodes([nid]);
        h_counter = 0;
    } else {
        h_counter++;
    }

    ctx.sleep(t);
});
