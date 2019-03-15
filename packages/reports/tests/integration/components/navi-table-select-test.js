import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';

const options = [{ longName: 'network' }, { longName: 'network2' }];
const selected = options[0];

module('Integration | Component | navi table select', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function(assert) {
    this.set('selected', selected);
    this.set('options', options);
    this.set('onChange', value => {
      assert.equal(value.longName, 'network2', 'network2 should be selected');
      this.set('selected', value);
    });

    await render(hbs`{{navi-table-select
            selected=selected
            options=options
            onChange=onChange
        }}`);
  });

  test('it renders', function(assert) {
    assert.expect(2);

    assert.equal(find('.navi-table-select__header').textContent.trim(), 'Table', 'The header text equals `table`');

    assert.equal(
      find('.ember-power-select-selected-item').textContent.trim(),
      'network',
      'The selected item equals `network`'
    );
  });

  test('trigger dropdown', function(assert) {
    assert.expect(1);

    clickTrigger();
    assert.deepEqual(
      $('.ember-power-select-option')
        .map(function() {
          return $(this)
            .text()
            .trim();
        })
        .get(),
      ['network', 'network2'],
      'All options are shown'
    );
  });

  test('select option', function(assert) {
    assert.expect(2);

    clickTrigger();
    nativeMouseUp($('.ember-power-select-option:contains(network2)')[0]);
    assert.equal(
      find('.ember-power-select-selected-item').textContent.trim(),
      'network2',
      'The selected item equals `network2`'
    );
  });

  test('enable search', async function(assert) {
    assert.expect(2);

    this.set('searchEnabled', true);
    await render(hbs`{{navi-table-select
          selected=selected
          options=options
          onChange=onChange
          searchEnabled=searchEnabled
      }}`);

    assert.notOk($('.ember-power-select-search').is(':visible'), 'search input should not be visible');
    clickTrigger();
    assert.ok($('.ember-power-select-search').is(':visible'), 'search input should be visible');
  });
});
