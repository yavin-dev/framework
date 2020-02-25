import { click, fillIn, find, findAll, triggerEvent } from '@ember/test-helpers';
import { assert } from '@ember/debug';
import { set } from '@ember/object';
import findByContains from 'navi-core/test-support/contains-helpers';
import { getVerticalCollection, didRender, renderAllItems } from './vertical-collection';

const groupedList = '.grouped-list';
const groupedListItemFilter = `${groupedList}__filter`; // dimension/metric row filter button
const groupedListItem = `${groupedList}__item`; // dimension/metric row
const groupedListItemLabel = `${groupedListItem}-label`; // add button
const groupedListItemCheckbox = `${groupedListItem}-checkbox`; // add button
const naviListSelector = '.navi-list-selector';
const searchBar = `${naviListSelector}__search-input`;
const showLink = `${naviListSelector}__show-link`;

const selector = {
  timeGrain: '.checkbox-selector--dimension',
  dimension: '.checkbox-selector--dimension',
  metric: '.checkbox-selector--metric',
  metricConfig: '.metric-config__dropdown-container'
};

function isAcceptedType(type) {
  return Object.keys(selector).includes(type);
}

function getSelector(type) {
  return selector[type];
}

export async function clickShowSelected(instance, type) {
  assert('clickShowSelected got an accepted type', isAcceptedType(type));
  const typeSelector = getSelector(type);

  const showSelectedButton = find(`${typeSelector} ${showLink}`);
  const originalText = showSelectedButton.textContent;
  if (showSelectedButton.textContent.includes('Show Selected')) {
    await click(showSelectedButton);
    await didRender(getVerticalCollection(instance, typeSelector));
  }

  return async () => {
    const button = find(`${typeSelector} ${showLink}`);
    if (!button.textContent.includes(originalText)) {
      await click(button);
      await didRender(getVerticalCollection(instance, typeSelector));
    }
  };
}

// search for metric/dimension
export async function searchFor(instance, type, query) {
  assert('searchFor got an accepted type', isAcceptedType(type));
  const typeSelector = getSelector(type);

  const searchBarInputSelector = `${typeSelector} ${searchBar}`;
  const searchBarInput = find(searchBarInputSelector);
  const previousSearch = searchBarInput.textContent;
  await fillIn(searchBarInput, query);
  await triggerEvent(searchBarInput, 'focusout');
  await didRender(getVerticalCollection(instance, typeSelector));

  return async () => {
    await fillIn(searchBarInputSelector, previousSearch);
    await triggerEvent(searchBarInput, 'focusout');
    await didRender(getVerticalCollection(instance, typeSelector));
  };
}

// get metric/dimension from selector
export async function getItem(instance, type, query) {
  assert('getItem got an accepted type', isAcceptedType(type));
  const reset = await searchFor(instance, type, query);
  const item = findByContains(groupedListItem, query);
  return { item, reset };
}

// add metric/dimension to request
export async function clickItem(instance, type, query) {
  assert('clickItem got an accepted type', isAcceptedType(type));
  const { item, reset } = await getItem(instance, type, query);
  await click(item.querySelector(groupedListItemLabel));
  await reset();
}

// add metric/dimension filter to request
export async function clickItemFilter(instance, type, query) {
  assert('clickItemFilter got an accepted type', isAcceptedType(type));
  const { item, reset } = await getItem(instance, type, query);
  await click(item.querySelector(groupedListItemFilter));
  await reset();
}

async function _renderAndOpenAllFiltered(instance, type) {
  const verticalCollection = getVerticalCollection(instance, getSelector(type));

  const { parentView: groupedList } = verticalCollection;
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

export async function renderAll(instance, type, query = '') {
  const resetSearch = await searchFor(instance, type, query);
  const resetRenderAll = await _renderAndOpenAllFiltered(instance, type);

  return async () => {
    await resetRenderAll();
    await resetSearch();
  };
}

export async function getAllSelected(instance, type, query) {
  assert('getAllSelected got an accepted type', isAcceptedType(type));
  const resetRenderAll = await renderAll(instance, type, query);

  const selected = findAll(`${getSelector(type)} ${groupedListItem}`)
    .filter(el => el.querySelector('.fa-minus-circle') || el.querySelector('input:checked'))
    .map(el => el.textContent.trim());

  await resetRenderAll();
  return selected;
}

export async function getAll(instance, type, query) {
  assert('getAll got an accepted type', isAcceptedType(type));
  const resetRenderAll = await renderAll(instance, type, query);

  const all = findAll(`${getSelector(type)} ${groupedListItem}`).map(el => el.textContent.trim());

  await resetRenderAll();
  return all;
}

// metrics config
export async function clickMetricConfigTrigger(instance, metric) {
  const { item, reset } = await getItem(instance, 'metric', metric);
  await click(item.querySelector('.metric-config__trigger-icon'));
  return reset;
}

export async function hasMetricConfig(instance, metric) {
  const { item, reset } = await getItem(instance, 'metric', metric);
  const result = !!item.querySelector('.metric-config');
  await reset();
  return result;
}

// timegrains
export async function getTimeGrainCheckbox(instance, timeGrain) {
  const { item, reset } = await getItem(instance, 'timeGrain', timeGrain);
  const result = item.querySelector(groupedListItemCheckbox);
  return { item: result, reset };
}
