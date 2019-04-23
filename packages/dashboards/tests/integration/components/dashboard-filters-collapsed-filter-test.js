import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'dashboard-filters-collapsed-filter',
  'Integration | Component | dashboard filters collapsed filter',
  {
    integration: true
  }
);

test('it renders', function(assert) {
  this.filter = {
    dimension: {
      name: 'property',
      longName: 'Proptery'
    },
    operator: 'in',
    field: 'id',
    rawValues: ['1', '2']
  };

  this.render(hbs`{{dashboard-filters-collapsed-filter filter=filter}}`);

  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'Proptery equals 1, 2',
    'Renders a filter string'
  );
});

test('value fallbacks', function(assert) {
  this.filter = {
    dimension: {
      name: 'property',
      longName: 'Proptery'
    },
    operator: 'in',
    field: 'id',
    rawValues: ['1', '2'],
    values: [{ id: '2', description: 'ValueDesc' }]
  };

  this.render(hbs`{{dashboard-filters-collapsed-filter filter=filter}}`);

  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'Proptery equals 1, ValueDesc (2)',
    'has value description'
  );
});

test('dimension fallbacks', function(assert) {
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

  this.render(hbs`{{dashboard-filters-collapsed-filter filter=filter}}`);

  this.set('filter.dimension.longName', '');
  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'property equals Something (1), ValueDesc (2)',
    'uses dimension.name as fallback for empty string'
  );

  this.set('filter.dimension.longName', null);
  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'property equals Something (1), ValueDesc (2)',
    'uses dimension.name as fallback for null'
  );

  this.set('filter.dimension', 'dimstring');
  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'dimstring equals Something (1), ValueDesc (2)',
    'uses dimension if dimension is a string'
  );

  this.set('filter.dimension', null);
  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'Unknown Dimension equals Something (1), ValueDesc (2)',
    'if all fallbacks fail resort to "Unknown Dimension"'
  );
});

test('operator mapping', function(assert) {
  this.filter = {
    dimension: {
      name: 'property',
      longName: 'Proptery'
    },
    operator: 'in',
    field: 'id',
    rawValues: ['1', '2'],
    values: [{ id: '1', description: 'Something' }, { id: '2', description: 'ValueDesc' }]
  };

  this.render(hbs`{{dashboard-filters-collapsed-filter filter=filter}}`);

  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'Proptery equals Something (1), ValueDesc (2)',
    '`in` is rendered as "equals"'
  );

  this.set('filter.operator', 'notin');
  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'Proptery not equals Something (1), ValueDesc (2)',
    '`notin` is rendered as "not equals"'
  );

  this.set('filter.operator', 'unknownop');
  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'Proptery unknownop Something (1), ValueDesc (2)',
    'unknown ops are passed through'
  );

  this.set('filter.operator', null);
  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'Proptery noop Something (1), ValueDesc (2)',
    'falsy ops are rendered as "noop"'
  );
});

test('it respects the field provided by the filter', function(assert) {
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
      { key: 'property|4', id: 'property|7', description: 'ValueDesc' }
    ]
  };

  this.render(hbs`{{dashboard-filters-collapsed-filter filter=filter}}`);

  this.set('filter.dimension.longName', '');
  assert.equal(
    this.$()
      .text()
      .trim()
      .replace(/\s+/g, ' '),
    'property equals ValueDesc (property|4), Something (property|7), property|9',
    'when field = "key" rawValues are matched against key prop, not id'
  );
});
