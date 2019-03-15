import { A } from '@ember/array';
import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { set, get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import config from 'ember-get-config';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

const SERIALIZED_MODEL =
  'EQbwOsAmCGAu0QFzmAS0kiBGCAaCcsATqgEYCusApgM5IoBuqN50ANqgF5yoD2AdvQiwAngAcqmYB35UAtAGMAFtCKw8EBlSI0-g4Iiz5gAWyrwY8IcGgAPZtZHWa21LWuiJUyKjP9dAhrACgIAZqgA5tZmxKgKUtCQAMIcCgDWdMDGPn4B_ADyRJDaSADaEGJEvBJqTsAAutm-VP56mYilKPzQZlIAClU1ogAEOFma7OTuBiiV1dqiUlhYACwQAL7ruF09kgYQA_O1wwBMQQyT08gVgwt1iNgADM-PY5vbEN29-8CHQyLDADM50u7Vmt1qSxejzOwE29U2iK2wlQsDYewewAAEiIiOR0cMAHJUADumWMRCoAEcpjR1DMIGxeBE4uwACrQUjojyc7k_WSwEm8IhpIKwZoAcSI0FQ-kxMDqyNM5hICnanQgMVVCWSqQyGw-yti8X50AYKTi-rhjQgORaeXVKDtrUCPzm_w2NuA4TY1B0ZS9KiY_CiBlKXpowvpHRQWriUm65r15NtqEpCnFrsx0BoJvWXtlfoubEdEDpqmjEBOrwArHJlnJHgBOYbPRBt54AOheQRaGB-1awdYbWAAbK3Hu3J12e9bjKRVJAAGraPJSBhjCnU2mwFc6PTrt5KylsHgCGhKVBiMEEShKYXWSwIBnATwYiDkFz-8ZofuYxOoAA-p-JRwu8wjiO-wCUmIUaZJswBAAA';

const NEW_MODEL = {
  author: 'navi_user',
  createdOn: null,
  request: {
    bardVersion: 'v1',
    dimensions: [],
    filters: [],
    having: [],
    intervals: [
      {
        end: 'current',
        start: 'P1D'
      }
    ],
    logicalTable: {
      table: 'network',
      timeGrain: 'day'
    },
    metrics: [],
    requestVersion: 'v1',
    sort: []
  },
  title: 'Untitled Report',
  updatedOn: null,
  visualization: {
    metadata: {
      columns: []
    },
    type: 'table',
    version: 1
  }
};

module('Unit | Route | reports/new', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();

    let metadataService = this.owner.lookup('service:bard-metadata');
    metadataService.loadMetadata();

    let mockAuthor = this.owner.lookup('service:store').createRecord('user', { id: 'navi_user' });

    this.owner.register(
      'service:user',
      Service.extend({
        getUser: () => mockAuthor
      })
    );
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('model', function(assert) {
    assert.expect(1);

    return settled().then(() => {
      let model = this.owner.lookup('route:reports/new').model(null, { queryParams: {} });

      assert.deepEqual(model.toJSON(), NEW_MODEL, 'A new report model is returned');
    });
  });

  test('_newModel', function(assert) {
    assert.expect(1);

    return settled().then(() => {
      let model = this.owner.lookup('route:reports/new')._newModel();
      assert.deepEqual(model.toJSON(), NEW_MODEL, 'A new report model is returned');
    });
  });

  test('_deserializeUrlModel', function(assert) {
    assert.expect(3);

    return settled().then(() => {
      return this.owner
        .lookup('route:reports/new')
        ._deserializeUrlModel(SERIALIZED_MODEL)
        .then(newModel => {
          assert.ok(newModel.get('isNew'), 'A new ember data model is returned');

          assert.ok(get(newModel, 'tempId'), 'A tempId is present');

          assert.equal(
            get(newModel, 'title'),
            'Hyrule News',
            'The new model inherits the properties of the given serialized model'
          );
        });
    });
  });

  test('_deserializeUrlModel - error', function(assert) {
    assert.expect(1);

    return settled().then(() => {
      return this.owner
        .lookup('route:reports/new')
        ._deserializeUrlModel('not actually a model')
        .catch(error =>
          assert.equal(
            error.message,
            'Could not parse model query param',
            'When modelString fails to deserialize, a rejected promise is returned'
          )
        );
    });
  });

  test('_getDefaultTable', function(assert) {
    assert.expect(2);

    return settled().then(() => {
      let table = this.owner.lookup('route:reports/new')._getDefaultTable();
      assert.deepEqual(
        table.name,
        'network',
        'Return table based on alphabetical order if default config not specified'
      );

      let defaultDataTable = get(config, 'navi.defaultDataTable');

      set(config, 'navi.defaultDataTable', 'tableA');
      table = this.owner.lookup('route:reports/new')._getDefaultTable();
      assert.deepEqual(table.name, 'tableA', 'Return default table');

      set(config, 'navi.defaultDataTable', defaultDataTable);
    });
  });

  test('_getDefaultTimeGrainName', function(assert) {
    assert.expect(3);

    return settled().then(() => {
      let table = this.owner.lookup('route:reports/new')._getDefaultTable(),
        tableTimeGrains = A(get(table, 'timeGrains')),
        timeGrainName = this.owner.lookup('route:reports/new')._getDefaultTimeGrainName(table);

      assert.deepEqual(
        timeGrainName,
        get(tableTimeGrains, 'firstObject.name'),
        'Return the first time grain in the table'
      );

      let defaultTimeGrain = get(config, 'navi.defaultTimeGrain');

      set(config, 'navi.defaultTimeGrain', 'year');
      timeGrainName = this.owner.lookup('route:reports/new')._getDefaultTimeGrainName(table);
      assert.deepEqual(timeGrainName, 'year', 'Return default time grain');

      set(config, 'navi.defaultTimeGrain', 'no');
      timeGrainName = this.owner.lookup('route:reports/new')._getDefaultTimeGrainName(table);
      assert.deepEqual(
        timeGrainName,
        get(tableTimeGrains, 'firstObject.name'),
        'Return the first time grain in the table when default is not found'
      );

      set(config, 'navi.defaultTimeGrain', defaultTimeGrain);
    });
  });
});
