import { find, findAll, triggerEvent } from '@ember/test-helpers';
import { assert } from '@ember/debug';
//@ts-ignore
import { drag } from 'ember-sortable/test-support/helpers/drag';
//@ts-ignore
import { getOffset } from 'ember-sortable/test-support/utils/offset';

const OVERSHOOT = 3;
const COLUMN_CONFIG_ITEM = 'navi-column-config-item';
const COLUMN_CONFIG_HANDLE = `${COLUMN_CONFIG_ITEM}__handle`;

/**
 * Custom reorder helper for the column config because it requires a mouseenter in each item
 * @param canonicalNames - list of canonical names in desired order
 * @see https://github.com/adopted-ember-addons/ember-sortable/blob/526293454cf5073d603298fce33dffdaad2bafe2/addon-test-support/helpers/reorder.js#L33
 */
export async function reorderColumns(...canonicalNames: string[]) {
  const selectors = canonicalNames.map((name) => `.${COLUMN_CONFIG_ITEM}[data-name="${name}"]`);
  for (let targetIndex = 0; targetIndex < selectors.length; targetIndex++) {
    const items = findAll(`.${COLUMN_CONFIG_ITEM}`);
    const sourceElement = find(selectors[targetIndex]);
    const targetElement = items[targetIndex];
    const dx = getOffset(targetElement).left - OVERSHOOT - getOffset(sourceElement).left;
    const dy = getOffset(targetElement).top - OVERSHOOT - getOffset(sourceElement).top;

    assert('sourceElement exists', sourceElement);
    await triggerEvent(sourceElement, 'mouseenter');
    const sourceElementHandle = find(`${selectors[targetIndex]} .${COLUMN_CONFIG_HANDLE}`);
    await drag('mouse', sourceElementHandle, () => {
      return { dx: dx, dy: dy };
    });
    await triggerEvent(sourceElement, 'mouseleave');
  }
}
