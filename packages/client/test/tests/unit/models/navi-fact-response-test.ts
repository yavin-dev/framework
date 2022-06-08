import { module, test } from 'qunit';
import NaviFactResponse from '@yavin/client/models/navi-fact-response';
import TimeDimensionMetadataModel from '@yavin/client/models/metadata/time-dimension';
import moment from 'moment';
import { nullInjector } from '../../helpers/injector';
import type { ResponseV1 } from '@yavin/client/serializers/facts/interface';

const eventTimeDay = new TimeDimensionMetadataModel(
  nullInjector,
  //@ts-ignore - partial dim
  {
    id: 'table1.eventTimeDay',
    name: 'Event Time Day',
    source: 'mock',
  }
);

const eventTimeMonth = new TimeDimensionMetadataModel(
  nullInjector,
  //@ts-ignore - partial dim
  {
    id: 'table1.eventTimeMonth',
    name: 'Event Time Month',
    source: 'mock',
  }
);

module('Unit | Model | navi fact response', function () {
  test('create', function (assert) {
    const rows = [{ 'table1.eventTimeDay': '2014-04-02 00:00:00.000' }];
    const meta = {};

    const response = new NaviFactResponse(nullInjector, { rows, meta });
    assert.equal(rows, response.rows, '`NaviFactResponse` can be hydrated with `rows`');
    assert.equal(meta, response.meta, '`NaviFactResponse` can be hydrated with `meta`');
  });

  test('getTimeDimensionAsMoments - cached', function (assert) {
    const rows = [
      { 'table1.eventTimeDay': '2014-04-02 00:00:00.000', 'table1.eventTimeMonth': '2014-04-01 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000', 'table1.eventTimeMonth': '2014-04-01 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000', 'table1.eventTimeMonth': '2014-04-01 00:00:00.000' },
    ];
    const response = new NaviFactResponse(nullInjector, { rows });

    const dayOne = response['getTimeDimensionAsMoments']({ columnMetadata: eventTimeDay });
    const monthOne = response['getTimeDimensionAsMoments']({ columnMetadata: eventTimeMonth });
    const dayTwo = response['getTimeDimensionAsMoments']({ columnMetadata: eventTimeDay });

    assert.notEqual(
      dayOne,
      monthOne,
      '`getTimeDimensionAsMoments` returns different arrays for different time columns'
    );

    assert.strictEqual(
      dayOne,
      dayTwo,
      '`getTimeDimensionAsMoments` returns the same (cached) array for the same time column'
    );
  });

  test('getMaxTimeDimension', function (assert) {
    const rows = [
      { 'table1.eventTimeDay': '2014-04-02 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' },
    ];
    const response = new NaviFactResponse(nullInjector, { rows });
    const max = response.getMaxTimeDimension({ columnMetadata: eventTimeDay });
    assert.ok(
      moment.parseZone(rows[2]['table1.eventTimeDay']).isSame(max),
      '`getMaxTimeDimension` returns the max dateTime for a column in moment form'
    );
  });

  test('getMinTimeDimension', function (assert) {
    const rows = [
      { 'table1.eventTimeDay': '2014-04-02 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' },
    ];
    const response = new NaviFactResponse(nullInjector, { rows });
    const min = response.getMinTimeDimension({ columnMetadata: eventTimeDay });
    assert.ok(
      moment.parseZone(rows[0]['table1.eventTimeDay']).isSame(min),
      '`getMinTimeDimension` returns the min dateTime for a column in moment form'
    );
  });

  test('getMaxTimeDimension/getMinTimeDimension - empty rows', function (assert) {
    const rows: ResponseV1['rows'] = [];
    const response = new NaviFactResponse(nullInjector, { rows });
    const max = response.getMaxTimeDimension({ columnMetadata: eventTimeDay });
    assert.strictEqual(null, max, '`getMaxTimeDimension` returns null for empty responses');

    const min = response.getMinTimeDimension({ columnMetadata: eventTimeDay });
    assert.strictEqual(null, min, '`getMinTimeDimension` returns null for empty responses');
  });

  test('getMaxTimeDimension/getMinTimeDimension - missing value', function (assert) {
    const rows = [
      { 'table1.eventTimeDay': '2014-04-02 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' },
    ];
    const response = new NaviFactResponse(nullInjector, { rows });
    const max = response.getMaxTimeDimension({ columnMetadata: eventTimeMonth });
    assert.strictEqual(null, max, '`getMaxTimeDimension` returns null for missing values');

    const min = response.getMinTimeDimension({ columnMetadata: eventTimeMonth });
    assert.strictEqual(null, min, '`getMinTimeDimension` returns null for missing values');
  });

  test('getMaxTimeDimension/getMinTimeDimension - value gaps', function (assert) {
    const maxRows = [
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': null },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' },
    ];
    const maxResponse = new NaviFactResponse(nullInjector, { rows: maxRows });
    const max = maxResponse.getMaxTimeDimension({ columnMetadata: eventTimeDay });
    assert.ok(
      moment.parseZone(maxRows[2]['table1.eventTimeDay']).isSame(max),
      '`getMaxTimeDimension` returns max dateTime when date values have gaps'
    );

    const minRows = [
      { 'table1.eventTimeDay': null },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
    ];
    const minResponse = new NaviFactResponse(nullInjector, { rows: minRows });

    const min = minResponse.getMinTimeDimension({ columnMetadata: eventTimeDay });
    assert.ok(
      moment.parseZone(minRows[2]['table1.eventTimeDay']).isSame(min),
      '`getMinTimeDimension` returns min dateTime when date values have gaps'
    );
  });

  test('getMaxTimeDimension/getMinTimeDimension - invalid values', function (assert) {
    const rows = [
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': 'not-a-date' },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' },
    ];
    const response = new NaviFactResponse(nullInjector, { rows });
    const max = response.getMaxTimeDimension({ columnMetadata: eventTimeDay });
    assert.strictEqual(null, max, '`getMaxTimeDimension` returns null when encountering an invalid date');

    const min = response.getMinTimeDimension({ columnMetadata: eventTimeDay });
    assert.strictEqual(null, min, '`getMinTimeDimension` returns null when encountering an invalid date');
  });

  test('getIntervalForTimeDimension', function (assert) {
    const rows = [
      { 'table1.eventTimeDay': '2014-04-02 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-02 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' },
    ];
    const response = new NaviFactResponse(nullInjector, { rows });
    const interval = response.getIntervalForTimeDimension({ columnMetadata: eventTimeDay });
    assert.deepEqual(
      interval?.asStrings(),
      {
        start: '2014-04-02T00:00:00.000Z',
        end: '2014-04-04T00:00:00.000Z',
      },
      '`getIntervalForTimeDimension` returns an `Interval` object for a time dimension column'
    );
  });

  test('getIntervalForTimeDimension - missing value', function (assert) {
    const rows = [
      { 'table1.eventTimeDay': '2014-04-02 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' },
    ];
    const response = new NaviFactResponse(nullInjector, { rows });
    const interval = response.getIntervalForTimeDimension({ columnMetadata: eventTimeMonth });
    assert.strictEqual(interval, null, '`getIntervalForTimeDimension` returns null for missing values');
  });

  test('getIntervalForTimeDimension - empty rows ', function (assert) {
    const rows: ResponseV1['rows'] = [];
    const response = new NaviFactResponse(nullInjector, { rows });
    const interval = response.getIntervalForTimeDimension({ columnMetadata: eventTimeDay });
    assert.strictEqual(interval, null, '`getIntervalForTimeDimension` returns null for an empty response');
  });

  test('getIntervalForTimeDimension - invalid values ', function (assert) {
    const rows = [
      { 'table1.eventTimeDay': '2014-04-03 00:00:00.000' },
      { 'table1.eventTimeDay': 'not-a-date' },
      { 'table1.eventTimeDay': '2014-04-04 00:00:00.000' },
    ];
    const response = new NaviFactResponse(nullInjector, { rows });
    const interval = response.getIntervalForTimeDimension({ columnMetadata: eventTimeDay });
    assert.strictEqual(interval, null, '`getIntervalForTimeDimension` returns null when encountering an invalid date');
  });
});
