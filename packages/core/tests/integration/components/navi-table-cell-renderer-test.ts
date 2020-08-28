import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | navi table cell renderer', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders the correct cell renderer', async function(assert) {
    this.set('column', {
      type: 'metric',
      field: 'foo',
      parameters: {},
      attributes: {}
    });

    this.set('data', {
      foo: 12
    });

    this.set('request', {});

    await render(hbs`<NaviTableCellRenderer
      @column={{this.column}}
      @data={{this.data}}
      @request={{this.request}}
     />`);

    assert.dom('.table-cell-content').hasText('12', 'renders metric value');
    assert.dom('.table-cell-content').hasClass('metric', 'renders metric cell-formatter');

    this.set('column', {
      type: 'dimension',
      field: 'foo',
      parameters: { field: 'id' },
      attributes: {}
    });

    this.set('data', {
      'foo(field=id)': 'hi'
    });

    assert.dom('.table-cell-content').hasText('hi', 'renders dimension value');
    assert.dom('.table-cell-content').hasClass('dimension', 'renders using dimension cell-formatter');

    this.set('column', {
      type: 'timeDimension',
      field: 'tableName.dateTime',
      parameters: { grain: 'day' },
      attributes: {}
    });

    this.set('data', {
      'tableName.dateTime(grain=day)': '2012-05-12T00:00:00'
    });

    assert.dom('.table-cell-content').hasText('05/12/2012', 'renders time-dimension value');
    assert.dom('.table-cell-content').hasClass('time-dimension', 'renders using date-time cell-formatter');
  });
});
