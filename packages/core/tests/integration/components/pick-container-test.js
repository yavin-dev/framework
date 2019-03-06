import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { set } from '@ember/object';

module('Integration | Component | pick container', function(hooks) {
  setupRenderingTest(hooks);

  test('Yields inner template', async function(assert) {
    assert.expect(1);

    await render(hbs`
        {{#pick-container}}
            <div id='should-be-found'>My div</div>
        {{/pick-container}}
    `);

    assert.dom('#should-be-found').hasText('My div', 'Inner template renders');
  });

  test('Passing selection', async function(assert) {
    assert.expect(2);

    this.set('testSelection', 1);

    await render(hbs`
        {{#pick-container selection=testSelection as |selection|}}
            {{#pick-value}}
                {{selection}}
            {{/pick-value}}
        {{/pick-container}}
    `);

    assert.dom('.pick-value').hasText('1', 'Container passes selection to inner components');

    this.set('testSelection', 2);
    assert.dom('.pick-value').hasText('2', 'Updating selection updates component');
  });

  test('Action - onFormToggled', async function(assert) {
    assert.expect(2);

    this.set('formToggled', isFormOpen => {
      assert.ok(isFormOpen, 'Clicking pick-value calls formToggled action with form open');
    });

    await render(hbs`
        {{#pick-container isFormOpen=false onFormToggled=(action formToggled)}}
            {{#pick-value}}
                <div id='click-me'></div>
            {{/pick-value}}
        {{/pick-container}}
    `);

    await click('#click-me');

    this.set('formToggled', isFormOpen => {
      assert.notOk(isFormOpen, 'Clicking pick-value again calls formToggled action with form closed');
    });
    await click('#click-me');
  });

  test('Action - applyChanges', async function(assert) {
    assert.expect(2);

    let originalSelection = 1;
    set(this, 'testSelection', originalSelection);

    this.set('handleUpdateSelection', selection => {
      assert.equal(
        selection,
        2,
        'Calling applyChanges action results in container calling onUpdateSelection handler with new selection'
      );
    });

    await render(hbs`
        {{#pick-container 
            selection=testSelection 
            isFormOpen=true 
            onUpdateSelection=handleUpdateSelection 
            as |selection container|
        }}
            {{#pick-form}}
                <div id='click-me' {{action 'applyChanges' 2 target=container}}></div>
            {{/pick-form}}
        {{/pick-container}}
    `);

    await click('#click-me');

    assert.equal(this.get('testSelection'), originalSelection, 'Passed selection object is unaffected by changes');
  });

  test('Action - stageChanges', async function(assert) {
    assert.expect(2);

    this.set('handleUpdateSelection', selection => {
      assert.equal(selection, 4, 'applyChanges is called once with most recent change');
    });

    await render(hbs`
        {{#pick-container 
            isFormOpen=true 
            onUpdateSelection=handleUpdateSelection 
            as |selection container|
        }}
            <div id='current-selection'>{{selection}}</div>
            {{#pick-form}}
                <div id='a' {{action 'stageChanges' 1 target=container}}></div>
                <div id='b' {{action 'stageChanges' 2 target=container}}></div>
                <div id='c' {{action 'stageChanges' 3 target=container}}></div>
                <div id='d' {{action 'stageChanges' 4 target=container}}></div>
                <div id='apply' {{action 'applyChanges' target=container}}></div>
            {{/pick-form}}
        {{/pick-container}}
    `);

    await click('#a');
    await click('#b');

    assert.dom('#current-selection').hasText('2', 'Internal selection value updates with staged changes');

    await click('#c');
    await click('#d');
    await click('#apply');
  });

  test('Action - discardChanges', async function(assert) {
    assert.expect(2);

    let originalSelection = 0;
    set(this, 'testSelection', originalSelection);

    this.set('handleUpdateSelection', selection => {
      assert.equal(selection, originalSelection, 'applyChanges ignores discarded changes');
    });

    await render(hbs`
        {{#pick-container 
            selection=testSelection 
            isFormOpen=true
            onUpdateSelection=handleUpdateSelection
            as |selection container|
        }}
            <div id='current-selection'>{{selection}}</div>
            {{#pick-form}}
                <div id='a' {{action 'stageChanges' 1 target=container}}></div>
                <div id='b' {{action 'stageChanges' 2 target=container}}></div>
                <div id='discard' {{action 'discardChanges' target=container}}></div>
                <div id='apply' {{action 'applyChanges' target=container}}></div>
            {{/pick-form}}
        {{/pick-container}}
    `);

    await click('#a');
    await click('#b');
    await click('#discard');

    assert.dom('#current-selection').hasText(`${originalSelection}`, 'Internal selection resets to original value');

    await click('#apply');
  });

  test('Form opened and closed by clicking value', async function(assert) {
    assert.expect(3);

    await render(hbs`
        {{#pick-container}}
            {{#pick-value}}
            {{/pick-value}}
            {{#pick-form}}
              <div> dlfjsld </div>
            {{/pick-form}}
        {{/pick-container}}
    `);

    assert.dom('.pick-form').isNotVisible('Form is closed by default');

    await click('.pick-value');
    assert.dom('.pick-form').isVisible('Form is open after clicking pick-value');

    await click('.pick-value');
    assert.dom('.pick-form').isNotVisible('Form is closed after clicking pick-value again');
  });

  test('Clicking outside open form will close it', async function(assert) {
    assert.expect(4);

    await render(hbs`
        <div class="outside">
            {{#pick-container isFormOpen=true}}
                {{#pick-value}}
                {{/pick-value}}
                {{#pick-form}}
                    <div id='inside-form'>to make visible</div>
                    to make visible
                {{/pick-form}}
            {{/pick-container}}
        </div>
    `);

    assert.dom('.pick-form').isVisible('Form is open when isFormOpen=true is set');

    /* == Click inside fo?rm == */
    await click('#inside-form');
    assert.dom('.pick-form').isVisible('Form is still open when clicking inside the form');

    /* == Click stale element inside form == */
    const insideForm = find('#inside-form');
    insideForm.onclick = () => insideForm.parentNode.remove(insideForm);

    // await run(() => insideForm.click());

    assert.dom('.pick-form').isVisible('Form is still open after clicking stale element');

    /* == Click outside form == */
    run(() => find('.outside').click());

    assert.dom('.pick-form').isNotVisible('Form is closed after clicking off the form');
  });

  test('Closes form automatically discards changes', async function(assert) {
    assert.expect(3);

    await render(hbs`
        {{#pick-container selection=1 isFormOpen=true as |selection container|}}
            {{#pick-value}}
                {{selection}}
            {{/pick-value}}
            {{#pick-form}}
                <div id='b' {{action 'stageChanges' 2 target=container}}></div>
            {{/pick-form}}
        {{/pick-container}}
    `);

    assert.dom('.pick-value').hasText('1', 'Value shows initial selection');

    await click('#b');

    assert.dom('.pick-value').hasText('2', 'Value shows staged changes after update');

    // Close and reopen
    await click('.pick-value');
    await click('.pick-value');

    assert.dom('.pick-value').hasText('1', 'Staged changes are discarded after opening and closing the form');
  });

  test('Auto close after apply ', async function(assert) {
    assert.expect(4);

    /* == autoClose = true == */
    await render(hbs`
        {{#pick-container autoClose=true as |selection container|}}
            {{#pick-value}}
            {{/pick-value}}
            {{#pick-form}}
                <div id='apply' {{action 'applyChanges' target=container}}>to make visible</div>
            {{/pick-form}}
        {{/pick-container}}
    `);

    await click('.pick-value');
    assert.dom('.pick-form').isVisible('Form is open after clicking pick-value');

    await click('#apply');
    assert.dom('.pick-form').isNotVisible('When autoClose = true, form is closed after applying');

    /* == autoClose = false == */
    await render(hbs`
        {{#pick-container autoClose=false as |selection container|}}
            {{#pick-value}}
            {{/pick-value}}
            {{#pick-form}}
                <div id='apply' {{action 'applyChanges' target=container}}>to make visible</div>
            {{/pick-form}}
        {{/pick-container}}
    `);

    await click('.pick-value');
    assert.dom('.pick-form').isVisible('Form is open after clicking pick-value');

    await click('#apply');
    assert.dom('.pick-form').isVisible('When autoClose = false, form is still open after applying');
  });
});
