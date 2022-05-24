/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NativeWithCreate, { Injector } from 'navi-data/models/native-with-create';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import moment, { Moment, MomentInput } from 'moment';
import Interval from '@yavin/client/utils/classes/interval';
import type { TimeDimensionColumn } from 'navi-data/models/metadata/time-dimension';

function notNull<T>(t: T | null): t is T {
  return t !== null;
}

export type ResponseRow = ResponseV1['rows'][number];

interface NaviFactResponsePayload {
  rows: ResponseV1['rows'];
  meta?: ResponseV1['meta'];
}

export default class NaviFactResponse extends NativeWithCreate implements ResponseV1 {
  constructor(injector: Injector, args: NaviFactResponsePayload) {
    super(injector, args);
    this.rows = this.rows ?? [];
    this.meta = this.meta ?? {};
  }
  declare readonly rows: ResponseV1['rows'];
  declare readonly meta: ResponseV1['meta'];

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
      .map((row) => {
        const value = row[field];
        return value ? moment.parseZone(value as MomentInput) : null;
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
