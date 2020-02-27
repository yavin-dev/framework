import DirectoryService from 'navi-directory/services/directories';
import { computed } from '@ember/object';

/**
 * Overrides addon typescript file, so it must be js
 */
export default class Directories extends DirectoryService {
  @computed
  get directories() {
    return [
      {
        name: 'My Data',
        routeLink: 'directory.my-data',
        filters: [
          {
            name: 'Favorites',
            icon: 'star-o',
            queryParams: { filter: 'favorites' }
          }
        ]
      },
      {
        name: 'Other Data',
        routeLink: 'directory.other-data',
        filters: []
      }
    ];
  }
}
