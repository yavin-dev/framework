import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('navi-email-tag', 'Integration | Component | navi email tag', {
  integration: true
});

test('valid email address', function(assert) {
  assert.expect(1);

  this.set('email', 'link@naviapp.io');

  this.render(hbs`{{navi-email-tag tag=email}}`);

  assert.notOk(
    this.$('.navi-email-tag').is('.navi-email-tag--is-disabled'),
    'Tag containing a valid email is not given the disabled class'
  );
});

test('invalid email address', function(assert) {
  assert.expect(1);

  this.set('email', 'abcdefg');

  this.render(hbs`{{navi-email-tag tag=email}}`);

  assert.ok(
    this.$('.navi-email-tag').is('.navi-email-tag--is-disabled'),
    'Tag containing an invalid email is given the disabled class'
  );
});
