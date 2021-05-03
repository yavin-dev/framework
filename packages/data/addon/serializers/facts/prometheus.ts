/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A serializer for a Prometheus response
 */
import EmberObject from '@ember/object';
import NaviFactSerializer, { ResponseV1 } from './interface';
import { FactAdapterError, RequestOptions, RequestV2 } from 'navi-data/adapters/facts/interface';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import NaviFactError, { NaviErrorDetails } from 'navi-data/errors/navi-adapter-error';
import moment from 'moment';
import type { Payload } from '../metadata/prometheus';

type BaseResult = { metric: Record<string, string> };
type Result = ((BaseResult & { value: [number, string] }) | (BaseResult & { values: [number, string][] }))[];

type Response = {
  resultType: 'vector';
  result: Result;
};

type QueryPayload = Payload<Response>[];

type ResponseRow = ResponseV1['rows'][number];
class ResponseJoiner {
  byDate: Record<string, Record<string, ResponseRow>> = {};
  defaultRow: ResponseRow;
  constructor(request: RequestV2) {
    this.defaultRow = request.columns.reduce((defaultRow: Record<string, null>, column) => {
      const { field: metric, parameters } = column;
      const canonicalName = canonicalizeMetric({ metric, parameters });
      defaultRow[canonicalName] = null;
      return defaultRow;
    }, {});
  }
  addData(time: string, metricName: string, metricValue: number, dimensions: Record<string, string>) {
    const byDate = this.byDate[time] ?? {};
    const dimensionKey = `dimensions:${Object.keys(dimensions)
      .sort()
      .map((key) => `${key}=${dimensions[key]}`)
      .join(',')}`;
    const byDimensions = byDate[dimensionKey] ?? {
      ...this.defaultRow,
      'time(grain=second)': time,
      ...dimensions,
    };

    byDimensions[metricName] = metricValue;

    byDate[dimensionKey] = byDimensions;
    this.byDate[time] = byDate;
  }
  flat(): ResponseRow[] {
    return Object.values(this.byDate).flatMap((byDim) => Object.values(byDim));
  }
}

export default class ElideFactsSerializer extends EmberObject implements NaviFactSerializer {
  /**
   * @param payload - raw payload string
   * @param request - request object
   */
  private processResponse(payload: QueryPayload, request: RequestV2, _options: RequestOptions): NaviFactResponse {
    const joiner = new ResponseJoiner(request);

    const metrics = request.columns.filter(({ type }) => type === 'metric');
    payload.forEach((singlePayload, idx) => {
      const { field: metric, parameters } = metrics[idx];
      const canonicalMetricName = canonicalizeMetric({ metric, parameters });

      singlePayload.data.result.forEach((row) => {
        const values = 'values' in row ? row.values : [row.value];
        values.forEach((valueRow) => {
          const [unixTimeStamp, strMetricValue] = valueRow;
          const time = moment.unix(unixTimeStamp).toISOString();
          joiner.addData(time, canonicalMetricName, Number(strMetricValue), row.metric);
        });
      });
    });

    return NaviFactResponse.create({
      rows: joiner.flat(),
    });
  }

  normalize(payload: QueryPayload, request: RequestV2, options: RequestOptions = {}): NaviFactResponse | undefined {
    return this.processResponse(payload, request, options);
  }

  extractError(payload: unknown, _request: RequestV2, _options: RequestOptions): NaviFactError {
    let errors: NaviErrorDetails[] = [];
    if (payload instanceof FactAdapterError) {
      errors = [{ title: payload.name, detail: payload.message }];
    }
    return new NaviFactError('Prometheus Request Failed', errors, payload);
  }
}
