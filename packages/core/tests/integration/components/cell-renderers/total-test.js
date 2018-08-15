import merge from 'lodash/merge';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
  {{cell-renderers/total
    data=data
    column=column
    request=request
  }}`;

const data = {
  'dateTime': 'Header',
  'os|id': 'All Other',
  'os|desc': 'All Other',
  'uniqueIdentifier': 172933788,
  'totalPageViews': 3669828357
};

const column = {
  field: {dateTime: 'dateTime'},
  type: 'dateTime',
  displayName: 'Date'
};

moduleForComponent('cell-renderers/total', 'Integration | Component | cell renderers/total', {
  integration: true,
  beforeEach() {
    this.set('data', data);
    this.set('column', column);
    this.render(TEMPLATE);
  }
});

test('it renders', function(assert) {
  assert.expect(5);

  assert.ok(this.$('.table-cell--total').is(':visible'),
    'the total cell is rendered');

  assert.equal(this.$('.table-cell--total').text().trim(),
    'Header',
    'the total cell displays the correct field from the data');

  assert.notOk(this.$('.table-cell__info-message').is(':visible'),
    'the info message and icon are not visible ');

  this.set('data', merge({}, data, {
    __meta__: {
      hasPartialData: true
    }
  }));

  assert.ok(this.$('.table-cell__info-message').is(':visible'),
    'the info message is visible when the partial data flag is true');

  assert.ok(this.$('.table-cell__info-message--icon').is(':visible'),
    'the info message icon is visible when the partial data flag is true');
});
