import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | should-show-id', function(hooks) {
  setupRenderingTest(hooks);

  test('it decides whether to show id or not', async function(assert) {
    this.set('arg', { name: 'foo' });
    this.set('allParams', [{ name: 'foo' }, { name: 'foo' }, { name: 'bar' }]);

    await render(hbs`{{if (should-show-id argument=this.arg params=this.allParams) 'T' 'F'}}`);

    assert.equal(this.element?.textContent?.trim(), 'T', 'True when duplicate name');

    this.set('allParams', [{ name: 'foo' }, { name: 'baz' }, { name: 'bar' }]);
    assert.equal(this.element?.textContent?.trim(), 'F', 'False when no duplicate name');

    this.set('arg', { description: 'foo' });
    this.set('allParams', [{ description: 'foo' }, { description: 'foo' }, { description: 'bar' }]);

    assert.equal(this.element?.textContent?.trim(), 'T', 'True when duplicate description');
    this.set('allParams', [{ description: 'foo' }, { description: 'baz' }, { description: 'bar' }]);
    assert.equal(this.element?.textContent?.trim(), 'F', 'False when no duplicate description');

    this.set('arg', { name: 'foo' });
    this.set('allParams', [
      { groupName: 'one', options: [{ name: 'foo' }, { name: 'bar' }] },
      { groupName: 'two', options: [{ name: 'baz' }, { name: 'bam' }] },
      { name: 'foo' }
    ]);
    assert.equal(this.element?.textContent?.trim(), 'T', 'True when no duplicates name in group');

    this.set('allParams', [
      { groupName: 'one', options: [{ name: 'foo' }, { name: 'bar' }] },
      { groupName: 'two', options: [{ name: 'baz' }, { name: 'bam' }] }
    ]);
    assert.equal(this.element?.textContent?.trim(), 'F', 'False when no duplicate name in group');
  });
});
