export interface TemplateLocals {
    BUFFER_PATH?: string;
    USE_SERVER_CLOCK?: boolean;
    ASCII_TEXT?: string;
}

export type ScriptPaths = string[];

export interface Renderer {
    (l?: TemplateLocals, s?: ScriptPaths, tags?: string[]): string;
}

export const rootRenderer = (
    locals: TemplateLocals = {},
    scripts: ScriptPaths = [],
    renderer: Renderer,
) => {
    const scriptTags = scripts.map(sPath => `<script src="${sPath}"></script>`);

    return renderer(locals, scripts, scriptTags);
};

export default rootRenderer;
