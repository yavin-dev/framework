import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pick-inner-component', 'Integration | Component | pick inner component', {
  integration: true,

  beforeEach() {
    // Create an extended component for testing since pick-inner-component can't be used directly
    let innerComponent = this.container.factoryFor('component:pick-inner-component').class,
        testComponent = innerComponent.extend({componentName: 'extended-component'});

    this.register('component:extended-component', testComponent);
  }
});

test('Yields inner template', function(assert) {
  assert.expect(1);

  this.render(hbs`
        {{#pick-container}}
            {{#extended-component}}
                <div id='should-be-found'>My div</div>
            {{/extended-component}}
        {{/pick-container}}
    `);

  assert.equal(this.$('#should-be-found').text(),
    'My div',
    'Inner template renders');
});
