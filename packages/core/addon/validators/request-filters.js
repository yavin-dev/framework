/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import BaseValidator from 'ember-cp-validations/validators/base';
import { get } from '@ember/object';
import { A as arr } from '@ember/array';

export default BaseValidator.extend({
  /**
   * @method validate
   * Validates that only filtered series are sent to the chart
   * @override
   * @returns {Boolean}
   */
  validate(allSeries, options /*, model, attribute*/) {
    let isValid = true;

    if (allSeries) {
      let requestFilters = arr(get(options, 'request.filters'));

      //check if each series value belongs to a filter
      allSeries.forEach(series => {
        Object.entries(get(series, 'values')).forEach(([key, value]) => {
          let filter = requestFilters.findBy('dimension.id', key);
          if (filter && !get(filter, 'rawValues').includes(value)) {
            isValid = false;
          }
        });
      });

      return isValid;
    }
  }
});
