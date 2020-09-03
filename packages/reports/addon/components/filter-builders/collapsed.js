/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterBuilders::Collapsed
 *     @displayName={{displayName}}
 *     @filter={{filter}}
 *     @request={{request}}
 *     @field={{field}}
 *     @selectedOperator{{selectedOperator}}
 *   />
 */
import Component from '@ember/component';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import layout from 'navi-reports/templates/components/filter-builders/collapsed';

@tagName('')
@templateLayout(layout)
class Collapsed extends Component {}

export default Collapsed;
