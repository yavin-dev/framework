import $ from 'jquery';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click, findAll, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | power select bulk import trigger', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    return this.owner
      .lookup('service:bard-metadata')
      .loadMetadata()
      .then(() => {
        return this.owner
          .lookup('service:bard-dimensions')
          .all('property')
          .then(async allProperties => {
            this.setProperties({
              options: allProperties,
              selected: [],
              onChange: () => null,
              extra: {
                filter: { subject: { name: 'property', longName: 'property' } }
              }
            });

            await render(
              hbs`
                  {{#power-select-multiple
                      options=options
                      selected=selected
                      extra=extra
                      triggerComponent='power-select-bulk-import-trigger'
                      onchange=(action onChange)
                      searchField='id'
                      as |item|
                  }}
                      <span class='selected-dim-id'>{{item.id}}</span>
                  {{/power-select-multiple}}
              `
            );
          });
      });
  });

  test('it renders', function(assert) {
    assert.expect(1);

    assert.dom('.ember-power-select-multiple-options').exists('The component renders');
  });

  test('paste to trigger bulk import', async function(assert) {
    assert.expect(6);

    /* == Typing text == */
    await fillIn('.ember-power-select-trigger-multiple-input', '100001,100002');
    assert.dom('.dimension-bulk-import').isNotVisible('Bulk import modal does not open when typing text with a ","');

    /* == Pasting text without "," == */
    await paste('Hello world');
    assert
      .dom('.dimension-bulk-import')
      .isNotVisible('Bulk import modal does not open when pasting text without a ","');

    /* == Pasting only "," == */
    await paste(',,,');
    assert
      .dom('.dimension-bulk-import')
      .isNotVisible('Bulk import modal is immediately closed when pasting only a ","');

    /* == Pasting text with "," == */
    await paste('78787, ,114, 101272');
    assert.dom('.dimension-bulk-import').isVisible('Bulk import modal opens when pasting text with a ","');

    let validPills = $('.id-container:first .item');
    assert.deepEqual(
      validPills
        .map(function() {
          return this.childNodes[3].wholeText.trim();
        })
        .get(),
      ['Property 1 (114)', 'Property 4 (101272)'],
      'IDs from pasted string are searched for valid dimensions'
    );

    let invalidPills = $('.paginated-scroll-list:last .item');
    assert.deepEqual(
      invalidPills
        .map(function() {
          return this.textContent.trim();
        })
        .get(),
      ['78787'],
      'Invalid IDs in pasted string are filtered out and user is notified'
    );
  });

  test('importing dimensions', async function(assert) {
    assert.expect(3);

    const selectedValues = () =>
      $('.selected-dim-id')
        .map(function() {
          return this.textContent.trim();
        })
        .get();

    this.set('onChange', newValues => this.set('selected', newValues));

    await paste('78787, ,114, 101272');

    await click('.dimension-bulk-import .btn-primary');

    assert.deepEqual(selectedValues(), ['114', '101272'], 'Only valid pasted ids are imported');

    /* == Duplicate ids == */
    await paste('114, 101272');
    await click('.dimension-bulk-import .btn-primary');

    assert.deepEqual(selectedValues(), ['114', '101272'], 'Duplicate ids are not imported twice');

    /* == Adding ids == */
    await paste('100001, 100002');
    await click('.dimension-bulk-import .btn-primary');

    assert.deepEqual(
      selectedValues(),
      ['114', '101272', '100001', '100002'],
      'New ids are imported without removing old ids'
    );
  });

  test('trying to import invalid values', async function(assert) {
    assert.expect(1);

    const selectedValues = () => findAll('.selected-dim-id').map(el => el.textContent.trim());

    await paste('not, a, valid, id');
    await click($('.dimension-bulk-import .btn-primary')[0]);

    assert.deepEqual(selectedValues(), [], 'No ids are imported when none are valid');
  });

  /**
   * Pastes a string into the power select search input
   *
   * @function paste
   * @param {Object} context - current test
   * @param {String} text - text to paste
   */
  async function paste(text) {
    const selector = '.ember-power-select-trigger-multiple-input';

    await triggerEvent(selector, 'paste', {
      clipboardData: {
        getData: () => text
      }
    });
  }
});
