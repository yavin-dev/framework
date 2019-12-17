/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirSearchBar
 *   @query={{query}}
 *   @searchFor={{action "searchFor" query}}
 * />
 */
import Component from '@ember/component';
import layout from '../templates/components/dir-search-bar';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class DirSearchBar extends Component {}

export default DirSearchBar;
