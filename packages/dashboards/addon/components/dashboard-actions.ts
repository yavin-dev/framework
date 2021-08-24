/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NaviActionList from 'navi-reports/components/navi-action-list';
import { action } from '@ember/object';

export default class DashboardActionList extends NaviActionList {
  /**
   * @override
   */
  @action
  isItemValid() {
    return this.args.item.validations.isTruelyValid;
  }
}
