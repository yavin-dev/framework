/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviActionList
 *      @item={{this.report}}
 *      @index={{this.index}}
 *   />
 */
import NaviBaseActionList from 'navi-reports/components/navi-base-action-list';
import { action } from '@ember/object';
import type ReportModel from 'navi-core/models/report';

export default class NaviActionList extends NaviBaseActionList<ReportModel> {
  @action
  async isItemValid() {
    await this.args.item.request?.loadMetadata();
    return this.args.item.validations?.isTruelyValid;
  }
}
