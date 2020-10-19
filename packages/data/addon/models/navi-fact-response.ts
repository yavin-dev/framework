/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import EmberObject from '@ember/object';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import moment, { Moment, MomentInput } from 'moment';
import { TimeDimensionColumn } from './metadata/time-dimension';
import Interval from 'navi-data/utils/classes/interval';

function notNull<T>(t: T | null): t is T {
  return t !== null;
}

export default class NaviFactResponse extends EmberObject implements ResponseV1 {
  readonly rows: ResponseV1['rows'] = [];
  readonly meta: ResponseV1['meta'] = {};

  private momentsCache: Record<string, Moment[]> = {};

  private getTimeDimensionAsMoments(column: TimeDimensionColumn): Moment[] {
    const { columnMetadata, parameters } = column;
    const field = columnMetadata.getCanonicalName(parameters);

    const cached = this.momentsCache[field];
    if (cached) {
      return cached;
    }

    const { rows = [] } = this;
    const moments = rows
      .map(row => {
        const value = row[field];
        return value ? moment(value as MomentInput) : null;
      })
      .filter(notNull);

    return (this.momentsCache[field] = moments);
  }

  /**
   * Get the max dateTime value for a column in moment form
   */
  getMaxTimeDimension(column: TimeDimensionColumn): Moment | null {
    const moments = this.getTimeDimensionAsMoments(column);
    if (moments.length) {
      const max = moment.max(moments);
      return max.isValid() ? max : null;
    }
    return null;
  }

  /**
   * Get the min dateTime value for a column in moment form
   */
  getMinTimeDimension(column: TimeDimensionColumn): Moment | null {
    const moments = this.getTimeDimensionAsMoments(column);
    if (moments.length) {
      const min = moment.min(moments);
      return min.isValid() ? min : null;
    }
    return null;
  }

  /**
   * Get an Interval object for a time dimension
   */
  getIntervalForTimeDimension(column: TimeDimensionColumn): Interval | null {
    const min = this.getMinTimeDimension(column);
    const max = this.getMaxTimeDimension(column);
    if (null === min || null === max) {
      return null;
    }
    return new Interval(min, max);
  }
}
