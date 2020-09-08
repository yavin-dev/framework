/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * <NaviVisualizations::ApexLine
 *   @model={{this.model}}
 *   @options={{this.metricOptions}}
 * />
 */
import numeral from 'numeral';
import Component from '@glimmer/component';
import { normalize } from '../../chart-builders/apex';
import { formatDateForGranularity } from 'navi-core/helpers/format-date-for-granularity';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ResizeObserver from 'resize-observer-polyfill';

export default class NaviVisualizationsApexLine extends Component {
  /**
   * @property {object} - an ApexCharts-friendly object of the data and data labels
   */
  get data() {
    return normalize(this.args.model.firstObject.request, this.args.model.firstObject.response.rows);
  }

  /**
   * @properties {array} - array of objects with ApexCharts-formatted data
   */
  get series() {
    return this.data.series.map(seri => {
      return { type: 'line', name: seri.name, data: seri.data };
    });
  }

  /**
   * @properties {array} - array of labels re-formatted to be human readable
   */
  get labels() {
    let labels = this.data.labels.map(label => {
      return formatDateForGranularity(label, this.args.model.firstObject.request.logicalTable.timeGrain);
    });
    return labels;
  }
  /*
  get annotations() {
    //currently only supports x-axis ruler annotations
    let ann = {
      xaxis: [
        {
          x: 'Feb 2019',
          label: {
            text: 'Annotation'
          }
        }
      ]
    };
    return ann;
  }
*/
  /**
   * @property {object} - ApexCharts-compatible object of options
   */
  get chartOptions() {
    return {
      //annotations: this.annotations,
      chart: {
        type: this.args.options?.series?.config?.area ? 'area' : 'line',
        [this.constrainBy]: '100%'
      },
      colors: this.args.options?.series?.config?.colors,
      dataLabels: {
        enabled: false
      },
      series: this.series,
      xaxis: {
        categories: this.labels
      },
      yaxis: {
        type: 'datetime',
        labels: {
          formatter: function(value) {
            return numeral(value).format('0.00a');
          }
        }
      },
      stroke: {
        curve: this.args.options?.series?.config?.stroke
      }
    };
  }

  /**
   * @property {string} constrainBy - the graph dimension to be pinned according to the orientation of the visualization container
   */
  @tracked constrainBy = 'width';

  /**
   * updates constrainBy when the visualization container's dimensions change, if necessary
   * @method updateDimensions
   */
  @action
  updateDimensions() {
    const container = this.args.containerComponent?.$('* [class*=visualization-container]');
    if (container === undefined) {
      console.warn('Apex-Pie called without proper container component');
      return;
    }
    const width = container.width();
    const height = container.height();
    // if oriented portrait-style, should constrain to width
    if (height > width && !(this.constrainBy === 'width')) {
      this.constrainBy = 'width';
    }
    // if oriented landscape-style, should constrain to height
    else if (width > height && !(this.constrainBy === 'height')) {
      this.constrainBy = 'height';
    }
  }

  constructor(owner, args) {
    super(owner, args);
    this.updateDimensions();
    const observer = new ResizeObserver(entries => {
      this.updateDimensions();
    });
    const container = this.args.containerComponent?.element;
    if (container !== undefined) {
      observer.observe(container);
      if ($(container).length) {
        $(container).on('resizestop', () => {
          this.updateDimensions();
        });
      }
    }
  }
}
