import { isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll, fillIn, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { assertTooltipRendered, assertTooltipNotRendered, assertTooltipContent } from '../../helpers/ember-tooltips';

let Store, MetadataService, Age;

module('Integration | Component | dimension selector', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    setupMock();

    this.set('addTimeGrain', () => {});
    this.set('removeTimeGrain', () => {});
    this.set('addDimension', () => {});
    this.set('removeDimension', () => {});
    this.set('addDimFilter', () => {});

    return MetadataService.loadMetadata().then(async () => {
      Age = MetadataService.getById('dimension', 'age');

      //set report object
      this.set(
        'request',
        Store.createFragment('bard-request/request', {
          logicalTable: Store.createFragment('bard-request/fragments/logicalTable', {
            table: MetadataService.getById('table', 'tableA'),
            timeGrainName: 'day'
          }),
          dimensions: [{ dimension: Age }],
          filters: [{ dimension: Age }],
          responseFormat: 'csv'
        })
      );

      await render(hbs`{{dimension-selector
            request=request
            onAddTimeGrain=(action addTimeGrain)
            onRemoveTimeGrain=(action removeTimeGrain)
            onAddDimension=(action addDimension)
            onRemoveDimension=(action removeDimension)
            onToggleDimFilter=(action addDimFilter)
          }}`);
    });
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('it renders', function(assert) {
    assert.expect(3);

    assert.ok(this.$('.checkbox-selector--dimension').is(':visible'), 'The dimension selector component is rendered');

    assert.ok(
      this.$('.navi-list-selector').is(':visible'),
      'a navi-list-selector component is rendered as part of the dimension selector'
    );

    assert.ok(
      this.$('.grouped-list').is(':visible'),
      'a grouped-list component is rendered as part of the dimension selector'
    );
  });

  test('groups', function(assert) {
    assert.expect(2);

    let groups = this.$('.grouped-list__group-header')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      );

    assert.ok(
      groups[0].includes('Time Grain'),
      'Time Grains are included as the first group in the dimension selector'
    );

    assert.deepEqual(
      groups,
      ['Time Grain (5)', 'test (25)', 'Asset (4)'],
      'The groups rendered by the component include dimension groups and Time Grain'
    );
  });

  test('show selected', function(assert) {
    assert.expect(3);

    assert.ok(
      findAll('.grouped-list__item').length > this.get('request.dimensions.length') + 1 /*for timegrain*/,
      'Initially all the dimensions are shown in the dimension-selector'
    );

    run(async () => {
      await click('.navi-list-selector__show-link');
    });

    assert.deepEqual(
      this.$('.grouped-list__item')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      ['Day', 'Age'],
      'When show selected is clicked only the selected age dimension and the selected timegrain are shown'
    );

    assert.notOk(
      this.$('.checkbox-selector__checkbox')
        .toArray()
        .map(el => $(el)[0]['checked'])
        .includes(false),
      'The selected items are checked'
    );
  });

  test('actions', function(assert) {
    assert.expect(4);

    this.set('addTimeGrain', item => {
      assert.equal(item.get('name'), 'week', 'the week time grain item is passed as a param to the action');
    });

    this.set('removeTimeGrain', item => {
      assert.equal(item.get('name'), 'day', 'the day time grain item is passed as a param to the action');
    });

    //select first time grain
    run(() => {
      //addTimeGrain when a different time grain is clicked
      this.$('.grouped-list__item:contains(Week) .grouped-list__item-label').click();

      //removeTimeGrain when selected time grain is clicked
      this.$('.grouped-list__item:contains(Day) .grouped-list__item-label').click();
    });

    this.set('addDimension', item => {
      assert.equal(
        item.get('longName'),
        'Gender',
        'the gender dimension item is passed as a param to the action for addition'
      );
    });

    this.set('removeDimension', item => {
      assert.equal(
        item.get('longName'),
        'Age',
        'the Age dimension item is passed as a param to the action for removal'
      );
    });

    //select a random dimension
    run(() => {
      //addDimension when an unselected dimension is clicked
      this.$('.grouped-list__item:contains(Gender) .grouped-list__item-label').click();

      //removeDimension when a selected dimension is clicked
      this.$('.grouped-list__item:contains(Age) .grouped-list__item-label').click();
    });
  });

  test('filter icon', function(assert) {
    assert.expect(3);

    assert.notOk(
      isEmpty(this.$('.grouped-list__item:contains(Age) .checkbox-selector__filter--active')),
      'The filter icon with the age dimension has the active class'
    );

    assert.ok(
      isEmpty(this.$('.grouped-list__item:contains(Gender) .checkbox-selector__filter--active')),
      'The filter icon with the gender dimension does not have the active class'
    );

    this.set('addDimFilter', dimension => {
      assert.deepEqual(dimension, Age, 'The age dimension is passed to the action when filter icon is clicked');
    });

    run(() => {
      this.$('.grouped-list__item:contains(Age) .checkbox-selector__filter').click();
    });
  });

  test('tooltip', function(assert) {
    assert.expect(3);

    assertTooltipNotRendered(assert);
    set(Age, 'extended', {
      content: { description: 'foo' }
    });

    run(() => {
      this.$('.grouped-list__group-header:contains(Test)').trigger('click');
      // triggerTooltipTargetEvent will not work for hidden elementc
      this.$('.grouped-list__item:contains(Age) .grouped-list__item-info').trigger('mouseenter');
    });

    assertTooltipRendered(assert);
    assertTooltipContent(assert, {
      contentString: 'foo'
    });
  });

  test('ranked search', async function(assert) {
    assert.expect(2);

    assert.deepEqual(
      this.$('.grouped-list__item:contains(Country)')
        .toArray()
        .map(el => el.textContent.trim()),
      ['Property Country', 'User Country'],
      'Initially the country dimensions are ordered alphabetically'
    );

    await fillIn('.navi-list-selector__search-input', 'count');
    await triggerEvent('.navi-list-selector__search-input', 'focusout');

    assert.deepEqual(
      this.$('.grouped-list__item')
        .toArray()
        .map(el => el.textContent.trim()),
      ['User Country', 'Property Country'],
      'The search results are ranked based on relevance'
    );
  });
});
