const fs = require('fs');
const path = require('path');

const getMarkdown = pathToMarkdown => {
    const absPath = path.join(process.cwd(), pathToMarkdown);
    try {
        return fs.readFileSync(absPath).toString();
    } catch (e) {
        console.error('Markdown read error: ', e.message);
        return '';
    }
};

module.exports = (locals, scripts, scriptTags) => `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" type="text/css" media="all" href="/public/sqcr-demo/css/slides.css"></link>
      </head>
      <body>
        <!-- TODO: self host locally? -->
        <script src="https://remarkjs.com/downloads/remark-latest.min.js"></script>
        <script>
            var MARKDOWN_PATH = "${locals.MARKDOWN_PATH}";
        </script>
        <script src="/public/js/slides-setup.js"></script>
      </body>
    </html>
`;
