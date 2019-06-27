/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   Pass to power-select component as "beforeOptionsComponent"
 *   {{power-select
 *     beforeOptionsComponent="power-select-search"
 *   }}
 */

import BeforeOptionsComponent from 'ember-power-select/components/power-select/before-options';
import layout from '../templates/components/power-select-search';

export default BeforeOptionsComponent.extend({
  layout
});
