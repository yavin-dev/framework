/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::DateRange
 *       @filter={{filter}}
 *       @request={{request}}
 *       @onUpdateFilter={{action 'update'}}
 *   />
 */
import BaseIntervalComponent from './base-interval-component';
import layout from '../../templates/components/filter-values/date-range';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class DateRange extends BaseIntervalComponent {}

export default DateRange;
