import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { getOwner } from '@ember/application';
import {setupMock, teardownMock } from '../../helpers/mirage-helper';

let metaService;

moduleForComponent('metric-format', 'helper:metric-format', {
  integration: true,
  beforeEach() {
    setupMock();
    metaService = getOwner(this).lookup('service:bard-metadata');
    return metaService.loadMetadata();
  },
  afterEach() {
    teardownMock();
  }
});

test('it renders with serialized metric object', function(assert) {
  assert.expect(7);
  this.set('metric', {metric: 'revenue', parameters: {currency: 'USD', as: 'revenueUSD'}});

  this.render(hbs`{{metric-format metric}}`);
  assert.equal(this.$().text().trim(), 'Revenue (USD)');

  this.set('metric', {metric: 'revenue', parameters: {currency: 'CAD', as: 'revenueUSD'}});
  assert.equal(this.$().text().trim(), 'Revenue (CAD)');

  this.set('metric', {metric: 'revenue'});
  assert.equal(this.$().text().trim(), 'Revenue');

  this.set('metric', {metric: null});
  assert.equal(this.$().text().trim(), '--');

  this.set('metric', null);
  assert.equal(this.$().text().trim(), '--');

  this.set('metric', {metric: ''});
  assert.equal(this.$().text().trim(), '--');

  this.set('metric', {metric: 'foo'});
  assert.equal(this.$().text().trim(), 'foo');
});


