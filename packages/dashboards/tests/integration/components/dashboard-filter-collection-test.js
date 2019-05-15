import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import $ from 'jquery';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import hbs from 'htmlbars-inline-precompile';

const MockFilterFragment1 = {
    dimension: { longName: 'age' },
    operator: 'notnull',
    rawValues: ['']
  },
  MockFilterFragment2 = {
    dimension: { longName: 'property' },
    operator: 'null',
    rawValues: ['']
  },
  MockDashboard = {
    filters: [MockFilterFragment1, MockFilterFragment2]
  };

module('Integration | Component | dashboard filter collection', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.dashboard = MockDashboard;
    this.onUpdateFilter = () => null;
    this.onRemoveFilter = () => null;

    await render(hbs`{{dashboard-filter-collection
      dashboard=dashboard
      onUpdateFilter=(action onUpdateFilter)
      onRemoveFilter=(action onRemoveFilter)
    }}`);
  });

  test('it renders', async function(assert) {
    assert.expect(3);

    assert.dom('.filter-collection__row').exists({ count: 2 }, 'Each dashboard filter is represented by a filter row');

    assert.dom('.filter-collection__row .filter-collection__remove').isVisible('Each filter row has a remove button');

    assert.dom('.filter-collection__row .filter-collection__builder').isVisible('Each filter row has a filter builder');
  });

  test('updating a filter', async function(assert) {
    assert.expect(2);

    /* == Changing operator == */
    this.set('onUpdateFilter', (filter, changeSet) => {
      assert.equal(filter, MockFilterFragment1, 'Filter to update is given to action');
      assert.deepEqual(
        changeSet,
        {
          operator: 'null'
        },
        'Operator update is requested'
      );
    });

    await clickTrigger(`#${$('.filter-builder-dimension__operator:eq(0)').attr('id')}`);
    await nativeMouseUp($('.ember-power-select-option:contains(Is Empty)')[0]);
  });

  test('remove a filter', async function(assert) {
    assert.expect(1);

    this.set('onRemoveFilter', filter => {
      assert.equal(
        filter,
        MockFilterFragment1,
        'When clicking remove icon, remove action is sent with selected filter'
      );
    });
    await click(findAll('.filter-collection__remove')[0]);
  });
});
