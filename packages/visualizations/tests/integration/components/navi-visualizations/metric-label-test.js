import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('navi-visualizations/metric-label', 'Integration | Component | navi-visualization/metric-label', {
  integration: true
});

test('metric label renders correctly', function(assert) {
  assert.expect(2);

  _setModel(this, {'magic': 30});
  this.render(hbs`
    {{navi-visualizations/metric-label
        model=model
        options=(hash
            description='Magic Points (MP)'
            metric='magic'
        )
      }}
    `);

  assert.equal(this.$('.metric-label-vis__description').text(),
    'Magic Points (MP)',
    'metric description is correctly displayed');

  assert.equal(this.$('.metric-label-vis__value').text(),
    '30',
    'metric value is correctly displayed');
});

test('metric label renders correctly when model has multiple metrics', function(assert) {
  assert.expect(2);

  _setModel(this, {magic: 30, hp: 40});
  this.render(hbs`
    {{navi-visualizations/metric-label
        model=model
        options=(hash
            description='Magic Points (MP)'
            metric='magic'
        )
      }}
    `);

  assert.equal(this.$('.metric-label-vis__description').text(),
    'Magic Points (MP)',
    'metric description is correctly displayed');

  assert.equal(this.$('.metric-label-vis__value').text(),
    '30',
    'metric value is correctly displayed');
});

test('metric label renders formatted string when format not null', function(assert) {
  assert.expect(1);

  _setModel(this, {rupees: 1000000});
  this.render(hbs`
    {{navi-visualizations/metric-label
            model=model
            options=(hash
                description='Rupees'
                metric='rupees'
                format='$ 0,0[.]00'
            )
      }}
    `);
  assert.equal(this.$('.metric-label-vis__value').text(),
    '$ 1,000,000',
    'metric value is formatted correctly');
});

/**
 * Set the test context model property with a model object
 * @function _setModel
 * @param {Object} context - test context
 * @param {Object} row - object containing row of data
 * @return {Void}
 */
function _setModel(context, row) {
  context.set('model', Ember.A([
    { response: { rows: [ row ] } }
  ]));
}
