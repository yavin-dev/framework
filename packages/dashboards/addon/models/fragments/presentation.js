/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import MF from 'model-fragments';

export default MF.Fragment.extend({
  columns: DS.attr('number', { defaultValue: 12 }),
  layout:  DS.attr({ defaultValue: () => [] }),
  version: DS.attr('number', { defaultValue: '1' }),
});
