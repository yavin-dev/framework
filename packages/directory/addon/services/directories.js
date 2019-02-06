/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import dirInfo from 'navi-directory/utils/enums/directories';
import { get } from '@ember/object';

export default Service.extend({
  /**
   * @property {Array} directories - Object list with info on each directory
   */
  directories: dirInfo,

  /**
   * @function getDirectories - returns list of valid directories
   */
  getDirectories() {
    return get(this, 'directories');
  }
});
