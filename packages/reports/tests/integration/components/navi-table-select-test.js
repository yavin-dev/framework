import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';

const options = [
  { longName: 'network' },
  { longName: 'network2' }
];
const selected = options[0];

moduleForComponent('navi-table-select', 'Integration | Component | navi table select', {
  integration: true,
  beforeEach(assert) {
    this.set('selected', selected);
    this.set('options', options);
    this.set('onChange', (value) => {
      assert.equal(value.longName,
        'network2',
        'network2 should be selected');
      this.set('selected', value);
    });

    this.render(hbs`{{navi-table-select
            selected=selected
            options=options
            onChange=onChange
        }}`);
  }
});

test('it renders', function(assert) {
  assert.expect(2);

  assert.equal(this.$('.navi-table-select__header').text().trim(),
    'Table',
    'The header text equals `table`');

  assert.equal(this.$('.ember-power-select-selected-item').text().trim(),
    'network',
    'The selected item equals `network`');
});

test('trigger dropdown', function(assert) {
  assert.expect(1);

  clickTrigger();
  assert.deepEqual($('.ember-power-select-option').map(function() { return $(this).text().trim(); }).get(),
    ['network', 'network2'],
    'All options are shown');
});

test('select option', function(assert) {
  assert.expect(2);

  clickTrigger();
  nativeMouseUp($('.ember-power-select-option:contains(network2)')[0]);
  assert.equal(this.$('.ember-power-select-selected-item').text().trim(),
    'network2',
    'The selected item equals `network2`');
});

test('enable search', function(assert) {
  assert.expect(2);

  this.set('searchEnabled', true);
  this.render(hbs`{{navi-table-select
        selected=selected
        options=options
        onChange=onChange
        searchEnabled=searchEnabled
    }}`);

  assert.notOk($('.ember-power-select-search').is(':visible'),
    'search input should not be visible');
  clickTrigger();
  assert.ok($('.ember-power-select-search').is(':visible'),
    'search input should be visible');
});
