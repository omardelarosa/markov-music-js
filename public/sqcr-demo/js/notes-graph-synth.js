var nodes = null;
var edges = null;
var network = null;
var selectedNodeId = 1;

var note = null;
var duration = 500;

var NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];

function rand() {
    return NOTES[Math.round(Math.random() * (NOTES.length - 1))];
}

var synth = new Tone.Synth({
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

var G = {
    '0': [0, 0, 2, 4],
    '1': [1, 1, 3, 5],
    '2': [2, 2, 4, 6],
    '3': [4],
    '4': [4, 0],
    '5': [0],
    '6': [1, 0],
};

var MC = new MarkovChain(G, NOTES, 0);

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
    nodes = makeNodes(G, NOTES);

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

setInterval(() => {
    selectedNodeId = MC.nextID();
    network.selectNodes([selectedNodeId]);
    note = NOTES[selectedNodeId];
    synth.triggerAttackRelease(note, duration);
}, 500);
