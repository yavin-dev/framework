/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  <VisualizationToggle
 *    @report={{this.report}}
 *    @validVisualizations={{this.validVisualizations}}
 *    @onVisualizationTypeUpdate={{this.onVisualizationTypeUpdate}}
 * />
 */
import Component from '@ember/component';
import layout from '../templates/components/visualization-toggle';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class VisualizationToggle extends Component {}
export default VisualizationToggle;
