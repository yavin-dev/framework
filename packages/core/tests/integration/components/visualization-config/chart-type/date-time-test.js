import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let Template = hbs`{{visualization-config/chart-type/date-time
                    options=options
                    response=response
                    request=request
                    onUpdateConfig=(action onUpdateConfig)
                }}`;

const Request = {
    metrics: [{ metric: { name: 'totalPageViews', longName: 'Total Page Views' } }]
  },
  Options = {
    axis: {
      y: {
        series: {
          type: 'dateTime',
          config: {
            metric: 'totalPageViews',
            timeGrain: 'year'
          }
        }
      }
    }
  };

module('Integration | Component | visualization config/chart type/date time', function(hooks) {
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

    assert.dom('.date-time-line-chart-config').exists('Date time configuration component renders');
  });
});
