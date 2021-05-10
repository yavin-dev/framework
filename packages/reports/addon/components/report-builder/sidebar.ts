/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import { sortBy } from 'lodash-es';
import config from 'ember-get-config';
import { getDataSource } from 'navi-data/utils/adapter';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';
//@ts-ignore
import { toLeft, toRight } from 'navi-reports/transitions/custom-move-over';
//@ts-ignore
import move from 'ember-animated/motions/move';
import type { NaviDataSource } from 'navi-config';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type TableMetadataModel from 'navi-data/models/metadata/table';
import type ReportModel from 'navi-core/models/report';
import type ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import type { SourceItem } from './source-selector';
import type { OrphanObserver } from 'ember-animated/services/motion';

export type TransitionContext = Parameters<Parameters<OrphanObserver>[1]>[0];

interface Args {
  report: ReportModel;
  isOpen: boolean;
  disabled: boolean;
  onResize?: () => void;
  closeSidebar(): void;
  lastAddedColumn?: ColumnFragment;
  setTable(table: TableMetadataModel): void;
}

type SelectingState = 'dataSource' | 'table' | 'columns';

type SourcePath = [] | [SourceItem<NaviDataSource>] | [SourceItem<NaviDataSource>, SourceItem<TableMetadataModel>];

const mapDataSource = (dataSource: NaviDataSource): SourceItem<NaviDataSource> => ({
  name: dataSource.displayName,
  description: dataSource.description,
  source: dataSource,
});

const mapTable = (table: TableMetadataModel): SourceItem<TableMetadataModel> => ({
  name: table.name,
  description: table.description,
  source: table,
});

export default class ReportBuilderSidebar extends Component<Args> {
  @service('navi-metadata')
  declare metadataService: NaviMetadataService;

  @tracked sourcePath: SourcePath = [];

  @tracked latestDataSourceTables: SourceItem<TableMetadataModel>[] = [];

  constructor(owner: unknown, args: Args) {
    super(owner, args);
    const { tableMetadata, dataSource } = this.request;

    if (tableMetadata) {
      this.sourcePath = [mapDataSource(getDataSource(tableMetadata.source)), mapTable(tableMetadata)];
    } else if (dataSource) {
      this.sourcePath = [mapDataSource(getDataSource(dataSource))];
    } else {
      this.setupDefaultPath();
    }
    const [dataSourceItem] = this.sourcePath;
    if (dataSourceItem) {
      this.latestDataSourceTables = this.getTablesForDataSource(dataSourceItem);
    }
  }

  protected setupDefaultPath(): void {
    const { dataSources } = this;
    if (dataSources.length === 1) {
      const dataSource = dataSources[0];
      const tables = this.getTablesForDataSource(dataSource);
      if (tables.length === 1) {
        this.setSelectedTable(tables[0].source);
      } else {
        this.setSelectedDataSource(dataSource.source);
      }
    }
  }

  private get request() {
    return this.args.report.request;
  }

  get requestDataSource(): SourceItem<NaviDataSource> | undefined {
    const { dataSources, request } = this;
    return dataSources.find((d) => d.source.name === request.dataSource);
  }

  get requestTableMetadata(): SourceItem<TableMetadataModel> | undefined {
    const { dataSourceTables, request } = this;
    return dataSourceTables.find((d) => d.source.id === request.table);
  }

  get selecting(): SelectingState {
    if (this.sourcePath.length === 0) {
      return 'dataSource';
    } else if (this.sourcePath.length === 1) {
      return 'table';
    } else if (this.sourcePath.length === 2) {
      return 'columns';
    }
    assert('sourcePath length not supported');
  }

  get table() {
    return this.request.table;
  }

  get dataSources(): SourceItem<NaviDataSource>[] {
    return sortBy(config.navi.dataSources, ['displayName']).map((dataSource) => ({
      name: dataSource.displayName,
      description: dataSource.description,
      source: dataSource,
    }));
  }

  get dataSourceTables(): SourceItem<TableMetadataModel>[] {
    const [dataSource] = this.sourcePath;
    if (dataSource) {
      return this.latestDataSourceTables;
    }
    return [];
  }

  private getTablesForDataSource(dataSource: SourceItem<NaviDataSource>) {
    const factTables = this.metadataService.all('table', dataSource.source.name).filter((t) => t.isFact === true);
    return sortBy(factTables, ['name']).map((table) => ({
      name: table.name,
      description: table.description,
      source: table,
    }));
  }

  protected get path() {
    const sources = this.sourcePath as SourceItem[];
    return ['Data Sources', ...sources.map((source) => source.name)];
  }

  get breadcrumb() {
    const { sourcePath } = this;
    return this.path.slice(0, this.path.length - 1).map((path, idx) => ({
      name: path,
      path: sourcePath.slice(0, idx),
    }));
  }

  get title() {
    return this.path[this.path.length - 1];
  }

  checkDidResize(oldSelecting: SelectingState, newSelecting: SelectingState) {
    if (oldSelecting !== newSelecting && (oldSelecting === 'columns' || newSelecting === 'columns')) {
      // Navigated to new state and it closed/opened the column config
      this.args.onResize?.();
    }
  }

  @action
  changePath(action: () => void) {
    const { selecting: oldSelecting } = this;
    action();
    const { selecting: newSelecting } = this;
    this.checkDidResize(oldSelecting, newSelecting);
  }

  @action
  setSelectedDataSource(dataSource?: NaviDataSource) {
    this.changePath(() => {
      if (dataSource) {
        this.sourcePath = [mapDataSource(dataSource)];
      } else {
        this.sourcePath = [];
      }
    });
    this.updateDataSourceTables();
  }

  @action
  setSelectedTable(table?: TableMetadataModel) {
    this.changePath(() => {
      if (table) {
        const dataSource = getDataSource(table.source);
        this.sourcePath = [mapDataSource(dataSource), mapTable(table)];
        this.args.setTable(table);
      } else {
        // Remove table
        if (this.sourcePath.length === 2) {
          this.sourcePath = [this.sourcePath[0]];
        }
      }
    });
    this.updateDataSourceTables();
  }

  @action
  updateDataSourceTables() {
    const dataSourceItem = this.sourcePath[0];
    if (dataSourceItem) {
      this.latestDataSourceTables = this.getTablesForDataSource(dataSourceItem);
    }
  }

  /**
   * Drawer transition
   * @param context - animation context
   */
  @action
  *drawerTransition(context: TransitionContext) {
    const { insertedSprites, removedSprites } = context;
    yield Promise.all([
      ...removedSprites.map((sprite) => {
        const { left, width } = sprite.element.getBoundingClientRect();
        const x = left - 1.5 * width;
        // sprite.applyStyles({ 'z-index': '1' });
        sprite.endAtPixel({ x });
        return move(sprite, { easing: easeIn });
      }),
      ...insertedSprites.map((sprite) => {
        const { left, width } = sprite.element.getBoundingClientRect();
        const x = left - 1.5 * width;
        sprite.startAtPixel({ x });
        // sprite.applyStyles({ 'z-index': '1' });
        return move(sprite, { easing: easeOut });
      }),
    ]);
    this.args.onResize?.();
  }

  @action
  contentAnimationRules({
    oldItems,
    newItems,
  }: {
    oldItems: [SourcePath | undefined];
    newItems: [SourcePath | undefined];
  }) {
    const oldSourceLength = oldItems[0]?.length ?? 0;
    const newSourceLength = newItems[0]?.length ?? 0;
    if (newSourceLength < oldSourceLength) {
      return this.toRight;
    } else {
      return this.toLeft;
    }
  }

  @action
  *toRight() {
    yield* toRight(...arguments);
    this.args.onResize?.();
  }

  @action
  *toLeft() {
    yield* toLeft(...arguments);
    this.args.onResize?.();
  }
}
