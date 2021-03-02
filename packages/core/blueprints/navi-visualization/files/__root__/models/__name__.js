import { set } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import VisualizationBase from './visualization';
import { buildValidations } from 'ember-cp-validations';
import { attr } from '@ember-data/model';

/**
 * @constant {Object} Validations - Validation object
 */
const Validations = buildValidations(
  {
    //TODO define whether metadata is valid based on request
  },
  {
    //Global Validation Options
    request: readOnly('model._request')
  }
);

export default class <%= classifiedModuleName %>Model extends VisualizationBase.extend(Validations) {
  @attr('string', { defaultValue: '<%= dasherizedModuleName %>' }) 
  type;
  
  @attr('number', { defaultValue: 1 })
  version;

  @attr({ defaultValue: () => ({}) }) // TODO define default visualization config settings
  metadata;

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {RequestFragment} request - request object
   * @param {NaviFactResponse} response - response object
   * @return {Object} this object
   */
  rebuildConfig(/*request, response*/) {
    // TODO build a valid config based on request + response
    set(this, 'metadata', {});

    return this;
  }
}
