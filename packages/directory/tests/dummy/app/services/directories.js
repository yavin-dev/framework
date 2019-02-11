import DirectoryService from 'navi-directory/services/directories';
import { computed } from '@ember/object';

export default DirectoryService.extend({
  directories: computed(function() {
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
      },
      {
        name: 'Other Data',
        routeLink: 'directory.other-data',
        filters: []
      }
    ];
  })
});
