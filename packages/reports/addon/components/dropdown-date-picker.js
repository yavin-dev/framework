/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{dropdown-date-picker
 *       onUpdate=(action 'onUpdate')
 *       date=(moment savedDate)
 *   }}
 */
import Component from '@ember/component';
import layout from '../templates/components/dropdown-date-picker';
import { layout as templateLayout } from '@ember-decorators/component';

@templateLayout(layout)
export default class extends Component {}
