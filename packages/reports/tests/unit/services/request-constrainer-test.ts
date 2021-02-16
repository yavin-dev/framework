import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import RequestConstrainerService, { TemplateDispatcherAction } from 'navi-reports/services/request-constrainer';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { RequestConstraintMetadata } from 'navi-data/models/metadata/request-constraint';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import MetadataModelRegistry from 'navi-data/models/metadata/registry';
import Route from '@ember/routing/route';
import { mapValues } from 'lodash-es';
import { MessageOptions } from 'navi-core/services/interfaces/navi-notifications';

let RequestConstrainer: RequestConstrainerService;

type Constraint = RequestConstraintMetadata['constraint'];
function makeConstraint(property: Constraint['property'], matches: Constraint['matches'], isSatisfied: boolean) {
  return {
    type: 'existence',
    description: `Constraint requiring that ${property} includes a ${matches.field} ${matches.type}`,
    constraint: {
      property,
      matches,
    },
    isSatisfied() {
      return isSatisfied;
    },
  };
}

function fakeRequest({
  columns = [],
  filters = [],
  requestConstraints = [],
}: {
  columns?: RequestV2['columns'];
  filters?: RequestV2['filters'];
  requestConstraints?: ReturnType<typeof makeConstraint>[];
}): RequestFragment {
  const request = ({
    columns,
    filters,
    sorts: [],
    dataSource: 'dataSource',
    tableMetadata: {
      requestConstraints,
    },
    serialize() {
      return request;
    },
  } as unknown) as RequestFragment;

  return request;
}

function serializeConstraints(constraints: ReturnType<RequestConstrainerService['buildConstraints']>) {
  return constraints.map((dispatcherArgs) =>
    dispatcherArgs.map((arg) => {
      if (typeof arg?.serialize === 'function') {
        const serialized = arg.serialize();
        if (arg instanceof ColumnFragment) {
          serialized.cid = `cid_${arg.canonicalName}`;
        }
        return serialized;
      }
      return arg;
    })
  );
}

module('Unit | Service | request-constrainer', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    RequestConstrainer = this.owner.lookup('service:request-constrainer');
    this.owner.register(
      'service:navi-metadata',
      class extends NaviMetadataService {
        getById<K extends keyof MetadataModelRegistry>(type: string, field: string, _dataSourceName: string) {
          return ({
            getDefaultParameters: () => ({}),
            serialize() {
              return { type, field, mockMeta: true };
            },
          } as unknown) as MetadataModelRegistry[K];
        }
      }
    );
  });

  test('buildConstraints', async function (assert) {
    const request = fakeRequest({
      requestConstraints: [
        makeConstraint('filters', { type: 'timeDimension', field: '1' }, false),
        makeConstraint('filters', { type: 'dimension', field: '2' }, false),
        makeConstraint('filters', { type: 'dimension', field: '3' }, true),
        makeConstraint('columns', { type: 'metric', field: '4' }, false),
        makeConstraint('columns', { type: 'timeDimension', field: '5' }, true),
      ],
    });

    assert.deepEqual(
      serializeConstraints(RequestConstrainer.buildConstraints(request)),
      [
        ['addFilter', { alias: null, cid: 'cid_1', field: '1', parameters: {}, type: 'timeDimension' }],
        ['addFilter', { alias: null, cid: 'cid_2', field: '2', parameters: {}, type: 'dimension' }],
        ['addColumnWithParams', { field: '4', mockMeta: true, type: 'metric' }],
      ],
      'builds dispatcher arguments for constraints that are not satisfied'
    );
  });

  test('constrain', async function (assert) {
    assert.expect(9);
    const request = fakeRequest({
      filters: [{ type: 'metric', field: '4', parameters: {}, operator: 'in', values: [] }],
      columns: [{ type: 'timeDimension', field: '8', parameters: {} }],
      requestConstraints: [
        makeConstraint('filters', { type: 'timeDimension', field: '1' }, false),
        makeConstraint('filters', { type: 'dimension', field: '2' }, false),
        makeConstraint('filters', { type: 'metric', field: '3' }, true),
        makeConstraint('filters', { type: 'metric', field: '4' }, false),
        makeConstraint('columns', { type: 'metric', field: '5' }, false),
        makeConstraint('columns', { type: 'timeDimension', field: '6' }, true),
        makeConstraint('columns', { type: 'dimension', field: '7' }, false),
        makeConstraint('columns', { type: 'timeDimension', field: '8' }, false),
      ],
    });

    const fakeRoute = ({
      modelFor: () => ({ request, title: 'Fake Report' }),
    } as unknown) as Route;

    RequestConstrainer.naviNotifications.add = ({ title, style, context }: MessageOptions) => {
      assert.deepEqual(style, 'warning', 'A warning is issued when constraints are not satisfied');
      assert.deepEqual(
        title,
        'The following requirements are not satisfied',
        'The warning says which constraints could not be satisfied'
      );
      assert.deepEqual(
        context,
        'Constraint requiring that filters includes a 2 dimension; Constraint requiring that columns includes a 7 dimension',
        'The failed constraints are passed as the context'
      );
    };

    let actionNum = 0;
    let expectedActions = [
      ['addFilter', fakeRoute, { alias: null, cid: 'cid_1', field: '1', parameters: {}, type: 'timeDimension' }],
      ['addFilter', fakeRoute, { alias: null, cid: 'cid_2', field: '2', parameters: {}, type: 'dimension' }],
      ['addFilter', fakeRoute, { alias: null, cid: 'cid_4', field: '4', parameters: {}, type: 'metric' }],
      ['addColumnWithParams', fakeRoute, { field: '5', mockMeta: true, type: 'metric' }],
      ['addColumnWithParams', fakeRoute, { field: '7', mockMeta: true, type: 'dimension' }],
      ['addColumnWithParams', fakeRoute, { field: '8', mockMeta: true, type: 'timeDimension' }],
    ];
    RequestConstrainer.updateReportActionDispatcher.dispatch = (...args: TemplateDispatcherAction) => {
      const [serialized] = serializeConstraints([args]);
      assert.deepEqual(serialized, expectedActions[actionNum++], 'The expected actions are passed in');
      const fieldNum = Number(serialized[2].field);
      if (fieldNum !== 2 && fieldNum !== 7) {
        request.tableMetadata!.requestConstraints[fieldNum - 1].isSatisfied = () => true;
      }
    };

    RequestConstrainer.constrain(fakeRoute);
  });

  test('getConstrainedProperties', async function (assert) {
    const requiredFilters: RequestV2['filters'] = [
      { type: 'timeDimension', field: '1', parameters: {}, operator: 'bet', values: [] },
      { type: 'dimension', field: '2', parameters: {}, operator: 'in', values: [] },
      { type: 'dimension', field: '3', parameters: {}, operator: 'isnull', values: [true] },
    ];
    const requiredColumns: RequestV2['columns'] = [
      { type: 'metric', field: '4', parameters: {} },
      { type: 'timeDimension', field: '5', parameters: {} },
    ];
    const request = fakeRequest({
      filters: [
        { type: 'timeDimension', field: 'skipped', parameters: {}, operator: 'bet', values: [] },
        { type: 'metric', field: 'skipped', parameters: {}, operator: 'bet', values: [] },
        ...requiredFilters,
        { type: 'dimension', field: 'skipped', parameters: {}, operator: 'bet', values: [] },
      ],
      columns: [
        { type: 'timeDimension', field: 'skipped', parameters: {} },
        { type: 'metric', field: 'skipped', parameters: {} },
        ...requiredColumns,
        { type: 'dimension', field: 'skipped', parameters: {} },
      ],
      requestConstraints: [
        makeConstraint('filters', { type: 'timeDimension', field: '1' }, false),
        makeConstraint('filters', { type: 'dimension', field: '2' }, false),
        makeConstraint('filters', { type: 'dimension', field: '3' }, true),
        makeConstraint('columns', { type: 'metric', field: '4' }, false),
        makeConstraint('columns', { type: 'timeDimension', field: '5' }, true),
      ],
    });

    assert.deepEqual(
      mapValues(RequestConstrainer.getConstrainedProperties(request), (p) => (p ? [...p] : [])),
      {
        //@ts-expect-error
        filters: requiredFilters,
        //@ts-expect-error
        columns: requiredColumns,
      },
      'Returns the list of filters and columns that match the given request constraints'
    );
  });
});
