/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviActionList
 *      @item={{this.report}}
 *      @index={{this.index}}
 *   />
 */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import ReportModel from 'navi-core/addon/models/report';

interface Args {
  item: ReportModel;
  idex: number;
}
export default class NaviActionList extends Component<Args> {
  @service
  router!: RouterService;

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
  async isReportValid(): Promise<boolean> {
    await this.args.item.request.loadMetadata();
    return this.args.item.validations.isTruelyValid;
  }
}
