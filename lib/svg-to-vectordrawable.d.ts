declare function svg2vectordrawable(
  svgCode: string,
  floatPrecision?: number,
  strict?: boolean
): Promise<string>;

export = svg2vectordrawable;
