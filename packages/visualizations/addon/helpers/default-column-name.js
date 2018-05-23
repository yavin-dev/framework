/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 */
import Helper from '@ember/component/helper';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { metricFormat } from 'navi-data/helpers/metric-format';

export default Helper.extend({
  bardMetadata: service(),

  compute([{ type, field }]) {
    if (type === 'dateTime') {
      return 'Date';
    }

    if (type === 'threshold') {
      type = 'metric';
    }

    let metadata = get(this, 'bardMetadata'),
        model = metadata.getById(type, field[type]);

    if (type === 'metric') {
      return metricFormat(model, model.longName);
    }

    return model.longName;
  }
});