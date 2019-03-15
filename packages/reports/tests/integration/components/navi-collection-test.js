import { run } from '@ember/runloop';
import Component from '@ember/component';
import { A } from '@ember/array';
import ArrayProxy from '@ember/array/proxy';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const REPORTS = ArrayProxy.create({
  isSettled: true, // Mock a loaded promise array
  content: A([
    {
      id: 1,
      title: 'Hyrule News',
      updatedOn: '2015-01-01 00:00:00',
      isFavorite: false
    },
    {
      id: 2,
      title: 'Hyrule Ad&Nav Clicks',
      updatedOn: '2015-01-01 00:00:00',
      isFavorite: true
    },
    {
      title: 'Unsaved report',
      updatedOn: '2015-01-01 00:00:00',
      isFavorite: false
    },
    {
      id: 10,
      title: 'No Data Report',
      updatedOn: '2016-02-10 17:00:44',
      isFavorite: true
    }
  ])
});

const TEMPLATE = hbs`
    {{navi-collection
        items=reports
        config=(hash
            filterable=true
        )
    }}`;

module('Integration | Component | navi collection', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    // suppress report-actions/export component inside integration tests, since we are not testing it here
    this.owner.register('component:report-actions/export', Component.extend(), { instantiate: false });
  });

  test('Table filtering', async function(assert) {
    assert.expect(2);

    this.set('reports', REPORTS);

    await render(TEMPLATE);

    // Click "Favorites" filter option
    run(() => this.$('.pick-form li:contains(All)').click());

    let listedReports = this.$('tbody tr td:first-of-type')
      .toArray()
      .map(el =>
        this.$(el)
          .text()
          .trim()
      );

    assert.deepEqual(
      listedReports,
      ['Hyrule News', 'Hyrule Ad&Nav Clicks', 'Unsaved report', 'No Data Report'],
      'By default, all reports with an id are listed'
    );

    // Click "Favorites" filter option
    run(() => this.$('.pick-form li:contains(Favorites)').click());
    listedReports = this.$('tbody tr td:first-of-type')
      .toArray()
      .map(el =>
        this.$(el)
          .text()
          .trim()
      );

    assert.deepEqual(
      listedReports,
      ['Hyrule Ad&Nav Clicks', 'No Data Report'],
      'After selecting favorite filter, only favorite reports are shown'
    );
  });

  test('Favorite icon', async function(assert) {
    assert.expect(2);

    this.set('reports', REPORTS);

    await render(TEMPLATE);

    //Reset to all filter
    run(() => this.$('.pick-form li:contains(All)').click());

    assert.notOk(
      this.$('tbody tr:eq(0) td:first-of-type i').is('.favorite-item--active'),
      'Report that is not a favorite does not have favorite icon'
    );

    assert.ok(
      this.$('tbody tr:eq(1) td:first-of-type i').is('.favorite-item--active'),
      'Report that is a favorite has favorite icon'
    );
  });

  test('Filterable Table', async function(assert) {
    assert.expect(2);

    this.set('reports', REPORTS);

    await render(hbs`
          {{navi-collection
              items=reports
          }}
      `);

    assert.notOk(
      this.$('.navi-collection .pick-container').is(':visible'),
      'Filter dropdown is not shown when `filterable` flag is not set to true in collection config'
    );

    await render(hbs`
          {{navi-collection
              items=reports
              config=(hash
                  filterable=true
              )
          }}
      `);

    assert.ok(
      this.$('.navi-collection .pick-container').is(':visible'),
      'Filter dropdown is shown when `filterable` flag is set to true in collection config'
    );
  });

  test('Actions in Table', async function(assert) {
    assert.expect(2);

    this.set('reports', REPORTS);

    await render(hbs`
          {{navi-collection
              items=reports
          }}
      `);

    assert.notOk(
      this.$('.navi-collection .navi-collection__actions').is(':visible'),
      'Actions column is not shown when `actions` component is missing from collection config'
    );

    this.owner.register('component:mock-actions-component', Component.extend(), {
      instantiate: false
    });

    await render(hbs`
          {{navi-collection
              items=reports
              config=(hash
                  actions='mock-actions-component'
              )
          }}
      `);

    assert.ok(
      this.$('.navi-collection .navi-collection__actions').is(':visible'),
      'Actions column is shown when `actions` component is in the collection config'
    );
  });

  test('Error Message - default', async function(assert) {
    assert.expect(2);

    this.set(
      'items',
      ArrayProxy.create({
        isSettled: true,
        content: A()
      })
    );

    await render(hbs`
          {{navi-collection
              items=items
              itemType='reports'
              itemNewRoute='customReports.new'
          }}
      `);

    assert.deepEqual(
      find('.navi-collection .no-results').textContent.trim(),
      `You don't have any reports yet. Go ahead and create one now?`,
      'Default message is shown when no items are rendered'
    );

    assert.ok(
      this.$('.navi-collection .no-results a').is(':visible'),
      'Default message is shown when no items are rendered with a link'
    );
  });

  test('Error Message - custom', async function(assert) {
    assert.expect(1);

    this.set(
      'items',
      ArrayProxy.create({
        isSettled: true,
        content: A()
      })
    );

    await render(hbs`
          {{navi-collection
              items=items
              config=(hash
                  emptyMsg='You have no custom reports. Create one now.'
              )
          }}
      `);

    assert.deepEqual(
      find('.navi-collection .no-results').textContent.trim(),
      'You have no custom reports. Create one now.',
      'Custom message is shown when no items are rendered'
    );
  });
});
