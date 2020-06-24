/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviActionList
 *      @item={{this.report}}
 *      @index={{this.index}}
 *   />
 */
import Component from '@ember/component';
import BuildUrl from 'navi-reports/mixins/build-url';
import layout from '../templates/components/navi-action-list';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class NaviActionList extends Component.extend(BuildUrl) {}
