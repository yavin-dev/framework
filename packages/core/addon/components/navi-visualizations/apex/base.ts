/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { readOnly } from '@ember/object/computed';
import type { Args } from '../pie-chart';
import type { ApexOptions } from 'apexcharts';
import type RequestFragment from 'navi-core/models/bard-request-v2/request';
import type NaviFactResponse from 'navi-data/models/navi-fact-response';

export default class ApexChartComponent extends Component<Args> {
  @readOnly('args.model.firstObject.request') declare request: RequestFragment;
  @readOnly('args.model.firstObject.response') declare response: NaviFactResponse;

  /**
   * Base options for all apex charts, currently attempts to mimic our c3 charts styles
   */
  get baseOptions(): ApexOptions {
    return {
      chart: {
        height: '100%',
        toolbar: {
          show: false,
        },
        animations: {
          enabled: false,
        },
      },
      legend: {
        position: 'bottom',
        floating: false,
        markers: {
          width: 10,
          height: 10,
          radius: 0,
        },
      },
      theme: {
        mode: 'light',
      },
      tooltip: {
        theme: 'light',
      },
      dataLabels: {
        style: {
          fontSize: '14px',
        },
      },
      plotOptions: {
        pie: {
          dataLabels: {
            offset: -15,
          },
        },
      },
    };
  }
}
