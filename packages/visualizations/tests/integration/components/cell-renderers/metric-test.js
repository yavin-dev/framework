import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
  {{cell-renderers/metric
    data=data
    column=column
    request=request
  }}`;

let data = {
  "dateTime": "2016-05-30 00:00:00.000",
  "os|id": "All Other",
  "os|desc": "All Other",
  "uniqueIdentifier": 172933788,
  "totalPageViews": 3669828357
};

let column = {
  field: {metric: 'uniqueIdentifier', parameters: {}},
  type: 'metric',
  displayName: 'Unique Identifiers'
};

let request = {
  dimensions: [ {dimension:'os'} ],
  metrics: [
    {metric: 'uniqueIdentifier'},
    {metric: 'totalPageViews'}
  ],
  logicalTable: {
    table: 'network',
    timeGrain: 'day'
  }
};

moduleForComponent('cell-renderers/metric', 'Integration | Component | cell renderers/metric', {
  integration: true,
  beforeEach() {
    this.set('data', data);
    this.set('column', column);
    this.set('request', request);
  }
});

test('it renders', function(assert) {
  assert.expect(2);
  this.render(TEMPLATE);

  assert.ok($('.table-cell-content').is(':visible'),
    'The metric cell renderer is visible');
  assert.equal($('.table-cell-content').text().trim(),
    "172933788",
    'The metric cell renders the value with commas correctly');
});

test('metric renders null value correctly', function(assert) {
  assert.expect(1);

  this.set('data', {"uniqueIdentifier": null});
  this.render(TEMPLATE);

  assert.equal($('.table-cell-content').text().trim(),
    "--",
    'The metric cell renders the null value with -- correctly');
});

test('render value based on column format', function (assert) {
  assert.expect(1);

  this.set('column', Object.assign({}, column, { format: '$0,0[.]00' }));
  this.render(TEMPLATE);

  assert.equal($('.table-cell-content').text().trim(),
    "$172,933,788",
    'The metric cell renders the value with format correctly');
});