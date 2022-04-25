/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviCollection
 *      @items={{items}}
 *      @itemType="item type"
 *      @config={{hash
 *          actions='actions-component'
 *          itemRoute='route for item link'
 *          itemNewRoute='route for new item link'
 *          emptyMsg='error message when items is empty'
 *          filterable='boolean flag for a filterable table'
 *      }}
 *   />
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import type DS from 'ember-data';
import type ReportModel from 'navi-core/models/report';
import type DashboardModel from 'navi-core/models/dashboard';

type Asset = ReportModel | DashboardModel;
type AssetArray = Asset[];
type PromiseAssetArray = DS.PromiseArray<Asset>;

type Filter = { name: string; filterFn: (items: AssetArray) => AssetArray };

interface Args {
  items: PromiseAssetArray;
  itemType: string;
  config?: {
    actions?: string;
    itemRoute?: string;
    itemNewRoute?: string;
    emptyMsg?: string;
    filterable?: boolean;
  };
}

export default class NaviCollection extends Component<Args> {
  /**
   * list of filters for the report table
   */
  filterOptions: Filter[] = [
    {
      filterFn: (items) => items,
      name: 'All',
    },
    {
      filterFn: (items) => items.filter((asset) => asset.isFavorite),
      name: 'Favorites',
    },
  ];

  /**
   * current report table filter
   */
  @tracked filter = this.filterOptions[0];

  /**
   * array of reports filtered by user selected filter
   */
  get filteredItems() {
    const { items } = this.args;

    return isEmpty(items) ? undefined : this.filter.filterFn(items.toArray());
  }

  /**
   * routes to ${itemType}.${item} by default
   */
  get itemRoute() {
    const { itemType, config = {} } = this.args;
    return config.itemRoute ?? `${itemType}s.${itemType}`;
  }

  /**
   * routes to ${itemType}.new by default
   */
  get itemNewRoute() {
    const { itemType, config = {} } = this.args;

    return config.itemNewRoute ?? `${itemType}s.new`;
  }

  /**
   * indicates if table has loaded
   */
  get hasTableLoaded() {
    const { items } = this.args;
    return items.isSettled || items.isLoaded;
  }
}
