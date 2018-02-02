import { moduleForComponent, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import DS from 'ember-data';
import Ember from 'ember';
import { ForbiddenError } from 'ember-ajax/errors';

const WIDGET = {
  id: 1,
  title: 'Widget 1',
  visualization: {
    type: 'my-test-visualization',
  }
};

moduleForComponent('navi-widget', 'Integration | Component | navi widget', {
  integration: true,

  beforeEach() {
    this.register('helper:route-action', Ember.Helper.helper(() => { }), { instantiate: false });
  }
});

test('it renders', function(assert) {
  assert.expect(7);

  let dataPromise = Ember.RSVP.defer();

  // Mock a visualization component
  this.register('component:navi-visualizations/my-test-visualization', Ember.Component.extend());

  this.set('widgetModel', WIDGET);

  this.set('data', DS.PromiseObject.create({
    promise: dataPromise.promise
  }));

  this.render(hbs`
    {{navi-widget
      model=widgetModel
      data=data
    }}
  `);

  assert.equal(this.$('.navi-widget__title').text().trim(),
    WIDGET.title,
    'widget title is rendered');

  assert.ok(this.$('.loader-container').is(':visible'),
    'loader is visibile while promise is pending');

  assert.notOk(this.$('.visualization-container').is(':visible'),
    'visualization is not rendered while data is loading');

  Ember.run(() => {
    dataPromise.resolve([]);
  });

  assert.ok(this.$('.visualization-container').is(':visible'),
    'visualization is visible when data is ready');

  assert.notOk(this.$('.loader-container').is(':visible'),
    'loader is hidden when promise is resolved');

  Ember.run(() => {
    this.set('data', DS.PromiseObject.create({
      promise: Ember.RSVP.reject()
    }));
  });

  assert.ok(this.$('.error-container').is(':visible'),
    'error is shown on rejected promise');

  Ember.run(() => {
    this.set('data', DS.PromiseObject.create({
      promise: Ember.RSVP.reject(new ForbiddenError({}))
    })).catch(() => null);
  });

  assert.ok(this.$('.navi-report-invalid__info-message .fa-lock').is(':visible'),
    'Unauthorized view should be shown when receiving ForbiddenError');
});

test('layout', function(assert) {
  assert.expect(4);

  this.set('widgetModel', WIDGET);

  this.set('layoutOptions', {
    column: 2,
    row: 1,
    height: 4,
    width: 10
  });

  this.render(hbs`
    {{navi-widget
      model=widgetModel
      layoutOptions=layoutOptions
    }}
  `);

  assert.equal(this.$('.grid-stack-item').attr('data-gs-x'),
    2,
    'given column is correctly translated to gridstack data attribute');

  assert.equal(this.$('.grid-stack-item').attr('data-gs-y'),
    1,
    'given row is correctly translated to gridstack data attribute');

  assert.equal(this.$('.grid-stack-item').attr('data-gs-width'),
    10,
    'given width is correctly translated to gridstack data attribute');

  assert.equal(this.$('.grid-stack-item').attr('data-gs-height'),
    4,
    'given height is correctly translated to gridstack data attribute');
});

test('visualization', function(assert) {
  assert.expect(4);

  let data = Ember.A([1, 2, 3]),
      metadata = {
        xAxis: 'timeseries'
      },
      dataPromise = Ember.RSVP.resolve(data);

  this.set('widgetModel', {
    id: 1,
    title: 'Widget 1',
    visualization: {
      type: 'my-test-visualization',
      version: 1,
      metadata
    },
  });

  this.set('data', DS.PromiseArray.create({
    promise: dataPromise
  }));

  // Make sure we have a reference to the grid-stack-item so we can test the event system
  let containerComponent = null;

  this.register('component:navi-visualizations/my-test-visualization', Ember.Component.extend({
    classNames: ['test-visualization'],

    didInsertElement() {
      this._super(...arguments);

      containerComponent = this.get('containerComponent');

      // Assert model and options are correct
      assert.deepEqual(this.get('options'),
        metadata,
        'metadata is passed to visualization as options');

      assert.deepEqual(this.get('model').toArray(),
        data,
        'data is passed to visualization as model');

      this.get('containerComponent').$().on('resizestop', () => {
        assert.ok(true, 'visualization can listen to resize events on containerComponent property');
      });
    }
  }));

  this.render(hbs`
    {{navi-widget
      model=widgetModel
      data=data
    }}
  `);

  return wait().then(() => {
    assert.ok(this.$('.test-visualization').is(':visible'),
      'visualization component is rendered');

    // Test visualization listening to events
    containerComponent.$().trigger('resizestop');
  });
});

test('delete action visibility', function(assert) {
  assert.expect(2);

  this.set('widgetModel', WIDGET);

  this.render(hbs`
    {{navi-widget
      model=widgetModel
      canEdit=canEdit
    }}
  `);

  this.set('canEdit', true);
  assert.ok(!!this.$('.navi-widget__delete-btn').length,
    'Delete action is visible when user can edit');

  this.set('canEdit', false);
  assert.notOk(!!this.$('.widget-actions .delete').length,
    'Delete action is hidden when user can not edit');
});
