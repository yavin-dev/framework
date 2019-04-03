import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const widgetModel = {
  author: 'navi',
  request: {
    clone() {
      return {
        test: 'foo'
      };
    }
  },
  toJSON() {
    return {
      title: 'test',
      visualization: {
        type: 'line-chart'
      }
    };
  }
};

module('Integration | Helper | reportify', function(hooks) {
  setupRenderingTest(hooks);

  test('onModelChange', async function(assert) {
    assert.expect(2);

    this.set('model', widgetModel);
    await render(hbs`{{get (reportify model) 'request.test'}}`);

    assert.dom('*').hasText('foo', 'Request should have foo text rendered');

    this.set('model.request', {
      clone() {
        return {
          test: 'bar'
        };
      }
    });

    assert.dom('*').hasText('bar', 'Request should have bar text rendered');
  });
});
