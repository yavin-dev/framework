import { moduleForComponent, test } from 'ember-qunit';
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
      },
    }
  }
}

moduleForComponent('helper:reportlize', 'Integration | Helper | reportlize', {
  integration: true,
});

test('onModelChange', function (assert) {
  assert.expect(2);

  this.set('model', widgetModel);
  this.render(hbs`{{get (reportlize model) 'request.test'}}`)

  assert.equal(this.$().text().trim(),
    'foo',
    'Request should have foo text rendered');

  this.set('model.request', {
    clone() {
      return {
        test: 'bar'
      };
    }});

  assert.equal(this.$().text().trim(),
    'bar',
    'Request should have bar text rendered');
});
