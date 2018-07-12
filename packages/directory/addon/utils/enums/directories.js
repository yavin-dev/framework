/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
export default [{
  name: 'My Directory',
  routeLink: 'directory.my-directory',
  filters: [{
      name: 'Favorites',
      icon: 'star-o',
      queryParam: { filter: 'favorites', sortBy: 'title'}
  },{
    name: 'Recently Updated',
    icon: 'cloud-upload',
    queryParam: { filter: null, sortBy: 'updatedOn' }
  }]
}];
