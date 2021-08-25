/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import type ReportModel from 'navi-core/models/report';
import type DashboardModel from 'navi-core/models/dashboard';
import type RouterService from '@ember/routing/router-service';

type Asset = ReportModel | DashboardModel;

interface Args<T extends Asset> {
  item: T;
  idex: number;
}

export default class NaviBaseActionList<T extends Asset> extends Component<Args<T>> {
  @service
  declare router: RouterService;

  @action
  buildUrl() {
    const { id, constructor } = this.args.item;
    if (id) {
      //@ts-ignore
      const modelType = constructor.modelName;
      const baseUrl = document.location.origin;
      const modelUrl = this.router.urlFor(`${modelType}s.${modelType}`, id);
      return baseUrl + modelUrl;
    }
    return '';
  }

  @action
  isItemValid() {
    return this.args.item.validations.isTruelyValid;
  }
}
