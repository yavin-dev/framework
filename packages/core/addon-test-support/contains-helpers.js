import { findAll } from '@ember/test-helpers';

/**
 * Finds selector by innerText
 * @param {String} selector - selector to search
 * @param {String} text - text to search by
 * @returns {Element} - first matching dom element
 */
export default function findByContains(selector, text) {
  return findAll(selector).find(el => el.innerText.includes(text));
}

/**
 * Finds button by innnerText
 * @param {String} text - text to search for
 * @returns {Element} - first matching dom element
 */
export function buttonContains(text) {
  return findByContains('button', text);
}

/**
 * Finds link by innnerText
 * @param {String} text - text to search for
 * @returns {Element} - first matching dom element
 */
export function linkContains(text) {
  return findByContains('a', text);
}
