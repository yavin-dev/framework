import { A } from '@ember/array';
import Route from '@ember/routing/route';
import FragmentFactory from 'navi-core/services/fragment-factory';
import { inject as service } from '@ember/service';
import type StoreService from '@ember-data/store';
import { VisualizationModel } from 'navi-core/components/navi-visualizations/table';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
export default class GoalGaugeRoute extends Route {
  @service
  declare store: StoreService;

  @service
  declare fragmentFactory: FragmentFactory;

  async model(): Promise<VisualizationModel> {
    const column = this.fragmentFactory.createColumn('metric', 'bardOne', 'pageViews', {}, '');
    const request = this.store.createFragment('request', {
      table: null,
      columns: [column],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
    });
    const response = NaviFactResponse.create({ rows: [{ pageViews: 3060000000 }] });

    return A([{ response, request }]);
  }
}
