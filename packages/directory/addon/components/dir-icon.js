/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirIcon iconClass>
 */

import Component from '@ember/component';
import layout from '../templates/components/dir-icon';
import { layout as templateLayout, classNames, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@classNames('dir-icon')
@tagName('span')
class DirIcon extends Component {
  static positionalParams = ['iconClass'];
}

export default DirIcon;
