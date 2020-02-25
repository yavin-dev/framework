import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';
import { set } from '@ember/object';

const verticalCollectionKey = 'component:vertical-collection';

function isVerticalCollection(component) {
  return component && component._debugContainerKey === verticalCollectionKey;
}

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

export async function didRender(verticalCollection, options = { timeout: 10000 }) {
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
    setTimeout(reject, options.timeout);
  });

  await forceRender;
}

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
