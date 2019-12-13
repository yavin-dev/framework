/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirEmpty />
 */
import Component from '@ember/component';
import layout from '../templates/components/dir-empty';
import FileTypes from 'navi-directory/utils/enums/file-types';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class DirEmpty extends Component {
  reportRoute = FileTypes.definitions.reports.linkRoute;
}

export default DirEmpty;
