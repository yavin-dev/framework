import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, triggerEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { assertTooltipContent } from 'ember-tooltips/test-support';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import type ReportBuilderSourceSelectorList from 'navi-reports/components/report-builder/source-selector-list';
import type { TestContext as Context } from 'ember-test-helpers';

type ComponentArgs = ReportBuilderSourceSelectorList['args'];
interface TestContext extends Context, ComponentArgs {}

const TEMPLATE = hbs`
<ReportBuilder::SourceSelectorList
  @sources={{this.sources}}
  @currentSource={{this.currentSource}}
  @setSource={{this.setSource}}
/>`;

module('Integration | Component | report-builder/source-selector-list', function (hooks) {
  setupRenderingTest(hooks);
  setupAnimationTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    this.sources = [
      { name: 'Source B', source: { stuff: 'b' } },
      { name: 'Source A', description: 'Source A Description', source: { stuff: 'a' } },
    ];
    this.setSource = () => undefined;
  });

  test('renders nothing when sources are empty', async function (this: TestContext, assert) {
    assert.expect(1);

    this.sources = [];
    await render(TEMPLATE);

    assert.dom('.report-builder-source-selector__list').doesNotExist('List is not shown');
  });

  test('it shows sources', async function (this: TestContext, assert) {
    assert.expect(2);

    await render(TEMPLATE);

    assert.dom('.report-builder-source-selector__source').exists({ count: 2 }, 'There are two sources');

    assert.deepEqual(
      findAll('.report-builder-source-selector__source').map((el) => el.textContent?.trim()),
      ['Source B', 'Source A'],
      'The sources are listed as passded in'
    );
  });

  test('it shows descriptions if available', async function (this: TestContext, assert) {
    assert.expect(2);

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
    assert.expect(5);

    this.setSource = (source) => {
      assert.deepEqual(source, { stuff: 'b' }, 'Source B was clicked');
      this.set('currentSource', (this.sources ?? [])[0]);
    };
    await render(TEMPLATE);

    assert.dom('.report-builder-source-selector__source--selected').doesNotExist('No source is selected');

    await click('.report-builder-source-selector__source-button[data-source-name="Source B"]');
    await animationsSettled();

    assert
      .dom('.report-builder-source-selector__source--selected')
      .exists({ count: 1 }, 'A source is selected')
      .hasText('Source B', 'And it is source B');

    assert
      .dom('.report-builder-source-selector__source--selected .report-builder-source-selector__source-name > span')
      .hasClass('is-active', 'Selected source name has active class');
  });
});
