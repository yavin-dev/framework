import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { getContext } from '@ember/test-helpers';
import GlimmerComponentManager from 'dummy/component-managers/glimmer';

// https://timgthomas.com/2019/11/unit-testing-glimmer-components/
function createGlimmerComponent(lookupPath, named = {}) {
  let { owner } = getContext();
  let { class: componentClass } = owner.factoryFor(lookupPath);
  let componentManager = new GlimmerComponentManager(owner);
  return componentManager.createComponent(componentClass, { named });
}

module('Unit | Component | dir-item-name-cell', function(hooks) {
  setupTest(hooks);

  test('links are constructed correctly', function(assert) {
    assert.expect(2);

    const args = {
      value: {
        constructor: {
          modelName: 'report'
        },
        modelId: '12345'
      }
    };
    let unsavedReportComponent = createGlimmerComponent('component:dir-item-name-cell', args);

    assert.equal(
      unsavedReportComponent.itemLink,
      'reports.report',
      'Component builds the link based on the type of the model correctly'
    );

    assert.equal(unsavedReportComponent.itemId, '12345', 'Component uses the modelId to construct the link');
  });
});
