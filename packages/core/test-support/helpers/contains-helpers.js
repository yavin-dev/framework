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
 * Example:
 * Jquery: $(.class-thing:contains(blah) .metric .test:contains(other))
 *
 * findByContains:
 * [...findByContains('.class-thing', 'blah').querySelectorAll('.metric .test')].find(el => el.innerText.trim().includes('other'))
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
  let nativeSelector,
    parentElement = baseElement || document;

  if (selector.includes(':contains(')) {
    let splits = selector.split(':contains(');
    let firstSelector = splits.shift(); //Selector without the :contains operator
    let restOfSelector = splits.join(':contains('); //We only want to split on the first instance of :contains(, so join the rest back together if there were more
    let endOfContentIndex = findEndOfContentIndex(restOfSelector);
    let content = restOfSelector.substring(0, endOfContentIndex);
    let nextSelector = restOfSelector.substring(endOfContentIndex + 1).trim();
    let filteredElement = [...parentElement.querySelectorAll(firstSelector)].find(el =>
      el.innerText.trim().includes(content)
    );

    /**
     * If the :contains was used at the very end of the selector, return the element we found here
     * Else recursively find element from rest of selector using the found element as the base
     */
    return nextSelector ? findContains(nextSelector, filteredElement) : filteredElement;
  } else {
    nativeSelector = selector;
  }

  return parentElement.querySelector(nativeSelector);
}

/**
 * @param {String} str - String with the content ended with a ) and possibly another selector following that
 * @returns {Number} Index of the ) character that closes the :contains( expression that precedes the input string
 */
function findEndOfContentIndex(str) {
  return str.includes(':contains(') ? str.lastIndexOf(')', str.indexOf(':contains')) : str.lastIndexOf(')');
}
