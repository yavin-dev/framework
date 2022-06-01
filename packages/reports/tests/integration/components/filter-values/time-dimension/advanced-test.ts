import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, find, render, blur } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import type Advanced from 'navi-reports/components/filter-values/time-dimension/advanced';
import type { TestContext as Context } from 'ember-test-helpers';
import type FilterFragment from 'navi-core/models/request/filter';
import type FragmentFactory from 'navi-core/services/fragment-factory';

type ComponentArgs = Advanced['args'];
interface TestContext extends Context, ComponentArgs {}

const TEMPLATE = hbs`<FilterValues::TimeDimension::Advanced
  @filter={{this.filter}}
  @onUpdateFilter={{this.onUpdateFilter}}
  @isCollapsed={{this.isCollapsed}}
/>`;

function getValues(): [string, string] {
  const input = 'filter-values--advanced-interval-input';
  return [(find(`.${input}--start`) as HTMLInputElement).value, (find(`.${input}--end`) as HTMLInputElement).value];
}

function isValidValues(assert: Assert) {
  assert.dom('.message').doesNotExist('Invalid message is not shown');
}

function isInvalidValues(assert: Assert) {
  assert.dom('.message').hasText('Invalid interval', 'Invalid message is shown');
  assert.dom('.message').exists({ count: 2 }, 'Invalid message is rendered twice');
}

module('Integration | Component | filter-values/time-dimension/advanced', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;

    this.filter = fragmentFactory.createFilter(
      'timeDimension',
      'bardOne',
      'network.dateTime',
      { grain: 'day' },
      'bet',
      ['P4D', '2022-01-01']
    ) as FilterFragment & { values: string[] };
    this.isCollapsed = false;

    this.onUpdateFilter = ({ values }) => {
      if (values) {
        this.filter.values = values;
      }
    };
  });

  test('it renders valid values', async function (assert) {
    assert.expect(2);
    await render(TEMPLATE);

    assert.deepEqual(getValues(), ['P4D', '2022-01-01'], 'It renders with the correct values');
    isValidValues(assert);
  });

  test('it renders invalid values', async function (this: TestContext, assert) {
    this.filter.values = ['', 'invalid'];
    await render(TEMPLATE);

    assert.deepEqual(getValues(), ['', 'invalid'], 'It renders with the correct values');
    isInvalidValues(assert);
  });

  test('it renders invalid values collapsed', async function (this: TestContext, assert) {
    this.filter.values = ['', 'invalid'];
    this.isCollapsed = true;
    await render(TEMPLATE);

    assert.dom('.filter-values--selected-error').exists('filter value error is present');
  });

  test('values react to being invalidated and revalidated', async function (this: TestContext, assert) {
    await render(TEMPLATE);
    assert.deepEqual(getValues(), ['P4D', '2022-01-01'], 'It renders with the correct values');
    isValidValues(assert);

    const start = find('.filter-values--advanced-interval-input--start')!;
    const end = find('.filter-values--advanced-interval-input--end')!;

    await fillIn(start, '');
    await fillIn(end, 'invalid');
    isInvalidValues(assert);
    this.onUpdateFilter = ({ values }) => {
      assert.deepEqual(values, ['', 'invalid'], 'Values are updated after focusout');
    };
    await blur(end); // invalid after input but before commiting changes
    assert.deepEqual(getValues(), ['', 'invalid'], 'It renders with the correct values');

    await fillIn(start, '2020-01-01');
    await fillIn(end, 'next');
    isValidValues(assert); // valid after input but before commiting changes
    this.onUpdateFilter = ({ values }) => {
      assert.deepEqual(values, ['2020-01-01T00:00:00.000Z', 'next'], 'Values are updated after focusout');
    };
    assert.deepEqual(getValues(), ['2020-01-01', 'next'], 'It renders with the correct values');
  });
});
