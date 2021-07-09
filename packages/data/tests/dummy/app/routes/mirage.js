import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MirageTest extends Route {
  @service naviFacts;

  model() {
    const request = {
      logicalTable: { table: 'network', timeGrain: 'day' },
      metrics: [{ metric: 'pageViews', parameters: { aggregation: 'total', trend: 'none' } }],
      intervals: [{ start: 'P1D', end: 'current' }],
      dimensions: [
        {
          dimension: 'age'
        },
        {
          dimension: 'userCountry'
        },
        {
          dimension: '__rollupMask'
        }
      ],
      filters: [],
      having: [],
      datasource: 'dummy',
      version: 'v1'
    };
    this.naviFacts.fetch(request, {
      queryParams: { rollupTo: 'age,userCountry', rollupGrandTotal: true }
    });
  }
}
