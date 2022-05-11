import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { merge } from 'lodash-es';
import { tracked } from '@glimmer/tracking';
import { ModelFrom } from 'navi-core/utils/type-utils';
import LineChartRoute from '../routes/line-chart';
import { LineChartConfig } from '@yavin/c3/models/line-chart';
import type YavinVisualizationsService from 'navi-core/services/visualization';

export default class LineChartController extends Controller {
  declare model: ModelFrom<LineChartRoute>;

  @service declare visualization: YavinVisualizationsService;

  get manifest() {
    return this.visualization.getVisualization(`c3:${this.chartType}`);
  }

  @tracked chartType = 'line-chart';

  @tracked metricOptions = {
    axis: {
      y: {
        series: {
          type: 'metric',
          config: {},
        },
      },
    },
  };

  @tracked dimensionOptions = {
    axis: {
      y: {
        series: {
          type: 'dimension',
          config: {
            metricCid: 'cid_adClicks',
            dimensions: [
              {
                name: '-3,All Other',
                values: {
                  'cid_age(field=id)': '-3',
                  'cid_age(field=desc)': 'All Other',
                },
              },
              {
                name: '4,21-24',
                values: {
                  'cid_age(field=id)': '4',
                  'cid_age(field=desc)': '21-24',
                },
              },
              {
                name: '5,25-29',
                values: {
                  'cid_age(field=id)': '5',
                  'cid_age(field=desc)': '25-29',
                },
              },
            ],
          },
        },
      },
    },
  };

  get metricVisualization() {
    return {
      type: this.chartType,
      version: 1,
      metadata: this.metricOptions,
    };
  }

  get dimVisualization() {
    return {
      type: this.chartType,
      version: 1,
      metadata: this.dimensionOptions,
    };
  }

  @tracked timeOptions = {
    axis: {
      y: {
        series: {
          type: 'dateTime',
          config: {
            metricCid: 'cid_totalPageViews',
            timeGrain: 'year',
          },
        },
      },
    },
  };

  @tracked hourByDayTimeOptions = {
    axis: {
      y: {
        series: {
          type: 'dateTime',
          config: {
            metricCid: 'cid_adClicks',
            timeGrain: 'day',
          },
        },
      },
    },
  };

  @tracked minuteByHourTimeOptions = {
    axis: {
      y: {
        series: {
          type: 'dateTime',
          config: {
            metricCid: 'cid_adClicks',
            timeGrain: 'hour',
          },
        },
      },
    },
  };

  @tracked secondByMinuteTimeOptions = {
    axis: {
      y: {
        series: {
          type: 'dateTime',
          config: {
            metricCid: 'cid_adClicks',
            timeGrain: 'minute',
          },
        },
      },
    },
  };

  @tracked amomalousOptions = {
    axis: {
      y: {
        series: {
          type: 'metric',
          config: {},
        },
      },
    },
  };

  @action
  onUpdateConfig(configUpdates: Partial<LineChartConfig['metadata']>) {
    let config = this.dimensionOptions;
    this.dimensionOptions = merge({}, config, configUpdates);
  }
}
