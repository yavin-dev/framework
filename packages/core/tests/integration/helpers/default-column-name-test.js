import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

moduleForComponent('default-column-name', 'helper:default-column-name', {
  integration: true,
  beforeEach() {
    setupMock();

    return Ember.getOwner(this)
      .lookup('service:bard-metadata')
      .loadMetadata();
  },
  afterEach() {
    teardownMock();
  }
});

test('dateTime column', function(assert) {
  const column = { type: 'dateTime' };
  this.set('column', column);

  this.render(hbs`{{default-column-name column}}`);

  assert.equal(
    this.$()
      .text()
      .trim(),
    'Date',
    'The default column name for dateTime is Date'
  );
});

test('dimension column', function(assert) {
  const column = { type: 'dimension', field: { dimension: 'os' } };
  this.set('column', column);

  this.render(hbs`{{default-column-name column}}`);

  assert.equal(
    this.$()
      .text()
      .trim(),
    'Operating System',
    'The default column name for os dimension is Operating System'
  );
});

test('metric column', function(assert) {
  const column = { type: 'metric', field: { metric: 'totalPageViews' } };
  this.set('column', column);

  this.render(hbs`{{default-column-name column}}`);

  assert.equal(
    this.$()
      .text()
      .trim(),
    'Total Page Views',
    'The default column name for totalPageViews metric is Total Page Views'
  );
});

test('metric column with parameters', function(assert) {
  const column = {
    type: 'metric',
    field: { metric: 'revenue', parameters: { currency: 'USD' } }
  };
  this.set('column', column);

  this.render(hbs`{{default-column-name column}}`);

  assert.equal(
    this.$()
      .text()
      .trim(),
    'Revenue (USD)',
    'The default column name for revenue metric with currency param of USD is Revenue (USD)'
  );
});
