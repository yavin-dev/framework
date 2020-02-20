import { A as arr } from '@ember/array';
import Component from '@ember/component';
import { helper as buildHelper } from '@ember/component/helper';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { assertTooltipContent } from 'ember-tooltips/test-support';
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

    // Mock a visualization component
    this.owner.register('component:navi-visualizations/my-test-visualization', Component.extend());
  });

  test('it renders', async function(assert) {
    assert.expect(8);

    this.set('widgetModel', WIDGET);
    this.set('taskInstance', undefined);

    await render(hbs`
      <NaviWidget
        @model={{this.widgetModel}}
        @taskInstance={{this.taskInstance}}
      />
    `);

    assert.dom('.navi-widget__title').hasText(WIDGET.title, 'widget title is rendered');

    assert.dom('.loader-container').isVisible('loader is visible if task instance is not defined');

    this.set('taskInstance', { isRunning: true });

    assert.dom('.loader-container').isVisible('loader is visible if task instance is running');

    assert.dom('.visualization-container').doesNotExist('visualization is not rendered while data is loading');

    this.set('taskInstance', {
      isSuccessful: true,
      value: []
    });

    assert.dom('.visualization-container').exists('visualization exists when task is finished');

    assert.dom('.loader-container').isNotVisible('loader is hidden when task is finished');

    this.set('taskInstance', {
      isError: true
    });

    assert.dom('.error-container').isVisible('error is shown on rejected promise');

    this.set('taskInstance', {
      isError: true,
      error: new ForbiddenError()
    });

    assert
      .dom('.navi-report-invalid__info-message .fa-lock')
      .isVisible('Unauthorized view should be shown when receiving ForbiddenError');
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
      <NaviWidget
        @model={{this.widgetModel}}
        @layoutOptions={{this.layoutOptions}}
      />
    `);

    assert
      .dom('.grid-stack-item')
      .hasAttribute('data-gs-x', '2', 'given column is correctly translated to gridstack data attribute');

    assert
      .dom('.grid-stack-item')
      .hasAttribute('data-gs-y', '1', 'given row is correctly translated to gridstack data attribute');

    assert
      .dom('.grid-stack-item')
      .hasAttribute('data-gs-width', '10', 'given width is correctly translated to gridstack data attribute');

    assert
      .dom('.grid-stack-item')
      .hasAttribute('data-gs-height', '4', 'given height is correctly translated to gridstack data attribute');
  });

  test('visualization', async function(assert) {
    assert.expect(4);

    const data = arr([1, 2, 3]),
      metadata = {
        xAxis: 'timeseries'
      },
      taskInstance = {
        isSuccessful: true,
        value: data
      };

    this.set('widgetModel', {
      id: 1,
      title: 'Widget 1',
      visualization: {
        type: 'my-test-visualization',
        version: 1,
        metadata
      }
    });

    this.set('taskInstance', taskInstance);

    // Make sure we have a reference to the grid-stack-item so we can test the event system
    let containerComponent = null;

    this.owner.register(
      'component:navi-visualizations/my-test-visualization',
      Component.extend({
        classNames: ['test-visualization'],

        didInsertElement() {
          this._super(...arguments);

          containerComponent = this.containerComponent;

          // Assert model and options are correct
          assert.deepEqual(this.options, metadata, 'metadata is passed to visualization as options');

          assert.deepEqual(this.model.toArray(), data, 'data is passed to visualization as model');

          this.containerComponent.element.addEventListener('resizestop', () => {
            assert.ok(true, 'visualization can listen to resize events on containerComponent property');
          });
        }
      })
    );

    await render(hbs`
      <NaviWidget
        @model={{this.widgetModel}}
        @taskInstance={{this.taskInstance}}
      />
    `);

    assert.dom('.test-visualization').exists('visualization component is rendered');

    // Test visualization listening to events
    triggerEvent(containerComponent.element, 'resizestop');
  });

  test('delete action visibility', async function(assert) {
    assert.expect(2);

    this.set('widgetModel', WIDGET);

    await render(hbs`
      <NaviWidget
        @model={{this.widgetModel}}
        @canEdit={{this.canEdit}}
      />
    `);

    this.set('canEdit', true);
    assert.dom('.navi-widget__delete-btn').isVisible('Delete action is visible when user can edit');

    this.set('canEdit', false);
    assert.dom('.navi-widget__delete-btn').isNotVisible('Delete action is hidden when user can not edit');
  });

  test('filter warning icon', async function(assert) {
    assert.expect(3);

    const data = arr([
      {
        response: {
          meta: {
            errors: [
              {
                title: 'Invalid Filter',
                detail: "Dimension A doesn't exist in this widget's logical table"
              },
              {
                title: 'Invalid Filter',
                detail: "Dimension B doesn't exist in this widget's logical table"
              }
            ]
          }
        }
      }
    ]);

    this.set('widgetModel', WIDGET);

    this.set('taskInstance', {
      isSuccessful: true,
      value: data
    });

    await render(hbs`
      <NaviWidget
        @model={{this.widgetModel}}
        @taskInstance={{this.taskInstance}}
      />
    `);

    assert
      .dom('.navi-widget__filter-errors-icon')
      .isVisible('Widget Filters Error icon is visible when the widget has invalid filters');

    //Render tooltip on warning icon
    await triggerEvent('.navi-widget__filter-errors-icon', 'mouseenter');

    //Tooltip contains all error messages separated by new line characters
    assertTooltipContent(assert, {
      contentString: `Unable to apply filter(s):\nDimension A doesn't exist in this widget's logical table\nDimension B doesn't exist in this widget's logical table`
    });

    const newData = arr([
      {
        response: {
          meta: {}
        }
      }
    ]);

    this.set('taskInstance', {
      isSuccessful: true,
      value: newData
    });

    assert
      .dom('.navi-widget__filter-errors-icon')
      .isNotVisible('Widget Filters Error icon is not visible when the widget has no invalid filters');
  });
});
