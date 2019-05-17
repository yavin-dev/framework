import { settled, triggerEvent } from '@ember/test-helpers';

export default async function drag(mode, itemElement, offsetFn, callbacks = {}) {
  let start, move, end, which;

  if (mode === 'mouse') {
    start = 'mousedown';
    move = 'mousemove';
    end = 'mouseup';
    which = 1;
  } else if (mode === 'touch') {
    start = 'touchstart';
    move = 'touchmove';
    end = 'touchend';
  } else {
    throw new Error(`Unsupported mode: '${mode}'`);
  }

  await settled();

  let offset = offsetFn();
  let rect = itemElement.getBoundingClientRect();
  /**
   * firefox gives some elements, like <svg>, a clientHeight of 0.
   * we can try to grab it off the parent instead to have a better
   * guess at what the scale is.
   * https://bugzilla.mozilla.org/show_bug.cgi?id=874811#c14
   * https://stackoverflow.com/a/13647345
   * https://stackoverflow.com/a/5042051
   */
  let dx = offset.dx || 0;
  let dy = offset.dy || 0;
  let clientHeight = itemElement.clientHeight || itemElement.offsetHeight || itemElement.parentNode.offsetHeight;
  let scale = clientHeight / (rect.bottom - rect.top);
  let halfwayX = itemElement.offsetLeft + (dx * scale) / 2;
  let halfwayY = itemElement.offsetTop + (dy * scale) / 2;
  let targetX = itemElement.offsetLeft + dx * scale;
  let targetY = itemElement.offsetTop + dy * scale;

  await settled();
  await triggerEvent(itemElement, start, {
    clientX: itemElement.offsetLeft,
    clientY: itemElement.offsetTop,
    which
  });

  if (callbacks.dragstart) {
    await settled().then(callbacks.dragstart);
  }

  await settled();
  await triggerEvent(itemElement, move, {
    clientX: itemElement.offsetLeft,
    clientY: itemElement.offsetTop,
    which
  });

  if (callbacks.dragmove) {
    await settled().then(callbacks.dragmove);
  }

  await settled();
  await triggerEvent(itemElement, move, {
    clientX: halfwayX,
    clientY: halfwayY,
    which
  });

  await settled();
  await triggerEvent(itemElement, move, {
    clientX: targetX,
    clientY: targetY,
    which
  });

  await settled();
  await triggerEvent(itemElement, end, {
    clientX: targetX,
    clientY: targetY,
    which
  });

  if (callbacks.dragend) {
    await settled().then(callbacks.dragend);
  }

  await settled();
}
