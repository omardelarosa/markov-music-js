let oscPort = {};

const handleMessage = msg => {
    console.log('message', msg);
};

const LightEvent = data => new CustomEvent('light', { detail: data });

const elementMatrix = [];

const mget = (mat, x, y) => {
    return (mat[x] && mat[x][y]) || undefined;
};

const MAX_COLS = 16;
const MAX_ROWS = 8;

const blink = (el, dur = 100, color) => {
    const colorClass = `colorize-${color}`;
    // TODO: add random color
    el.classList.add(colorClass);

    setTimeout(() => {
        el.classList.remove(colorClass);
    }, dur);
};

// For debugging purposes.
const ticker = () => {
    let n = 0;
    let m = 0;

    return e => {
        const el = elementMatrix[n][m];
        blink(el);
        m++;
        if (m >= MAX_COLS) {
            m = 0;
            n++;
        }

        if (n >= MAX_ROWS) {
            n = 0;
        }
    };
};

const initViz = () => {
    // Init container
    const $container = document.querySelector('.container');

    const $rows = document.querySelectorAll('.k-row');

    // TODO: make this more widely compatible and avoid .forEach
    $rows.forEach($row => {
        const rowRefs = [];
        $row.querySelectorAll('.k-col').forEach($cell => {
            rowRefs.push($cell);
        });
        elementMatrix.push(rowRefs);
    });

    $container.addEventListener('light', e => {
        const detail = e.detail || {};
        const { address = '', args = [] } = detail;
        const addressParts = address.split('/');
        if (addressParts[1] === 'blink') {
            const [, , m, n, color, dur] = addressParts;
            const mNum = Number(m);
            const nNum = Number(n);
            const el = mget(elementMatrix, mNum, nNum);
            el && blink(el, parseInt(dur), color);
        }
    });

    window.Visualizer = {
        el: $container,

        blink: msg => {
            $container.dispatchEvent(LightEvent({ address: msg }));
        },
    };
};

window.initViz = initViz;
