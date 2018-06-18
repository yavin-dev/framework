import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dir-sidebar', 'Integration | Component | dir sidebar', {
  integration: true,
  beforeEach() {
    this.render(hbs`{{dir-sidebar}}`);
  }
});

test('it renders', function(assert) {
  assert.expect(5);

  assert.ok(this.$('.dir-sidebar').is(':visible'),
    'The sidebar component is rendered');

  assert.deepEqual(this.$('.dir-sidebar__group').toArray().map(el => el.textContent.trim()),
    [ 'My Stuff', 'Canned Stuff' ],
    'The sidebar component has the right groups');

  assert.equal(this.$('.dir-sidebar__group--selected').text().trim(),
    'My Stuff',
    'The first group is initially selected');

  assert.deepEqual(this.$('.dir-sidebar__filter').toArray().map(el => el.textContent.trim()),
    [ 'All', 'Favorites', 'Recently Updated' ],
    `The selected group's filters are shown in the filter section`);

  assert.equal(this.$('.dir-sidebar__filter--selected').text().trim(),
    'All',
    'The first filter for the group is initially selected');
});

test('change selections', function(assert) {
  assert.expect(4);

  assert.equal(this.$('.dir-sidebar__group--selected').text().trim(),
    'My Stuff',
    'The first group is initially selected');

  this.$('.dir-sidebar__group:contains(Canned Stuff)').click();

  assert.equal(this.$('.dir-sidebar__group--selected').text().trim(),
    'Canned Stuff',
    'The selected group is now `Canned Stuff`');

  this.$('.dir-sidebar__group:contains(My Stuff)').click();

  assert.equal(this.$('.dir-sidebar__filter--selected').text().trim(),
    'All',
    '`All` is initially the selected filter');

  this.$('.dir-sidebar__filter:contains(Favorites)').click();

  assert.equal(this.$('.dir-sidebar__filter--selected').text().trim(),
    'Favorites',
    '`Favorites` is now the selected filter');
});
