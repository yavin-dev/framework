import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('table-cell-renderer', 'Integration | Component | table cell renderer', {
  integration: true
});

test('it renders the correct cell renderer', function(assert) {
  this.set('column', {
    field: { metric: 'foo', parameters: {} },
    type: 'metric'
  });

  this.set('data', {
    foo: 12
  });

  this.set('request', {});

  this.render(hbs`{{table-cell-renderer
    column=column
    data=data
    request=request
   }}`);

  assert.equal(
    this.$('.table-cell-content')
      .text()
      .trim(),
    '12.00',
    'renders metric value'
  );
  assert.ok(this.$('.table-cell-content').hasClass('metric'), 'renders metric cell-formatter');

  this.set('column', {
    field: { dimension: 'foo' },
    type: 'dimension'
  });

  this.set('data', {
    'foo|id': 'hi'
  });

  assert.equal(
    this.$('.table-cell-content')
      .text()
      .trim(),
    'hi',
    'renders dimension value'
  );
  assert.ok(this.$('.table-cell-content').hasClass('dimension'), 'renders using dimension cell-formatter');

  this.set('column', {
    type: 'date-time'
  });

  this.set('data', {
    dateTime: '2012-05-12T00:00:00'
  });

  this.set('request', {
    logicalTable: {
      timeGrain: 'day'
    }
  });

  assert.equal(
    this.$('.table-cell-content')
      .text()
      .trim(),
    '05/12/2012',
    'renders date-time value'
  );
  assert.ok(this.$('.table-cell-content').hasClass('date-time'), 'renders using date-time cell-formatter');

  this.set('column', {
    field: { metric: 'foo', parameters: {} },
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

  assert.equal(
    this.$('.table-cell-content')
      .text()
      .trim(),
    '12',
    'renders threshold value'
  );
  assert.ok(this.$('.table-cell-content').hasClass('threshold'), 'renders using threshold cell-formatter');
});
