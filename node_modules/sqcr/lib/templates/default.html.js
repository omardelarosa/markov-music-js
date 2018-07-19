"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTemplate = function (locals, scripts, scriptTags) {
    return "\n    <!DOCTYPE html>\n    <html>\n        <head>\n            <title>sqcr</title>\n            <meta charset=\"UTF-8\" />\n            <script>\n                // BROWSER ENV VARIABLES\n                var BUFFER_PATH = '" + locals.BUFFER_PATH + "';\n                var USE_SERVER_CLOCK = '" + locals.USE_SERVER_CLOCK + "';\n            </script>\n            " + scriptTags.join('\n') + "\n        </head>\n        <body>\n        <pre>\n" + locals.ASCII_TEXT + "\n        </pre>\n        <div>\n            <a href=\"javascript:sqcr.start()\">start</a>\n            <a href=\"javascript:sqcr.stop()\">stop</a>\n        </div>\n        </body>\n    </html>\n    ";
};
exports.default = exports.defaultTemplate;
//# sourceMappingURL=default.html.js.map