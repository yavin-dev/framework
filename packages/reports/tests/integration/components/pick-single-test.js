import { get } from '@ember/object';
import { run } from '@ember/runloop';
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

let Options, Template;

moduleForComponent('pick-single', 'Integration | Component | Pick Single', {
  integration: true,

  beforeEach() {
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
  }
});

test('it renders', function(assert) {
  assert.expect(4);

  this.render(Template);

  assert.notOk(isEmpty(this.$('.pick-container')), 'pick-single component is rendered');

  assert.equal(
    this.$('.pick-single .pick-value')
      .text()
      .trim(),
    Options[0].id,
    'The Id of the selected options object is displayed by default'
  );

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

  assert.equal(
    this.$('.pick-single .pick-form .active')
      .text()
      .trim(),
    this.get('selection.id'),
    'The active class is set for the selected value'
  );
});

test('switching display field', function(assert) {
  assert.expect(3);

  let displayField = 'name';

  run(() => {
    this.set('displayField', displayField);
  });

  this.render(Template);

  assert.equal(
    this.$('.pick-single .pick-value')
      .text()
      .trim(),
    get(Options[0], displayField),
    'The displayField of the selected options object is displayed'
  );

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

  assert.equal(
    this.$('.pick-single .pick-form .active')
      .text()
      .trim(),
    this.get(`selection.${displayField}`),
    'The active class is set for the selected value'
  );
});

test('update selection action', function(assert) {
  assert.expect(2);
  this.set('updateSelection', selection => {
    assert.ok(true, 'updateSelection method is called');
    assert.equal(selection, Options[1], 'the clicked option is passed in as the selection param');
  });

  this.render(Template);
  this.$('.pick-single .pick-form li:eq(1)').click();
});

test('label', function(assert) {
  assert.expect(2);

  this.render(Template);

  assert.ok(isEmpty(this.$('.pick-value label')), 'No label is present when not defined');

  run(() => {
    this.set('label', 'Hello');
  });

  this.render(Template);
  assert.equal(
    this.$('.pick-value label')
      .text()
      .trim(),
    'Hello',
    'the label defined is present'
  );
});
