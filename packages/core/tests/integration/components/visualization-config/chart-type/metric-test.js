import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
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

module('Integration | Component | visualization config/line chart type/metric', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setProperties({
      request: Request,
      options: Options,
      onUpdateConfig: () => null
    });
  });

  test('it renders', async function(assert) {
    assert.expect(1);

    await render(Template);

    assert
      .dom('.metric-line-chart-config')
      .hasText('No configuration options available.', 'Table Configuration Component displays the warning message');
  });
});
