declare function svg2vectordrawable(
    svgCode: string,
    options?: {
        floatPrecision?: number, // default 2
        strict?: boolean, // defaults to false
        fillBlack?: boolean, // defaults to false
        xmlTag?: boolean, // defaults to false
        tint?: string
    }
): Promise<string>;

export = svg2vectordrawable;
