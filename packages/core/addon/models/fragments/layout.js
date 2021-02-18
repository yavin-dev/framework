/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import Fragment from 'ember-data-model-fragments/fragment';

export default Fragment.extend({
  column: DS.attr('number'),
  row: DS.attr('number'),
  width: DS.attr('number'),
  height: DS.attr('number'),
  widgetId: DS.attr('number'),
});
