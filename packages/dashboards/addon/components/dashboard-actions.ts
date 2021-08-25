/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <DashboardActions
 *      @item={{this.dashboard}}
 *      @index={{this.index}}
 *   />
 */
import NaviBaseActionList from 'navi-reports/components/navi-base-action-list';
import type DashboardModel from 'navi-core/models/dashboard';

export default class DashboardActionList extends NaviBaseActionList<DashboardModel> {}
