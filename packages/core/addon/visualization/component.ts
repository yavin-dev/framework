/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
// eslint-disable-next-line ember/no-classic-components
import type EmberComponent from '@ember/component';
import type RequestFragment from 'navi-core/models/request';
import type NaviFactResponse from 'navi-data/models/navi-fact-response';
import type { YavinVisualizationManifest } from './manifest';

export interface YavinVisualizationArgs<Settings = unknown> {
  request: RequestFragment;
  response: NaviFactResponse;
  settings: Settings;
  isEditing: boolean;
  isReadOnly: boolean;
  isPrint: boolean;
  onUpdateReport: (action: string, ...params: unknown[]) => void;
  onUpdateSettings(model: Settings): void;
  // temporary legacy support
  manifest: YavinVisualizationManifest;
  container: () => HTMLElement | EmberComponent;
  annotationData: unknown;
}

export default abstract class YavinVisualizationComponent<Settings = unknown> extends Component<
  YavinVisualizationArgs<Settings>
> {}
