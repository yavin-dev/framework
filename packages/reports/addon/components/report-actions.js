/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  <ReportActions
 *    @model={{this.model}}
 *    @addToDashboard={{this.addToDashboard}}
 *    @addToNewDashboard={{this.addToNewDashboard}}
 *  />
 */

import Component from '@ember/component';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from '../templates/components/report-actions';

@templateLayout(layout)
@tagName('')
export default class ReportActions extends Component {}
