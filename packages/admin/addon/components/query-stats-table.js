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
        label: 'Created On',
        valuePath: 'createdOn',
        sortable: true
      },
      {
        label: 'Model Name',
        valuePath: 'nameModel',
        width: '150px',
        sortable: true
      },
      {
        label: 'User',
        valuePath: 'user',
        width: '150px',
        sortable: true
      },
      {
        label: 'Query Status',
        valuePath: 'status',
        width: '150px',
        sortable: true
      },
      {
        label: 'Query Duration',
        valuePath: 'duration',
        width: '150px',
        sortable: true
      },
      {
        label: 'Rows Returned',
        valuePath: 'rowsReturned',
        width: '150 px',
        sortable: true
      }
    ];
  })
});
