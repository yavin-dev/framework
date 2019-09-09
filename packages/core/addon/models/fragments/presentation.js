/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import DS from 'ember-data';
import Fragment from 'ember-data-model-fragments/fragment';
import { fragmentArray } from 'ember-data-model-fragments/attributes';

export default Fragment.extend({
  columns: DS.attr('number', { defaultValue: 12 }),
  layout: fragmentArray('fragments/layout', { defaultValue: () => [] }),
  version: DS.attr('number', { defaultValue: '1' }),

  /**
   * Clones presentation model
   *
   * @returns {Fragment} - Ember model data fragment clone of current presentation
   */
  copy() {
    const presentation = this.toJSON();

    return this.store.createFragment('fragments/presentation', {
      columns: presentation.columns,
      version: presentation.version,
      layout: presentation.layout.map(cell => this.store.createFragment('fragments/layout', cell))
    });
  }
});
