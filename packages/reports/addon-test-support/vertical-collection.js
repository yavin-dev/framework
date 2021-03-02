import { assert } from '@ember/debug';
import { getContext, settled } from '@ember/test-helpers';
import { set } from '@ember/object';

const verticalCollectionKey = 'component:vertical-collection';

/**
 * Checks whether a component is registered as a vertical-collection
 * @param {Component} component - The component instance to check
 * @returns {Boolean} - true if the component is a vertical collection
 */
function isVerticalCollection(component) {
  return component && component._debugContainerKey === verticalCollectionKey;
}

/**
 * Finds a vertical collection visible under the given selector, the selector must pin down a single instance
 * @param {String} selector - the query selector to pin down the vertical collection (e.g. '#ember23' or '.grouped-list')
 * @returns {Component} - the vertical collection component visible under the given selector
 */
export function getVerticalCollection(selector = 'body') {
  const viewRegistry = getContext().owner.lookup('-view-registry:main');
  const allVCs = Object.values(viewRegistry).filter(isVerticalCollection);

  let verticalCollection;
  const byId = allVCs.find((vc) => `#${vc.elementId}` === selector);
  if (byId) {
    verticalCollection = byId;
  } else {
    const visibleVCs = allVCs.filter((verticalCollection) => {
      const { elementId } = verticalCollection;
      return !!document.querySelector(`${selector} #${elementId}`);
    });

    assert(
      `Selector '${selector}' for vertical collections returned ${visibleVCs.length} instead of just 1`,
      visibleVCs.length === 1
    );
    verticalCollection = visibleVCs[0];
  }

  assert(`A vertical collection was not found for selector '${selector}'`, verticalCollection);

  return verticalCollection;
}

/**
 * Forces the vertical collection to render all of its contents
 * @param {Component} verticalCollection - the vertical collection component instance
 * @returns {Function} - resets the vertical collection to its previous state
 */
export async function renderAllItems(verticalCollection = getVerticalCollection()) {
  const { renderAll } = verticalCollection;

  set(verticalCollection, 'renderAll', true);
  // changing renderAll causes vertical collection render so we need to wait
  await settled();

  return async () => {
    if (!verticalCollection.isDestroyed || !verticalCollection.isDestroying) {
      set(verticalCollection, 'renderAll', renderAll);
      // changing renderAll back causes vertical collection render so we need to wait
      await settled();
    }
  };
}
