import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | dashboard filters collapsed filter', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    const MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  test('it renders', async function(assert) {
    this.filter = {
      dimension: {
        name: 'property',
        longName: 'Property'
      },
      operator: 'in',
      field: 'id',
      rawValues: ['1', '2']
    };

    await render(hbs`{{dashboard-filters-collapsed-filter filter=filter}}`);

    assert.dom(this.element).hasText('Property equals 1, 2', 'Renders a filter string');
  });

  test('value fallbacks', async function(assert) {
    this.filter = {
      dimension: {
        name: 'property',
        longName: 'Property'
      },
      operator: 'in',
      field: 'id',
      rawValues: ['1', '2'],
      values: [{ id: '2', description: 'ValueDesc' }]
    };

    await render(hbs`{{dashboard-filters-collapsed-filter filter=filter}}`);

    assert.dom(this.element).hasText('Property equals 1, ValueDesc (2)', 'has value description');
  });

  test('dimension fallbacks', async function(assert) {
    this.filter = {
      dimension: {
        name: 'property',
        longName: 'Property'
      },
      operator: 'in',
      field: 'id',
      rawValues: ['1', '2'],
      values: [{ id: '1', description: 'Something' }, { id: '2', description: 'ValueDesc' }]
    };

    await render(hbs`{{dashboard-filters-collapsed-filter filter=filter}}`);

    this.set('filter.dimension.longName', '');

    assert
      .dom(this.element)
      .hasText('property equals Something (1), ValueDesc (2)', 'uses dimension.name as fallback for empty string');

    this.set('filter.dimension.longName', null);

    assert
      .dom(this.element)
      .hasText('property equals Something (1), ValueDesc (2)', 'uses dimension.name as fallback for null');

    this.set('filter.dimension', 'dimstring');
    assert
      .dom(this.element)
      .hasText('dimstring equals Something (1), ValueDesc (2)', 'uses dimension if dimension is a string');

    this.set('filter.dimension', null);
    assert
      .dom(this.element)
      .hasText(
        'Unknown Dimension equals Something (1), ValueDesc (2)',
        'if all fallbacks fail resort to "Unknown Dimension"'
      );
  });

  test('operator mapping', async function(assert) {
    this.filter = {
      dimension: {
        name: 'property',
        longName: 'Property'
      },
      operator: 'in',
      field: 'id',
      rawValues: ['1', '2'],
      values: [{ id: '1', description: 'Something' }, { id: '2', description: 'ValueDesc' }]
    };

    await render(hbs`{{dashboard-filters-collapsed-filter filter=filter}}`);

    assert.dom(this.element).hasText('Property equals Something (1), ValueDesc (2)', '`in` is rendered as "equals"');

    this.set('filter.operator', 'notin');
    assert
      .dom(this.element)
      .hasText('Property not equals Something (1), ValueDesc (2)', '`notin` is rendered as "not equals"');

    this.set('filter.operator', 'unknownop');
    assert
      .dom(this.element)
      .hasText('Property unknownop Something (1), ValueDesc (2)', 'unknown ops are passed through');

    this.set('filter.operator', null);
    assert.dom(this.element).hasText('Property noop Something (1), ValueDesc (2)', 'falsy ops are rendered as "noop"');
  });

  test('it respects the field provided by meta data', async function(assert) {
    this.filter = {
      dimension: {
        name: 'property',
        longName: 'Property'
      },
      operator: 'in',
      field: 'key',
      rawValues: ['property|4', 'property|7', 'property|9'],
      values: [
        { key: 'property|7', id: 'property|4', description: 'Something' },
        { key: 'property|4', id: 'property|7', description: 'ValueDesc' },
        { key: 'property|9', id: 'property|9' }
      ]
    };

    await render(hbs`{{dashboard-filters-collapsed-filter filter=filter}}`);

    this.set('filter.dimension.longName', '');
    assert
      .dom(this.element)
      .hasText(
        'property equals ValueDesc (property|7), Something (property|4), property|9',
        'when field = "key" rawValues are matched against id prop, not key'
      );
  });
});
