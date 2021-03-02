import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import { set } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
import { animationsSettled } from 'ember-animated/test-support';

module('Integration | Component | missing intervals warning', function (hooks) {
  setupRenderingTest(hooks);

  test('missing intervals present', async function (assert) {
    assert.expect(6);

    let response = {
      meta: {
        missingIntervals: [
          '2018-11-10 00:00:00.000/2018-11-13 00:00:00.000',
          '2018-11-14 00:00:00.000/2018-11-16 00:00:00.000',
          '2018-11-19 00:00:00.000/2018-11-20 00:00:00.000',
        ],
      },
    };
    set(this, 'response', response);
    set(this, 'onDetailsToggle', () => {});

    await render(hbs`<MissingIntervalsWarning
      @response={{this.response}}
      @onDetailsToggle={{this.onDetailsToggle}}
    />`);

    assert
      .dom('.missing-intervals-warning__message-text')
      .hasText(
        'Results have missing data.',
        'The component is visible when missing intervals are present and the warning is displayed'
      );

    assert
      .dom('.missing-intervals-warning__details-content')
      .isNotVisible('The details section is not expanded by default');

    await click('.missing-intervals-warning__contents');
    await animationsSettled();

    assert
      .dom('.missing-intervals-warning__details-content')
      .isVisible('The details section expands when the component is clicked');

    assert.deepEqual(
      findAll('.missing-intervals-warning__date-interval').map((e) => e.textContent),
      ['2018/11/10 - 2018/11/12', '2018/11/14 - 2018/11/15', '2018/11/19'],
      'The missing intervals are displayed correctly'
    );

    assert
      .dom('.missing-intervals-warning__disclaimer')
      .hasText(
        'Note: Listed intervals include both the start and end dates.',
        'The disclaimer is shown when the details are expanded'
      );

    await click('.missing-intervals-warning__contents');
    await animationsSettled();

    assert
      .dom('.missing-intervals-warning__details-content')
      .isNotVisible('The details section collapses when the component is clicked');
  });

  test('no missing intervals', async function (assert) {
    assert.expect(1);

    let response = { meta: {} };
    set(this, 'response', response);

    await render(hbs`{{missing-intervals-warning
      response=response
    }}`);

    assert
      .dom('.missing-intervals-warning__footer')
      .isNotVisible('The component is not visible when there are no missing intervals');
  });

  test('onDetailsToggle', async function (assert) {
    assert.expect(1);

    let response = {
      meta: {
        missingIntervals: [
          '2018-11-10 00:00:00.000/2018-11-13 00:00:00.000',
          '2018-11-14 00:00:00.000/2018-11-16 00:00:00.000',
          '2018-11-19 00:00:00.000/2018-11-20 00:00:00.000',
        ],
      },
    };
    set(this, 'response', response);
    set(this, 'onDetailsToggle', () =>
      assert.ok(true, 'onDetailsToggle action is called when the details are toggled')
    );

    await render(hbs`<MissingIntervalsWarning
      @response={{this.response}}
      @onDetailsToggle={{this.onDetailsToggle}}
    />`);

    await click('.missing-intervals-warning__contents');
    await animationsSettled();
  });
});
