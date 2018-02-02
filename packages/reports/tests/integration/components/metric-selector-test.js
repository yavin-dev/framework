import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { setupMock, teardownMock }from '../../helpers/mirage-helper';
import {
  assertTooltipRendered,
  assertTooltipNotRendered,
  assertTooltipContent
} from '../../helpers/ember-tooltips';

const { getOwner, set } = Ember;

let Store,
    MetadataService,
    AdClicks;

moduleForComponent('metric-selector', 'Integration | Component | metric selector', {
  integration: true,
  beforeEach() {
    Store = getOwner(this).lookup('service:store');
    MetadataService = getOwner(this).lookup('service:bard-metadata');
    setupMock();

    this.set('addMetric', () => {});
    this.set('removeMetric', () => {});
    this.set('addMetricFilter', () => {});

    return MetadataService.loadMetadata().then(() => {
      AdClicks = MetadataService.getById('metric', 'adClicks');
      //set report object
      this.set('request',
        Store.createFragment('bard-request/request', {
          logicalTable: Store.createFragment('bard-request/fragments/logicalTable', {
            table: MetadataService.getById('table', 'tableA'),
            timeGrainName: 'day'
          }),
          metrics: [{ metric: AdClicks }],
          having: Ember.A([{ metric: AdClicks }]),
          responseFormat: 'csv'
        }));

      this.render(hbs`{{metric-selector
            request=request
            addMetric=(action addMetric)
            removeMetric=(action removeMetric)
            toggleMetricFilter=(action addMetricFilter)
          }}`);
    });
  },
  afterEach() {
    teardownMock();
  }
});

test('it renders', function(assert) {
  assert.expect(3);

  assert.ok(this.$('.checkbox-selector--metric').is(':visible'),
    'The metric selector component is rendered');

  assert.ok(this.$('.navi-list-selector').is(':visible'),
    'a navi-list-selector component is rendered as part of the metric selector');

  assert.ok(this.$('.grouped-list').is(':visible'),
    'a grouped-list component is rendered as part of the metric selector');
});

test('show selected', function(assert) {
  assert.expect(3);

  assert.ok(this.$('.grouped-list__item').length > this.get('request.metrics.length'),
    'Initially all the metrics are shown in the metric selector');

  Ember.run(() => {
    this.$('.navi-list-selector__show-link').click();
  });

  assert.deepEqual(this.$('.grouped-list__item').toArray().map(el => $(el).text().trim()),
    [ 'Ad Clicks' ],
    'When show selected is clicked only the selected adClicks metric is shown');

  assert.notOk(this.$('.checkbox-selector__checkbox').toArray().map(el => $(el)[0]['checked']).includes(false),
    'The selected items are checked');
});

test('add and remove metric actions', function(assert) {
  assert.expect(2);

  this.set('addMetric', (metric) => {
    assert.equal(metric.get('longName'),
      'Total Clicks',
      'the clicked metric is passed as a param to the action');
  });

  this.set('removeMetric', (metric) => {
    assert.equal(metric.get('longName'),
      'Ad Clicks',
      'the clicked metric is passed as a param to the action');
  });

  //select first time grain
  Ember.run(() => {
    //add total clicks
    this.$('.grouped-list__item:contains(Total Clicks) .grouped-list__item-label').click();

    //remove ad clicks
    this.$('.grouped-list__item:contains(Ad Clicks) .grouped-list__item-label').click();
  });
});

test('filter icon', function(assert) {
  assert.expect(3);

  assert.notOk(Ember.isEmpty(this.$('.grouped-list__item:contains(Ad Clicks) .checkbox-selector__filter--active')),
    'The filter icon with the adclicks metric has the active class');

  assert.ok(Ember.isEmpty(this.$('.grouped-list__item:contains(Total Clicks) .checkbox-selector__filter--active')),
    'The filter icon with the total clicks metric does not have the active class');

  this.set('addMetricFilter', metric => {
    assert.deepEqual(metric,
      AdClicks,
      'The adclicks metric is passed to the action when filter icon is clicked');
  });

  Ember.run(() => {
    this.$('.grouped-list__item:contains(Ad Clicks) .checkbox-selector__filter').click();
  });
});

test('tooltip', function(assert) {
  assert.expect(3);

  assertTooltipNotRendered(assert);
  set(AdClicks, 'extended', {
    content: { description: 'foo' }
  });

  Ember.run(() => {
    this.$('.grouped-list__group-header:contains(Clicks)').trigger('click');
    // triggerTooltipTargetEvent will not work for hidden elementc
    this.$('.grouped-list__item:contains(Ad Clicks) .grouped-list__item-info').trigger('mouseenter');
  });

  assertTooltipRendered(assert);
  assertTooltipContent(assert, {
    contentString: 'foo',
  });
});
