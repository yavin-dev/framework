import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import ReportViewOverlay from 'navi-reports/components/report-view-overlay';

type ComponentArgs = ReportViewOverlay['args'];

interface TestContext extends Context, ComponentArgs {}

const TEMPLATE = hbs`<ReportViewOverlay 
  @isVisible={{this.isVisible}}
  @runReport={{this.runReport}}
/>`;

module('Integration | Component | report-view-overlay', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    this.isVisible = false;
    this.runReport = () => undefined;
  });

  test('it renders', async function(this: TestContext, assert) {
    assert.expect(5);

    this.runReport = () => assert.ok(true, 'Called runReport');
    await render(TEMPLATE);

    assert
      .dom('.report-view-overlay__content')
      .doesNotExist('The content is not rendered when the overlay is not visible');

    this.set('isVisible', true);

    assert.dom('.report-view-overlay__content').exists('The content is rendered when the overlay is visible');

    await click('.report-view-overlay__button--run');

    await click('.report-view-overlay__button--dismiss');

    assert
      .dom('.report-view-overlay__content')
      .doesNotExist('The content is not rendered when the overlay is dismissed');

    this.set('isVisible', false);
    this.set('isVisible', true);
    assert.dom('.report-view-overlay__content').exists('The dismiss is reset when the @isVisible prop is updated');
  });

  test('it renders - hasBlock', async function(this: TestContext, assert) {
    this.isVisible = false;
    this.runReport = () => undefined;
    await render(hbs`
      <ReportViewOverlay id="test-overlay-id" @isVisible={{this.isVisible}} @runReport={{this.runReport}} as |Overlay|>
        Content
        <button type="button" id="dismiss-button" {{on "click" Overlay.dismiss}} />
      </ReportViewOverlay>
    `);

    assert.dom('#test-overlay-id').exists('The wrapper container exists');
    assert
      .dom('#test-overlay-id')
      .doesNotHaveTextContaining('Content', 'The content is not rendered when the overlay is not visible');

    this.set('isVisible', true);
    assert.dom('#test-overlay-id').hasText('Content', 'The content is not rendered when the overlay is not visible');
    assert.dom('#dismiss-button').exists('The dismiss button exists');

    await click('#dismiss-button');

    assert
      .dom('#test-overlay-id')
      .doesNotHaveTextContaining('Content', 'The content is not rendered when the overlay is not visible');
    assert.dom('#dismiss-button').doesNotExist('The dismiss button is hidden');
  });
});
