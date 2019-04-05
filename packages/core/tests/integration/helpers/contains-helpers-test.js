import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { findContains, findAllContains } from '../../helpers/contains-helpers';
import { find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
  <div id=test123 class=test-div>Test1
    <span class=test-span>Span1</span>
    <span class=test-span>Span2</span>
    <span class=test-span>Span3</span>
  </div>
  <div id=copy-test-div class=test-div>Test1
    <span class=test-span>Span1 Copy</span>
    <span class=test-span>Span2 Copy</span>
    <span class=test-span>Span3 Copy</span>
  </div>
  <div class=test-div>Test2
    <span class=test-span>Span4
      <div class=inner-test-div>Inner Div 1</div>
    </span>
    <span class=test-span>Span5
      <div class=inner-test-div>Inner Div 2</div>
    </span>
  </div>
  <div class=test-div>Test3
    <span class=test-span>(Other) Span</span>
    <span class=test-span>Other Span</span>
  </div>`;

module('helper:contains-helpers', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    await render(TEMPLATE);
  });

  test('findContains', async function(assert) {
    assert.expect(9);

    assert.ok(findContains('#test123').textContent.includes('Test1'), 'Native selector without contains works');

    assert.ok(findContains('.test-div:contains(Test2)').textContent.includes('Test2'), 'Finds element by text content');

    assert.ok(
      findContains('.test-div:Contains("Test2")').textContent.includes('Test2'),
      'Capitalizations of contains and quoted content are accepted'
    );

    assert.ok(
      findContains(".test-div:contains('Test2')").textContent.includes('Test2'),
      'Single quotes around content works'
    );

    assert.ok(
      findContains('.test-div:contains(Test2) .test-span').textContent.includes('Span4'),
      'Uses the correct parent element to select an inner element'
    );

    assert.equal(
      findContains('.test-div:contains(Test2) .test-span:contains(Span5) .inner-test-div').textContent.trim(),
      'Inner Div 2',
      'Multiple contains within one selector are handled correctly'
    );

    assert.ok(
      findContains('.test-span:contains("(Other) Span")').textContent.includes('(Other) Span'),
      'Content with parentheses is selected on correctly'
    );

    let baseElement = find('#copy-test-div');
    assert.ok(
      findContains('.test-span:contains(Span1)', baseElement).textContent.includes('Span1 Copy'),
      'The correct element is selected when a base element is given'
    );

    assert.ok(
      findContains('.test-div:contains("Test2")').textContent.includes('Test2'),
      'Content wrapped in quotes is accepted'
    );
  });

  test('findAllContains', async function(assert) {
    assert.expect(4);

    let allTest1Spans = findAllContains('.test-div:contains(Test1) .test-span');

    assert.equal(allTest1Spans.length, 6, 'The right number of elements are returned');

    assert.deepEqual(
      allTest1Spans.map(el => el.textContent.trim()),
      ['Span1', 'Span2', 'Span3', 'Span1 Copy', 'Span2 Copy', 'Span3 Copy'],
      'The correct spans are selected'
    );

    let noMatches = findAllContains('.there-should-be-no-matches:contains(anything)');

    assert.ok(Array.isArray(noMatches), 'An array is returned');

    assert.equal(noMatches.length, 0, "Empty array is returned when the selector doesn't match any elements");
  });
});
