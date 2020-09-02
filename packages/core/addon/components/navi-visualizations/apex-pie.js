/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * <NaviVisualizations::ApexPie
 *   @model={{this.model}}
 *   @options={{this.visualizationOptions}}
 * />
 */
import Component from '@glimmer/component';
import { normalize } from '../../chart-builders/apex';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ResizeObserver from 'resize-observer-polyfill';

export default class NaviVisualizationsApexPie extends Component {
  /**
   * @property {object} - ApexCharts-compatible object of options
   */
  get chartOptions() {
    const {
      request,
      response: { rows }
    } = this.args.model.firstObject;
    const data = normalize(request, rows);
    return {
      chart: {
        type: 'pie',
        [this.constrainBy]: '100%'
      },
      colors: this.args.options?.series?.config?.colors,
      dataLabels: {
        enabled: this.args.options?.series?.config?.dataLabelsVisible
      },
      labels: data.labels,
      legend: {
        show: this.args.options?.series?.config?.legendVisible,
        position: 'bottom',
        floating: false
      },
      series: data.series[0].data
    };
  }

  /**
   * @property {string} constrainBy - the graph dimension to be pinned according to the orientation of the visualization container
   */
  @tracked constrainBy = 'height';

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
