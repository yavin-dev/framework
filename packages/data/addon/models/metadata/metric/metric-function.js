/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A collection of function arguments that has a one to many relationship to metrics
 */
import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';

export default class MetricFunction extends EmberObject {
  /**
   * @property {Ember.Service} keg
   */
  @service('bard-metadata')
  metadataService;

  /**
   * @property {String} id
   */
  id;

  /**
   * @property {String} name
   */
  name;

  /**
   * @property {String} description
   */
  description;

  /**
   * @property {String} source
   */
  source;

  /**
   * @property {String[]} argumentIds - ids that map to the function argument instances related to this metric function
   */
  argumentIds = [];

  /**
   * @property {FunctionArgument[]} - Function argument instances related to this metric function
   */
  get arguments() {
    return this.argumentIds.map(argId => {
      return this.metadataService.findById('metadata/metric/function-argument', argId, this.source);
    });
  }
}
