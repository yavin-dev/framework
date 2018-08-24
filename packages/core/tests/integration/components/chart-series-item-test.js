import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-series-item', 'Integration | Component | chart series item', {
  integration: true
});

test('Component renders', function(assert) {
  assert.expect(3);

  this.set('seriesIndex', 0);

  this.render(hbs`
        {{#chart-series-item
           seriesIndex=seriesIndex
        }}
            <li class='list'>Foo</li>
        {{/chart-series-item}}
    `);

  assert.ok(this.$('.chart-series-item').is(':visible'),
    'Chart Series component is rendered');

  assert.equal(this.$('.chart-series-item .series-header').text().trim(),
    'Series 1',
    'Chart series has header as "Series 1"');

  assert.equal(this.$('.chart-series-item .list').text().trim(),
    'Foo',
    'The element in the yield block is rendered');
});
