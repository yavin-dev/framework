import { findAll, settled } from '@ember/test-helpers';
import drag from './drag';
import $ from 'jquery';

const OVERSHOOT = 4;

/**
 *
 * @param {String} mode
 * @param {String} itemSelector
 * @param  {...String|Element} resultSelectors - accepts selectors or element objects
 */
export default async function reorder(mode, itemSelector, ...resultSelectors) {
  const promises = resultSelectors.map((selector, targetIndex) => async () => {
    await settled();

    let element = $(selector)[0];
    let targetElement = findAll(itemSelector)[targetIndex];
    let dx = targetElement.offsetLeft - OVERSHOOT - element.offsetLeft;
    let dy = targetElement.offsetTop - OVERSHOOT - element.offsetTop;

    return drag(mode, element, () => ({ dx, dy }));
  });

  for (const promise of promises) {
    await settled();
    await promise();
  }

  return settled();
}
