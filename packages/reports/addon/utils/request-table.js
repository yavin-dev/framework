/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import config from 'ember-get-config';

/**
 * Returns a default time grain from a list of table time grains
 *
 * @method getDefaultTimeGrain
 * @param {Array} timeGrains - list of table time grains
 * @returns {Object} time grain
 */
export function getDefaultTimeGrain(timeGrains = []) {
  const defaultTimeGrainId = config.navi.defaultTimeGrain;
  const timeGrain = timeGrains.find((grain) => grain.id === defaultTimeGrainId);

  return timeGrain || timeGrains[0];
}
