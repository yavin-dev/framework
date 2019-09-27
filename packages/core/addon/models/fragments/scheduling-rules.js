/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import Fragment from 'ember-data-model-fragments/fragment';

export default Fragment.extend({
  mustHaveData: DS.attr('boolean', { defaultValue: false })
});
