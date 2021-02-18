import $ from 'jquery';

/**
 * Synchronous test helper to fill in text in the given element
 *
 * @function fillInSync
 * @param {String} selector - element selector
 * @param {String} text - text to fill in
 * @returns {Void}
 */
export function fillInSync(selector, text) {
  if (!document.hasFocus || document.hasFocus()) {
    $(selector).focus();
  } else {
    $(selector).trigger('focusin');
  }
  $(selector).val(text).trigger('input').change();
}
