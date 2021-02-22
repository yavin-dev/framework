/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';

export interface DirectoryFilterQueryParams {
  filter?: string;
}
export interface DirectoryFilter {
  name: string;
  icon: string;
  queryParams: DirectoryFilterQueryParams;
}
export interface Directory {
  name: string;
  routeLink: string;
  filters: Array<DirectoryFilter>;
}

export default class DirectoriesService extends Service {
  /**
   * @property {Array<Directory>} directories - Object list with info on each directory
   */
  directories: Array<Directory> = [
    {
      name: 'My Data',
      routeLink: 'directory.my-data',
      filters: [
        {
          name: 'Favorites',
          icon: 'star-o',
          queryParams: { filter: 'favorites' },
        },
      ],
    },
  ];

  /**
   * @function getDirectories - returns list of valid directories
   */
  getDirectories() {
    return this.directories;
  }
}

declare module '@ember/service' {
  interface Registry {
    directories: DirectoriesService;
  }
}
