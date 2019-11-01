import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | table cell renderer', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders the correct cell renderer', async function(assert) {
    this.set('column', {
      attributes: { name: 'foo', parameters: {} },
      type: 'metric'
    });

    this.set('data', {
      foo: 12
    });

    this.set('request', {});

    await render(hbs`{{navi-table-cell-renderer
      column=column
      data=data
      request=request
     }}`);

    assert.dom('.table-cell-content').hasText('12', 'renders metric value');
    assert.dom('.table-cell-content').hasClass('metric', 'renders metric cell-formatter');

    this.set('column', {
      attributes: { name: 'foo' },
      type: 'dimension'
    });

    this.set('data', {
      'foo|id': 'hi'
    });

    assert.dom('.table-cell-content').hasText('hi', 'renders dimension value');
    assert.dom('.table-cell-content').hasClass('dimension', 'renders using dimension cell-formatter');

    this.set('column', {
      type: 'dateTime'
    });

    this.set('data', {
      dateTime: '2012-05-12T00:00:00'
    });

    this.set('request', {
      logicalTable: {
        timeGrain: 'day'
      }
    });

    assert.dom('.table-cell-content').hasText('05/12/2012', 'renders date-time value');
    assert.dom('.table-cell-content').hasClass('date-time', 'renders using date-time cell-formatter');

    this.set('column', {
      attributes: { name: 'foo', parameters: {} },
      type: 'threshold'
    });

    this.set('data', {
      foo: 12
    });

    this.set('request', {
      logicalTable: {
        timeGrain: 'day'
      }
    });

    assert.dom('.table-cell-content').hasText('12', 'renders threshold value');
    assert.dom('.table-cell-content').hasClass('threshold', 'renders using threshold cell-formatter');
  });
});
