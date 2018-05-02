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
    "172,933,788",
    'The metric cell renders the value with commas correctly');
});

test('metric renders zero value correctly', function(assert) {
  assert.expect(1);

  this.set('data', {"uniqueIdentifier": 0});

  this.render(hbs`
    {{cell-renderers/metric
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal($('.table-cell-content').text().trim(),
    "0.00",
    'The metric cell renders the zero value correctly');
});

test('metric renders values > 100 correctly', function(assert) {
  assert.expect(1);

  this.set('data', {"uniqueIdentifier": 12345678});

  this.render(hbs`
    {{cell-renderers/metric
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal($('.table-cell-content').text().trim(),
    "12,345,678",
    'The metric cell renders the decimal value correctly');
});

test('metric renders decimal value between 1 and 100 correctly', function(assert) {
  assert.expect(1);

  this.set('data', {"uniqueIdentifier": 99});

  this.render(hbs`
    {{cell-renderers/metric
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal($('.table-cell-content').text().trim(),
    "99.00",
    'The metric cell renders the decimal value between 1 and 100 correctly');
});

test('metric renders decimal value between 0.0001 and 1 correctly', function(assert) {
  assert.expect(1);
  this.set('data', {"uniqueIdentifier": 0.001234});

  this.render(hbs`
    {{cell-renderers/metric
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal($('.table-cell-content').text().trim(),
    "0.0012",
    'The metric cell renders the decimal value between 0.0001 and 1 correctly');
});

test('metric renders decimal value less than 0.0001 correctly', function(assert) {
  assert.expect(1);
  this.set('data', {"uniqueIdentifier": 0.00001234});

  this.render(hbs`
    {{cell-renderers/metric
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal($('.table-cell-content').text().trim(),
    "1.2340e-5",
    'The metric cell renders the decimal value less than 0.0001 correctly');
});

test('metric renders null value correctly', function(assert) {
  assert.expect(1);

  this.set('data', {"uniqueIdentifier": null});

  this.render(hbs`
    {{cell-renderers/metric
      data=data
      column=column
      request=request
    }}
  `);

  assert.equal($('.table-cell-content').text().trim(),
    "--",
    'The metric cell renders the null value with -- correctly');
});
