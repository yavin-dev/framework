/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import RequestFragment from 'navi-core/models/request';
import YavinVisualizationModel from 'navi-core/models/visualization-v2';
import NaviFactResponse from 'navi-data/models/navi-fact-response';

export interface YavinVisualizationPanelArgs<Settings = unknown> {
  request: RequestFragment;
  response: NaviFactResponse;
  settings: Settings;
  isEditing: boolean;
  isReadOnly: boolean;
  onUpdateReport: (action: string, ...params: unknown[]) => void;
  onUpdateSettings(model: YavinVisualizationModel<Settings>): void;
}

export default abstract class YavinVisualizationPanelComponent<Settings = unknown> extends Component<
  YavinVisualizationPanelArgs<Settings>
> {}
