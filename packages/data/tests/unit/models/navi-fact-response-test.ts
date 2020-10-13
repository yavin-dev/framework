import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import { TestContext as Context } from 'ember-test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import ElideOneScenario from 'navi-data/mirage/scenarios/elide-one';
import { Server } from 'miragejs';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import TimeDimensionMetadataModel from 'navi-data/models/metadata/time-dimension';
import moment from 'moment';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';

interface TestContext extends Context {
  metadataService: NaviMetadataService;
  server: Server;
}

module('Unit | Model | navi fact response', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function(this: TestContext) {
    ElideOneScenario(this.server);
    this.metadataService = this.owner.lookup('service:navi-metadata');
    await this.metadataService.loadMetadata({ dataSourceName: 'elideOne' });
  });

  test('create', function(this: TestContext, assert) {
    const rows = [{ 'table1.eventTimeDay': '2014-04-02 00:00:00.000' }];
    const meta = {};

    const response = NaviFactResponse.create({ rows, meta });
    assert.equal(rows, response.rows, '`NaviFactResponse` can be hydrated with `rows`');
    assert.equal(meta, response.meta, '`NaviFactResponse` can be hydrated with `meta`');
  });

  test('getMaxTimeDimension', function(this: TestContext, assert) {
    const rows = [
      { 'table1.eventTimeDay': '2014-04-02 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' }
    ];
    const response = NaviFactResponse.create({ rows });
    const columnMetadata = this.metadataService.getById(
      'timeDimension',
      'table1.eventTimeDay',
      'elideOne'
    ) as TimeDimensionMetadataModel;
    const max = response.getMaxTimeDimension({ columnMetadata });
    assert.ok(
      moment(rows[2]['table1.eventTimeDay']).isSame(max),
      '`getMaxTimeDimension` returns the max dateTime for a column in moment form'
    );
  });

  test('getMinTimeDimension', function(this: TestContext, assert) {
    const rows = [
      { 'table1.eventTimeDay': '2014-04-02 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' }
    ];
    const response = NaviFactResponse.create({ rows });
    const columnMetadata = this.metadataService.getById(
      'timeDimension',
      'table1.eventTimeDay',
      'elideOne'
    ) as TimeDimensionMetadataModel;
    const min = response.getMinTimeDimension({ columnMetadata });
    assert.ok(
      moment(rows[0]['table1.eventTimeDay']).isSame(min),
      '`getMinTimeDimension` returns the min dateTime for a column in moment form'
    );
  });

  test('getMaxTimeDimension/getMaxTimeDimension - empty column', function(this: TestContext, assert) {
    const rows: ResponseV1['rows'] = [];
    const response = NaviFactResponse.create({ rows });
    const columnMetadata = this.metadataService.getById(
      'timeDimension',
      'table1.eventTimeDay',
      'elideOne'
    ) as TimeDimensionMetadataModel;
    const max = response.getMaxTimeDimension({ columnMetadata });
    assert.equal(null, max, '`getMaxTimeDimension` returns null for empty responses');

    const min = response.getMinTimeDimension({ columnMetadata });
    assert.equal(null, min, '`getMinTimeDimension` returns null for empty responses');
  });

  test('getMaxTimeDimension/getMaxTimeDimension - missing value', function(this: TestContext, assert) {
    const rows = [
      { 'table1.eventTimeDay': '2014-04-02 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' }
    ];
    const response = NaviFactResponse.create({ rows });
    const columnMetadata = this.metadataService.getById(
      'timeDimension',
      'table1.eventTimeMonth',
      'elideOne'
    ) as TimeDimensionMetadataModel;
    const max = response.getMaxTimeDimension({ columnMetadata });
    assert.equal(null, max, '`getMaxTimeDimension` returns null for missing values');

    const min = response.getMinTimeDimension({ columnMetadata });
    assert.equal(null, min, '`getMinTimeDimension` returns null for missing values');
  });

  test('getMaxTimeDimension/getMaxTimeDimension - value gaps', function(this: TestContext, assert) {
    const columnMetadata = this.metadataService.getById(
      'timeDimension',
      'table1.eventTimeDay',
      'elideOne'
    ) as TimeDimensionMetadataModel;

    const maxRows = [
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': null },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' }
    ];
    const maxResponse = NaviFactResponse.create({ rows: maxRows });
    const max = maxResponse.getMaxTimeDimension({ columnMetadata });
    assert.ok(
      moment(maxRows[2]['table1.eventTimeDay']).isSame(max),
      '`getMaxTimeDimension` returns max dateTime when date values have gaps'
    );

    const minRows = [
      { 'table1.eventTimeDay': null },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' }
    ];
    const minResponse = NaviFactResponse.create({ rows: minRows });

    const min = minResponse.getMinTimeDimension({ columnMetadata });
    assert.ok(
      moment(minRows[2]['table1.eventTimeDay']).isSame(min),
      '`getMinTimeDimension` returns min dateTime when date values have gaps'
    );
  });
});
