import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { Status, DataSourceAvailabilty, FetchedAvailabilityResult } from 'navi-data/services/data-availability';
import type DataAvailabilityService from 'navi-data/services/data-availability';
import { task, TaskGenerator } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import { mapValues } from 'lodash-es';
import moment from 'moment';

function serializeResult(result: DataSourceAvailabilty) {
  return mapValues(result, (s) => ({ ...s, ...('error' in s ? { error: s.error.message } : {}) }));
}

let Service: DataAvailabilityService;
module('Unit | Service | data-availability', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    Service = this.owner.lookup('service:data-availability');
  });

  test('it handles functions', async function (assert) {
    const date = moment.utc();
    const error = new Error('oops');
    Service.registerDataSourceAvailability('a', () => ({ status: Status.OK, date }));
    Service.registerDataSourceAvailability('b', () => {
      throw error;
    });
    Service.registerDataSourceAvailability('c', () => {
      throw 'unknown';
    });

    const result = await taskFor(Service.fetchAll).perform();
    assert.deepEqual(
      serializeResult(result),
      {
        a: { status: Status.OK, date },
        b: { status: Status.UNAVAILABLE, error: 'oops' },
        c: { status: Status.UNAVAILABLE, error: 'Availability Fetch failed' },
      },
      'it fetches all function backed availabilities and handles errors'
    );
  });

  test('it handles promises', async function (assert) {
    const date = moment.utc();
    const error = new Error('oops');
    Service.registerDataSourceAvailability('a', async () => ({ status: Status.DELAYED, date }));
    Service.registerDataSourceAvailability('b', async () => {
      throw error;
    });
    Service.registerDataSourceAvailability('c', async () => {
      throw 'unknown';
    });

    const result = await taskFor(Service.fetchAll).perform();
    assert.deepEqual(
      serializeResult(result),
      {
        a: { status: Status.DELAYED, date },
        b: { status: Status.UNAVAILABLE, error: 'oops' },
        c: { status: Status.UNAVAILABLE, error: 'Availability Fetch failed' },
      },
      'it fetches all promise backed availabilities and handles errors'
    );
  });

  test('it handles tasks', async function (assert) {
    const date = moment.utc();
    class Custom {
      @task *a(): TaskGenerator<FetchedAvailabilityResult> {
        return yield { status: Status.LATE, date: date };
      }
      // eslint-disable-next-line require-yield
      @task *b(): TaskGenerator<FetchedAvailabilityResult> {
        throw new Error('oops');
      }
      // eslint-disable-next-line require-yield
      @task *c(): TaskGenerator<FetchedAvailabilityResult> {
        throw 'unknown';
      }
    }
    const customFetcher = new Custom();
    Service.registerDataSourceAvailability('a', () => taskFor(customFetcher.a).perform());
    Service.registerDataSourceAvailability('b', () => taskFor(customFetcher.b).perform());
    Service.registerDataSourceAvailability('c', () => taskFor(customFetcher.c).perform());

    const result = await taskFor(Service.fetchAll).perform();
    assert.deepEqual(
      serializeResult(result),
      {
        a: { status: Status.LATE, date: date },
        b: { status: Status.UNAVAILABLE, error: 'oops' },
        c: { status: Status.UNAVAILABLE, error: 'Availability Fetch failed' },
      },
      'it fetches all TaskInstance backed availabilities and handles errors'
    );
  });

  test('it fetches a single datasource', async function (assert) {
    const date = moment.utc();
    Service.registerDataSourceAvailability('a', () => ({ status: Status.OK, date }));

    assert.deepEqual(
      await taskFor(Service.fetchDataSource).perform('a'),
      {
        status: Status.OK,
        date,
      },
      'it fetches a single datasource'
    );
  });

  test('it caches a availabilities', async function (assert) {
    let numCalls = 0;
    const date = moment.utc();
    Service.registerDataSourceAvailability('a', () => {
      numCalls++;
      return { status: Status.OK, date };
    });

    const doFetch = async () => {
      await taskFor(Service.fetchDataSource).perform('a');
      return numCalls;
    };

    assert.strictEqual(await doFetch(), 1, 'it performs one call');
    assert.strictEqual(await doFetch(), 1, 'it returns cached value on subsequent call');
    Service['_cache'].clear();
    assert.strictEqual(await doFetch(), 2, 'it fetches after cached value is invalidated');
  });
});
