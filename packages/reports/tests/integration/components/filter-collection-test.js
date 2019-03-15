import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import Duration from 'navi-core/utils/classes/duration';
import Interval from 'navi-core/utils/classes/interval';

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
  MockIntervalFragment = {
    interval: new Interval(new Duration('P7D'), 'current')
  },
  MockMetricFragment1 = {
    metric: { metric: { longName: 'Page Views' }, parameters: {} },
    operator: 'gt',
    values: ['1000']
  },
  MockMetricFragment2 = {
    metric: { metric: { longName: 'Page Views' }, parameters: {} },
    operator: 'bet',
    values: ['1000', '2000']
  },
  MockRequest = {
    filters: [MockFilterFragment1, MockFilterFragment2],
    intervals: [MockIntervalFragment],
    having: [MockMetricFragment1, MockMetricFragment2],
    logicalTable: { timeGrain: { name: 'day', longName: 'Day' } }
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
        }}`);
  });

  test('it renders', function(assert) {
    assert.expect(4);

    assert.equal(findAll('.filter-collection__row').length, 5, 'Each request filter is represented by a filter row');

    assert.ok(
      this.$('.filter-collection__row .filter-collection__remove').is(':visible'),
      'Each filter row has a remove button'
    );

    assert.ok(
      this.$('.filter-collection__row .filter-collection__builder').is(':visible'),
      'Each filter row has a filter builder'
    );

    assert.ok(this.$('.filter-values--range-input').is(':visible'), 'Range input should be rendered');
  });

  test('updating a filter', function(assert) {
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
    clickTrigger(`#${$('.filter-builder__operator:eq(1)').attr('id')}`);
    nativeMouseUp($('.ember-power-select-option:contains(Is Empty)')[0]);
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
      this.$('.filter-collection__remove:eq(0)').is('.filter-collection__remove--disabled'),
      'The first filter has remove disabled'
    );
  });
});
