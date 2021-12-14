/* eslint-disable prettier/prettier */
/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { VisualizationModel } from './table';
import { LineChartConfig } from 'navi-core/models/line-chart';
import { compile, TopLevelSpec } from 'vega-lite';

export type Args = {
  model: VisualizationModel;
  options: LineChartConfig['metadata'];
};

export default class LineChart extends Component<Args> {
  get request() {
    return this.args.model.objectAt(0)?.request;
  }

  get response() {
    return this.args.model.objectAt(0)?.response;
  }

  get spec() {
    const vegaLiteSpec: TopLevelSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 'container',
      height: 'container',
      usermeta: { embedOptions: { renderer: 'svg' } },
      description: "Google's stock price over time.",
      data: { values: this.response?.rows ?? [] },
      encoding: {
        x: {
          field: 'network\\.dateTime(grain=day)',
          timeUnit: 'yearmonthdate',
          type: 'ordinal',
          scale: { type: 'utc' },
        },
      },
      layer: [
        // {
        //   mark: { type: 'point', size: 6 },
        //   encoding: {
        //     y: { field: this.request?.metricColumns[0].canonicalName, type: 'quantitative' },
        //     opacity: { value: 0 },
        //   },
        // },
        {
          mark: { type: 'bar' },
          encoding: {
            y: {
              field: this.request.metricColumns[1].canonicalName,
              type: 'quantitative',
            },
            xOffset: { field: 'property(field=id)' },

            color: {
              field: 'property(field=id)',
              type: 'nominal',
            },
          },
        },
        {
          mark: { type: 'line', point: true, size: 3 },
          encoding: {
            y: {
              field: this.request.metricColumns[0].canonicalName,
              type: 'quantitative',
            },
            color: { field: 'property(field=id)' },
          },
        },
        {
          transform: [
            {
              pivot: 'property(field=id)',
              value: this.request.metricColumns[0].canonicalName,
              groupby: ['network\\.dateTime(grain=day)'],
            },
          ],
          mark: 'rule',
          encoding: {
            opacity: {
              condition: {
                param: 'hover',
                empty: false,
                value: 0.6,
              },
              value: 0,
            },
            tooltip: [
              { field: '114', type: 'quantitative' },
              { field: '100001', type: 'quantitative' },
              { field: '100002', type: 'quantitative' },
              { field: '101272', type: 'quantitative' },
            ],
          },
          params: [
            {
              name: 'hover',
              select: {
                type: 'point',
                encodings: ['x'],
                nearest: true,
                on: 'mouseover',
                clear: 'mouseout',
              },
            },
          ],
        },
      ],
      resolve: { scale: { y: 'independent' } },
    };
    return compile(vegaLiteSpec).spec;
  }
}
