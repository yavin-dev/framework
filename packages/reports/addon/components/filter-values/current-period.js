/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::CurrentPeriod
 *       @filter={{filter}}
 *       @request={{request}}
 *   />
 */
import BaseIntervalComponent from './base-interval-component';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from '../../templates/components/filter-values/current-period';

@templateLayout(layout)
@tagName('')
export default class CurrentPeriodComponent extends BaseIntervalComponent {}
