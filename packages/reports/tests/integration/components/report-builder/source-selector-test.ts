import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, triggerEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { assertTooltipContent } from 'ember-tooltips/test-support';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import type ReportBuilderSourceSelector from 'navi-reports/components/report-builder/source-selector';
import type { TestContext as Context } from 'ember-test-helpers';

type ComponentArgs = ReportBuilderSourceSelector['args'];
interface TestContext extends Context, ComponentArgs {}

const TEMPLATE = hbs`
<ReportBuilder::SourceSelector 
  @sourcesTask={{this.sourcesTask}}
  @currentSource={{this.currentSource}}
  @setSource={{this.setSource}}
/>`;

module('Integration | Component | report-builder/source-selector', function (hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    //@ts-ignore
    this.sourcesTask = {
      isRunning: false,
      isSuccessful: true,
      value: [
        { name: 'Source B', source: { stuff: 'b' } },
        { name: 'Source A', description: 'Source A Description', source: { stuff: 'a' } },
      ],
      error: new Error('Broken Source'),
    };
    this.setSource = () => undefined;
  });

  test('it shows loading state', async function (this: TestContext, assert) {
    //@ts-ignore
    this.sourcesTask.isSuccessful = false;
    //@ts-ignore
    this.sourcesTask.isRunning = true;
    await render(TEMPLATE);

    assert.dom('.report-builder-source-selector__source').doesNotExist('There are no sources shown');

    assert.dom('.loader').exists('There is a loading indicator while sources are not ready');
  });

  test('it shows sources', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    assert.dom('.report-builder-source-selector__source').exists({ count: 2 }, 'There are two sources');

    assert.deepEqual(
      findAll('.report-builder-source-selector__source').map((el) => el.textContent?.trim()),
      ['Source B', 'Source A'],
      'The sources are listed as passded in'
    );
  });

  test('it shows descriptions if available', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    assert
      .dom('.report-builder-source-selector__source-description')
      .exists({ count: 1 }, 'Only one description is rendered');

    await triggerEvent('.report-builder-source-selector__source-description', 'mouseenter');

    assertTooltipContent(assert, {
      contentString: 'Source A Description',
    });

    await click('.report-builder-source-selector__source-button[data-source-name="Source B"]');
    await animationsSettled();
  });

  test('it handles selecting a source', async function (this: TestContext, assert) {
    assert.expect(4);
    this.setSource = (source) => {
      assert.deepEqual(source, { stuff: 'b' }, 'Source B was clicked');
      this.set('currentSource', (this.sourcesTask.value ?? [])[0]);
    };
    await render(TEMPLATE);

    assert.dom('.report-builder-source-selector__source--selected').doesNotExist('No source is selected');

    await click('.report-builder-source-selector__source-button[data-source-name="Source B"]');
    await animationsSettled();

    assert
      .dom('.report-builder-source-selector__source--selected')
      .exists({ count: 1 }, 'A source is selected')
      .hasText('Source B', 'And it is source B');
  });

  test('it shows empty state', async function (this: TestContext, assert) {
    //@ts-ignore
    this.sourcesTask.value = [];
    await render(TEMPLATE);

    assert.dom('.report-builder-source-selector-error').exists('An error notification is shown');
    assert
      .dom('.report-builder-source-selector-error__message')
      .hasText('There Are No Sources', 'A failure message is displayed');
  });

  test('it shows error state', async function (this: TestContext, assert) {
    //@ts-ignore
    this.sourcesTask.isSuccessful = false;
    await render(TEMPLATE);

    assert.dom('.report-builder-source-selector-error').exists('An error notification is shown');
    assert
      .dom('.report-builder-source-selector-error__message')
      .hasText('Sources Failed To Load', 'A failure message is displayed');

    assert
      .dom('.report-builder-source-selector-error__error-list')
      .hasText('Error: Broken Source', 'The error is shown');
  });
});
