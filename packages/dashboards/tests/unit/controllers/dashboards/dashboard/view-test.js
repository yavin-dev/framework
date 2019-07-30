import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import { settled } from '@ember/test-helpers';

let Store, MetadataService, controller, compression;

module('Unit | Controller | dashboards/dashboard/view', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.server = startMirage();
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');

    controller = this.owner.lookup('controller:dashboards/dashboard/view');
    compression = this.owner.lookup('service:compression');

    return MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });

  test('_removeAllFiltersFromDashboard', function(assert) {
    assert.expect(2);

    let osFilter = Store.createFragment('bard-request/fragments/filter', {
        dimension: MetadataService.getById('dimension', 'os'),
        operator: 'in',
        field: 'id',
        rawValues: ['MacOS']
      }),
      ageFilter = Store.createFragment('bard-request/fragments/filter', {
        dimension: MetadataService.getById('dimension', 'age'),
        operator: 'notin',
        field: 'id',
        rawValues: ['13-17', '18-25']
      }),
      dashboard = Store.createRecord('dashboard', {
        title: 'Test Dashboard'
      });

    dashboard.get('filters').pushObjects([osFilter, ageFilter]);
    assert.equal(dashboard.get('filters.length'), 2, 'Dashboard has two filters');
    controller._removeAllFiltersFromDashboard(dashboard);

    assert.equal(dashboard.get('filters.length'), 0, 'Dashboard has no filters');
  });

  test('generateFilterQueryParams', async function(assert) {
    assert.expect(8);

    let osFilter = Store.createFragment('bard-request/fragments/filter', {
        dimension: MetadataService.getById('dimension', 'os'),
        operator: 'in',
        field: 'id',
        rawValues: ['MacOS']
      }),
      ageFilter = Store.createFragment('bard-request/fragments/filter', {
        dimension: MetadataService.getById('dimension', 'age'),
        operator: 'notin',
        field: 'id',
        rawValues: ['13-17', '18-25']
      }),
      author = await Store.findRecord('user', 'navi_user'),
      dashboard = Store.createRecord('dashboard', {
        title: 'Test Dashboard',
        author
      });
    controller.transitionToRoute = transition => {
      controller.filters = transition.queryParams.filters;
    };
    controller.set('model', { dashboard });
    dashboard.get('filters').pushObject(osFilter);
    await dashboard.save();

    assert.equal(dashboard.get('filters.length'), 1, 'Dashboard has one filter');
    assert.notOk(dashboard.hasDirtyAttributes, 'Dashboard has one filter in clean state');
    assert.notOk(controller.get('filters'), 'No query params set in controller');

    await generateFilterQueryParams(controller);

    assert.notOk(controller.get('filters'), 'No query params generated in controller when model is in clean state');

    dashboard.get('filters').pushObject(ageFilter);

    assert.ok(dashboard.hasDirtyAttributes, 'Dashboard has two filters in dirty state');

    await generateFilterQueryParams(controller);
    let expectedQueryParams = await compression.compress({ filters: [osFilter.serialize(), ageFilter.serialize()] });

    assert.equal(
      controller.filters,
      expectedQueryParams,
      'Filter fragments are compressed correctly when dashboard has dirty filters'
    );

    dashboard.rollbackAttributes();
    assert.notOk(dashboard.hasDirtyAttributes, 'Dashboard is in a clean state');

    await generateFilterQueryParams(controller);

    assert.notOk(controller.get('filters'), 'No query params generated in controller after model rollback');
  });

  test('addFiltersFromQueryParams', async function(assert) {
    assert.expect(7);

    let author = await Store.findRecord('user', 'navi_user'),
      genderFilter = Store.createFragment('bard-request/fragments/filter', {
        dimension: MetadataService.getById('dimension', 'gender'),
        operator: 'in',
        field: 'id',
        rawValues: ['Male']
      }),
      ageFilter = Store.createFragment('bard-request/fragments/filter', {
        dimension: MetadataService.getById('dimension', 'age'),
        operator: 'notin',
        field: 'desc',
        rawValues: ['13-17', '18-20']
      }),
      dashboard = Store.createRecord('dashboard', {
        title: 'Test Dashboard',
        author
      });
    controller.set('model', { dashboard });

    assert.notOk(controller.get('filters'), 'No filter query params are set');
    assert.equal(dashboard.get('filters.length'), 0, 'Dashboard has no filters');

    await controller.addFiltersFromQueryParams();
    assert.equal(dashboard.get('filters.length'), 0, 'No filters added when query params are empty');

    let compressedFilters = await compression.compress({ filters: [genderFilter.serialize(), ageFilter.serialize()] });
    controller.set('filters', compressedFilters);
    await controller.addFiltersFromQueryParams();

    assert.deepEqual(
      dashboard.get('filters').map(fil => fil.serialize()),
      [genderFilter.serialize(), ageFilter.serialize()],
      'Two filters are added from valid filter query params'
    );

    dashboard.rollbackAttributes();

    assert.equal(dashboard.get('filters.length'), 0, 'Dashboard has no filters');
    controller.set('filters', 'SomeInvalidFilterString');

    await controller.addFiltersFromQueryParams().catch(e => {
      assert.equal(
        e.message,
        `Error decompressing filter query params: SomeInvalidFilterString\nRangeError: Invalid array length`,
        "query params that don't decompress properly throw a decompression error"
      );
    });

    let singleCompressedFilter = await compression.compress(ageFilter);
    controller.set('filters', singleCompressedFilter);
    await controller.addFiltersFromQueryParams().catch(e => {
      assert.equal(
        e.message,
        `Error decompressing filter query params: ${singleCompressedFilter}\nError: Filter query params are not valid filters`,
        'query params that only contain a single filter rather than an array throw an error'
      );
    });
  });
});

/**
 * Wait for query params to generate
 * @function generateFilterQueryParams
 */
async function generateFilterQueryParams(controller) {
  controller.send('generateFilterQueryParams');
  await settled();
}
