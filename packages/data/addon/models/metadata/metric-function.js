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
  @service('keg')
  keg;

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
   * @property {FunctionArgument[]} - Function argument instances related to this metric function
   */
  arguments;
}
