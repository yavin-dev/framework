/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirEmpty />
 */
import Component from '@glimmer/component';
import FileTypes from 'navi-directory/utils/enums/file-types';

export default class DirEmptyComponent extends Component {
  fileTypes = Object.entries(FileTypes.definitions);
}
