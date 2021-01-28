import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';
import $ from 'jquery';

const DIVINE_BEASTS = ['Ruta', 'Medoh', 'Neboris', 'Rudania'];

module('Integration | Component | navi tag input/tag', function(hooks) {
  setupRenderingTest(hooks);

  async function paste(text) {
    const selector = '.emberTagInput-input';
    await triggerEvent(selector, 'paste', {
      clipboardData: {
        getData: () => text
      }
    });
  }

  test('Pasting input only shows helper if input has commas and splitOnPaste is true', async function(assert) {
    assert.expect(4);
    this.set('tags', []);
    this.set('splitOnPaste', false);
    this.set('addTag', value => {
      assert.equal(value, 2, 'TODO');
    });

    await render(hbs`
      <NaviTagInput
        @addTag={{action this.addTag}}
        @tags={{this.tags}}
        @splitOnPaste={{splitOnPaste}}
        as |tag|
      >
        {{tag}}
      </NaviTagInput>
    `);

    await paste('123');
    assert.dom('.dimension-bulk-import-simple').doesNotExist('The modal did not pop up because splitOnPaste is false');

    await paste('1,2,3');
    assert
      .dom('.dimension-bulk-import-simple')
      .doesNotExist('The modal did not pop up because the input contains a comma, but splitOnPaste is false');

    this.set('splitOnPaste', true);

    await paste('123');
    assert
      .dom('.dimension-bulk-import-simple')
      .doesNotExist('The modal did not pop up because the input does not contain a comma');

    await paste('1,2,3');
    assert
      .dom('.dimension-bulk-import-simple')
      .exists('The modal popped up because the input contains a comma, and splitOnPaste is true');
  });

  test('default tag component', async function(assert) {
    assert.expect(2);

    this.set('tags', DIVINE_BEASTS);

    this.set('removeTagAtIndex', index => {
      assert.equal(index, 2, 'Clicking remove icon on calls removeTagAtIndex with the clicked tag index');
    });

    await render(hbs`
      {{#navi-tag-input
        tags=tags
        removeTagAtIndex=(action removeTagAtIndex)
        as |divineBeast|
      }}
        {{divineBeast}}
      {{/navi-tag-input}}
    `);

    assert.deepEqual(
      $('.tag')
        .toArray()
        .map(e => e.textContent.trim()),
      DIVINE_BEASTS,
      'Default tag component provides ember tag input class and yields'
    );

    // Test tag removal
    await click(findAll('.tag__remove')[2]);
  });

  test('custom tag component', async function(assert) {
    assert.expect(2);

    this.owner.register(
      'component:my-wacky-tag',
      Component.extend({
        classNames: 'my-wacky-tag'
      })
    );

    this.set('tags', DIVINE_BEASTS);

    await render(hbs`
      <NaviTagInput
        @tags={{this.tags}}
        @tagComponent='my-wacky-tag'
        as |divineBeast|
      > 
        {{divineBeast}}
      </NaviTagInput>
    `);

    assert.deepEqual(
      $('.my-wacky-tag')
        .toArray()
        .map(e => e.textContent.trim()),
      DIVINE_BEASTS,
      'Custom tag component can be given to add new behavior'
    );

    assert.dom('.tag__remove').doesNotExist('Elements from the default component are not required in a custom tag');
  });
});
