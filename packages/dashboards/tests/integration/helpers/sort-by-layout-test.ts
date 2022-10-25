import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | sortByLayout', function (hooks) {
  setupRenderingTest(hooks);

  test('It returns order of layout arrays correctly', async function (assert) {
    this.set('inputValue', [
      { column: 6, row: 16, height: 4, width: 6, widgetId: 14 },
      { column: 0, row: 12, height: 4, width: 12, widgetId: 15 },
      { column: 0, row: 16, height: 4, width: 6, widgetId: 16 },
      { column: 0, row: 0, height: 4, width: 6, widgetId: 17 },
      { column: 0, row: 8, height: 4, width: 12, widgetId: 18 },
      { column: 0, row: 4, height: 4, width: 12, widgetId: 19 },
      { column: 6, row: 0, height: 4, width: 6, widgetId: 20 },
    ]);

    await render(hbs`{{#each (sort-by-layout this.inputValue) as | widget |}}{{widget.widgetId}},{{/each}}`);

    assert.equal(this.element.textContent, '17,20,19,18,15,16,14,', 'Renders widget Ids in correct order');
  });

  test('It is able to order layouts in fragments', async function (assert) {
    assert.expect(1);
    const factory = this.owner.lookup('service:store');
    // pulled from actual complaint dashboard
    const presentation = factory.createFragment('fragments/presentation', {
      version: 1,
      layout: [
        {
          column: 4,
          row: 19,
          height: 4,
          width: 4,
          widgetId: 32303,
        },
        {
          column: 0,
          row: 19,
          height: 4,
          width: 4,
          widgetId: 32425,
        },
        {
          column: 8,
          row: 10,
          height: 4,
          width: 4,
          widgetId: 32426,
        },
        {
          column: 4,
          row: 10,
          height: 4,
          width: 4,
          widgetId: 32427,
        },
        {
          column: 8,
          row: 14,
          height: 4,
          width: 4,
          widgetId: 32429,
        },
        {
          column: 0,
          row: 14,
          height: 4,
          width: 4,
          widgetId: 32430,
        },
        {
          column: 0,
          row: 23,
          height: 4,
          width: 4,
          widgetId: 32431,
        },
        {
          column: 4,
          row: 23,
          height: 4,
          width: 4,
          widgetId: 32432,
        },
        {
          column: 4,
          row: 14,
          height: 4,
          width: 4,
          widgetId: 32433,
        },
        {
          column: 0,
          row: 10,
          height: 4,
          width: 4,
          widgetId: 32434,
        },
        {
          column: 8,
          row: 19,
          height: 4,
          width: 4,
          widgetId: 32436,
        },
        {
          column: 8,
          row: 23,
          height: 4,
          width: 4,
          widgetId: 32437,
        },
        {
          column: 0,
          row: 28,
          height: 4,
          width: 4,
          widgetId: 32632,
        },
        {
          column: 4,
          row: 28,
          height: 4,
          width: 4,
          widgetId: 32635,
        },
        {
          column: 8,
          row: 28,
          height: 4,
          width: 4,
          widgetId: 32636,
        },
        {
          column: 0,
          row: 33,
          height: 5,
          width: 4,
          widgetId: 32684,
        },
        {
          column: 4,
          row: 33,
          height: 5,
          width: 4,
          widgetId: 32685,
        },
        {
          column: 8,
          row: 33,
          height: 5,
          width: 4,
          widgetId: 32686,
        },
        {
          column: 0,
          row: 38,
          height: 5,
          width: 12,
          widgetId: 32687,
        },
        {
          column: 0,
          row: 1,
          height: 4,
          width: 4,
          widgetId: 32743,
        },
        {
          column: 4,
          row: 1,
          height: 4,
          width: 4,
          widgetId: 32744,
        },
        {
          column: 8,
          row: 1,
          height: 4,
          width: 4,
          widgetId: 32745,
        },
        {
          column: 4,
          row: 5,
          height: 4,
          width: 4,
          widgetId: 32747,
        },
        {
          column: 8,
          row: 5,
          height: 4,
          width: 4,
          widgetId: 32748,
        },
        {
          column: 0,
          row: 5,
          height: 4,
          width: 4,
          widgetId: 32749,
        },
        {
          column: 0,
          row: 48,
          height: 5,
          width: 12,
          widgetId: 32764,
        },
        {
          column: 0,
          row: 58,
          height: 5,
          width: 12,
          widgetId: 32766,
        },
        {
          column: 0,
          row: 68,
          height: 5,
          width: 12,
          widgetId: 32767,
        },
        {
          column: 0,
          row: 43,
          height: 5,
          width: 6,
          widgetId: 32769,
        },
        {
          column: 6,
          row: 43,
          height: 5,
          width: 6,
          widgetId: 32785,
        },
        {
          column: 0,
          row: 53,
          height: 5,
          width: 6,
          widgetId: 32786,
        },
        {
          column: 6,
          row: 53,
          height: 5,
          width: 6,
          widgetId: 32787,
        },
        {
          column: 0,
          row: 63,
          height: 5,
          width: 6,
          widgetId: 32788,
        },
        {
          column: 6,
          row: 63,
          height: 5,
          width: 6,
          widgetId: 32789,
        },
      ],
      columns: 12,
    });
    this.set('layout', presentation.layout);
    await render(hbs`{{#each (sort-by-layout this.layout) as | widget |}}{{widget.widgetId}},{{/each}}`);

    assert.equal(
      this.element.textContent,
      '32743,32744,32745,32749,32747,32748,32434,32427,32426,32430,32433,32429,32425,32303,32436,32431,32432,32437,32632,32635,32636,32684,32685,32686,32687,32769,32785,32764,32786,32787,32766,32788,32789,32767,',
      'Renders widget Ids in correct order'
    );
  });
});
