import DS from 'ember-data';
import { computed, set } from '@ember/object';
import VisualizationBase from './visualization';
import { validator, buildValidations } from 'ember-cp-validations';

// color pallete recommended from Denali Design principles
// https://denali.design/principles/graphs
// https://denali.design/docs/2/aesthetics/colors
const denaliColors = [
  '#87d812',
  '#fed800',
  '#19c6f4',
  '#9a2ead',
  '#ff3390',
  '#0072df',
  '#f17603',
  '#6e2ebf',
  '#20c05b',
  '#e21717'
];

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    // checks that there is exactly one metric
    'metadata.series.config.metrics': [validator('presence', true), validator('length', { is: 1 })],

    // checks that there is at least one dimension
    'metadata.series.config.dimensions': [validator('presence', true), validator('length', { min: 1 })]
  },
  {
    //Global Validation Options
    request: computed.readOnly('model._request')
  }
);

export default VisualizationBase.extend(Validations, {
  type: DS.attr('string', { defaultValue: 'apex-pie' }),
  version: DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({
    defaultValue: () => {
      return {
        series: {
          type: null,
          config: {}
        }
      };
    }
  }),

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {Object} request - request object
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(request, response) {
    this.isValidForRequest(request);
    /*
    RETURNS:
    series: {
      type: string,
      config: {
        colors: ['string',  ...]
        metrics: [{ metric: string }, { metric: string }, ...],
        dimensions: [{ dimension: string }, { dimension: string }, ...]
      }
    }
    */
    const metOrder = request.metrics.content.map(item => {
      return item.metric.id;
    });
    const dimOrder = request.dimensions.content.map(item => {
      return item.dimension.id;
    });
    let meta = {
      series: {
        config: {
          colors: response.rows.map((item, index) => denaliColors[index % denaliColors.length]),
          metrics: metOrder.map(item => {
            return { metric: item };
          }),
          dimensions: dimOrder.map(item => {
            return { dimension: item };
          })
        }
      }
    };
    set(this, 'metadata', meta);
    return this;
  }
});
