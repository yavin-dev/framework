/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import Fragment from 'ember-data-model-fragments/fragment';

export default Fragment.extend({
  columns: DS.attr('number', { defaultValue: 12 }),
  layout: DS.attr({ defaultValue: () => [] }),
  version: DS.attr('number', { defaultValue: '1' })
});
