import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import { clickTrigger, nativeMouseUp } from 'ember-power-select/test-support/helpers';
import AgeValues from 'navi-data/mirage/bard-lite/dimensions/age';
import config from 'ember-get-config';

const MockFilter = {
  subject: {
    name: 'age',
    storageStrategy: 'loaded',
    primaryKeyFieldName: 'id'
  },
  values: ['1', '2', '3'],
  validations: {}
};

const HOST = config.navi.dataSources[0].uri;

let Mirage;

module('Integration | Component | filter values/dimension select', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.filter = MockFilter;
    Mirage = setupMock();
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('it renders', async function(assert) {
    assert.expect(2);

    await render(hbs`{{filter-values/dimension-select filter=filter}}`);

    // Open value selector
    clickTrigger();
    return settled().then(() => {
      let selectedValueText = this.$('.ember-power-select-multiple-option span:nth-of-type(2)')
          .map(function() {
            return $(this)
              .text()
              .trim();
          })
          .get(),
        expectedValueDimensions = AgeValues.filter(age => MockFilter.values.includes(age.id));

      assert.deepEqual(
        selectedValueText,
        expectedValueDimensions.map(age => `${age.description} (${age.id})`),
        'Filter value ids are converted into full dimension objects and displayed as selected'
      );

      let optionText = $('.ember-power-select-option')
          .map(function() {
            return $(this)
              .text()
              .trim();
          })
          .get(),
        expectedOptionText = AgeValues.map(age => `${age.description} (${age.id})`);

      /*
       * Since ember-collection is used for rendering the dropdown options,
       * some later options may be cropped from the DOM, so just check the first 10
       */
      optionText.length = 10;
      expectedOptionText.length = 10;

      assert.deepEqual(
        optionText,
        expectedOptionText,
        'Given Age as the filter subject, all age values are present in the value selector'
      );
    });
  });

  skip('no values', async function(assert) {
    assert.expect(1);

    Mirage.pretender.map(function() {
      this.get(`${HOST}/v1/dimensions/age/values`, request => {
        if (request.queryParams.filters === 'age|id-in[]') {
          assert.notOk(true, 'dimension-select should not request dimension values when the filter has no values');
        } else {
          return [200, { 'content-type': 'application/javascript' }, '{}'];
        }
      });
    });

    this.filter = {
      subject: { name: 'age', longName: 'Age' },
      values: []
    };

    await render(hbs`{{filter-values/dimension-select filter=filter}}`);

    assert
      .dom('input')
      .hasAttribute('placeholder', 'Age Values', 'The dimension long name is used as the placeholder text');
  });

  test('changing values', async function(assert) {
    assert.expect(1);

    this.onUpdateFilter = changeSet => {
      assert.deepEqual(
        changeSet.rawValues,
        MockFilter.values.concat(['5']),
        'The newly selected value is added to existing values and given to action'
      );
    };

    await render(hbs`{{filter-values/dimension-select filter=filter onUpdateFilter=(action onUpdateFilter)}}`);

    // Select a new value
    clickTrigger();
    return settled().then(() => {
      nativeMouseUp($('.ember-power-select-option:contains(25-29)')[0]);
    });

    // Assert handled in action
  });

  test('error state', async function(assert) {
    assert.expect(2);

    await render(hbs`{{filter-values/dimension-select filter=filter}}`);
    assert.notOk(
      this.$('.filter-values--dimension-select--error').is(':visible'),
      'The input should not have error state'
    );

    this.set('filter.validations', { attrs: { rawValues: { isInvalid: true } } });
    assert.ok(this.$('.filter-values--dimension-select--error').is(':visible'), 'The input should have error state');
  });

  test('alternative primary key', async function(assert) {
    assert.expect(1);
    this.filter = {
      subject: {
        name: 'multiSystemId',
        storageStrategy: 'loaded',
        primaryKeyFieldName: 'key'
      },
      values: ['k1', 'k3'],
      validations: {}
    };

    await render(hbs`{{filter-values/dimension-select filter=filter}}`);

    return settled().then(() => {
      let selectedValueText = this.$('.ember-power-select-multiple-option span:nth-of-type(2)')
        .toArray()
        .map(el => {
          let text = $(el)
            .text()
            .trim();
          return text.substr(text.lastIndexOf('('));
        });

      assert.deepEqual(selectedValueText, ['(1)', '(3)'], 'Select values by key instead of id');
    });
  });
});
