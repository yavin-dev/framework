/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
export default [
  {
    name: 'My Data',
    routeLink: 'directory.my-data',
    filters: [
      {
        name: 'Favorites',
        icon: 'star-o',
        queryParam: { filter: 'favorites', sortBy: 'title' }
      },
      {
        name: 'Recently Updated',
        icon: 'cloud-upload',
        queryParam: { filter: null, sortBy: 'updatedOn' }
      }
    ]
  },
  {
    name: 'Other Data',
    routeLink: 'directory.other-data',
    filters: []
  }
];
