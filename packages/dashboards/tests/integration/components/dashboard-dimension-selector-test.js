import { module, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { A as arr } from '@ember/array';
import { clickTrigger, selectChoose } from 'ember-power-select/test-support/helpers';
import { settled, render } from '@ember/test-helpers';

module('Integration | Component | dashboard dimension selector', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with right options', async function(assert) {
    assert.expect(3);

    const dashboard = {
      widgets: Promise.resolve([
        {
          requests: arr([
            {
              dataSource: 'bardOne',
              requestVersion: '2.0',
              sorts: [],
              columns: [],
              filters: [],
              limit: null,
              table: 'a',
              tableMetadata: {
                id: 'a',
                dimensions: [
                  { id: 'dim1', name: 'dim1', category: 'cat1', metadataType: 'dimension' },
                  { id: 'dim2', name: 'dim2', category: 'cat2', metadataType: 'dimension' }
                ]
              }
            }
          ])
        },

        {
          requests: arr([
            {
              dataSource: 'bardOne',
              requestVersion: '2.0',
              sorts: [],
              columns: [],
              filters: [],
              limit: null,
              table: 'b',
              tableMetadata: {
                id: 'b',
                dimensions: [
                  { id: 'dim3', name: 'dim3', category: 'cat2', metadataType: 'dimension' },
                  { id: 'dim1', name: 'dim1', category: 'cat1', metadataType: 'dimension' }
                ]
              }
            }
          ])
        }
      ])
    };

    this.set('dashboard', dashboard);

    this.set('changeme', function(selection) {
      assert.deepEqual(
        selection,
        { type: 'dimension', field: 'dim1', name: 'dim1', tables: ['a', 'b'], dataSource: 'bardOne' },
        'Selection sends correct dimension object'
      );
    });

    await render(hbs`<DashboardDimensionSelector @dashboard={{this.dashboard}} @onChange={{this.changeme}} />`);

    await settled();

    await clickTrigger();

    const dropdown = document.querySelector('.ember-basic-dropdown-content');

    assert.deepEqual(
      structure(dropdown),
      { cat1: ['dim1'], cat2: ['dim2', 'dim3'] },
      'Correct select structure is shown'
    );

    assert.dom('.ember-power-select-placeholder').hasText('Dimension');

    await selectChoose('.ember-power-select-trigger', 'dim1');
  });

  test('it renders multi-datasource widgets with right options', async function(assert) {
    assert.expect(1);
    const dashboard = {
      widgets: Promise.resolve([
        {
          requests: arr([
            {
              dataSource: 'bardOne',
              requestVersion: '2.0',
              sorts: [],
              columns: [],
              filters: [],
              limit: null,
              table: 'a',
              tableMetadata: {
                id: 'a',
                timeDimensions: [],
                dimensions: [
                  { id: 'dim1', name: 'dim1', category: 'cat1' },
                  { id: 'dim2', name: 'dim2', category: 'cat2' }
                ]
              }
            }
          ])
        },
        {
          requests: arr([
            {
              dataSource: 'bardTwo',
              requestVersion: '2.0',
              sorts: [],
              columns: [],
              filters: [],
              limit: null,
              table: 'b',
              tableMetadata: {
                id: 'b',
                timeDimensions: [],
                dimensions: [
                  { id: 'dim3', name: 'dim3', category: 'cat3' },
                  { id: 'dim4', name: 'dim4', category: 'cat1' },
                  { id: 'dim2', name: 'dim2', category: 'cat4' }
                ]
              }
            }
          ])
        }
      ])
    };

    this.set('dashboard', dashboard);

    this.set('changeme', () => undefined);

    await render(hbs`<DashboardDimensionSelector @dashboard={{this.dashboard}} @onChange={{this.changeme}} />`);

    await settled();

    await clickTrigger();

    const dropdown = document.querySelector('.ember-basic-dropdown-content');

    assert.deepEqual(
      structure(dropdown),
      { 'cat1 (bardTwo)': ['dim4'], 'cat1 (bardOne)': ['dim1'], cat2: ['dim2'], cat3: ['dim3'], cat4: ['dim2'] },
      'Correct select structure is shown'
    );
  });
});

const structure = dropdown =>
  [...dropdown.querySelectorAll('.ember-power-select-group')].reduce((obj, el) => {
    const key = el.querySelector('.ember-power-select-group-name').textContent.trim();
    const value = [...el.querySelectorAll('.ember-power-select-option')].map(el => el.textContent.trim());
    return Object.assign({}, obj, { [key]: value });
  }, {});
