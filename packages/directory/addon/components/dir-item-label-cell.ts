/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This component won't be used directly. It is passed to ember-light-table as a custom cell component.
 * Ember-light-table will pass any parameters in through the value attribute.
 */
import Component from '@glimmer/component';
import type ReportModel from 'navi-core/models/report';
import DashboardModel from 'navi-core/models/dashboard';

interface DirItemLabelCellComponentArgs {
  value: ReportModel | DashboardModel;
}

export default class DirItemLabelCellComponent extends Component<DirItemLabelCellComponentArgs> {
  /**
   * @property {String[]} labels - the labels that will be applied to this row of the table
   */
  get labels() {
    let labels: string[] = [];
    // add the scheduled label to scheduled reports/dashboards
    if (this.args.value?.deliveryRules?.length > 0) {
      labels.push('Scheduled');
    }
    return labels;
  }
}
