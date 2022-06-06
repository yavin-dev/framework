import { module, test } from 'qunit';
import RequestConstraintMetadataModel, {
  RequestConstraintMetadataPayload,
} from '@yavin/client/models/metadata/request-constraint';
import type { RequestV2 } from '@yavin/client/request';
import { nullInjector } from '../../../helpers/injector';

let Payload: RequestConstraintMetadataPayload;
let RequestConstraint: RequestConstraintMetadataModel;

module('Unit | Model | metadata/request constraint', function (hooks) {
  hooks.beforeEach(async function () {
    Payload = {
      id: 'normalizer-generated:requestConstraint(filters=tableName.dateTime)',
      name: 'Date Time Filter',
      description: 'The request has a Date Time filter that specifies an interval.',
      type: 'existence',
      constraint: { property: 'filters', matches: { type: 'timeDimension', field: 'tableName.dateTime' } },
      source: 'bardOne',
    };

    RequestConstraint = new RequestConstraintMetadataModel(nullInjector, Payload);
  });

  test('it properly hydrates properties', function (assert) {
    assert.expect(6);

    assert.deepEqual(RequestConstraint.id, Payload.id, 'id property is hydrated properly');

    assert.deepEqual(RequestConstraint.name, Payload.name, 'name property was properly hydrated');

    assert.deepEqual(RequestConstraint.description, Payload.description, 'description property was properly hydrated');

    assert.deepEqual(RequestConstraint.type, Payload.type, 'type property was properly hydrated');

    assert.deepEqual(RequestConstraint.constraint, Payload.constraint, 'constraint property was properly hydrated');

    assert.deepEqual(RequestConstraint.source, Payload.source, 'source property was properly hydrated');
  });

  test('constraint can be satisfied', function (assert) {
    assert.expect(2);

    const EmptyRequest: RequestV2 = {
      table: '',
      dataSource: '',
      requestVersion: '2.0',
      limit: null,
      columns: [],
      filters: [],
      sorts: [],
    };

    assert.notOk(
      RequestConstraint.isSatisfied(EmptyRequest),
      'request constraint is not satisfied when there is no matching filter'
    );

    assert.ok(
      RequestConstraint.isSatisfied({
        ...EmptyRequest,
        filters: [{ type: 'timeDimension', field: 'tableName.dateTime', parameters: {}, operator: 'bet', values: [] }],
      }),
      'request constraint is satisfied when there is a matching filter'
    );
  });
});
