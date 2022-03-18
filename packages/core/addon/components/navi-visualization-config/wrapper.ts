/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import type YavinVisualizationPanelComponent from '../../visualization/panel-component';
import type { YavinVisualizationPanelArgs } from '../../visualization/panel-component';

export default class NaviVisualizationConfigWrapperComponent
  extends Component<YavinVisualizationPanelArgs>
  implements YavinVisualizationPanelComponent
{
  get configComponent() {
    const { type } = this.args.manifest;
    const owner = getOwner(this);
    const componentName = `navi-visualization-config/${type}`;
    return owner.factoryFor(`component:${componentName}`)?.class;
  }
}
