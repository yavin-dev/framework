import { set, get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import config from 'ember-get-config';
import { setupMirage } from 'ember-cli-mirage/test-support';

const defaultDataTable = get(config, 'navi.defaultDataTable');
const NEW_MODEL = {
  createdOn: null,
  requests: [
    {
      table: 'tableA',
      filters: [
        {
          type: 'timeDimension',
          field: 'tableA.dateTime',
          parameters: {
            grain: 'hour'
          },
          operator: 'bet',
          values: ['P1D', 'current']
        }
      ],
      columns: [],
      sorts: [],
      limit: null,
      requestVersion: '2.0',
      dataSource: 'bardOne'
    }
  ],
  title: 'Untitled Widget',
  updatedOn: null,
  visualization: {
    type: 'table',
    version: 1,
    metadata: {
      columns: []
    }
  },
  dashboard: 'dashboard1'
};

let Store, Route;

module('Unit | Route | dashboards/dashboard/widgets/new', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');
    Route = this.owner.factoryFor('route:dashboards/dashboard/widgets/new').create({
      modelFor: () =>
        Store.createRecord('dashboard', {
          id: 'dashboard1',
          author: 'navi_user'
        }),

      router: {
        currentRoute: {
          queryParams: {}
        }
      }
    });

    set(config, 'navi.defaultDataTable', 'tableA');

    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  hooks.afterEach(function() {
    set(config, 'navi.defaultDataTable', defaultDataTable);
  });

  test('model', async function(assert) {
    assert.expect(2);

    return settled().then(() => {
      return Route.model().then(model => {
        assert.deepEqual(model.toJSON(), NEW_MODEL, 'A new widget model is returned');

        assert.equal(
          model.get('author.id'),
          'navi_user',
          'the author of the widget is set using the author from the dashboard'
        );
      });
    });
  });

  test('_newModel', function(assert) {
    assert.expect(2);

    return settled().then(() => {
      return Route._newModel().then(model => {
        assert.deepEqual(model.toJSON(), NEW_MODEL, 'A new widget model is returned');

        assert.equal(
          model.get('author.id'),
          'navi_user',
          'the author of the widget is set using the author from the dashboard'
        );
      });
    });
  });
});
