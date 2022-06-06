/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import type RequestFragment from 'navi-core/models/request';
import type NaviFactResponse from '@yavin/client/models/navi-fact-response';
import type { YavinVisualizationManifest } from './manifest';

export interface YavinVisualizationPanelArgs<Settings = unknown> {
  request: RequestFragment;
  response: NaviFactResponse;
  settings: Settings;
  isEditing: boolean;
  isReadOnly: boolean;
  onUpdateReport: (action: string, ...params: unknown[]) => void;
  onUpdateSettings(model: Settings): void;
  // temporary legacy support
  manifest: YavinVisualizationManifest;
}

export default abstract class YavinVisualizationPanelComponent<Settings = unknown> extends Component<
  YavinVisualizationPanelArgs<Settings>
> {}
