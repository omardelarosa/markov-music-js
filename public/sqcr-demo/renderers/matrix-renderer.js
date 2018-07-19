const makeRow = (cols, idx = 1) => {
    const colDivs = [];

    for (let i = 0; i < cols; i++) {
        colDivs.push(
            `<div class="k-col k-c-16 k-center blank-box k-${i + 1}"></div>`,
        );
    }

    return `<div class="k-row r-${idx}">${colDivs.join('\n')}</div>`;
};

const makeVideoPlayer = () => `
    <div class='videoContainer k-row'>
        <iframe class="k-col k-c-1" src="https://www.youtube.com/embed/uxpDa-c-4Mc?autoplay=1&mute=1&start=46" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </div>
`;

const makeGrid = (rows, cols) => {
    const rowsHTML = [];

    for (let i = 0; i < rows; i++) {
        rowsHTML.push(makeRow(cols, i + 1));
    }

    return `<div class="container">${rowsHTML.join('\n')}</div>`;
};

module.exports = (locals, scripts, scriptTags) => `
    <!DOCTYPE html>
    <html>
        <head>
            <title>Untitled - osc.js demo</title>
            <meta charset="UTF-8" />
            <link rel="stylesheet" type="text/css" media="all" href="/public/css/grid.css"></link>
            <link rel="stylesheet" type="text/css" media="all" href="/public/css/global.css"></link>

            <link rel="stylesheet" type="text/css" media="all" href="/public/matrix-16x8/styles.css"></link>
            <link rel="stylesheet" type="text/css" media="all" href="/public/sqcr-demo/styles.css"></link>
            ${scriptTags.join('\n')}
        </head>

        <body>
            ${'' && makeVideoPlayer()}
            ${makeGrid(8, 16)}
            <div>
                <a href="javascript:sqcr.start()">start</a>
                <a href="javascript:sqcr.stop()">stop</a>
            </div>
            <script>window.initViz()</script>
        </body>
    </html>
`;
