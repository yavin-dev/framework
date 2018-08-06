import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMock, teardownMock }from '../../helpers/mirage-helper';
import { render, find } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { set } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

let Store;

module('Integration | Component | dir table', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    Store = this.owner.lookup('service:store');
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('table populates from items correctly', async function(assert) {
    assert.expect(4);

    let items;
    run(() => {
      let author = Store.createRecord('user', { id: 'navi_user' });
      items = [
        Store.createRecord('report', { title: 'Report 1', author, updatedOn: '2020-01-01 00:00:00'}),
        Store.createRecord('dashboard', { title: 'Dashboard 1', author, updatedOn: '2020-01-02 00:00:00'}),
        Store.createRecord('report', { title: 'Report 2', author, updatedOn: '2020-01-03 00:00:00'})
      ];
    });

    set(this, 'items', items);
    set(this, 'searchQuery', '');

    await render(hbs`{{dir-table
      items=items
      searchQuery=searchQuery
    }}`);

    assert.equal(this.element.querySelectorAll('.dir-table__row').length,
      3,
      'There is one row per item passed to the table');

    assert.deepEqual([...this.element.querySelectorAll('th')].map(elm => elm.innerText.trim()),
      ['NAME', 'AUTHOR', 'LAST UPDATED DATE'],
      'The correct columns are generated for the table');

    assert.ok([...this.element.querySelectorAll('.dir-table__cell--author')].every(elm => elm.innerText.trim() === 'navi_user'),
      'The author\'s name is displayed correctly for each row');

    assert.deepEqual([...this.element.querySelectorAll('.dir-table__cell--lastUpdatedDate')].map(elm => elm.innerText.trim()),
      ['01/01/2020 - 12:00:00 am', '01/02/2020 - 12:00:00 am', '01/03/2020 - 12:00:00 am'],
      'The last updated dates are formatted and displayed correctly');
  });

  test('search results messaging', async function(assert) {
    assert.expect(2);

    set(this, 'items', []);
    set(this, 'searchQuery', '');

    await render(hbs`{{dir-table
      items=items
      searchQuery=searchQuery
    }}`);

    assert.equal(this.element.querySelector('.lt-body').innerText.trim(),
      'Nothing to see here.',
      'Gives the correct message when no items are present and there\'s no search query');

    set(this, 'searchQuery', 'this won\'t return anything');

    await render(hbs`{{dir-table
      items=items
      searchQuery=searchQuery
    }}`);

    assert.equal(this.element.querySelector('.lt-body').innerText.trim(),
      'No search results.',
      'Gives the correct message when no items are present and there is a search query');
  });

  test('table loader', async function(assert) {
    assert.expect(2);

    set(this, 'isLoading', true);

    await render(hbs`{{dir-table
      items=items
      isLoading=isLoading
    }}`);

    assert.ok(find('.navi-loader__spinner'),
      'The loader is rendered when `isLoading` property is true');

    set(this, 'isLoading', false);

    await render(hbs`{{dir-table
      items=items
      isLoading=isLoading
    }}`);

    assert.notOk(find('.navi-loader__spinner'),
      'The loader is not rendered when `isLoading` property is false');  
  });
});
