import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, clearRender, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext } from 'ember-test-helpers';
import Service from '@ember/service';
import ControllerClass from '@ember/controller';

const TEMPLATE = hbs`<DirSidebarToggle />`;

class TestRouter extends Service {
  isActive = () => false;
}
class TestController extends ControllerClass {
  toggleSidebar() {
    // empty
  }
}
let Router: TestRouter;
let Controller: TestController;

const Toggle = '#dir-sidebar-toggle';

module('Integration | Component | dir sidebar toggle', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.owner.unregister('controller:directory');
    this.owner.register('controller:directory', TestRouter);
    Controller = this.owner.lookup('controller:directory');

    this.owner.unregister('service:router');
    this.owner.register('service:router', TestRouter);
    Router = this.owner.lookup('service:router');
  });

  test('it renders only on directory routes', async function (assert) {
    await render(TEMPLATE);
    assert.dom(Toggle).doesNotExist('The sidebar toggle component is not rendered on non-directory routes');

    await clearRender();
    Router.isActive = () => true;
    await render(TEMPLATE);

    assert.dom(Toggle).exists('The sidebar toggle component is rendered on directory routes');
  });

  test('it handles clicks', async function (assert) {
    assert.expect(2);

    Controller.toggleSidebar = () => {
      assert.ok(true, 'the sidebar was toggled');
    };
    Router.isActive = () => true;

    await render(TEMPLATE);

    assert.dom(Toggle).exists('The sidebar toggle component is rendered on directory routes');
    await click(Toggle);
  });
});
