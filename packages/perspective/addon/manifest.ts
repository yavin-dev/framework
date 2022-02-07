/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import type { PerspectiveViewerConfig } from '@finos/perspective-viewer';
import { YavinVisualizationManifest } from 'navi-core/visualization/manifest';
import PerspectiveVisualization from './components/perspective';

export interface PerspectiveSettings {
  configuration?: PerspectiveViewerConfig;
}

export class PerspectiveManifest extends YavinVisualizationManifest<PerspectiveSettings> {
  namespace = 'perspective';
  currentVersion = 1;
  type = 'perspective';
  niceName = 'Perspective';
  icon = 'explore';

  validate() {
    return { isValid: true };
  }

  visualizationComponent = PerspectiveVisualization;

  createNewSettings(): PerspectiveSettings {
    return { configuration: {} };
  }
}
