import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import type ReportBuilderSourceSelector from 'navi-reports/components/report-builder/source-selector';
import type { TestContext as Context } from 'ember-test-helpers';

type ComponentArgs = ReportBuilderSourceSelector['args'];
interface TestContext extends Context, ComponentArgs {}

const TEMPLATE = hbs`
<ReportBuilder::SourceSelector
  @sourceType={{this.sourceType}}
  @emptyMsg={{this.emptyMsg}}
  @sourcesTask={{this.sourcesTask}}
  @currentSource={{this.currentSource}}
  @setSource={{this.setSource}}
  @reset={{this.reset}}
/>`;

module('Integration | Component | report-builder/source-selector', function (hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    this.sourceType = 'tables';
    this.emptyMsg = 'There are no tables for this datasource.';
    //@ts-ignore
    this.sourcesTask = {
      isRunning: false,
      isSuccessful: true,
      value: [
        { name: 'Source B', source: { stuff: 'b' } },
        { name: 'Source A', description: 'Source A Description', source: { stuff: 'a' }, isSuggested: true },
      ],
      error: new Error('Broken Source'),
    };
    this.setSource = () => undefined;
    this.reset = () => undefined;
  });

  test('it shows loading state', async function (this: TestContext, assert) {
    assert.expect(2);

    //@ts-ignore
    this.sourcesTask.isSuccessful = false;
    //@ts-ignore
    this.sourcesTask.isRunning = true;
    await render(TEMPLATE);

    assert.dom('.report-builder-source-selector__source').doesNotExist('There are no sources shown');

    assert.dom('.loader').exists('There is a loading indicator while sources are not ready');
  });

  test('it shows sources with suggestions', async function (this: TestContext, assert) {
    assert.expect(2);

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.report-builder-source-selector-title').map((el) => el.textContent?.trim()),
      ['Suggested tables', 'All available tables'],
      'Titles for `suggested` and `all` are displayed'
    );

    assert.deepEqual(
      findAll('.report-builder-source-selector__source').map((el) => el.textContent?.trim()),
      ['Source A', 'Source B', 'Source A'],
      'The sources are listed correctly'
    );
  });

  test('it shows sources without suggestions', async function (this: TestContext, assert) {
    assert.expect(2);

    //@ts-ignore
    this.sourcesTask.value[1].isSuggested = false;
    await render(TEMPLATE);

    assert
      .dom('.report-builder-source-selector-title')
      .doesNotExist('Titles are not displayed if no sources are suggested.');

    assert.deepEqual(
      findAll('.report-builder-source-selector__source').map((el) => el.textContent?.trim()),
      ['Source B', 'Source A'],
      'The sources are listed as passed in'
    );
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

    assert
      .dom('.report-builder-source-selector-error .navi-info-message__title')
      .hasText('Nothing Here Yet', 'A failure message title is displayed');

    assert
      .dom('.report-builder-source-selector-error__description')
      .hasText('There are no tables for this datasource.', 'Passed in empty message is displayed');
  });

  test('it shows error state', async function (this: TestContext, assert) {
    assert.expect(2);

    //@ts-ignore
    this.sourcesTask.isSuccessful = false;
    await render(TEMPLATE);

    assert
      .dom('.report-builder-source-selector-error .navi-info-message__title')
      .hasText('Error Loading Tables', 'A failure message is displayed');

    assert
      .dom('.report-builder-source-selector-error__error-list')
      .hasText('Error: Broken Source', 'The error is shown');
  });
});
