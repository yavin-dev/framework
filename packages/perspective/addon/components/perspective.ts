/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { action } from '@ember/object';
import perspective, { Schema, TableData } from '@finos/perspective';
import '@finos/perspective-viewer';
import '@finos/perspective-viewer-datagrid';
import '@finos/perspective-viewer-d3fc';
import YavinVisualizationComponent from 'navi-core/visualization/component';
import { PerspectiveSettings } from '../manifest';
import { isEqual } from 'lodash-es';
import { task, TaskGenerator } from 'ember-concurrency';
import type { HTMLPerspectiveViewerElement } from '@finos/perspective-viewer';
import type { Grain } from 'navi-data/utils/date';

const worker = perspective.shared_worker();

export default class PerspectiveVisualization extends YavinVisualizationComponent<PerspectiveSettings> {
  @task *saveSettingsTask(e: { target: HTMLPerspectiveViewerElement }): TaskGenerator<void> {
    const configuration = yield e.target.save();
    const { settings, isReadOnly } = this.args;
    if (!isReadOnly && !isEqual(configuration, settings?.configuration)) {
      this.args.onUpdateSettings({ configuration });
    }
  }

  async makeSchema(): Promise<Schema> {
    const { response, request } = this.args;
    // load some table data to infer a schema
    const data = response.rows.slice(0, 10) as TableData;
    const table = await worker.table(data);
    const defaultSchema = await table.schema();
    await table.delete();

    const isDayAligned = (grain: Grain) => !['hour', 'minute', 'second'].includes(grain);
    const dayAlignedTimeDimensions = request.columns.filter(
      (c) => c.type === 'timeDimension' && isDayAligned(c.parameters.grain as Grain)
    );
    // override day aligned time dimensions to explicitly be `date` instead of `datetime`
    const schemaOverrides: Schema = Object.fromEntries(dayAlignedTimeDimensions.map((d) => [d.canonicalName, 'date']));

    return { ...defaultSchema, ...schemaOverrides };
  }

  @action
  async loadData(viewer: HTMLPerspectiveViewerElement): Promise<void> {
    const { response } = this.args;
    const data = response.rows as TableData;
    const schema = await this.makeSchema();
    const table = await worker.table(schema);
    table.update(data);
    await viewer.load(table);
  }

  @action
  async loadSettings(viewer: HTMLPerspectiveViewerElement): Promise<void> {
    const { settings } = this.args;
    await viewer.restore(settings?.configuration ?? {});
  }

  @action
  async setupElement(viewer: HTMLPerspectiveViewerElement): Promise<void> {
    await this.loadData(viewer);
    await this.loadSettings(viewer);
  }
}
