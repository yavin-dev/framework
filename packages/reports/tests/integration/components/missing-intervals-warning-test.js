import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import { set } from '@ember/object';
import { later } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | missing intervals warning', function(hooks) {
  setupRenderingTest(hooks);

  test('missing intervals present', async function(assert) {
    assert.expect(6);

    let response = {
      meta: {
        missingIntervals: [
          '2018-11-10 00:00:00.000/2018-11-13 00:00:00.000',
          '2018-11-14 00:00:00.000/2018-11-16 00:00:00.000',
          '2018-11-19 00:00:00.000/2018-11-20 00:00:00.000'
        ]
      }
    };
    set(this, 'response', response);
    set(this, 'onDetailsToggle', () => {});

    await render(hbs`{{missing-intervals-warning
      response=response
      onDetailsToggle=onDetailsToggle
    }}`);

    assert.equal(
      find('.missing-intervals-warning__message-text').textContent.trim(),
      'Results have missing data.',
      'The component is visible when missing intervals are present and the warning is displayed'
    );

    assert.notOk(
      this.$('.missing-intervals-warning__details-content').is(':visible'),
      'The details section is not expanded by default'
    );

    await click('.missing-intervals-warning__contents');

    assert.ok(
      this.$('.missing-intervals-warning__details-content').is(':visible'),
      'The details section expands when the component is clicked'
    );

    assert.deepEqual(
      this.$('.missing-intervals-warning__date-interval')
        .toArray()
        .map(elm => elm.innerHTML),
      ['2018/11/10 - 2018/11/12', '2018/11/14 - 2018/11/15', '2018/11/19'],
      'The missing intervals are displayed correctly'
    );

    assert.equal(
      find('.missing-intervals-warning__disclaimer').textContent.trim(),
      'Note: Listed intervals include both the start and end dates.',
      'The disclaimer is shown when the details are expanded'
    );

    await click('.missing-intervals-warning__contents');

    assert.notOk(
      this.$('.missing-intervals-warning__details-content').is(':visible'),
      'The details section collapses when the component is clicked'
    );
  });

  test('no missing intervals', async function(assert) {
    assert.expect(1);

    let response = { meta: {} };
    set(this, 'response', response);

    await render(hbs`{{missing-intervals-warning
      response=response
    }}`);

    assert.notOk(
      this.$('.missing-intervals-warning__footer').is(':visible'),
      'The component is not visible when there are no missing intervals'
    );
  });

  test('onDetailsToggle', async function(assert) {
    const done = assert.async();

    assert.expect(1);

    let response = {
      meta: {
        missingIntervals: [
          '2018-11-10 00:00:00.000/2018-11-13 00:00:00.000',
          '2018-11-14 00:00:00.000/2018-11-16 00:00:00.000',
          '2018-11-19 00:00:00.000/2018-11-20 00:00:00.000'
        ]
      }
    };
    set(this, 'response', response);
    set(this, 'onDetailsToggle', () =>
      assert.ok(true, 'onDetailsToggle action is called when the details are toggled')
    );

    await render(hbs`{{missing-intervals-warning
      response=response
      onDetailsToggle=onDetailsToggle
    }}`);

    await click('.missing-intervals-warning__contents');

    later(() => done(), 300);
  });
});
