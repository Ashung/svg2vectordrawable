declare function svg2vectordrawable(
  svgCode: string,
  floatPrecision?: number,
  strict?: boolean, // defaults to false
  fillBlack?: boolean, // defaults to false
): Promise<string>;

export = svg2vectordrawable;
