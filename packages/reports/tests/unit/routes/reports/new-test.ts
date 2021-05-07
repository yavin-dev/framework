import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';

const SERIALIZED_MODEL =
  'EQbwOsAmCGAu0QFzmAS0kiBGCAaCcsATqgEYCusApgM5IoBuqN50ANqgF5yoD2AdvQiwAngAcqmYB35UAtAGMAFtCKw8EBlSI0-g4Iiz5gAWyrwY8IcGgAPZtZHWa21LWuiJUyKjP9dAhrACgIAZqgA5tZmxKgKUtCQAMIcCgDWdMDGPn4B_ADyRJDaSADaEGJEvBJqTsAAutm-VP56mYilKPzQZlIAClU1ogAEOFma7OTuBiiV1dqiUlhYACwQAL7ruF09kgYQA_O1wwBMQQyT08gVgwt1iNgADM-PY5vbEN29-8CHQyLDADM50u7Vmt1qSxejzOwE29U2iK2wlQsDYewewAAEiIiOR0cMAHJUADumWMRCoAEcpjR1DMIGxeBE4uwACrQUjojyc7k_WSwEm8IhpIKwZoAcSI0FQ-kxMDqyNM5hICnanQgMVVCWSqQyGw-yti8X50AYKTi-rhjQgORaeXVKDtrUCPzm_w2NuA4TY1B0ZS9KiY_CiBlKXpowvpHRQWriUm65r15NtqEpCnFrsx0BoJvWXtlfoubEdEDpqmjEBOrwArHJlnJHgBOYbPRBt54AOheQRaGB-1awdYbWAAbK3Hu3J12e9bjKRVJAAGraPJSBhjCnU2mwFc6PTrt5KylsHgCGhKVBiMEEShKYXWSwIBnATwYiDkFz-8ZofuYxOoAA-p-JRwu8wjiO-wCUmIUaZJswBAAA';

const NEW_MODEL = {
  author: 'navi_user',
  createdOn: null,
  request: {
    columns: [],
    dataSource: 'bardOne',
    filters: [],
    limit: null,
    requestVersion: '2.0',
    sorts: [],
    table: 'network',
  },
  title: 'Untitled Report',
  updatedOn: null,
  visualization: {
    metadata: {
      columnAttributes: {},
    },
    type: 'table',
    version: 2,
  },
};

module('Unit | Route | reports/new', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await this.owner.lookup('service:navi-metadata').loadMetadata();

    let mockAuthor = this.owner.lookup('service:store').createRecord('user', { id: 'navi_user' });

    this.owner.register(
      'service:user',
      class extends Service {
        getUser = () => mockAuthor;
      }
    );
  });

  test('model', async function (assert) {
    const model = await this.owner.lookup('route:reports/new').model(null, { queryParams: {} });
    assert.deepEqual(model.toJSON(), NEW_MODEL, 'A new report model is returned');
  });

  test('newModel', async function (assert) {
    const model = await this.owner.lookup('route:reports/new').newModel();
    assert.deepEqual(model.toJSON(), NEW_MODEL, 'A new report model is returned');
    assert.equal(model.request.dataSource, 'bardOne', 'Should fall back to default dataSource');
  });

  test('deserializeUrlModel', async function (assert) {
    const newModel = await this.owner.lookup('route:reports/new').deserializeUrlModel(SERIALIZED_MODEL);

    assert.ok(newModel.get('isNew'), 'A new ember data model is returned');

    assert.ok(newModel.tempId, 'A tempId is present');

    assert.equal(newModel.title, 'Hyrule News', 'The new model inherits the properties of the given serialized model');
  });

  test('deserializeUrlModel - error', async function (assert) {
    assert.expect(1);

    await this.owner
      .lookup('route:reports/new')
      .deserializeUrlModel('not actually a model')
      .catch((error: { message: string }) =>
        assert.equal(
          error.message,
          'Could not parse model query param',
          'When modelString fails to deserialize, a rejected promise is returned'
        )
      );
  });

  test('getDefaultTable', async function (assert) {
    const route = this.owner.lookup('route:reports/new');
    let table = await route.getDefaultTable();
    assert.deepEqual(table.id, 'network', 'Return table based on alphabetical order if default config not specified');

    const defaultDataTable = config.navi.defaultDataTable;

    config.navi.defaultDataTable = 'tableA';
    table = await route.getDefaultTable();
    assert.equal(table.id, 'tableA', 'Return default table');

    config.navi.defaultDataTable = defaultDataTable;
  });
});
