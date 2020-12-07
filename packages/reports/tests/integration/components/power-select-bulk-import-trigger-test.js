import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click, findAll, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

let BardDimensions;
module('Integration | Component | power select bulk import trigger', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    BardDimensions = this.owner.lookup('service:bard-dimensions');

    await this.owner.lookup('service:navi-metadata').loadMetadata();
    const allProperties = await BardDimensions.all('property');
    this.setProperties({
      options: allProperties,
      selected: [],
      onChange: () => null,
      extra: {
        filter: { field: 'property', source: 'bardOne', type: 'dimension' }
      }
    });

    await render(
      hbs`<PowerSelectMultiple
        @options={{this.options}}
        @selected={{this.selected}}
        @extra={{this.extra}}
        @triggerComponent='power-select-bulk-import-trigger'
        @onchange={{action this.onChange}}
        @searchField="id"
        as |item|>
        <span class='selected-dim-id'>{{item.id}}</span>
      </PowerSelectMultiple>
    `
    );
  });

  test('it renders', function(assert) {
    assert.expect(1);

    assert.dom('.ember-power-select-multiple-options').exists('The component renders');
  });

  skip('paste to trigger bulk import', async function(assert) {
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

    assert.deepEqual(
      findAll('.valid-ids .item').map(el => el.childNodes[3].wholeText.trim()),
      ['Property 1 (114)', 'Property 4 (101272)'],
      'IDs from pasted string are searched for valid dimensions'
    );

    assert.deepEqual(
      findAll('.invalid-ids .item').map(el => el.textContent.trim()),
      ['78787'],
      'Invalid IDs in pasted string are filtered out and user is notified'
    );
  });

  skip('importing dimensions', async function(assert) {
    assert.expect(3);

    const selectedValues = () => findAll('.selected-dim-id').map(el => el.textContent.trim());

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

  skip('trying to import invalid values', async function(assert) {
    assert.expect(1);

    const selectedValues = () => findAll('.selected-dim-id').map(el => el.textContent.trim());

    await paste('not, a, valid, id');
    await click('.dimension-bulk-import .btn-primary');

    assert.deepEqual(selectedValues(), [], 'No ids are imported when none are valid');
  });

  skip('import valid raw input', async function(assert) {
    assert.expect(3);

    const selectedValues = () => findAll('.selected-dim-id').map(el => el.textContent.trim());

    const allProperties = await BardDimensions.all('commaDim');
    this.setProperties({
      options: allProperties,
      onChange: newValues => this.set('selected', newValues.toArray()),
      selected: [{ id: 'no comma' }],
      extra: {
        filter: { field: 'commaDim', source: 'bardOne', type: 'dimension' }
      }
    });

    await paste('yes, comma');

    const rawInputButton = findAll('.btn-primary')[1];
    assert.dom('.btn-primary').exists({ count: 2 }, 'There are now 2 primary buttons');
    assert.dom(rawInputButton).hasText('Include Raw Input', 'The second button allows import the raw value if valid');
    await click(rawInputButton);

    assert.deepEqual(selectedValues(), ['no comma', 'yes, comma'], 'The valid raw input is imported');
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
