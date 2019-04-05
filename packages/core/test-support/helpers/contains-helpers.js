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

/**
 * This function allows us to keep using the jquery notation for :contains without using jquery
 *
 * Need quotes around content with parentheses -- e.g. class:contains("(content)")
 *
 *
 * Example:
 * Jquery: $(.class-thing:contains(blah) .metric .test:contains(other))
 *
 * Non-Jquery Equivalent: [
 *    ...[
 *      ...document.querySelectorAll(
 *        (.class-thing)
 *      )].find(el => el.innerText.trim().includes('blah'))
 *    .querySelectorAll('.metric .test')
 *  ]
 *  .find(el => el.innerText.trim().includes('other'))
 *
 * findContains: findContains(.class-thing:contains(blah) .metric .test:contains(other))
 *
 * @param {String} selector - jquery or native style selector
 * @param {HTMLElement} [baseElement] - optional parameter to use as base element to select off of
 * @returns {HTMLElement} - Element based on text it (or its parent) contains
 */
export function findContains(selector, baseElement) {
  return findAllContains(selector, baseElement)[0];
}

/**
 * Same as findContains but returns ALL elements that match rather than just the first one
 *
 * @param {String} selector
 * @param {HTMLElement} baseElement
 * @returns {HTMLElement[]} - Array of all elements that match the selector and text content
 */
export function findAllContains(selector, baseElement) {
  let parentElement = baseElement || document;
  let hasContains = /:[cC]ontains\(/;

  if (hasContains.exec(selector)) {
    let regex = /^(.*?):[cC]ontains\((["']?)(.*?)\2\)(.*)$/;
    let matches = regex.exec(selector);
    let firstSelector = matches[1];
    let content = matches[3];
    let nextSelector = matches[4];
    let filteredElements = [...parentElement.querySelectorAll(firstSelector)].filter(el =>
      el.innerText.includes(content)
    );

    /**
     * If the :contains was used at the very end of the selector, return the element we found here
     * Else recursively find element from rest of selector using the found element as the base
     */
    return nextSelector
      ? flattenDeep(filteredElements.map(el => findAllContains(nextSelector, el)))
      : flattenDeep(filteredElements);
  }

  return [...parentElement.querySelectorAll(selector)];
}

/**
 * Deep flatten array
 * @param {Array} arr - Array to flatten
 */
function flattenDeep(arr) {
  return arr.reduce((acc, val) => (Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val)), []);
}
