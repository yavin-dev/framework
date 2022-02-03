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
 *    @print={{this.print}}
 *  />
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { guidFor } from '@ember/object/internals';
import type NaviFactResponse from 'navi-data/models/navi-fact-response';
import type ReportModel from 'navi-core/models/report';

interface NaviVisualizationsWrapperArgs {
  report: ReportModel;
  response: NaviFactResponse;
  container: unknown;
  isEditing: boolean;
  onUpdateReport: (action: string, ...params: unknown[]) => void;
  print?: boolean;
}

export default class NaviVisualizationsWrapper extends Component<NaviVisualizationsWrapperArgs> {
  guid = guidFor(this);

  get visualizationHash() {
    return {
      request: this.args.report.request,
      response: this.args.response || { rows: [] },
    };
  }

  get visualizationComponent() {
    const { type } = this.args.report.visualization;
    const owner = getOwner(this);
    let component;
    const componentName = `navi-visualizations/${type}`;
    if (this.args.print) {
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
