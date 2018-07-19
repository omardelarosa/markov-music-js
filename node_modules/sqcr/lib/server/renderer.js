"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootRenderer = function (locals, scripts, renderer) {
    if (locals === void 0) { locals = {}; }
    if (scripts === void 0) { scripts = []; }
    var scriptTags = scripts.map(function (sPath) { return "<script src=\"" + sPath + "\"></script>"; });
    return renderer(locals, scripts, scriptTags);
};
exports.default = exports.rootRenderer;
//# sourceMappingURL=renderer.js.map