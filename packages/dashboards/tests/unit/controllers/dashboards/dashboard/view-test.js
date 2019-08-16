import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

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

  test('updateFilter', async function(assert) {
    assert.expect(3);

    let osFilter = Store.createFragment('bard-request/fragments/filter', {
        dimension: MetadataService.getById('dimension', 'os'),
        operator: 'in',
        field: 'id',
        rawValues: ['MacOS']
      }),
      author = await Store.findRecord('user', 'navi_user'),
      dashboard = Store.createRecord('dashboard', {
        title: 'Test Dashboard',
        author
      });

    dashboard.get('filters').pushObject(osFilter);
    await dashboard.save();

    assert.equal(dashboard.get('filters.length'), 1, 'Dashboard has one filter');

    controller.transitionToRoute = async (destination, transition) => {
      assert.deepEqual(
        transition,
        {
          queryParams: {
            filters:
              'EQbwOsBmCWA2AuBTATgZwgLgNrmAE2gFtEA7VaAexMwgvWABpaAHFAQ3guRuGmsYgA3NrACuietggBZNgGMA8gGUITYAHU-eCgHd6AXTUxEsPD2hngAX31XgQAA'
          }
        },
        'Updating the filter sets the filters query param to the expected compressed string'
      );

      const decompressed = await compression.decompress(transition.queryParams.filters);
      assert.deepEqual(
        decompressed,
        {
          filters: [
            {
              dimension: 'os',
              field: 'id',
              operator: 'in',
              values: ['MacOS', 'Windows']
            }
          ]
        },
        'The filter decompresses correctly'
      );
    };

    await controller.send('updateFilter', dashboard, osFilter, { rawValues: ['MacOS', 'Windows'] });
  });

  test('removeFilter', async function(assert) {
    let osFilter = Store.createFragment('bard-request/fragments/filter', {
        dimension: MetadataService.getById('dimension', 'os'),
        operator: 'in',
        field: 'id',
        rawValues: ['MacOS']
      }),
      author = await Store.findRecord('user', 'navi_user'),
      dashboard = Store.createRecord('dashboard', {
        title: 'Test Dashboard',
        author
      });

    dashboard.get('filters').pushObject(osFilter);
    await dashboard.save();

    assert.equal(dashboard.get('filters.length'), 1, 'Dashboard has one filter');

    controller.transitionToRoute = async (destination, transition) => {
      assert.deepEqual(
        transition,
        {
          queryParams: {
            filters: 'EQbwOsBmCWA2AuBTATgZwgLgNoF0C-wQAAA'
          }
        },
        'Removing the filter sets the filters query param to the expected compressed string'
      );

      const decompressed = await compression.decompress(transition.queryParams.filters);
      assert.deepEqual(decompressed, { filters: [] }, 'The filter decompresses correctly to an empty array');
    };

    await controller.send('removeFilter', dashboard, osFilter);
  });

  test('addFilter', async function(assert) {
    let author = await Store.findRecord('user', 'navi_user'),
      dashboard = Store.createRecord('dashboard', {
        title: 'Test Dashboard',
        author
      });

    controller.transitionToRoute = async (destination, transition) => {
      assert.deepEqual(
        transition,
        {
          queryParams: {
            filters:
              'EQbwOsBmCWA2AuBTATgZwgLgNrmAE2gFtEA7VaAexMwgEMBzRCAGggoAcVb4Lkbho1YK2AA3WrACuidMGwBdETESw8_aGuABfeVuBAAA'
          }
        },
        'Adding a filter sets the filters query param to the expected compressed string'
      );

      const decompressed = await compression.decompress(transition.queryParams.filters);
      assert.deepEqual(
        decompressed,
        {
          filters: [
            {
              dimension: 'age',
              operator: 'in',
              values: [],
              field: 'id'
            }
          ]
        },
        'The filter decompresses correctly to an array with a valueless filter'
      );
    };

    await controller.send('addFilter', dashboard, { dimension: 'age' });
  });
});
