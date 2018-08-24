import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

let Template = hbs`{{visualization-config/chart-type/date-time
                    options=options
                    response=response
                    request=request
                    onUpdateConfig=(action onUpdateConfig)
                }}`;

const Request = {
        metrics: [
          { metric: { name: 'totalPageViews', longName: 'Total Page Views' } },
        ]
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


moduleForComponent('visualization-config/chart-type/date-time', 'Integration | Component | visualization config/chart type/date time', {
  integration: true,

  beforeEach() {
    this.setProperties({
      request: Request,
      options: Options,
      onUpdateConfig: () => null
    });
  }
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(Template);

  assert.equal(this.$('.date-time-line-chart-config').text().trim(),
    'No configuration options available.',
    'Table Configuration Component displays the warning message');
});
