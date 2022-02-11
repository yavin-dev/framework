import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { taskFor } from 'ember-concurrency-ts';
import type NaviFactsService from 'navi-data/services/navi-facts';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type StoreService from '@ember-data/store';

export default class Application extends Route {
  @service
  declare naviMetadata: NaviMetadataService;

  @service
  declare naviFacts: NaviFactsService;

  @service
  declare store: StoreService;

  get request() {
    return this.store.createFragment('request', {
      table: 'network',
      dataSource: 'bardOne',
      requestVersion: '2.0',
      filters: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['P14D', '2022-01-01'],
          source: 'bardOne',
        },
      ],
      columns: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          source: 'bardOne',
        },
        {
          type: 'dimension',
          field: 'age',
          parameters: { field: 'desc' },
          source: 'bardOne',
        },
        {
          type: 'metric',
          field: 'totalPageViews',
          source: 'bardOne',
        },
        {
          type: 'metric',
          field: 'uniqueIdentifier',
          source: 'bardOne',
        },
      ],
    });
  }

  async model() {
    const { request, naviMetadata, naviFacts } = this;
    await naviMetadata.loadMetadata({ dataSourceName: 'bardOne' });
    const { response } = await taskFor(naviFacts.fetch).perform(this.request);
    return { request, response };
  }
}
