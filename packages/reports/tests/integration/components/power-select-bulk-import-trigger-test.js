import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, fillIn } from '@ember/test-helpers';
import { hbsWithModal } from '../../helpers/hbs-with-modal';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

module('Integration | Component | power select bulk import trigger', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    setupMock();

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
                filter: { subject: { name: 'property' } }
              }
            });

            await render(
              hbsWithModal(
                `
                  {{#power-select-multiple
                      options=options
                      selected=selected
                      extra=extra
                      triggerComponent='power-select-bulk-import-trigger'
                      onchange=(action onChange)
                      as |item|
                  }}
                      <span class='selected-dim-id'>{{item.id}}</span>
                  {{/power-select-multiple}}
              `,
                getOwner(this)
              )
            );
          });
      });
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('it renders', function(assert) {
    assert.expect(1);

    assert.ok($('.ember-power-select-multiple-options').is(':visible'), 'The component renders');
  });

  test('paste to trigger bulk import', async function(assert) {
    assert.expect(6);

    /* == Typing text == */
    await fillIn('.ember-power-select-trigger-multiple-input', '100001,100002');
    assert.notOk(
      $('.dimension-bulk-import').is(':visible'),
      'Bulk import modal does not open when typing text with a ","'
    );

    /* == Pasting text without "," == */
    paste(this, 'Hello world');
    assert.notOk(
      $('.dimension-bulk-import').is(':visible'),
      'Bulk import modal does not open when pasting text without a ","'
    );

    /* == Pasting only "," == */
    paste(this, ',,,');
    assert.notOk(
      $('.dimension-bulk-import').is(':visible'),
      'Bulk import modal is immediately closed when pasting only a ","'
    );

    /* == Pasting text with "," == */
    paste(this, '78787, ,114, 101272');
    assert.ok($('.dimension-bulk-import').is(':visible'), 'Bulk import modal opens when pasting text with a ","');

    return settled().then(() => {
      let validPills = $('.id-container:first .item');
      assert.deepEqual(
        validPills
          .map(function() {
            return this.childNodes[0].wholeText.trim();
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
  });

  test('importing dimensions', function(assert) {
    assert.expect(3);

    const selectedValues = () =>
      $('.selected-dim-id')
        .map(function() {
          return this.textContent.trim();
        })
        .get();

    this.set('onChange', newValues => this.set('selected', newValues));

    paste(this, '78787, ,114, 101272');
    return settled().then(() => {
      run(() => {
        $('.dimension-bulk-import .btn-primary').click();
      });

      assert.deepEqual(selectedValues(), ['114', '101272'], 'Only valid pasted ids are imported');

      /* == Duplicate ids == */
      paste(this, '114, 101272');
      return settled().then(() => {
        run(() => {
          $('.dimension-bulk-import .btn-primary').click();
        });

        assert.deepEqual(selectedValues(), ['114', '101272'], 'Duplicate ids are not imported twice');

        /* == Adding ids == */
        paste(this, '100001, 100002');
        return settled().then(() => {
          run(() => {
            $('.dimension-bulk-import .btn-primary').click();
          });

          assert.deepEqual(
            selectedValues(),
            ['114', '101272', '100001', '100002'],
            'New ids are imported without removing old ids'
          );
        });
      });
    });
  });

  test('trying to import invalid values', function(assert) {
    assert.expect(1);

    const selectedValues = () =>
      $('.selected-dim-id')
        .map(function() {
          return this.textContent.trim();
        })
        .get();

    paste(this, 'not, a, valid, id');
    return settled().then(() => {
      run(() => {
        $('.dimension-bulk-import .btn-primary').click();
      });

      assert.deepEqual(selectedValues(), [], 'No ids are imported when none are valid');
    });
  });

  /**
   * Pastes a string into the power select search input
   *
   * @function paste
   * @param {Object} context - current test
   * @param {String} text - text to paste
   */
  function paste(context, text) {
    // Mock paste event since phantomjs doesn't support the ClipboardEvent
    let pasteEvent = $.Event('paste');
    pasteEvent.clipboardData = {
      getData: () => text
    };

    context.$('.ember-power-select-trigger-multiple-input').trigger(pasteEvent);
  }
});
