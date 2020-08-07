import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import Table from 'ember-light-table';
import { task } from 'ember-concurrency';
import { A } from '@ember/array';
import { cloneDeep } from 'lodash-es';

export default Mixin.create({
  store: service(),

  page: 0,
  limit: 5,
  dir: 'asc',
  sort: 'createdOn',

  isLoading: computed.oneWay('fetchRecords.isRunning'),
  canLoadMore: true,
  enableSync: true,

  model: null,
  meta: null,
  columns: null,
  table: null,

  init() {
    this._super(...arguments);
    let columns = this.get('columns');
    let modelsDebug = this.get('model');
    console.log(modelsDebug.promiseArray);
    const rows = modelsDebug.promiseArray;
    const data_ = modelsDebug.promiseArray.content;
    // const data_please = modelsDebug.promiseArray.then(function(response) {
    //   console.log(response.data)
    // })
    // let rows_blah = A()
    // for(let i =0 ; i < 100; i++) {
    //   rows_blah.pushObjects(cloneDeep(MOCK_DATA))
    // }

    let table = Table.create({ columns, rows });
    let sortColumn = table.get('allColumns').findBy('valuePath', this.get('sort'));

    // Setup initial sort column
    if (sortColumn) {
      sortColumn.set('sorted', true);
    }

    this.set('table', table);
  },

  fetchRecords: task(function*() {
    console.log('Gets Called');
    let rows = yield this.get('store').query('querystat', this.getProperties(['page', 'limit', 'sort', 'dir']));
    // this.get('model').promiseArray.pushObjects(records.toArray());
    // this.set('meta', records.get('meta'));
    // this.set('canLoadMore', !isEmpty(records));
    this.model['promiseArray'] = rows;
    let columns = this.get('columns');
    let table = Table.create({ columns, rows });
    let sortColumn = table.get('allColumns').findBy('valuePath', this.get('sort'));

    // Setup initial sort column
    if (sortColumn) {
      sortColumn.set('sorted', true);
    }

    this.set('table', table);
    //console.log(records);
  }),

  actions: {
    onScrolledToBottom() {
      if (this.get('canLoadMore')) {
        this.incrementProperty('page');
        this.get('fetchRecords').perform();
      }
    },

    onColumnClick(column) {
      if (column.sorted) {
        this.setProperties({
          dir: column.ascending ? 'asc' : 'desc',
          sort: column.get('valuePath'),
          canLoadMore: true,
          page: 0
        });
        //get(this, 'model').clear()

        //TODO: need to sort the data over here based on the properties
        //and rerender again
        //this.transitiontoroute(..maybe)

        console.log('Models Cleared');
        //console.log(this.fetchRecords)
        //console.log(this.get('fetchRecords'))//.next();
        //this.get('model')
        this.get('fetchRecords').perform();
      }
    }
  }
});
