import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('power-select-collection-options', 'Integration | Component | Power Select Collection Options', {
  integration: true,

  beforeEach() {
    this.set('options', [
      { id: 1, name: 'foo' },
      { id: 2, name: 'bar' },
      { id: 3, name: 'baz' }
    ]);

    this.set('select', {
      actions: {
        highlighted: () => null,
        scrollTo: () => null
      }
    });
  }
});

test('it renders - with clear selection', function(assert) {
  assert.expect(1);

  this.render(hbs`
        {{#power-select-collection-options
            extra=(hash allowClear=true)
            options=options
            select=select
        as |item| }}
            {{item.name}}
        {{/power-select-collection-options}}
    `);

  assert.deepEqual(this.$('.ember-power-select-option').toArray().map(el => $(el).text().trim()),
    [ 'Clear Selection', ...this.get('options').map(o => o.name) ],
    'it renders a list of options with clear selection');
});

test('it renders - without clear selection', function(assert) {
  assert.expect(1);

  this.render(hbs`
        {{#power-select-collection-options
            options=options
            select=select
        as |item| }}
            {{item.name}}
        {{/power-select-collection-options}}
    `);

  assert.deepEqual(this.$('.ember-power-select-option').toArray().map(el => $(el).text().trim()),
    this.get('options').map(o => o.name),
    'it renders a list of options without clear selection');
});
