import { A } from '@ember/array';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import FragmentFactory from 'navi-core/services/fragment-factory';

export default class GoalGaugeRoute extends Route {
  @service
  fragmentFactory!: FragmentFactory;

  model() {
    const column = this.fragmentFactory.createColumn('metric', 'bardOne', 'pageViews', {}, ''),
      request = this.store.createFragment('bard-request-v2/request', {
        table: null,
        columns: [column],
        filters: [],
        sorts: [],
        limit: null,
        dataSource: 'bardOne',
        requestVersion: '2.0'
      });

    return A([
      {
        response: { rows: [{ pageViews: 3060000000 }] },
        request
      }
    ]);
  }
}
