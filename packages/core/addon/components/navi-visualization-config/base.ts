/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import RequestFragment from 'navi-core/models/request';
import { ResponseV1 } from '@yavin/client/serializers/facts/interface';

export interface Args<Options> {
  options: Options;
  request: RequestFragment;
  response: ResponseV1;
  onUpdateConfig(options: Partial<Options>): void;
}

export default class NaviVisualizationConfigBaseComponent<T extends object = Record<string, unknown>> extends Component<
  Args<T>
> {}
