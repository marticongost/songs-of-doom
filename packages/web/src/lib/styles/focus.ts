import * as palette from './palette';

export const outlineColor = palette.thatch;
export const outline = `2px solid ${outlineColor}`;
export const mixin = { '&:focus': { outline } };
