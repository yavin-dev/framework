import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { animationsSettled } from 'ember-animated/test-support';

module('Integration | Component | navi-column-config', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<NaviColumnConfig />`);
    await animationsSettled();
    assert.dom('.navi-column-config').exists('NaviColumnConfig renders');
  });

  test('it opens and closes', async function(assert) {
    await render(hbs`<NaviColumnConfig @isOpen={{this.isOpen}} />`);

    await animationsSettled();
    assert.dom('.navi-column-config__panel').doesNotExist('Drawer is closed when `isOpen` is false');

    this.set('isOpen', true);
    await animationsSettled();
    assert.dom('.navi-column-config__panel').exists('Drawer is open when `isOpen` is true');

    this.set('isOpen', false);
    await animationsSettled();
    assert.dom('.navi-column-config__panel').doesNotExist('Drawer is closed when `isOpen` is false');
  });

  test('it fires drawerDidChange action', async function(assert) {
    assert.expect(3);

    this.set('drawerDidChange', () => assert.ok('drawerDidChange fires'));

    await render(hbs`<NaviColumnConfig
      @isOpen={{this.isOpen}}
      @drawerDidChange={{this.drawerDidChange}}
    />`);
    await animationsSettled();

    this.set('isOpen', true);
    await animationsSettled();

    this.set('isOpen', false);
    await animationsSettled();

    this.set('isOpen', true);
    await animationsSettled();
  });
});
