import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('pick-container', 'Integration | Component | pick container', {
  integration: true
});

test('Yields inner template', function(assert) {
  assert.expect(1);

  this.render(hbs`
        {{#pick-container}}
            <div id='should-be-found'>My div</div>
        {{/pick-container}}
    `);

  assert.equal(this.$('#should-be-found').text(),
    'My div',
    'Inner template renders');
});

test('Passing selection', function(assert) {
  assert.expect(2);

  this.set('testSelection', 1);

  this.render(hbs`
        {{#pick-container selection=testSelection as |selection|}}
            {{#pick-value}}
                {{selection}}
            {{/pick-value}}
        {{/pick-container}}
    `);

  assert.equal(this.$('.pick-value').text().trim(),
    '1',
    'Container passes selection to inner components');

  this.set('testSelection', 2);
  assert.equal(this.$('.pick-value').text().trim(),
    '2',
    'Updating selection updates component');
});

test('Action - formToggled', function(assert) {
  assert.expect(2);

  this.render(hbs`
        {{#pick-container isFormOpen=false formToggled='formToggled'}}
            {{#pick-value}}
                <div id='click-me'></div>
            {{/pick-value}}
        {{/pick-container}}
    `);

  this.on('formToggled', (isFormOpen) => {
    assert.ok(isFormOpen, 'Clicking pick-value calls formToggled action with form open');
  });
  this.$('#click-me').click();

  this.on('formToggled', (isFormOpen) => {
    assert.notOk(isFormOpen, 'Clicking pick-value again calls formToggled action with form closed');
  });
  this.$('#click-me').click();
});

test('Action - applyChanges', function(assert) {
  assert.expect(2);

  let originalSelection = 1;

  this.set('testSelection', originalSelection);

  this.render(hbs`
        {{#pick-container selection=testSelection isFormOpen=true updateSelection='updateSelection' as |selection container|}}
            {{#pick-form}}
                <div id='click-me' {{action 'applyChanges' 2 target=container}}></div>
            {{/pick-form}}
        {{/pick-container}}
    `);

  this.on('updateSelection', (selection) => {
    assert.equal(selection,
      2,
      'Calling applyChanges action results in container sending updateSelection action with new selection');
  });

  this.$('#click-me').click();

  assert.equal(this.get('testSelection'),
    originalSelection,
    'Passed selection object is unaffected by changes');
});

test('Action - stageChanges', function(assert) {
  assert.expect(2);

  this.render(hbs`
        {{#pick-container isFormOpen=true updateSelection='updateSelection' as |selection container|}}
            <div id='current-selection'>{{selection}}</div>
            {{#pick-form}}
                <div id='1' {{action 'stageChanges' 1 target=container}}></div>
                <div id='2' {{action 'stageChanges' 2 target=container}}></div>
                <div id='3' {{action 'stageChanges' 3 target=container}}></div>
                <div id='4' {{action 'stageChanges' 4 target=container}}></div>
                <div id='apply' {{action 'applyChanges' target=container}}></div>
            {{/pick-form}}
        {{/pick-container}}
    `);

  this.on('updateSelection', (selection) => {
    assert.equal(selection,
      4,
      'applyChanges is called once with most recent change');
  });

  this.$('#1').click();
  this.$('#2').click();

  assert.equal(this.$('#current-selection').text(),
    '2',
    'Internal selection value updates with staged changes');

  this.$('#3').click();
  this.$('#4').click();
  this.$('#apply').click();
});

test('Action - discardChanges', function(assert) {
  assert.expect(2);

  let originalSelection = 0;
  this.set('testSelection', originalSelection);

  this.render(hbs`
        {{#pick-container selection=testSelection isFormOpen=true updateSelection='updateSelection' as |selection container|}}
            <div id='current-selection'>{{selection}}</div>
            {{#pick-form}}
                <div id='1' {{action 'stageChanges' 1 target=container}}></div>
                <div id='2' {{action 'stageChanges' 2 target=container}}></div>
                <div id='discard' {{action 'discardChanges' target=container}}></div>
                <div id='apply' {{action 'applyChanges' target=container}}></div>
            {{/pick-form}}
        {{/pick-container}}
    `);

  this.on('updateSelection', (selection) => {
    assert.equal(selection,
      originalSelection,
      'applyChanges ignores discarded changes');
  });

  this.$('#1').click();
  this.$('#2').click();
  this.$('#discard').click();

  assert.equal(this.$('#current-selection').text(),
    originalSelection,
    'Internal selection resets to original value');

  this.$('#apply').click();
});

test('Form opened and closed by clicking value', function(assert) {
  assert.expect(3);

  this.render(hbs`
        {{#pick-container}}
            {{#pick-value}}
            {{/pick-value}}
            {{#pick-form}}
            {{/pick-form}}
        {{/pick-container}}
    `);

  assert.notOk(this.$('.pick-form').is(':visible'), 'Form is closed by default');

  this.$('.pick-value').click();
  assert.ok(this.$('.pick-form').is(':visible'), 'Form is open after clicking pick-value');

  this.$('.pick-value').click();
  assert.notOk(this.$('.pick-form').is(':visible'), 'Form is closed after clicking pick-value again');
});

test('Clicking outside open form will close it', function(assert) {
  assert.expect(4);

  this.render(hbs`
        {{#pick-container isFormOpen=true}}
            {{#pick-value}}
            {{/pick-value}}
            {{#pick-form}}
                <div id='inside-form'></div>
            {{/pick-form}}
        {{/pick-container}}
    `);

  assert.ok(this.$('.pick-form').is(':visible'), 'Form is open when isFormOpen=true is set');

  /* == Click inside form == */
  this.$('#inside-form').click();
  assert.ok(this.$('.pick-form').is(':visible'), 'Form is still open when clicking inside the form');

  /* == Click stale element inside form == */
  this.$('#inside-form').on('click', () => {
    this.$('#inside-form').remove();
  });

  Ember.run(() => {
    this.$('#inside-form').click();
  });

  assert.ok(this.$('.pick-form').is(':visible'), 'Form is still open after clicking stale element');

  /* == Click outside form == */
  Ember.run(() => {
    Ember.$('body').click();
  });
  assert.notOk(this.$('.pick-form').is(':visible'), 'Form is closed after clicking off the form');

});

test('Closes form automatically discards changes', function(assert) {
  assert.expect(3);

  this.render(hbs`
        {{#pick-container selection=1 isFormOpen=true as |selection container|}}
            {{#pick-value}}
                {{selection}}
            {{/pick-value}}
            {{#pick-form}}
                <div id='2' {{action 'stageChanges' 2 target=container}}></div>
            {{/pick-form}}
        {{/pick-container}}
    `);

  assert.equal(this.$('.pick-value').text().trim(),
    '1',
    'Value shows initial selection');

  this.$('#2').click();

  assert.equal(this.$('.pick-value').text().trim(),
    '2',
    'Value shows staged changes after update');

  // Close and reopen
  this.$('.pick-value').click();
  this.$('.pick-value').click();

  assert.equal(this.$('.pick-value').text().trim(),
    '1',
    'Staged changes are discarded after opening and closing the form');
});


test('Auto close after apply ', function(assert) {
  assert.expect(4);

  /* == autoClose = true == */
  this.render(hbs`
        {{#pick-container autoClose=true as |selection container|}}
            {{#pick-value}}
            {{/pick-value}}
            {{#pick-form}}
                <div id='apply' {{action 'applyChanges' target=container}}></div>
            {{/pick-form}}
        {{/pick-container}}
    `);

  this.$('.pick-value').click();
  assert.ok(this.$('.pick-form').is(':visible'), 'Form is open after clicking pick-value');

  this.$('#apply').click();
  assert.notOk(this.$('.pick-form').is(':visible'), 'When autoClose = true, form is closed after applying');

  /* == autoClose = false == */
  this.render(hbs`
        {{#pick-container autoClose=false as |selection container|}}
            {{#pick-value}}
            {{/pick-value}}
            {{#pick-form}}
                <div id='apply' {{action 'applyChanges' target=container}}></div>
            {{/pick-form}}
        {{/pick-container}}
    `);

  this.$('.pick-value').click();
  assert.ok(this.$('.pick-form').is(':visible'), 'Form is open after clicking pick-value');

  this.$('#apply').click();
  assert.ok(this.$('.pick-form').is(':visible'), 'When autoClose = false, form is still open after applying');
});
