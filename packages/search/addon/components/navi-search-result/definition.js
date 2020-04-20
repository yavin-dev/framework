/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A component that displays results for definitions
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class NaviDefinitionSearchResultComponent extends Component {
  /**
   * @property {Ember.Service} metadataService
   */
  @service('bard-metadata') metadataService;

  /**
   * @property {Boolean} hasMultipleDataSources
   */
  get hasMultipleDataSources() {
    return this.metadataService.loadedDataSources.length > 1;
  }
}
