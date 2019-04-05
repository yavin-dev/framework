import { get } from '@ember/object';
import { run } from '@ember/runloop';
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let Options, Template;

module('Integration | Component | Pick Single', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    Template = hbs`
            {{pick-single
                classNames='pick-single'
                selection=selection
                options=options
                onUpdateSelection=(action updateSelection)
                displayField=displayField
                label=label
            }}`;

    Options = [
      {
        id: '1',
        name: 'foo'
      },
      {
        id: '2',
        name: 'bar'
      }
    ];

    this.set('options', Options);
    this.set('selection', Options[0]);
    this.set('displayField', 'id');
    this.set('updateSelection', () => null);
  });

  test('it renders', async function(assert) {
    assert.expect(4);

    await render(Template);

    assert.notOk(isEmpty(this.$('.pick-container')), 'pick-single component is rendered');

    assert
      .dom('.pick-single .pick-value')
      .hasText(Options[0].id, 'The Id of the selected options object is displayed by default');

    let formValues = this.$('.pick-single .pick-form li')
      .toArray()
      .map(function(li) {
        return $(li)
          .text()
          .trim();
      });

    assert.deepEqual(
      formValues,
      A(Options).mapBy('id'),
      'The pick-form contains the ids from options using the displayField `id`'
    );

    assert
      .dom('.pick-single .pick-form .active')
      .hasText(this.get('selection.id'), 'The active class is set for the selected value');
  });

  test('switching display field', async function(assert) {
    assert.expect(3);

    let displayField = 'name';

    run(() => {
      this.set('displayField', displayField);
    });

    await render(Template);

    assert
      .dom('.pick-single .pick-value')
      .hasText(get(Options[0], displayField), 'The displayField of the selected options object is displayed');

    let formValues = this.$('.pick-single .pick-form li')
      .toArray()
      .map(function(li) {
        return $(li)
          .text()
          .trim();
      });

    assert.deepEqual(
      formValues,
      A(Options).mapBy(displayField),
      'The pick-form contains the ids from options based on displayField set'
    );

    assert
      .dom('.pick-single .pick-form .active')
      .hasText(this.get(`selection.${displayField}`), 'The active class is set for the selected value');
  });

  test('update selection action', async function(assert) {
    assert.expect(2);
    this.set('updateSelection', selection => {
      assert.ok(true, 'updateSelection method is called');
      assert.equal(selection, Options[1], 'the clicked option is passed in as the selection param');
    });

    await render(Template);
    await click(findAll('.pick-single .pick-form li')[1]);
  });

  test('label', async function(assert) {
    assert.expect(2);

    await render(Template);

    assert.ok(isEmpty(this.$('.pick-value label')), 'No label is present when not defined');

    run(() => {
      this.set('label', 'Hello');
    });

    await render(Template);
    assert.dom('.pick-value label').hasText('Hello', 'the label defined is present');
  });
});
