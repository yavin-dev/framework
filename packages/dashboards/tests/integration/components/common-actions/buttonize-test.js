import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

let Template;

moduleForComponent('common-actions/buttonize', 'Integration | Component | common actions/buttonize', {
  integration: true,
  beforeEach() {
    Template = hbs`
        {{#common-actions/buttonize}}
          Buttonize component
        {{/common-actions/buttonize}}
      `;
  }
});

test('buttonize component renders', function(assert) {
  assert.expect(1);

  this.render(Template);

  assert.equal(this.$('.action').text().trim(),
    'Buttonize component',
    'Buttonize component is yielded');
});
