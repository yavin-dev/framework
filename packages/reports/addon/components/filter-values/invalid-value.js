/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterValues::InvalidValue/>
 */
import Component from '@ember/component';
import { layout as templateLayout, tagName, classNames } from '@ember-decorators/component';
import layout from '../../templates/components/filter-values/invalid-value';

@classNames('filter-values--selected-error')
@tagName('span')
@templateLayout(layout)
class InvalidValue extends Component {}

export default InvalidValue;
