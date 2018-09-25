/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

/**
 * Helper to generate template necessary for ember-modal-dialog
 *
 * @function hbsWithModal
 * @param {String} template - template to be rendered
 * @param {Object} testContainer -  test container
 * @returns {String} - template necessary for ember-modal-dialog
 */
export function hbsWithModal(template, testContainer) {
  //Necessary for modal popup
  testContainer.register('config:modals-container-id', 'modal-overlays', {
    instantiate: false
  });
  testContainer.inject('component:modal-dialog', 'destinationElementId', 'config:modals-container-id');

  return `<div id="modal-overlays"></div>${template}`;
}
