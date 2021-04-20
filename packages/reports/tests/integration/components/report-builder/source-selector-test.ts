import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, triggerEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import type ReportBuilderSourceSelector from 'navi-reports/components/report-builder/source-selector';
import type { TestContext as Context } from 'ember-test-helpers';
//@ts-ignore
import { assertTooltipContent } from 'ember-tooltips/test-support';

type ComponentArgs = ReportBuilderSourceSelector['args'];
interface TestContext extends Context, ComponentArgs {}

const TEMPLATE = hbs`
<ReportBuilder::SourceSelector 
  @sources={{this.sources}}
  @currentSource={{this.currentSource}}
  @setSource={{this.setSource}}
/>`;
module('Integration | Component | report-builder/source-selector', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    this.sources = [
      { name: 'Source B', source: { stuff: 'b' } },
      { name: 'Source A', description: 'Source A Description', source: { stuff: 'a' } },
    ];
    this.setSource = () => undefined;
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
  });

  test('it handles selecting a source', async function (this: TestContext, assert) {
    assert.expect(4);
    this.setSource = (source) => {
      assert.deepEqual(source, { stuff: 'b' }, 'Source B was clicked');
      this.set('currentSource', this.sources[0]);
    };
    await render(TEMPLATE);

    assert.dom('.report-builder-source-selector__source--selected').doesNotExist('No source is selected');

    await click('.report-builder-source-selector__source-button[data-source-name="Source B"]');

    assert
      .dom('.report-builder-source-selector__source--selected')
      .exists({ count: 1 }, 'A source is selected')
      .hasText('Source B', 'And it is source B');
  });
});
