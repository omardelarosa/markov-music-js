export const defaultTemplate = (locals, scripts, scriptTags) =>
    `
    <!DOCTYPE html>
    <html>
        <head>
            <title>sqcr</title>
            <meta charset="UTF-8" />
            <script>
                // BROWSER ENV VARIABLES
                var BUFFER_PATH = '${locals.BUFFER_PATH}';
                var USE_SERVER_CLOCK = '${locals.USE_SERVER_CLOCK}';
            </script>
            ${scriptTags.join('\n')}
        </head>
        <body>
        <pre>
${locals.ASCII_TEXT}
        </pre>
        <div>
            <a href="javascript:sqcr.start()">start</a>
            <a href="javascript:sqcr.stop()">stop</a>
        </div>
        </body>
    </html>
    `;

export default defaultTemplate;
