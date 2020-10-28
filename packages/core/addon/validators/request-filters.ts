/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
//@ts-ignore
import BaseValidator from 'ember-cp-validations/validators/base';
import { DimensionSeriesValues } from 'navi-core/models/chart-visualization';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

export default class RequestFitlerValidator extends BaseValidator {
  /**
   * Validates that only filtered series are sent to the chart
   */
  validate(allSeries: DimensionSeriesValues[], options: { request: RequestFragment } /*, model, attribute*/) {
    const { filters, columns } = options.request;

    if (allSeries) {
      let isValid = true;
      //check if each series value belongs to a filter
      allSeries.forEach(series => {
        Object.entries(series.values).forEach(([key, value]) => {
          const column = columns.find(({ cid }) => cid === key);
          const filter = filters.find(
            ({ type, canonicalName }) => type === column?.type && canonicalName === column.canonicalName
          );
          if (filter && !filter.values?.includes(value as string | number)) {
            isValid = false;
          }
        });
      });

      return isValid;
    }
    return undefined;
  }
}
