import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('grouped-list', 'Integration | Component | grouped list', {
  integration: true,
  beforeEach() {
    this.set('items', [
      { val:1, field: 'foo,bar' },
      { val:6, field: 'bar' },
      { val:2, field: 'foo' },
      { val:3, field: 'foo,bar' }
    ]);

    this.set('sortme', [
      { name: 'ice cream stand', cat: 'places'},
      { name: 'zebra', cat: 'animals'},
      { name: 'zoo', cat: 'places'},
      { name: 'aardvark', cat: 'animals'},
      { name: 'bees', cat: 'animals' },
      { name: 'apple stand', cat: 'places'}
    ]);
  }
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs`{{grouped-list}}`);

  assert.ok(this.$('.grouped-list').is(':visible'),
    'the grouped-list component is rendered');
});

test('groups', function(assert) {
  assert.expect(4);

  this.render(hbs`
        {{#grouped-list
            items=items
            shouldOpenAllGroups=shouldOpenAllGroups
            groupByField='field'
            as | item |
        }}
            {{item.val}}
        {{/grouped-list}}
    `);

  assert.deepEqual(this.$('.grouped-list__group-header').toArray().map(el => $(el).text().trim()),[
    'foo (3)',
    'bar (1)'
  ], 'the groups in the grouped-list are rendered, only the first item in the groupByField is considered for grouping');

  assert.deepEqual(this.$('.grouped-list__group:first-of-type .grouped-list__group-header').text().trim(),
    'foo (3)',
    'the first group header is `foo(3)`');

  assert.deepEqual(this.$('.grouped-list__group:first-of-type .grouped-list__item').toArray().map(el => $(el).text().trim()),
    [ '1', '2', '3' ],
    'the items under the first group header belong to the group');

  this.set('shouldOpenAllGroups', true);

  let openAttrs = this.$('.grouped-list__group').toArray().map(el => $(el).attr('open'));

  assert.notOk(openAttrs.includes(false) || openAttrs.includes(undefined),
    'All groups are open when `shouldOpenAllGroups` attribute is true');
});

test('sorted groups', function(assert) {
  assert.expect(2);

  this.render(hbs`
        {{#grouped-list
            items=sortme
            shouldOpenAllGroups=shouldOpenAllGroups
            groupByField='cat'
            sortByField='name'
            as | item |
        }}
            {{item.name}}
        {{/grouped-list}}
    `);

  assert.deepEqual(this.$('.grouped-list__group:first-of-type .grouped-list__item').toArray().map(el => $(el).text().trim()),
    [ 'apple stand', 'ice cream stand', 'zoo' ],
    'Each item in the group \'places\' is sorted by the `sortByField`');

  assert.deepEqual(this.$('.grouped-list__group:nth-of-type(2) .grouped-list__item').toArray().map(el => $(el).text().trim()),
    [ 'aardvark', 'bees', 'zebra' ],
    'Each item in the group \'animals\' is sorted by the `sortByField`');
});
