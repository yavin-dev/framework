import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
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
 * @param {Object} instance - the test or application instance
 * @param {String} selector - the query selector to pin down the vertical collection
 * @returns {Component} - the vertical collection component visible under the given selector
 */
export function getVerticalCollection(instance, selector = 'body') {
  const owner = instance.owner || getOwner(instance);
  assert('getVerticalCollection called with no owner', owner);

  const componentByView = owner.lookup('-view-registry:main');
  if (selector.startsWith('ember')) {
    // use ember id
    return componentByView[selector];
  }
  const allVerticalCollections = Object.values(componentByView)
    .filter(isVerticalCollection)
    .filter(verticalCollection => !!document.querySelector(`${selector} #${verticalCollection.elementId}`));

  assert(
    `Your selector '${selector}' for vertical collections returned ${allVerticalCollections.length} instead of just 1`,
    allVerticalCollections.length === 1
  );

  return allVerticalCollections[0];
}

/**
 * Schedules an update for the vertical collection and waits for it to be run
 * @param {Component} verticalCollection - the vertical collection component instance
 * @param {Object} options - The options component to specify when to timeout
 */
export async function didRender(verticalCollection, options = { timeout: undefined }) {
  assert('didRender must be called with vertical collection', isVerticalCollection(verticalCollection));
  const { _radar: radar } = verticalCollection;
  const { _debugDidUpdate: originalDebugDidUpdate } = radar;

  const forceRender = new Promise((resolve, reject) => {
    radar._debugDidUpdate = function() {
      originalDebugDidUpdate.apply(radar, ...arguments);
      radar._debugDidUpdate = originalDebugDidUpdate;
      resolve();
    };

    radar.scheduleUpdate();
    if (options.timeout) {
      setTimeout(reject, options.timeout);
    }
  });

  await forceRender;
}

/**
 * Forces the vertical collection to render all of its contents
 * @param {Component} verticalCollection - the vertical collection component instance
 * @param {Object} options - The options component to specify when to timeout
 * @returns {Function} - resets the vertical collection to its previous state
 */
export async function renderAllItems(verticalCollection, options) {
  const { renderAll: _renderAll } = verticalCollection;

  set(verticalCollection, 'renderAll', true);
  await didRender(verticalCollection, options);

  return async () => {
    if (!verticalCollection.isDestroyed || !verticalCollection.isDestroying) {
      set(verticalCollection, 'renderAll', _renderAll);
    }
    await didRender(verticalCollection, options);
  };
}
