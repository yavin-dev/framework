import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dimension bulk import simple', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    this.set('onSelectValues', () => undefined);
    this.set('onClose', () => undefined);

    await render(hbs`
      <DimensionBulkImportSimple
        @rawInput={{this.rawInput}}
        @onSelectValues={{this.onSelectValues}}
        @isOpen={{true}}
        @onClose={{this.onClose}}
      />
    `);
  });

  function getRawValue() {
    return findAll('.dimension-bulk-import-simple__raw-value .item').map((el) => el.textContent.trim());
  }

  function getSplitValues() {
    return findAll('.dimension-bulk-import-simple__split-values .item').map((el) => el.textContent.trim());
  }

  test('Raw inputs are filtered and split up properly', async function (assert) {
    this.set('rawInput', '1,2,3');
    assert.deepEqual(getRawValue(), ['1,2,3'], 'The raw string is 1,2,3');
    assert.deepEqual(getSplitValues(), ['1', '2', '3'], 'The input values are split on the comma');

    this.set('rawInput', '');
    assert.deepEqual(getRawValue(), [], 'Raw value does not include empty string');
    assert.deepEqual(getSplitValues(), [], 'Split values do not include empty string');

    this.set('rawInput', ' some weird,  spacing,going ,on');
    assert.deepEqual(
      getRawValue(),
      ['some weird,  spacing,going ,on'],
      'The raw value string is trimmed, but retains inner spacing'
    );
    assert.deepEqual(
      getSplitValues(),
      ['some weird', 'spacing', 'going', 'on'],
      'The split values will trim away weird inner spacing'
    );
  });

  test('Selecting the raw value gives the raw array', async function (assert) {
    assert.expect(2);

    const raw = ['some weird,  spacing,going ,on'];
    this.set('rawInput', ' some weird,  spacing,going ,on');
    assert.deepEqual(getRawValue(), raw, 'The raw value string is trimmed, but retains inner spacing');
    this.set('onSelectValues', (values) =>
      assert.deepEqual(values, raw, 'The selected value is the raw string as an array')
    );
    await click('.dimension-bulk-import-simple__raw-btn');
  });

  test('Selecting the split values gives the filtered split array', async function (assert) {
    assert.expect(2);

    const split = ['some weird', 'spacing', 'going', 'on'];
    this.set('rawInput', ' some weird,  spacing,going ,on,,, ,,,');
    assert.deepEqual(getSplitValues(), split, 'The split values will trim away weird inner spacing');
    this.set('onSelectValues', (values) =>
      assert.deepEqual(values, split, 'The selected values are just the split string array')
    );
    await click('.dimension-bulk-import-simple__split-btn');
  });
});
