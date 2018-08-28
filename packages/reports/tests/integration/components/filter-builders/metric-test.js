import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';
import Helper from '@ember/component/helper';
import { A as arr } from '@ember/array';

let Request = {
  metrics: arr([]),
  having: arr([])
};

moduleForComponent('filter-builders/metric', 'Integration | Component | filter-builders/metric', {
  integration: true,

  beforeEach() {
    this.register('helper:update-report-action', Helper.helper(() => {}), { instantiate: false });

    this.register('component:mock/values-component', Component.extend({
      classNames: 'mock-value-component'
    }));
  }
});

test('displayName', function(assert) {
  assert.expect(2);

  //check display name for metric with params
  let filter = {
    subject: {
      metric: { longName: 'metric-with-params' },
      parameters: {
        foo: 'bar',
        bar: 'baz'
      }
    },
    operator: {
      id: 'in',
      longName: 'Includes',
      valuesComponent: 'mock/values-component'
    },
    values: [1, 2, 3]
  };

  this.set('filter', filter);
  this.set('request', Request);
  this.render(hbs`{{filter-builders/metric filter=filter request=request}}`);

  assert.equal(this.$('.filter-builder__subject').text().trim(),
    'metric-with-params (bar,baz)',
    'Subject\'s long name displayed in filter builder includes the metric long name and the parameters');

  //check display name for metric without params
  filter = {
    subject: {
      metric: { longName: 'metric-without-params' },
      parameters: {}
    },
    operator: {
      id: 'in',
      longName: 'Includes',
      valuesComponent: 'mock/values-component'
    },
    values: [1, 2, 3]
  };

  this.set('filter', filter);

  assert.equal(this.$('.filter-builder__subject').text().trim(),
    'metric-without-params',
    'Only the subject\'s long name is displayed when the metric has no parameters');
});
