import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import config from 'ember-get-config';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import { clickTrigger as toggleSelector, nativeMouseUp as toggleOption } from 'ember-power-select/test-support/helpers';

moduleForComponent('visualization-config/table', 'Integration | Component | visualization config/table', {
  integration: true,
  beforeEach() {
    this.server = startMirage();
    return Ember.getOwner(this)
      .lookup('service:bard-metadata')
      .loadMetadata();
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs`{{visualization-config/table}}`);

  assert.equal(
    this.$('.table-config')
      .text()
      .trim(),
    'You can access more configuration in each of the column headers',
    'Table Configuration Component displays the warning message'
  );
});

test('table config - feature flag set', function(assert) {
  assert.expect(5);

  let originalFlag = config.navi.FEATURES.enableTotals;
  config.navi.FEATURES.enableTotals = true;

  this.set('onUpdateConfig', () => {});
  this.set('request', {
    dimensions: [{ dimension: 'os' }, { dimension: 'age' }]
  });
  this.render(hbs`{{visualization-config/table
    request=request
    onUpdateConfig=(action onUpdateConfig)
  }}`);

  assert.equal(
    this.$('.table-config__header')
      .text()
      .trim(),
    'Totals',
    'The header text is displayed correctly'
  );

  assert.deepEqual(
    this.$('.table-config__totals-toggle-label')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      ),
    ['Grand Total', 'Subtotal'],
    'The totals toggle is displayed when the feature flag is set'
  );

  assert.equal(
    this.$('.table-config__total-toggle-button.x-toggle-component').length,
    2,
    'Two toggle buttons are displayed next to the labels'
  );

  assert.notOk(
    this.$('.table-config__total-toggle-button--grand-total.x-toggle-component .x-toggle-container-checked').is(
      ':visible'
    ),
    'The toggle buttons are unchecked by default'
  );

  this.set('onUpdateConfig', result => {
    assert.ok(
      result.showTotals.grandTotal,
      'Clicking the button toggles and sends the flag `showGrandTotal` to `onUpdateConfig`'
    );
  });
  this.$('.table-config__total-toggle-button--grand-total .x-toggle-btn').click();

  config.navi.FEATURES.enableTotals = originalFlag;
});

test('table config - grandTotal flag option set', function(assert) {
  assert.expect(1);

  let originalFlag = config.navi.FEATURES.enableTotals;
  config.navi.FEATURES.enableTotals = true;

  this.render(hbs`{{visualization-config/table
    options=options
  }}`);

  this.set('options', { showTotals: { grandTotal: true } });

  assert.ok(
    this.$('.table-config__total-toggle-button--grand-total.x-toggle-component .x-toggle-container-checked').is(
      ':visible'
    ),
    'The grand total toggle button is checked when the flag in options is set'
  );

  config.navi.FEATURES.enableTotals = originalFlag;
});

test('table config - subtotal', function(assert) {
  assert.expect(5);

  let originalFlag = config.navi.FEATURES.enableTotals;
  config.navi.FEATURES.enableTotals = true;

  this.set('request', {});
  this.set('options', { showTotals: { grandTotal: true } });
  this.set('onUpdateConfig', () => {});

  this.render(hbs`{{visualization-config/table
    request=request
    options=options
    onUpdateConfig=(action onUpdateConfig)
  }}`);

  assert.notOk(
    this.$('.table-config__total-toggle-button--subtotal').is(':visible'),
    'The subtotal toggle is not visible when there are no dimension groupbys'
  );

  this.set('request', {
    dimensions: [
      { dimension: { name: 'os', longName: 'Operating System' } },
      { dimension: { name: 'age', longName: 'Age' } }
    ]
  });

  this.set('onUpdateConfig', result => {
    assert.equal(
      result.showTotals.subtotal,
      'dateTime',
      '`dateTime` is used to subtotal when toggled on and updated using `onUpdateConfig`'
    );
  });

  //click the subtotal toggle
  this.$('.table-config__total-toggle-button--subtotal .x-toggle-btn').click();

  assert.ok(
    this.$('.table-config__subtotal-dimension-select').is(':visible'),
    'The dimension dropdown is visible when subtotal is toggled on'
  );

  this.set('onUpdateConfig', result => {
    assert.equal(
      result.showTotals.subtotal,
      'age',
      'Choosing another option in the dimension select updates the subtotal in the config'
    );
  });

  toggleSelector('.table-config__subtotal-dimension-select');
  toggleOption($('.subtotal-dimension-select__options .ember-power-select-option:contains(Age)')[0]);

  //toggle off subtotal
  this.$('.table-config__total-toggle-button--subtotal .x-toggle-btn').click();

  assert.notOk(
    this.$('.table-config__subtotal-dimension-select').is(':visible'),
    'The dimension dropdown is hidden when subtotal is toggled off'
  );

  config.navi.FEATURES.enableTotals = originalFlag;
});

test('table config - subtotal flag option set', function(assert) {
  assert.expect(2);

  let originalFlag = config.navi.FEATURES.enableTotals;
  config.navi.FEATURES.enableTotals = true;

  let request = {
    dimensions: [
      { dimension: { name: 'os', longName: 'Operating System' } },
      { dimension: { name: 'age', longName: 'Age' } }
    ]
  };

  this.set('request', request);

  this.render(hbs`{{visualization-config/table
    request=request
    options=options
  }}`);

  this.set('options', { showTotals: { subtotal: 'os' } });

  assert.ok(
    this.$('.table-config__total-toggle-button--subtotal.x-toggle-component .x-toggle-container-checked').is(
      ':visible'
    ),
    'The subtotal toggle button is checked when the flag in options has a value'
  );

  assert.equal(
    this.$('.table-config__subtotal-dimension-select')
      .text()
      .replace(/\s+/g, ' ')
      .trim(),
    'by Operating System',
    'The selected dimension is set when subtotal in options has a value'
  );

  config.navi.FEATURES.enableTotals = originalFlag;
});
