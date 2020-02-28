/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
import EmberObject from '@ember/object';

export default class MetricFunction extends EmberObject {
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
  @tracked
  argumentIds = [];

  /**
   * @property {FunctionArgument[]} - Function argument instances related to this metric function
   */
  get arguments() {
    return this.argumentIds.map(argId => {
      return getOwner(this)
        .lookup('service:keg')
        .getById('metadata/metric/metric-function', argId, this.source);
    });
  }
}
