import { click, getContext, fillIn, find, findAll, triggerEvent } from '@ember/test-helpers';
import { assert } from '@ember/debug';
import { set } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import findByContains from 'navi-core/test-support/contains-helpers';
import { getVerticalCollection, renderAllItems } from './vertical-collection';

const addFilterButton = `.column-selector__add-filter-btn `; // dimension/metric row filter button
const groupedListItem = '.column-selector__column'; // dimension/metric row
const addColumnButton = '.column-selector__add-column-btn';
const addedColumns = '.column-selector__column--added';
const columnSearchBar = '.column-selector__search-input';

const selector = {
  timeGrain: '.report-builder__dimension-selector',
  dimension: '.report-builder__dimension-selector',
  metric: '.report-builder__metric-selector',
};

/**
 * Checks if a given type is valid for the report builder grouped lists
 * @param {String} type - A selector type for grouped lists
 * @returns {Boolean} - true if the selector is valid
 */
function isAcceptedType(type) {
  return Object.keys(selector).includes(type);
}

/**
 * Gets the query selector containing the grouped list
 * @param {String} type - a valid selector for grouped lists
 * @returns {String} - query selector for type
 */
function getSelector(type) {
  assert('getSelector must be passed an accepted type', isAcceptedType(type));
  return selector[type];
}

/**
 * Searches for the given query in the grouped list
 * @param {String} type - a valid selector for grouped lists
 * @param {String} query - The query to type in the search bar
 * @returns {Function} - resets search to it's previous state
 */
export async function searchFor(type, query) {
  assert('searchFor must be passed an accepted type', isAcceptedType(type));
  const typeSelector = getSelector(type);

  const searchBarInputSelector = `${typeSelector} ${columnSearchBar}`;
  const searchBarInput = find(searchBarInputSelector);
  const previousSearch = searchBarInput.textContent;
  await fillIn(searchBarInput, query);
  await triggerEvent(searchBarInput, 'focusout');

  return async () => {
    await fillIn(searchBarInputSelector, previousSearch);
    await triggerEvent(searchBarInput, 'focusout');
  };
}

/**
 * Searches for the given item, then retrieves it from grouped list
 * @param {String} type - a valid selector for grouped lists
 * @param {String} query - The query to type in the search bar
 * @param {String} itemText - The text content of the element to return
 * @returns {Object} - the element and a function to reset the search bar
 */
export async function getItem(type, query, itemText) {
  assert('getItem must be passed an accepted type', isAcceptedType(type));
  const reset = await searchFor(type, query);
  itemText = itemText || query;
  const item = findByContains(groupedListItem, itemText);
  return { item, reset };
}

/**
 * Searches for the given item, retrieves it, clicks it, then resets the state
 * @param {Object} instance - the test or application instance
 * @param {String} type - a valid selector for grouped lists
 * @param {String} query - The query to type in the search bar
 * @param {String|void} itemText - The text content of the element to click
 */
export async function clickItem(type, query, itemText) {
  assert('clickItem must be passed an accepted type', isAcceptedType(type));
  const { item, reset } = await getItem(type, query, itemText);
  await click(item.querySelector(addColumnButton));
  await reset();
}

/**
 * Searches for the given item, retrieves it, clicks its filter button, then resets the state
 * @param {String} type - a valid selector for grouped lists
 * @param {String} query - The query to type in the search bar
 * @param {String} itemText - The text content of the element to click the filter of
 */
export async function clickItemFilter(type, query, itemText) {
  assert('clickItemFilter must be passed an accepted type', isAcceptedType(type));
  const { item, reset } = await getItem(type, query, itemText);
  await click(item.querySelector(addFilterButton));
  await reset();
}

/**
 * Forces the given grouped list to open all of its groups and render all of its contents
 * @param {String} type - a valid selector for grouped lists
 * @returns {Function} - resets to original open groups and rendering
 */
async function _renderAndOpenAllFiltered(type) {
  const verticalCollection = getVerticalCollection(getSelector(type));
  const guid = find(getSelector(type)).querySelector('.grouped-list')?.id;
  const viewRegistry = getContext().owner.lookup('-view-registry:main');
  const groupedList = Object.values(viewRegistry).find((c) => c.guid === guid);

  const { groupConfigs, groupedItems } = groupedList;
  const _groupConfigs = Object.assign({}, groupConfigs);

  const allOpenGroups = Object.keys(groupedItems).reduce((config, group) => {
    config[group] = { isOpen: true };
    return config;
  }, {});

  set(groupedList, 'groupConfigs', allOpenGroups);
  const resetRenderAllItems = await renderAllItems(verticalCollection);

  return async () => {
    if (!groupedList.isDestroyed || !groupedList.isDestroying) {
      set(groupedList, 'groupConfigs', _groupConfigs);
    }
    await resetRenderAllItems();
  };
}

/**
 * Searches for the given query (defaults to none), opens all groups, and renders all items.
 * This is useful to force everything to be in the dom, then revert when done
 * @param {String} type - a valid selector for grouped lists
 * @param {String} query - The query to type in the search bar
 * @returns {Function} - resets to previous search/open groups/render state
 */
export async function renderAll(type, query = '') {
  const resetSearch = await searchFor(type, query);
  const resetRenderAll = await _renderAndOpenAllFiltered(type);

  return async () => {
    await resetRenderAll();
    await resetSearch();
  };
}

/**
 * Renders all items that match the given query, then returns the names of all selected items
 * @param {String} type - a valid selector for grouped lists
 * @param {String} query - The query to type in the search bar
 * @returns {Array<String>} - the names of all the selected items
 */
export async function getAllSelected(type, query) {
  assert('getAllSelected must be passed an accepted type', isAcceptedType(type));
  const resetRenderAll = await renderAll(type, query);
  const selected = findAll(`${getSelector(type)} ${addedColumns}`);
  await resetRenderAll();
  return selected;
}

/**
 * Renders all items that match the given query, then returns the names of all items
 * @param {String} type - a valid selector for grouped lists
 * @param {String} query - The query to type in the search bar
 * @returns {Array<String>} - the names of all the selected items
 */
export async function getAll(type, query) {
  assert('getAll must be passed an accepted type', isAcceptedType(type));
  const resetRenderAll = await renderAll(type, query);

  const all = findAll(`${getSelector(type)} ${groupedListItem}`).map((el) => el.textContent.trim());

  await resetRenderAll();
  return all;
}
