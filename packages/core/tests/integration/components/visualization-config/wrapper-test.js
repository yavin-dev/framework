import { run } from '@ember/runloop';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let MetadataService;

let Template = hbs`
  {{navi-visualization-config/wrapper
    response=response
    request=request
    visualization=visualization
    onUpdateConfig=(action onUpdateChartConfig)
  }}`;

module('Integration | Component | visualization config/warpper', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    // mocking viz-config component
    this.owner.register(
      'component:navi-visualization-config/mock',
      Component.extend({
        classNames: ['mock'],
        click() {
          const handleUpdateConfig = this.onUpdateConfig;
          if (handleUpdateConfig) handleUpdateConfig('foo');
        }
      }),
      { instantiate: false }
    );

    this.set('visualization', {
      type: 'mock',
      metadata: {}
    });

    this.set('onUpdateChartConfig', () => null);

    MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  test('component renders', async function(assert) {
    assert.expect(1);

    await render(Template);

    assert
      .dom('.navi-visualization-config .navi-visualization-config__contents.mock')
      .exists('The Mock component is correctly rendered based on visualization type');
  });

  test('onUpdateChartConfig', async function(assert) {
    assert.expect(1);

    this.set('onUpdateChartConfig', result => {
      assert.equal(result, 'foo', 'onUpdateChartConfig action is called by the mock component');
    });

    await render(Template);

    await run(() => click('.navi-visualization-config .navi-visualization-config__contents.mock'));
  });
});
