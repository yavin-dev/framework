/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * <NaviVisualizationConfig::Table
 *    @request={{this.request}}
 *    @response={{this.response}}
 *    @options={{this.tableOptions}}
 *    @onUpdateConfig={{this.onUpdateConfig}}
 * />
 */

import Component from '@glimmer/component';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';

export interface Args<Options> {
  options: Options;
  request: RequestFragment;
  response: ResponseV1;
  onUpdateConfig(options: Partial<Options>): void;
}

export default class NaviVisualizationConfigBaseComponent<T extends object = {}> extends Component<Args<T>> {}
