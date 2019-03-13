import { find, findAll, settled } from '@ember/test-helpers';
import drag from './drag';

const OVERSHOOT = 2;

export default async function reorder(mode, itemSelector, ...resultSelectors) {
  const promises = resultSelectors.map((selector, targetIndex) => async () => {
    await settled();
    let element = find(selector);
    let targetElement = findAll(itemSelector)[targetIndex];
    let dx = targetElement.offsetLeft - OVERSHOOT - element.offsetLeft;
    let dy = targetElement.offsetTop - OVERSHOOT - element.offsetTop;

    await drag(mode, selector, () => ({ dx, dy }));
  });

  for (const promise of promises) {
    await settled();
    await promise();
  }

  await settled();
}
