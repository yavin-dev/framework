import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'navi-visualizations/<%= dasherizedModuleName %>',
  'Integration | Component | navi-visualization/<%= dasherizedModuleName %>',
  {
    integration: true
  }
);

test('it renders', function(assert) {
  this.render(hbs`{{navi-visualizations/<%= dasherizedModuleName %>}}`);

  assert.equal(
    this.$('.<%= dasherizedModuleName %>-vis')
      .text()
      .trim(),
    '<%= classifiedModuleName %>',
    'Component renders'
  );
});
