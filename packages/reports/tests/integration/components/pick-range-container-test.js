import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';
import moment from 'moment';

module('Integration | Component | Pick Range Container', function(hooks) {
  setupRenderingTest(hooks);

  test('setStart Action', async function(assert) {
    assert.expect(1);

    this.set('selection', new Interval(moment('2015-01-18', 'YYYY-MM-DD'), moment('2015-01-20', 'YYYY-MM-DD')));

    await render(hbs`
          {{#pick-range-container
              selection=selection
              dateTimePeriod='day'
              as |selection container moments strings|
          }}
              <div id='start'>{{selection._start}}</div>
              <div id='set-start' {{action 'setStart' 'P7D' target=container}}></div>
          {{/pick-range-container}}
      `);

    await click('#set-start');

    assert.equal(find('#start').textContent, 'P7D', 'Selection start value was set by action');
  });

  test('setEnd Action', async function(assert) {
    assert.expect(1);

    this.set('selection', new Interval(moment('2015-01-18', 'YYYY-MM-DD'), moment('2015-01-20', 'YYYY-MM-DD')));

    await render(hbs`
          {{#pick-range-container
              selection=selection
              dateTimePeriod='day'
              as |selection container moments strings|
          }}
              <div id='end'>{{selection._end}}</div>
              <div id='set-end' {{action 'setEnd' 'current' target=container}}></div>
          {{/pick-range-container}}
      `);

    await click('#set-end');

    assert.equal(find('#end').textContent, 'current', 'Selection end value was set by action');
  });

  test('dateMoments', async function(assert) {
    assert.expect(2);

    this.set('selection', new Interval(new Duration('P1D'), moment('2015-01-20', 'YYYY-MM-DD')));

    await render(hbs`
          {{#pick-range-container
              selection=selection
              dateTimePeriod='day'
              as |selection container moments strings|
          }}
              <div id='start'>{{moment-format moments.start 'YYYY-MM-DD'}}</div>
              <div id='end'>{{moment-format moments.end 'YYYY-MM-DD'}}</div>
          {{/pick-range-container}}
      `);

    assert.equal(
      find('#start').textContent,
      '2015-01-19',
      'The start duration is converted to the right moment object'
    );

    assert.equal(find('#end').textContent, '2015-01-19', 'The end moment object is returned as a moment');
  });

  test('dateStrings', async function(assert) {
    assert.expect(2);

    this.set('selection', new Interval(new Duration('P1D'), moment('2015-01-20', 'YYYY-MM-DD')));

    await render(hbs`
          {{#pick-range-container
              selection=selection
              dateTimePeriod='day'
              as |selection container moments strings|
          }}
              <div id='start'>{{strings.start}}</div>
              <div id='end'>{{strings.end}}</div>
          {{/pick-range-container}}
      `);

    assert.equal(
      find('#start').textContent,
      'P1D',
      'The start duration is converted to a string representing the duration'
    );

    assert.equal(
      find('#end').textContent,
      '2015-01-20',
      'The end moment object is converted to a formatted date string'
    );
  });
});
