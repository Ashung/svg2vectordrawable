declare function svg2vectordrawable(
  svgCode: string,
  floatPrecision?: number,
  strict?: boolean,
  fillBlack?: boolean,
): Promise<string>;

export = svg2vectordrawable;
