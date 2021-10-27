/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { sortBy } from 'lodash-es';
import config from 'ember-get-config';
import { getDataSource } from 'navi-data/utils/adapter';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';
//@ts-ignore
import { toLeft, toRight } from 'navi-reports/transitions/custom-move-over';
//@ts-ignore
import move from 'ember-animated/motions/move';
import { task } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import type { TaskInstance, TaskGenerator } from 'ember-concurrency';
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
  onCloseSidebar(): void;
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
  friendlyName: table.friendlyName,
  description: table.description,
  source: table,
});

export default class ReportBuilderSidebar extends Component<Args> {
  @service('navi-metadata')
  declare metadataService: NaviMetadataService;

  @tracked sourcePath: SourcePath = [];

  @tracked dataSources: TaskInstance<SourceItem<NaviDataSource>[]>;
  @tracked tables?: TaskInstance<SourceItem<TableMetadataModel>[]>;

  constructor(owner: unknown, args: Args) {
    super(owner, args);
    const { tableMetadata, dataSource } = this.request;
    this.dataSources = taskFor(this.fetchDataSources).perform();

    if (tableMetadata) {
      this.setSourcePath([mapDataSource(getDataSource(tableMetadata.source)), mapTable(tableMetadata)]);
    } else if (dataSource) {
      this.setSourcePath([mapDataSource(getDataSource(dataSource))]);
    } else {
      this.setupDefaultPath();
    }
  }

  protected async setupDefaultPath() {
    const allDataSources = await this.dataSources;

    if (allDataSources.length === 1) {
      const dataSource = allDataSources[0];
      const allDatasourceTables = await taskFor(this.getTablesForDataSource).perform(dataSource.source);
      if (allDatasourceTables.length === 1) {
        // ember-animated doesn't render this correctly unless we use next
        next(() => this.setSelectedTable(allDatasourceTables[0].source));
      } else {
        // ember-animted fix^
        next(() => this.setSelectedDataSource(dataSource.source));
      }
    }
  }

  private get request() {
    return this.args.report.request;
  }

  get requestDataSource(): SourceItem<NaviDataSource> | undefined {
    const { dataSource } = this.request;
    return dataSource ? mapDataSource(getDataSource(dataSource)) : undefined;
  }

  get requestTableMetadata(): SourceItem<TableMetadataModel> | undefined {
    const { tableMetadata } = this.request;
    return tableMetadata ? mapTable(tableMetadata) : undefined;
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

  @task *fetchDataSources(): TaskGenerator<SourceItem<NaviDataSource>[]> {
    const sources: SourceItem<NaviDataSource>[] = sortBy(config.navi.dataSources, ['displayName']).map(
      (dataSource) => ({
        name: dataSource.displayName,
        description: dataSource.description,
        source: dataSource,
      })
    );
    return yield sources;
  }

  @task({ restartable: true }) *getTablesForDataSource(
    dataSource: NaviDataSource
  ): TaskGenerator<SourceItem<TableMetadataModel>[]> {
    yield this.metadataService.loadMetadata({ dataSourceName: dataSource.name });
    const factTables = this.metadataService.all('table', dataSource.name).filter((t) => t.isFact === true);
    const sources = sortBy(factTables, ['name']).map((table) => ({
      name: table.name,
      friendlyName: table.friendlyName,
      description: table.description,
      source: table,
      isSuggested: dataSource.suggestedDataTables?.includes(table.id),
    }));
    return sources;
  }

  protected get path() {
    const sources = this.sourcePath as SourceItem[];
    return ['Data Sources', ...sources.map((source) => source.friendlyName || source.name)];
  }

  get breadcrumb() {
    const { sourcePath } = this;
    return this.path.slice(0, this.path.length - 1).map((path, idx) => ({
      name: path,
      path: sourcePath.slice(0, idx),
    }));
  }

  get title(): string {
    return this.path[this.path.length - 1];
  }

  @action
  protected setSourcePath(path: SourcePath): void {
    const { selecting: oldSelecting } = this;
    const [originalDataSource] = this.sourcePath;

    this.sourcePath = path;

    const [newDataSource] = this.sourcePath;
    if (newDataSource?.source && originalDataSource?.source !== newDataSource.source) {
      this.tables = taskFor(this.getTablesForDataSource).perform(newDataSource.source);
    }

    const { selecting: newSelecting } = this;
    this.checkDidResize(oldSelecting, newSelecting);
  }

  checkDidResize(oldSelecting: SelectingState, newSelecting: SelectingState) {
    if (oldSelecting !== newSelecting && (oldSelecting === 'columns' || newSelecting === 'columns')) {
      // Navigated to new state and it closed/opened the column config
      this.args.onResize?.();
    }
  }

  @action
  setSelectedDataSource(dataSource?: NaviDataSource) {
    if (dataSource) {
      this.setSourcePath([mapDataSource(dataSource)]);
    } else {
      this.setSourcePath([]);
    }
  }

  @action
  setSelectedTable(table?: TableMetadataModel) {
    if (table) {
      const dataSource = getDataSource(table.source);
      this.setSourcePath([mapDataSource(dataSource), mapTable(table)]);
      this.args.setTable(table);
    } else {
      // Remove table
      if (this.sourcePath.length === 2) {
        this.setSourcePath([this.sourcePath[0]]);
      }
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
        sprite.endAtPixel({ x });
        return move(sprite, { easing: easeIn });
      }),
      ...insertedSprites.map((sprite) => {
        const { left, width } = sprite.element.getBoundingClientRect();
        const x = left - 1.5 * width;
        sprite.startAtPixel({ x });
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
