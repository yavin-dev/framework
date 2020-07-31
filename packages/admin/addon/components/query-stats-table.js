// import Ember from 'ember';

// export default Ember.Component.extend({
//   sortProps: [],
//   sortedContent: Ember.computed.sort('content', 'sortProps'),

//   actions: {
//     sort(direction, key) {
//       this.set('sortProps', [key + ':' + direction]);
//     }
//   }
// });

import Component from '@ember/component';
import TableCommon from '../mixins/table-common';
import { computed } from '@ember/object';

export default Component.extend(TableCommon, {
  columns: computed(function() {
    return [
      {
        label: 'Request ID',
        valuePath: 'requestID',
        width: '150 px'
      },
      {
        label: 'Model Name',
        valuePath: 'nameModel',
        width: '150px'
      },
      {
        label: 'User',
        valuePath: 'user',
        width: '150px'
      },
      {
        label: 'Query Status',
        valuePath: 'status'
      },
      {
        label: 'Query Duration',
        valuePath: 'duration'
      },
      {
        label: 'Created On',
        valuePath: 'createdOn'
      }
    ];
  })
});
