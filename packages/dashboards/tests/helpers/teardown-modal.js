/**
 * @function teardownModal
 * Testing container is reset to initial state after each test
 * Cleaning up modal overlays left behind
 */
export function teardownModal() {
  let modal = document.getElementById('modal-overlays');
  modal.parentElement.removeChild(modal);
}
