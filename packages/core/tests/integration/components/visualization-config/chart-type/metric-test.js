import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

let Template = hbs`{{visualization-config/chart-type/metric
                    options=options
                    response=response
                    request=request
                    onUpdateConfig=(action onUpdateConfig)
                }}`;

const Request = {
    metrics: [
      { metric: { name: 'totalPageViews', longName: 'Total Page Views' } },
      { metric: { name: 'uniqueIdentifier', longName: 'Unique Identifier' } }
    ]
  },
  Options = {
    axis: {
      y: {
        series: {
          type: 'metric',
          config: {
            metrics: ['totalPageViews']
          }
        }
      }
    }
  };

moduleForComponent(
  'visualization-config/chart-type/metric',
  'Integration | Component | visualization config/line chart type/metric',
  {
    integration: true,

    beforeEach() {
      this.setProperties({
        request: Request,
        options: Options,
        onUpdateConfig: () => null
      });
    }
  }
);

test('it renders', function(assert) {
  assert.expect(1);

  this.render(Template);

  assert.equal(
    this.$('.metric-line-chart-config')
      .text()
      .trim(),
    'No configuration options available.',
    'Table Configuration Component displays the warning message'
  );
});
