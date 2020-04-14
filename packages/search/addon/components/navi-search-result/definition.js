/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A component that displays results for definitions
 */

import Component from '@glimmer/component';

export default class NaviDefinitionSearchResultComponent extends Component {
  /**
   * @property {Boolean} hasMultipleDataSources
   */
  get hasMultipleDataSources() {
    return new Set(this.args?.data.map(value => value.source)).size !== 1;
  }
}
