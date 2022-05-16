/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import RequestFragment from 'navi-core/models/request';
import FilterFragment from 'navi-core/models/request/filter';
import { dasherize } from '@ember/string';
import { inject as service } from '@ember/service';
import RequestConstrainer from 'navi-reports/services/request-constrainer';
import { next } from '@ember/runloop';
import { assert } from '@ember/debug';

interface FilterCollectionArgs {
  isCollapsed: boolean;
  request: RequestFragment;
  lastAddedFilter?: FilterFragment | null;
  resetLastAddedFilter?: () => void;
  onUpdateCollapsed?: (isCollapsed: boolean) => void;
  onRemoveFilter(filter: FilterFragment): void;
  onUpdateFilter(filter: FilterFragment): void;
}

type FilterItem = {
  type: string;
  isRequired: boolean;
  fragment: FilterFragment;
};
export default class FilterCollection extends Component<FilterCollectionArgs> {
  @service requestConstrainer!: RequestConstrainer;

  lastAddedFilterElement: HTMLElement | undefined;

  /**
   * Ordered collection of date, metric, and dimension filters from request
   */
  @computed('args.request.filters.[]')
  get filters(): FilterItem[] {
    const { request } = this.args;
    const requiredFilters = this.requestConstrainer.getConstrainedProperties(request).filters || new Set();
    return [...request.dimensionFilters, ...request.metricFilters].map((fragment) => ({
      type: this.getFilterType(fragment),
      isRequired: requiredFilters.has(fragment),
      fragment,
    }));
  }

  /**
   * Get appropriate filter builder type based on column type
   */
  private getFilterType(filter: FilterFragment) {
    const { columnMetadata } = filter;
    if (columnMetadata.metadataType === 'dimension' && columnMetadata.valueType === 'number') {
      return 'metric';
    }
    return dasherize(filter.type);
  }

  /**
   * Stores element reference after render.
   * If the filter was last added, scrolls to the element and highlights it
   * @param element - element inserted
   */
  @action
  setupElement(element: HTMLElement, filterArg: FilterFragment[]) {
    const [filter] = filterArg;
    const { lastAddedFilter, resetLastAddedFilter } = this.args;

    if (lastAddedFilter === filter) {
      this.lastAddedFilterElement = element;
      next(() => {
        this.scrollToElement();
        this.highlightElement();
        resetLastAddedFilter?.();
      });
    }
  }

  /**
   * sets the scroll position to the last added filter
   */
  scrollToElement() {
    const { parentElement, offsetTop } = this.lastAddedFilterElement ?? { offsetTop: 0 };
    assert('Component should have a parent', parentElement);
    parentElement.scrollTop = offsetTop - parentElement.offsetTop;
  }

  /**
   * adds a highlighting animation to the element
   */
  highlightElement() {
    this.lastAddedFilterElement?.classList.add('filter-collection__row--last-added');
  }
}
