import { run } from '@ember/runloop';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

let MetadataService;

let Template = hbs`
  {{visualization-config/wrapper
    response=response
    request=request
    visualization=visualization
    onUpdateConfig=(action onUpdateChartConfig)
  }}`;

module('Integration | Component | visualization config/warpper', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    setupMock();

    // mocking viz-config component
    this.owner.register(
      'component:visualization-config/mock',
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

  hooks.afterEach(function() {
    teardownMock();
  });

  test('component renders', async function(assert) {
    assert.expect(1);

    await render(Template);

    assert
      .dom('.visualization-config .visualization-config__contents.mock')
      .exists('The Mock component is correctly rendered based on visualization type');
  });

  test('onUpdateChartConfig', async function(assert) {
    assert.expect(1);

    this.set('onUpdateChartConfig', result => {
      assert.equal(result, 'foo', 'onUpdateChartConfig action is called by the mock component');
    });

    await render(Template);

    await run(() => click('.visualization-config .visualization-config__contents.mock'));
  });
});
