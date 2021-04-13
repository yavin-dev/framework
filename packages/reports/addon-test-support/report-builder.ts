import { assert } from '@ember/debug';
import { set } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { click, fillIn, find, findAll, getContext, triggerEvent } from '@ember/test-helpers';
//@ts-ignore
import findByContains from 'navi-core/test-support/contains-helpers';
//@ts-ignore
import { getVerticalCollection, renderAllItems } from './vertical-collection';
import type { ColumnType } from 'navi-data/models/metadata/column';
/* global Ember */

const addFilterButton = `.column-selector__add-filter-btn `;
const groupedListItem = '.column-selector__column';
const addColumnButton = '.column-selector__add-column-btn';
const columnSearchBar = '.column-selector__search-input';

const selector: Record<ColumnType, string> = {
  timeDimension: '.report-builder__dimension-selector',
  dimension: '.report-builder__dimension-selector',
  metric: '.report-builder__metric-selector',
};

/**
 * Checks if a given type is valid for the report builder grouped lists
 * @param type - A selector type for grouped lists
 * @returns - true if the selector is valid
 */
function isAcceptedType(type: ColumnType) {
  return Object.keys(selector).includes(type);
}

/**
 * Gets the query selector containing the grouped list
 * @param type - a valid selector for grouped lists
 * @returns - query selector for type
 */
function getSelector(type: ColumnType): string {
  assert('getSelector must be passed an accepted type', isAcceptedType(type));
  return selector[type];
}

/**
 * Searches for the given query in the grouped list
 * @param type - a valid selector for grouped lists
 * @param query - The query to type in the search bar
 * @returns - resets search to it's previous state
 */
export async function searchFor(type: ColumnType, query: string) {
  assert('searchFor must be passed an accepted type', isAcceptedType(type));
  const typeSelector = getSelector(type);

  const searchBarInputSelector = `${typeSelector} ${columnSearchBar}`;
  const searchBarInput = find(searchBarInputSelector);
  assert('A searchBar must be found', searchBarInput);
  const previousSearch = searchBarInput.textContent || '';
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
export async function getItem(type: ColumnType, query: string, itemText?: string) {
  assert('getItem must be passed an accepted type', isAcceptedType(type));
  const reset = await searchFor(type, query);
  itemText = itemText || query;
  const item = findByContains(groupedListItem, itemText);
  return { item, reset };
}

/**
 * Searches for the given item, retrieves it, clicks it, then resets the state
 * @param instance - the test or application instance
 * @param type - a valid selector for grouped lists
 * @param query - The query to type in the search bar
 * @param itemText - The text content of the element to click
 */
export async function clickItem(type: ColumnType, query: string, itemText?: string) {
  assert('clickItem must be passed an accepted type', isAcceptedType(type));
  const { item, reset } = await getItem(type, query, itemText);
  await click(item.querySelector(addColumnButton));
  await reset();
}

/**
 * Searches for the given item, retrieves it, clicks its filter button, then resets the state
 * @param type - a valid selector for grouped lists
 * @param query - The query to type in the search bar
 * @param itemText - The text content of the element to click the filter of
 */
export async function clickItemFilter(type: ColumnType, query: string, itemText?: string) {
  assert('clickItemFilter must be passed an accepted type', isAcceptedType(type));
  const { item, reset } = await getItem(type, query, itemText);
  await click(item.querySelector(addFilterButton));
  await reset();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findComponentInstance(node: any, guid: string) {
  if (guidFor(node.instance) === guid) {
    return node.instance;
  }

  const { children = [] } = node;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return children.map((c: any) => findComponentInstance(c, guid)).find((c: any) => c);
}

/**
 * Forces the given grouped list to open all of its groups and render all of its contents
 * @param {String} type - a valid selector for grouped lists
 * @returns {Function} - resets to original open groups and rendering
 */
async function _renderAndOpenAllFiltered(type: ColumnType) {
  const verticalCollection = getVerticalCollection(getSelector(type));
  const guid = find(getSelector(type))?.querySelector('.grouped-list')?.id;
  assert('grouped list id is found', guid);
  //@ts-expect-error -- private interface
  const renderTree = Ember._captureRenderTree(getContext().owner);
  const groupedList = findComponentInstance(renderTree[0], guid);

  const { groupConfigs, groupedItems } = groupedList;
  const _groupConfigs = Object.assign({}, groupConfigs);

  const allOpenGroups = Object.keys(groupedItems).reduce((config: Record<string, { isOpen: boolean }>, group) => {
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
 * @param type - a valid selector for grouped lists
 * @param query - The query to type in the search bar
 * @returns - resets to previous search/open groups/render state
 */
export async function renderAll(type: ColumnType, query = '') {
  const resetSearch = await searchFor(type, query);
  const resetRenderAll = await _renderAndOpenAllFiltered(type);

  return async () => {
    await resetRenderAll();
    await resetSearch();
  };
}

/**
 * Renders all items that match the given query, then returns the names of all items
 * @param type - a valid selector for grouped lists
 * @param query - The query to type in the search bar
 * @returns - the names of all the selected items
 */
export async function getAll(type: ColumnType, query?: string) {
  assert('getAll must be passed an accepted type', isAcceptedType(type));
  const resetRenderAll = await renderAll(type, query);

  const all = findAll(`${getSelector(type)} ${groupedListItem}`).map((el) => el.textContent?.trim());

  await resetRenderAll();
  return all;
}
