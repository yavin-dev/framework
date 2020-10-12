/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import EmberObject from '@ember/object';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import moment, { Moment, MomentInput } from 'moment';
import { TimeDimensionColumn } from './metadata/time-dimension';

function notNull<T>(t: T | null): t is T {
  return t !== null;
}

export default class NaviFactResponse extends EmberObject implements ResponseV1 {
  rows!: ResponseV1['rows'];
  meta!: ResponseV1['meta'];

  private getTimeDimensionAsMoments(column: TimeDimensionColumn): Moment[] {
    const { columnMetadata, parameters } = column;
    const field = columnMetadata.getCanonicalName(parameters);
    const { rows = [] } = this;
    return rows
      .map(row => {
        const value = row[field];
        return value ? moment(value as MomentInput) : null;
      })
      .filter(notNull);
  }

  /**
   * Get the max dateTime value for a column in moment form
   */
  getMaxTimeDimension(column: TimeDimensionColumn): Moment | null {
    const moments = this.getTimeDimensionAsMoments(column);
    return moments.length ? moment.max(moments) : null;
  }

  /**
   * Get the min dateTime value for a column in moment form
   */
  getMinTimeDimension(column: TimeDimensionColumn): Moment | null {
    const moments = this.getTimeDimensionAsMoments(column);
    return moments.length ? moment.min(moments) : null;
  }
}
