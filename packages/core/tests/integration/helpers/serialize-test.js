import { moduleForComponent, test } from 'ember-qunit';
import DS from 'ember-data';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

moduleForComponent('serialize', 'helper:serialize', {
  integration: true
});

test('it returns serialization of model', function(assert) {
  assert.expect(1);
  const modelClass = DS.Model.extend({
    something: DS.attr('weird')
  });

  const weirdTransform = DS.Transform.extend({
    serialize(input) {
      return input.replace(/./g, '#');
    },
    deserialize(input) {
      return input;
    }
  });

  this.registry.register('model:weirdo', modelClass);
  this.registry.register('transform:weird', weirdTransform);

  run(() => {
    let store = this.container.lookup('service:store');

    store.pushPayload({
      data: {
        id: '1',
        type: 'weirdo',
        attributes: {
          something: 'hello'
        }
      }
    });

    let model = store.peekRecord('weirdo', '1');

    this.set('model', model);

    this.render(hbs`{{get (serialize model) 'data.attributes.something'}}`);

    assert.equal(this.$().text().trim(),
      '#####',
      'Serializes model with transforms and everything!');
  });

});

test('it throws an assertion if it\'s not serializable model', function(assert) {
  assert.expectAssertion(() => {
    this.set('model', {some: 'object', will: 'fail'});
    this.render(hbs`{{serialize model}}`);
  });
});

test('it returns with undefined or null', function(assert) {
  assert.expect(2);
  this.set('model', null);
  this.render(hbs`{{serialize model}}`);

  assert.equal(this.$().text().trim(),
    '',
    'renders nothing if null is passed');

  this.set('model', undefined);

  assert.equal(this.$().text().trim(),
    '',
    'renders nothing if undefined is passed');
});

