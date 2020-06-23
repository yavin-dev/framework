/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviTagInput::Tag
 *      @tag={{this.tag}}
 *      @index={{this.index}}
 *      @isRemovable={{true}}
 *      @onRemoveTag={{this.removeTag}}
 *   />
 */
import Component from '@ember/component';
import layout from '../../templates/components/navi-tag-input/tag';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class NaviTagInputTag extends Component {
  extraClassNames = '';
}
