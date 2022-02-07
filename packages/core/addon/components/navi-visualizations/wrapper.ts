/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  <NaviVisualizations::Wrapper
 *    @report={{this.report}}
 *    @response={{this.response}}
 *    @container={{this.container}}
 *    @isEditing={{this.isEditing}}
 *    @onUpdateReport={{this.onUpdateReport}}
 *    @isPrint={{this.isPrint}}
 *  />
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { guidFor } from '@ember/object/internals';
import type YavinVisualizationComponent from 'navi-core/visualization/component';
import type { YavinVisualizationArgs } from 'navi-core/visualization/component';

export default class NaviVisualizationsWrapper
  extends Component<YavinVisualizationArgs>
  implements YavinVisualizationComponent {
  guid = guidFor(this);

  get visualizationHash() {
    return {
      request: this.args.request,
      response: this.args.response || { rows: [] },
    };
  }

  get visualizationComponent() {
    const { type } = this.args.manifest;
    const owner = getOwner(this);
    let component;
    const componentName = `navi-visualizations/${type}`;
    if (this.args.isPrint) {
      const printComponentName = `${componentName}-print`;
      const printComponent = owner.factoryFor(`component:${printComponentName}`)?.class;
      if (printComponent) {
        component = printComponent;
      }
    }
    if (!component) {
      component = owner.factoryFor(`component:${componentName}`)?.class;
    }
    return component;
  }

  @action
  getContainer() {
    return document.getElementById(this.guid);
  }
}
