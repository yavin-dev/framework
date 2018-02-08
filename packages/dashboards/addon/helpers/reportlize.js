/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Helper.extend({
  store: service(),

  /**
   * @method compute
   * @param {DS.Model} model - model to be casted to a report
   * @returns {DS.Model} report model
   */
  compute([model]) {
    let clonedModel = model.toJSON(),
        store = get(this, 'store');

    return store.createRecord('report', {
      title: clonedModel.title,
      author: get(model, 'author'),
      request: get(model, 'request').clone(),
      visualization: store.createFragment(clonedModel.visualization.type, clonedModel.visualization)
    });
  }
});

