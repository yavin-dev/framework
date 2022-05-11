import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import { Status } from 'navi-data/services/data-availability';
import moment from 'moment';
import { getStatus, getDataSourceStatuses } from 'navi-core/test-support/data-availability';
import type DataAvailabilityService from 'navi-data/services/data-availability';

const TEMPLATE = hbs`<DataAvailability @dataSources={{this.dataSources}} />`;

let Service: DataAvailabilityService;

module('Integration | Component | data-availability', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    Service = this.owner.lookup('service:data-availability');
  });

  test('no dataSources requested', async function (assert) {
    this.set('dataSources', []);
    await render(TEMPLATE);
    await clickTrigger('.data-availability');

    assert.strictEqual(getStatus(), 'unavailable', 'No status is available');
    assert
      .dom('.data-availability__summary')
      .hasText('No availabilities to show.', 'Shows no availabilities if none have been requested');
  });

  test('all dataSources requested and none configured', async function (assert) {
    await render(TEMPLATE);
    await clickTrigger('.data-availability');

    assert.strictEqual(getStatus(), 'unavailable', 'No status is available');
    assert
      .dom('.data-availability__summary')
      .hasText(
        'Data availability has not been configured.',
        'Shows none configured warning when all dataSources are requested'
      );
  });

  test('all dataSources requested and one configured', async function (assert) {
    const time = moment.utc('2022-05-05T01:23:45.678Z');
    Service.registerDataSourceAvailability('bardOne', () => ({ status: Status.OK, date: time }));
    await render(TEMPLATE);
    await clickTrigger('.data-availability');

    assert.strictEqual(getStatus(), 'ok', 'Status is ok when all are ok');
    assert.deepEqual(
      getDataSourceStatuses(),
      [{ status: 'ok', name: 'Bard One', date: '05/05/2022 - 01:23:45 AM' }],
      'All registered datasources are shown'
    );
  });

  test('all dataSources requested and some configured', async function (assert) {
    const time = moment.utc('2022-05-05T01:23:45.678Z');
    const dayBefore = time.clone().subtract(1, 'day');
    Service.registerDataSourceAvailability('bardOne', () => ({ status: Status.DELAYED, date: time }));
    Service.registerDataSourceAvailability('bardTwo', () => ({ status: Status.LATE, date: dayBefore }));
    await render(TEMPLATE);
    await clickTrigger('.data-availability');

    assert.strictEqual(getStatus(), 'delayed', 'Status is delayed when datasource statuses are mixed');
    assert.deepEqual(
      getDataSourceStatuses(),
      [
        { status: 'delayed', name: 'Bard One', date: '05/05/2022 - 01:23:45 AM' },
        { status: 'late', name: 'Bard Two', date: '05/04/2022 - 01:23:45 AM' },
      ],
      'All registered datasources are shown'
    );

    this.set('dataSources', ['bardTwo']);

    assert.strictEqual(getStatus(), 'late', 'Status is updated when dataSources change');
    assert.deepEqual(
      getDataSourceStatuses(),
      [{ status: 'late', name: 'Bard Two', date: '05/04/2022 - 01:23:45 AM' }],
      'Datasource statuses are reactive'
    );
  });

  test('one unconfigured dataSource requested', async function (assert) {
    this.set('dataSources', ['bardOne']);
    await render(TEMPLATE);
    await clickTrigger('.data-availability');

    assert.strictEqual(getStatus(), 'unavailable', 'Status is unavailable when non configured source is requested');
    assert.deepEqual(
      getDataSourceStatuses(),
      [{ status: 'unavailable', name: 'Bard One', date: 'Availability Unknown' }],
      'All registered datasources are shown'
    );
  });
});
