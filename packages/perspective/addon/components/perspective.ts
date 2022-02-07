/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { action } from '@ember/object';
import perspective, { TableData } from '@finos/perspective';
import '@finos/perspective-viewer';
import type { HTMLPerspectiveViewerElement } from '@finos/perspective-viewer';
import '@finos/perspective-viewer-datagrid';
import '@finos/perspective-viewer-d3fc';
import YavinVisualizationComponent from 'navi-core/visualization/component';
import { PerspectiveSettings } from '../manifest';
import { isEqual } from 'lodash-es';

export default class PerspectiveVisualization extends YavinVisualizationComponent<PerspectiveSettings> {
  async saveSettings(viewer: HTMLPerspectiveViewerElement) {
    const { settings, isReadOnly } = this.args;
    const configuration = await viewer.save();
    if (!isReadOnly && !isEqual(configuration, settings?.configuration)) {
      this.args.onUpdateSettings({ configuration });
    }
  }

  @action
  async onSettingsUpdate(viewer: HTMLPerspectiveViewerElement): Promise<void> {
    await viewer.restore(this.args?.settings?.configuration ?? {});
    await this.saveSettings(viewer);
  }

  @action
  async setupElement(viewer: HTMLPerspectiveViewerElement): Promise<void> {
    const { response, settings } = this.args;
    const worker = perspective.worker();

    const data = response.rows as TableData;
    const table = await worker.table(data);

    await viewer.load(table);
    await viewer.restore(settings?.configuration ?? {});
    await this.saveSettings(viewer);

    viewer.addEventListener('perspective-config-update', async () => {
      await this.saveSettings(viewer);
    });
  }
}
