import { run } from '@ember/runloop';
import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { set } from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

let route;

moduleForComponent('helper:model-for', 'Integration | Helper | model for', {
  integration: true,

  beforeEach() {
    let controller = {};
    this.register('route:mock-route', Route.extend({ controller }));
    route = getOwner(this).lookup('route:mock-route');
  }
});

test('modelFor', function(assert) {
  assert.expect(2);

  set(route, 'controller.model', 'foo');
  this.render(hbs`<span>{{model-for 'mock-route'}}</span>`);
  assert.equal(this.$('span').text(), 'foo', "model-for helper returned the route's model");

  run(() => set(route, 'controller.model', 'bar'));
  assert.equal(this.$('span').text(), 'bar', "model-for helper recomputes when the route's model changes");
});

test('modelFor - missing route', function(assert) {
  assert.expect(1);

  this.render(hbs`<span>{{model-for 'missing-route'}}</span>`);
  assert.equal(this.$('span').text(), '', 'model-for helper returns undefined when route does not exist');
});
