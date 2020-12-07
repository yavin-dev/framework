/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import VisualizationModel from '../../models/visualization';

type Args = {
  request: RequestV2;
  response: ResponseV1;
  visualization: VisualizationModel;
  onUpdateConfig: (config: TODO) => void;
};

export default class NaviVisualizationConfigWrapperComponent extends Component<Args> {}
