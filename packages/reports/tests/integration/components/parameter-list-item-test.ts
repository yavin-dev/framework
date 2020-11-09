import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | parameter-list-item', function(hooks) {
  setupRenderingTest(hooks);

  test('it decides whether to show id or not', async function(assert) {
    this.set('arg', { name: 'foo', id: 'sid' });
    this.set('allParams', [{ name: 'foo' }, { name: 'foo' }, { name: 'bar' }]);

    await render(hbs`<ParameterListItem @argument={{this.arg}} @parameters={{this.allParams}} />`);

    assert.dom(this.element).hasText('foo (sid)', 'should show id when name is duplicated');

    this.set('allParams', [{ name: 'foo' }, { name: 'baz' }, { name: 'bar' }]);
    assert.dom(this.element).hasText('foo', 'Shows name when there is no duplicate');

    this.set('arg', { description: 'foo', id: 'sid' });
    this.set('allParams', [{ description: 'foo' }, { description: 'foo' }, { description: 'bar' }]);

    assert.dom(this.element).hasText('foo (sid)', 'should show id when description is duplicated');
    this.set('allParams', [{ description: 'foo' }, { description: 'baz' }, { description: 'bar' }]);
    assert.dom(this.element).hasText('foo', 'Shows description when there is no duplicate');

    this.set('arg', { name: 'foo', id: 'sid' });
    this.set('allParams', [
      { groupName: 'one', options: [{ name: 'foo' }, { name: 'bar' }] },
      { groupName: 'two', options: [{ name: 'baz' }, { name: 'bam' }] },
      { name: 'foo' }
    ]);
    assert.dom(this.element).hasText('foo (sid)', 'Shows id when there is a duplicate in grouped param list');

    this.set('allParams', [
      { groupName: 'one', options: [{ name: 'foo' }, { name: 'bar' }] },
      { groupName: 'two', options: [{ name: 'baz' }, { name: 'bam' }] }
    ]);
    assert.dom(this.element).hasText('foo', 'Shows name when there is no duplicate in grouped param list');
  });
});
