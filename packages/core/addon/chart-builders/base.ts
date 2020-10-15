/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Mixin from '@ember/object/mixin';
import EmberObject from '@ember/object';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import RequestFragment from 'navi-core/models/bard-request-v2/request';

export type ResponseRow = ResponseV1['rows'][number];

export type C3Row = {
  x: {
    rawValue: string;
    displayValue: string;
  };
} & Record<string, number | null | undefined>;

export default interface BaseChartBuilder {
  getXValue(row: ResponseRow, config: unknown, request: RequestFragment): string | number;

  buildData(response: ResponseV1, _config: unknown, request: RequestFragment): C3Row[];

  buildTooltip(_config: unknown, _request: RequestFragment): Mixin<{ layout: unknown; rowData: unknown }, EmberObject>;
}
