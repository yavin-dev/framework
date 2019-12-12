/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * <DirNewButton />
 */

import Component from '@ember/component';
import layout from '../templates/components/dir-new-button';
import { get } from '@ember/object';
import FileTypes from 'navi-directory/utils/enums/file-types';
import { layout as templateLayout, classNames } from '@ember-decorators/component';

@templateLayout(layout)
@classNames('dir-new-button')
class DirNewButton extends Component {
  /**
   * @method calculatePosition
   * @returns {Object} - positioning info used by ember-basic-dropdown
   */
  calculatePosition(trigger, content) {
    let { top, left, width, height } = trigger.getBoundingClientRect(),
      { width: contentWidth } = content.getBoundingClientRect(),
      marginFromTopBar = 15,
      style = {
        left: left - contentWidth + width,
        top: top + height + marginFromTopBar
      };

    return { style };
  }

  /**
   * @property {Array} fileTypeNames - Names of file types in directory
   */
  fileTypeNames = FileTypes.getTypes();

  /**
   * @property {Object} fileTypes - Object containing file types icon class and route-link with the type name as keys
   */
  fileTypes = get(FileTypes, 'definitions');
}

export default DirNewButton;
