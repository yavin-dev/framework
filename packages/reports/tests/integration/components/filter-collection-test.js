import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import Duration from 'navi-data/utils/classes/duration';
import Interval from 'navi-data/utils/classes/interval';

const MockFilterFragment1 = {
    dimension: { name: 'age' },
    operator: 'notnull',
    rawValues: ['']
  },
  MockFilterFragment2 = {
    dimension: { name: 'property' },
    operator: 'null',
    rawValues: ['']
  },
  MockIntervalFragment = {
    interval: new Interval(new Duration('P7D'), 'current')
  },
  MockMetricFragment1 = {
    metric: { metric: { name: 'Page Views' }, parameters: {} },
    operator: 'gt',
    values: ['1000']
  },
  MockMetricFragment2 = {
    metric: { metric: { name: 'Page Views' }, parameters: {} },
    operator: 'bet',
    values: ['1000', '2000']
  },
  MockRequest = {
    filters: [MockFilterFragment1, MockFilterFragment2],
    intervals: [MockIntervalFragment],
    having: [MockMetricFragment1, MockMetricFragment2],
    logicalTable: { timeGrain: 'day', table: { timeGrainIds: ['day'], timeGrains: [{ id: 'day', name: 'Day' }] } }
  };

module('Integration | Component | filter collection', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.request = MockRequest;
    this.onUpdateFilter = () => null;
    this.onRemoveFilter = () => null;

    await render(hbs`{{filter-collection
            request=request
            onUpdateFilter=(action onUpdateFilter)
            onRemoveFilter=(action onRemoveFilter)
            isCollapsed=isCollapsed
            onUpdateCollapsed=onUpdateCollapsed
        }}`);
  });

  test('it renders', async function(assert) {
    assert.expect(4);

    this.set('onUpdateCollapsed', () =>
      assert.ok(false, 'onUpdateCollapsed is not called on click when not collapsed')
    );

    assert.dom('.filter-collection__row').exists({ count: 5 }, 'Each request filter is represented by a filter row');

    assert.dom('.filter-collection__row .filter-collection__remove').isVisible('Each filter row has a remove button');

    assert.dom('.filter-collection__row .filter-collection__builder').isVisible('Each filter row has a filter builder');

    assert.dom('.filter-values--range-input').isVisible('Range input should be rendered');

    await click('.filter-collection');
  });

  test('collapsed', async function(assert) {
    assert.expect(3);

    this.set('isCollapsed', true);

    this.set('onUpdateCollapsed', collapsed => assert.notOk(collapsed, 'onUpdateCollapsed(false) is called on click'));

    assert
      .dom('span.filter-collection--collapsed-item')
      .exists({ count: 5 }, 'Each request filter is represented by a filter span');

    assert.dom('.filter-collection__remove').doesNotExist('Remove buttons are not visible');

    await click('.filter-collection--collapsed');
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
    await clickTrigger(`#${$('.filter-builder-dimension__operator').attr('id')}`);
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
    await click(findAll('.filter-collection__remove')[1]);
  });

  test('removing date filter', function(assert) {
    assert.expect(1);

    assert.ok(
      $('.filter-collection__remove:eq(0)').is('.filter-collection__remove--disabled'),
      'The first filter has remove disabled'
    );
  });
});
