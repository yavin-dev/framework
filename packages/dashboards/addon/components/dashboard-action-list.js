/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NaviActionList from 'navi-reports/components/navi-action-list';
import layout from '../templates/components/dashboard-action-list';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class DashboardActionList extends NaviActionList {}
