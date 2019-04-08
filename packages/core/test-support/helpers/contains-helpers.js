import { findAll } from '@ember/test-helpers';
import { flatten, sortedUniq } from 'lodash';

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
 * Finds what child of the `parent` contains the
 * `element` and returns the index of that child + 1.
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} parent
 * @returns {Number}
 */
function nthChildContains(element, parent) {
  return [...parent.children].findIndex(child => child.contains(element)) + 1;
}

/**
 * Takes an `element` and returns a selector that uniquely
 * selects that element.  Element is assumed to be contained
 * within `baseSelector`'s children.
 *
 * @param {HTMLElement} element
 * @param {String} baseSelector - selector to start with
 * @returns {String}
 */
function uniqueSelector(element, baseSelector = ':root') {
  const nthChild = nthChildContains(element, document.querySelector(baseSelector));

  if (nthChild) return uniqueSelector(element, `${baseSelector} > :nth-child(${nthChild})`);
  return baseSelector;
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

function findAllContainsSelectors(selector) {
  const hasContains = /:contains\(/im;

  if (hasContains.exec(selector)) {
    const regex = /^([\0-\uFFFF]*?):contains\((["']?)(.*?)\2\)([\0-\uFFFF]*)$/im;
    const allRegex = /(\s|[>~+]\s*)$/im;
    const matches = regex.exec(selector);

    let firstSelector = matches[1];
    /**
     * When first selector is empty, check against every element.
     * i.e. `':contains(someting)'` -> `'*:contains(something)'`
     */
    if (!firstSelector) {
      firstSelector = '*';

      /**
       * When first selectors ending in ` `, `+`, `>`, `~` operators
       * i.e.
       * `'.test-div :contains(someting)'`
       *   ->
       * `document.querySelectorAll('.test-div *').map(el => el.innerText.includes('something'))`
       */
    } else if (allRegex.test(firstSelector)) {
      firstSelector = `${firstSelector}*`;
    }

    const content = matches[3];
    const nextSelector = matches[4];
    const filteredElementSelectors = [...document.querySelectorAll(firstSelector)]
      .filter(el => el.innerText.includes(content))
      .map(el => uniqueSelector(el));

    /**
     * If the :contains was used at the very end of the selector, return the element we found here
     * Else recursively find element from rest of selector using the found element as the base
     */
    return flatten(filteredElementSelectors.map(unique => findAllContainsSelectors(`${unique}${nextSelector}`)));
  }

  return [...document.querySelectorAll(selector)].map(el => uniqueSelector(el));
}

/**
 * Same as findContains but returns ALL elements that match rather than just the first one
 *
 * @param {String} selector - selector
 * @param {HTMLElement} baseElement - scoping element
 * @returns {Array<HTMLElement>}
 */
export function findAllContains(selector, baseElement) {
  return sortedUniq(
    findAllContainsSelectors(`${uniqueSelector(baseElement)} ${selector}`).sort((a, b) => a.localeCompare(b))
  ).map(uniqueSelector => document.querySelector(uniqueSelector));
}
