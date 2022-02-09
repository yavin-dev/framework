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
import { task, TaskGenerator } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';

export default class PerspectiveVisualization extends YavinVisualizationComponent<PerspectiveSettings> {
  @task *saveSettings(viewer: HTMLPerspectiveViewerElement): TaskGenerator<void> {
    const { settings, isReadOnly } = this.args;
    const configuration = yield viewer.save();
    if (!isReadOnly && !isEqual(configuration, settings?.configuration)) {
      this.args.onUpdateSettings({ configuration });
    }
  }

  @action
  async loadData(viewer: HTMLPerspectiveViewerElement): Promise<void> {
    const { response } = this.args;
    const data = response.rows as TableData;
    const worker = perspective.shared_worker();
    const table = await worker.table(data);
    await viewer.load(table);
  }

  @action
  async loadSettings(viewer: HTMLPerspectiveViewerElement): Promise<void> {
    const { settings } = this.args;
    await viewer.restore(settings?.configuration ?? {});
    await taskFor(this.saveSettings).perform(viewer); //save in the case config is updated after loading
  }

  @action
  async setupElement(viewer: HTMLPerspectiveViewerElement): Promise<void> {
    await this.loadData(viewer);
    await this.loadSettings(viewer);

    viewer.addEventListener('perspective-config-update', () => {
      taskFor(this.saveSettings).perform(viewer);
    });
  }
}
