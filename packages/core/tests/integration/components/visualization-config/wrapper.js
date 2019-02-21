import { run } from '@ember/runloop';
import Component from '@ember/component';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { get } from '@meber/object';

let Template = hbs`
  {{visualization-config/wrapper
    response=response
    request=request
    visualization=visualization
    onUpdateConfig=(action onUpdateConfig)
  }}`;

moduleForComponent('visualization-config/wrapper', 'Integration | Component | visualization config/warpper', {
  integration: true,
  beforeEach() {
    //mocking viz-config component
    this.register(
      'component:visualization-config/mock',
      Component.extend({
        classNames: ['mock'],
        click() {
          const handleUpdateConfig = get(this, 'onUpdateConfig');
          if (handleUpdateConfig) handleUpdateConfig('foo');
        }
      }),
      { instantiate: false }
    );

    this.set('visualization', {
      type: 'mock',
      metadata: {}
    });
  }
});

test('component renders', function(assert) {
  assert.expect(2);

  this.render(Template);

  assert.ok(
    this.$('.visualization-config--body .mock').is(':visible'),
    'The Mock component is correctly rendered based on visualization type'
  );

  assert.equal(
    this.$('.visualization-config--header')
      .text()
      .trim(),
    'Mock',
    'the header displays the type of the visualization config component rendered'
  );
});

test('onUpdateConfig', function(assert) {
  assert.expect(1);

  this.set('onUpdateConfig', result => {
    assert.equal(result, 'foo', 'onUpdateConfig action is called by the mock component');
  });

  this.render(Template);

  run(() => {
    this.$('.visualization-config--body .mock').click();
  });
});
