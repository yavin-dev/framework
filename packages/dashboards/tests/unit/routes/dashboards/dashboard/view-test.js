import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

let Route, Store, MetadataService, compression;

module('Unit | Route | dashboards/dashboard/view', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function() {
    this.server = startMirage();
    Route = this.owner.lookup('route:dashboards/dashboard/view');
    this.owner.lookup('service:user').findUser();
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    compression = this.owner.lookup('service:compression');

    await MetadataService.loadMetadata();
  });

  test('_addFiltersFromQueryParams', async function(assert) {
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
    assert.notOk(Route.get('filters'), 'No filter query params are set');
    assert.equal(dashboard.get('filters.length'), 0, 'Dashboard has no filters');

    await Route._addFiltersFromQueryParams(dashboard, '');
    assert.equal(dashboard.get('filters.length'), 0, 'No filters added when query params are empty');

    let compressedFilters = await compression.compress({ filters: [genderFilter.serialize(), ageFilter.serialize()] });
    await Route._addFiltersFromQueryParams(dashboard, compressedFilters);

    assert.deepEqual(
      dashboard.get('filters').map(fil => fil.serialize()),
      [genderFilter.serialize(), ageFilter.serialize()],
      'Two filters are added from valid filter query params'
    );

    dashboard.rollbackAttributes();

    assert.equal(dashboard.get('filters.length'), 0, 'Dashboard has no filters');

    await Route._addFiltersFromQueryParams(dashboard, 'SomeInvalidFilterString').catch(e => {
      assert.equal(
        e.message,
        `Error decompressing filter query params: SomeInvalidFilterString\nRangeError: Invalid array length`,
        "query params that don't decompress properly throw a decompression error"
      );
    });

    let singleCompressedFilter = await compression.compress(ageFilter);
    await Route._addFiltersFromQueryParams(dashboard, singleCompressedFilter).catch(e => {
      assert.equal(
        e.message,
        `Error decompressing filter query params: ${singleCompressedFilter}\nError: Filter query params are not valid filters`,
        'query params that only contain a single filter rather than an array throw an error'
      );
    });
  });
});
