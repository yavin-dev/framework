/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

/**
 * given a transform, returns the translation that transform provides
 * @param transform - transform to calculate
 * @returns {Object} - Object with x and y properties
 */
export function getTranslation(transform: string) {
  /*
   * Create a dummy g for calculation purposes only. This will never
   * be appended to the DOM and will be discarded once this function
   * returns.
   */
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Set the transform attribute to the provided string value.
  g.setAttributeNS(null, 'transform', transform);

  /*
   * consolidate the SVGTransformList containing all transformations
   * to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
   * its SVGMatrix.
   */
  const matrix = g.transform.baseVal.consolidate().matrix;

  /*
   * Below calculations are taken and adapted from the private function
   * transform/decompose.js of D3's module d3-interpolate.
   */
  return { x: matrix.e, y: matrix.f };
}
