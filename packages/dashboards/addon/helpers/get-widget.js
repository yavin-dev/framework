/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Helper from '@ember/component/helper';

export default Helper.extend({
  store: service(),

  /**
   * @method compute
   * @param {String} id - widget id
   * @returns {DS.Model} widget model
   */
  compute([id]) {
    return this.get('store').peekRecord('dashboard-widget', id);
  },
});
