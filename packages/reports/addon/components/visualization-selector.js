/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{visualization-selector
 *    report=report
 *    validVisualizations=validVisualizations
 *    onVisualizationTypeUpdate=(action 'onVisualizationTypeUpdate')
 *  }}
 */
import Component from '@ember/component';
import layout from '../templates/components/visualization-selector';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { computed } from '@ember/object';

@templateLayout(layout)
@tagName('')
class VisualizationSelector extends Component {
  @computed('validVisualizations')
  get visualizations() {
    return this.validVisualizations;
  }
}

export default VisualizationSelector;
