/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * graph colors follow pattern recommended at https://denali.design/principles/graphs
 * (lime, yellow, sky, violet, pink, blue, orange, purple, green, red)
 * color pallettes recommended at https://denali.design/docs/2/aesthetics/colors
 */
const denaliGraphColors = [
  // 500-series colors
  '#87d812',
  '#fed800',
  '#19c6f4',
  '#9a2ead',
  '#ff3390',
  '#0072df',
  '#f17603',
  '#6e2ebf',
  '#20c05b',
  '#e21717',
  // 700-series colors
  '#6eac0f',
  '#f0b200',
  '#1499b5',
  '#6e227d',
  '#bf2874',
  '#0058a0',
  '#c85e03',
  '#40008b',
  '#1a9947',
  '#be0c0c'
];

const denaliStatusColors = ['#ea0000', '#f4cb00', '#15c046', '#0066df'];

export function fetchColor(index, type = 'graph') {
  if (type === 'status') {
    return denaliStatusColors[index % denaliStatusColors.length];
  }
  return denaliGraphColors[index % denaliGraphColors.length];
}

export function assignColors(length) {
  return new Array(length).fill().map((item, index) => {
    return fetchColor(index);
  });
}
