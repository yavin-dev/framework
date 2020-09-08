import DS from 'ember-data';
import { computed, set } from '@ember/object';
import VisualizationBase from './visualization';
import { buildValidations } from 'ember-cp-validations';
import { assignColors } from 'navi-core/utils/enums/denali-colors';

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    //TODO define whether metadata is valid based on request
  },
  {
    //Global Validation Options
    request: computed.readOnly('model._request')
  }
);

export default VisualizationBase.extend(Validations, {
  type: DS.attr('string', { defaultValue: 'apex-line' }),
  version: DS.attr('number', { defaultValue: 1 }),
  metadata: DS.attr({
    defaultValue: () => {
      // TODO define default visualization config settings
      return {};
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
    let meta = {
      series: {
        config: {
          area: this.getWithDefault('metadata.series.config.area', false),
          annotations: this.getWithDefault('metadata.series.config.annotations', []),
          colors: [],
          stroke: this.getWithDefault('metadata.series.config.stroke', 'straight'),
          metrics: request.metrics.content.map(item => {
            return { id: item.metric.id, name: item.metric.name };
          }),
          dimensions: request.dimensions.content.map(item => {
            return { id: item.dimension.id, name: item.dimension.name };
          })
        }
      }
    };
    let oldColors = this.getWithDefault('metadata.series.config.colors', []);
    let newColors = assignColors(response.rows.length);
    Array.prototype.splice.apply(newColors, [0, oldColors.length].concat(oldColors));
    set(meta, 'series.config.colors', newColors);
    set(this, 'metadata', meta);
    return this;
  }
});
