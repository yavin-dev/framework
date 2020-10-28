/* eslint-disable @typescript-eslint/camelcase */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import RequestFilterValidator from 'navi-core/validators/request-filters';
import StoreService from 'ember-data/store';

module('Unit | Validator | request-filters', function(hooks) {
  setupTest(hooks);

  test('validate request-filters', function(assert) {
    assert.expect(2);
    const store = this.owner.lookup('service:store') as StoreService;

    let Validator = this.owner.lookup('validator:request-filters') as RequestFilterValidator;

    const dim1 = { type: 'dimension', field: 'dim1', parameters: { field: 'id' }, source: 'bardOne' };
    const dim2 = { type: 'dimension', field: 'dim2', parameters: { field: 'desc' }, source: 'bardOne' };

    const request = store.createFragment('bard-request-v2/request', {
      columns: [
        { ...dim1, cid: 'cid_dim1' },
        { ...dim2, cid: 'cid_dim2' }
      ],
      filters: [
        { ...dim1, operator: 'in', values: ['d1'] },
        { ...dim2, operator: 'in', values: ['d2'] }
      ],
      sorts: [],
      requestVersion: '2.0',
      dataSource: 'bardOne',
      table: 'network'
    });

    let series = [
      { name: 'series 1', values: { cid_dim1: 'd1' } },
      { name: 'series 2', values: { cid_dim2: 'd2' } }
    ];

    assert.equal(
      Validator.validate(series, { request }),
      true,
      'request-filters returns `true` when dimensions in series match filters in request'
    );

    series = [
      { name: 'series 1', values: { cid_dim1: 'd1' } },
      { name: 'series 2', values: { cid_dim1: 'd' } },
      { name: 'series 3', values: { cid_dim2: 'd2' } }
    ];

    assert.equal(
      Validator.validate(series, { request }),
      false,
      'request-filters returns `false` when dimensions in series are not in request filters'
    );
  });
});
