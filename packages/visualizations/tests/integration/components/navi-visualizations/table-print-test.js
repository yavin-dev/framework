import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

const TEMPLATE = hbs`
  {{navi-visualizations/table
    model=model
    options=options
    onUpdateReport=(action onUpdateReport)
  }}`;

const ROWS = [
  {
    'dateTime': '2016-05-30 00:00:00.000',
    'os|id': 'All Other',
    'os|desc': 'All Other',
    'uniqueIdentifier': 172933788,
    'totalPageViews': 3669828357
  },
  {
    'dateTime': '2016-05-30 00:00:00.000',
    'os|id': 'Android',
    'os|desc': 'Android',
    'uniqueIdentifier': 183206656,
    'totalPageViews': 4088487125
  },
  {
    'dateTime': '2016-05-30 00:00:00.000',
    'os|id': 'BlackBerry',
    'os|desc': 'BlackBerry OS',
    'uniqueIdentifier': 183380921,
    'totalPageViews': 4024700302
  },
];

const Model = Ember.A([{
  request: {
    dimensions: [ {dimension:'os'} ],
    metrics: [
      {metric: 'uniqueIdentifier'},
      {metric: 'totalPageViews'}
    ],
    logicalTable: {
      table: 'network',
      timeGrain:{
        name: 'day'
      }
    },
  },
  response: {
    rows: ROWS
  }
}]);

const Options = {
  columns: [
    {
      field: 'dateTime',
      type: 'dateTime',
      displayName: 'Date'
    },
    {
      field: 'os',
      type: 'dimension',
      displayName: 'Operating System'
    },
    {
      field: 'uniqueIdentifier',
      type: 'metric',
      displayName: 'Unique Identifiers'
    },
    {
      field: 'totalPageViews',
      type: 'metric',
      displayName: 'Total Page Views'
    }
  ]
};

moduleForComponent('navi-visualizations/table-print', 'Integration | Component | navi visualizations/table print', {
  integration: true,
  beforeEach() {
    this.server = startMirage();

    this.set('model', Model);
    this.set('options', Options);
    this.set('onUpdateReport', () => {});

    return Ember.getOwner(this).lookup('service:bard-metadata').loadMetadata();
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it renders', function(assert) {
  assert.expect(3);

  this.render(TEMPLATE);

  assert.ok(this.$('.table-widget').is(':visible'),
    'The table widget component is visible');

  let headers = this.$('.table-header-cell').toArray().map((el) =>
    this.$(el).text().trim());

  assert.deepEqual(headers, [
    'Date',
    'Operating System',
    'Unique Identifiers',
    'Total Page Views'
  ], 'The table renders the headers correctly based on the request');

  let body = this.$('.table-body .table-row' ).toArray().map((row) =>
    this.$(row).find('.table-cell-content').toArray().map((cell) =>
      this.$(cell).text().trim()));

  assert.deepEqual(body, [
    ['05/30/2016','All Other','172,933,788','3,669,828,357'],
    ['05/30/2016','Android','183,206,656','4,088,487,125'],
    ['05/30/2016','BlackBerry OS','183,380,921','4,024,700,302']
  ], 'The table renders the response dataset correctly');
});
