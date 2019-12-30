/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { computed } from '@ember/object';

class Directories extends Service {
  /**
   * @property {Array} directories - Object list with info on each directory
   */
  @computed
  get directories() {
    //Default supported directories. Override this property in your app to add directories.
    return [
      {
        name: 'My Data',
        routeLink: 'directory.my-data',
        filters: [
          {
            name: 'Favorites',
            icon: 'star-o',
            queryParam: { filter: 'favorites' }
          }
        ]
      }
    ];
  }

  /**
   * @function getDirectories - returns list of valid directories
   */
  getDirectories() {
    return this.directories;
  }
}

export default Directories;
