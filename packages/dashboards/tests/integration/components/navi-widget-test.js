import { A } from '@ember/array';
import { run } from '@ember/runloop';
import Component from '@ember/component';
import { defer, reject, resolve } from 'rsvp';
import { helper as buildHelper } from '@ember/component/helper';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import DS from 'ember-data';
import { ForbiddenError } from 'ember-ajax/errors';

const WIDGET = {
  id: 1,
  title: 'Widget 1',
  visualization: {
    type: 'my-test-visualization'
  }
};

module('Integration | Component | navi widget', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('helper:route-action', buildHelper(() => {}), {
      instantiate: false
    });
  });

  test('it renders', async function(assert) {
    assert.expect(7);

    let dataPromise = defer();

    // Mock a visualization component
    this.owner.register('component:navi-visualizations/my-test-visualization', Component.extend());

    this.set('widgetModel', WIDGET);

    this.set(
      'data',
      DS.PromiseObject.create({
        promise: dataPromise.promise
      })
    );

    await render(hbs`
      {{navi-widget
        model=widgetModel
        data=data
      }}
    `);

    assert.dom('.navi-widget__title').hasText(WIDGET.title, 'widget title is rendered');

    assert.ok(this.$('.loader-container').is(':visible'), 'loader is visibile while promise is pending');

    assert.notOk(
      this.$('.visualization-container').is(':visible'),
      'visualization is not rendered while data is loading'
    );

    run(() => {
      dataPromise.resolve([]);
    });

    assert.ok(this.$('.visualization-container').is(':visible'), 'visualization is visible when data is ready');

    assert.notOk(this.$('.loader-container').is(':visible'), 'loader is hidden when promise is resolved');

    run(() => {
      this.set(
        'data',
        DS.PromiseObject.create({
          promise: reject()
        })
      );
    });

    assert.ok(this.$('.error-container').is(':visible'), 'error is shown on rejected promise');

    run(() => {
      this.set(
        'data',
        DS.PromiseObject.create({
          promise: reject(new ForbiddenError({}))
        })
      ).catch(() => null);
    });

    assert.ok(
      this.$('.navi-report-invalid__info-message .fa-lock').is(':visible'),
      'Unauthorized view should be shown when receiving ForbiddenError'
    );
  });

  test('layout', async function(assert) {
    assert.expect(4);

    this.set('widgetModel', WIDGET);

    this.set('layoutOptions', {
      column: 2,
      row: 1,
      height: 4,
      width: 10
    });

    await render(hbs`
      {{navi-widget
        model=widgetModel
        layoutOptions=layoutOptions
      }}
    `);

    assert
      .dom('.grid-stack-item')
      .hasAttribute('data-gs-x', 2, 'given column is correctly translated to gridstack data attribute');

    assert
      .dom('.grid-stack-item')
      .hasAttribute('data-gs-y', 1, 'given row is correctly translated to gridstack data attribute');

    assert
      .dom('.grid-stack-item')
      .hasAttribute('data-gs-width', 10, 'given width is correctly translated to gridstack data attribute');

    assert
      .dom('.grid-stack-item')
      .hasAttribute('data-gs-height', 4, 'given height is correctly translated to gridstack data attribute');
  });

  test('visualization', async function(assert) {
    assert.expect(4);

    let data = A([1, 2, 3]),
      metadata = {
        xAxis: 'timeseries'
      },
      dataPromise = resolve(data);

    this.set('widgetModel', {
      id: 1,
      title: 'Widget 1',
      visualization: {
        type: 'my-test-visualization',
        version: 1,
        metadata
      }
    });

    this.set(
      'data',
      DS.PromiseArray.create({
        promise: dataPromise
      })
    );

    // Make sure we have a reference to the grid-stack-item so we can test the event system
    let containerComponent = null;

    this.owner.register(
      'component:navi-visualizations/my-test-visualization',
      Component.extend({
        classNames: ['test-visualization'],

        didInsertElement() {
          this._super(...arguments);

          containerComponent = this.get('containerComponent');

          // Assert model and options are correct
          assert.deepEqual(this.get('options'), metadata, 'metadata is passed to visualization as options');

          assert.deepEqual(this.get('model').toArray(), data, 'data is passed to visualization as model');

          this.get('containerComponent')
            .$()
            .on('resizestop', () => {
              assert.ok(true, 'visualization can listen to resize events on containerComponent property');
            });
        }
      })
    );

    await render(hbs`
      {{navi-widget
        model=widgetModel
        data=data
      }}
    `);

    return settled().then(() => {
      assert.ok(this.$('.test-visualization').is(':visible'), 'visualization component is rendered');

      // Test visualization listening to events
      containerComponent.$().trigger('resizestop');
    });
  });

  test('delete action visibility', async function(assert) {
    assert.expect(2);

    this.set('widgetModel', WIDGET);

    await render(hbs`
      {{navi-widget
        model=widgetModel
        canEdit=canEdit
      }}
    `);

    this.set('canEdit', true);
    assert.ok(!!findAll('.navi-widget__delete-btn').length, 'Delete action is visible when user can edit');

    this.set('canEdit', false);
    assert.notOk(!!findAll('.widget-actions .delete').length, 'Delete action is hidden when user can not edit');
  });
});
