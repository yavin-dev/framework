import { findAll, settled } from '@ember/test-helpers';
import { findContains } from './contains-helpers';
import drag from './drag';

const OVERSHOOT = 2;

/**
 *
 * @param {String} mode
 * @param {String} itemSelector
 * @param  {...String|Element} resultSelectors - accepts selectors or element objects
 */
export default async function reorder(mode, itemSelector, ...resultSelectors) {
  const promises = resultSelectors.map((selector, targetIndex) => async () => {
    await settled();

    let element = findContains(selector);
    let targetElement = findAll(itemSelector)[targetIndex];
    let dx = targetElement.offsetLeft - OVERSHOOT - element.offsetLeft;
    let dy = targetElement.offsetTop - OVERSHOOT - element.offsetTop;

    await drag(mode, element, () => ({ dx, dy }));
  });

  for (const promise of promises) {
    await settled();
    await promise();
  }

  await settled();
}
