import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import DS from 'ember-data';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';

module('helper:serialize', function (hooks) {
  setupRenderingTest(hooks);

  test('it returns serialization of model', async function (assert) {
    assert.expect(1);
    const modelClass = DS.Model.extend({
      something: DS.attr('weird'),
    });

    const weirdTransform = DS.Transform.extend({
      serialize(input) {
        return input.replace(/./g, '#');
      },
      deserialize(input) {
        return input;
      },
    });

    this.owner.register('model:weirdo', modelClass);
    this.owner.register('transform:weird', weirdTransform);

    await run(async () => {
      let store = this.owner.lookup('service:store');

      store.pushPayload({
        data: {
          id: '1',
          type: 'weirdo',
          attributes: {
            something: 'hello',
          },
        },
      });

      let model = store.peekRecord('weirdo', '1');

      this.set('model', model);

      await render(hbs`{{get (serialize model) 'data.attributes.something'}}`);

      assert.dom().hasText('#####', 'Serializes model with transforms and everything!');
    });
  });

  test('it returns with undefined or null', async function (assert) {
    assert.expect(2);
    this.set('model', null);
    await render(hbs`{{serialize model}}`);

    assert.dom().hasText('', 'renders nothing if null is passed');

    this.set('model', undefined);

    assert.dom().hasText('', 'renders nothing if undefined is passed');
  });
});
