/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
//@ts-expect-error
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';
import { inject as service } from '@ember/service';
import ReportModel from 'navi-core/models/report';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';
import { Parameters, ColumnType } from 'navi-data/adapters/facts/interface';
import { tracked } from '@glimmer/tracking';
import ColumnMetadataModel from 'navi-data/models/metadata/column';

interface NaviColumnConfigArgs {
  isOpen: boolean;
  report: ReportModel;
  lastAddedColumn: ColumnFragment;
  onAddColumn(metadata: ColumnMetadataModel, parameters: Parameters): void;
  onRemoveColumn(metadata: ColumnMetadataModel, parameters: Parameters): void;
  onToggleFilter(column: ColumnFragment): void;
  onRenameColumn(column: ColumnFragment, alias: string): void;
  onReorderColumn(column: ColumnFragment, index: number): void;
  openFilters(): void;
  drawerDidChange(): void;
}

type ConfigColumn = {
  type: ColumnType;
  name: string;
  displayName: string;
  isFiltered: boolean;
  isRemovable: boolean;
  fragment: ColumnFragment;
};

export default class NaviColumnConfig extends Component<NaviColumnConfigArgs> {
  /**
   * Dimension and metric columns from the request
   */
  @computed('args.report.request.{columns.@each.parameters,filters.[]}')
  get columns(): ConfigColumn[] {
    const { request } = this.args.report;
    if (request.table !== undefined) {
      const { metricColumns: metrics, dimensionColumns: dimensions, dimensionFilters, metricFilters } = request;

      const filteredDimensions = dimensionFilters.map(({ canonicalName }) => canonicalName);
      const filteredMetrics = metricFilters.map(({ canonicalName }) => canonicalName);
      const dimensionColumns = dimensions.map(dimension => {
        const { canonicalName: name, type } = dimension;
        return {
          type,
          name,
          displayName: this.getDisplayName(dimension),
          isFiltered: filteredDimensions.includes(name),
          isRemovable: true,
          fragment: dimension
        };
      });

      const metricColumns = metrics.map(metric => {
        const { canonicalName: name, type } = metric;
        return {
          type,
          name,
          displayName: this.getDisplayName(metric),
          isFiltered: filteredMetrics.includes(name),
          isRemovable: true,
          fragment: metric
        };
      });

      return [...dimensionColumns, ...metricColumns];
    }
    return [];
  }

  @service metricName: TODO;

  @tracked
  currentlyOpenColumn?: ConfigColumn;

  @tracked
  componentElement!: Element;

  getDisplayName(column: ColumnFragment) {
    const {
      alias,
      columnMetadata: { name },
      hasParametersSet,
      parameters
    } = column;

    if (alias) {
      return alias;
    }
    return hasParametersSet ? `${name} (${Object.values(parameters).join(' ')})` : name;
  }

  /**
   * Adds a copy of the given column to the request including its parameters
   * @action
   * @param column - The metric/dimension column to make a copy of
   */
  @action
  cloneColumn(column: ConfigColumn) {
    const { columnMetadata, parameters } = column.fragment;
    this.args.onAddColumn(columnMetadata, { ...parameters });
  }

  /**
   * @action
   * @param column - the column fragment to be renamed
   * @param alias - the new name for the column
   */
  @action
  renameColumn(column: ColumnFragment, alias: string) {
    this.args.onRenameColumn(column, alias);
  }

  /**
   * @action
   * @param column - the column fragment to be renamed
   * @param index - the new name for the column
   */
  @action
  reorderColumn(column: ColumnFragment, index: number) {
    this.args.onReorderColumn(column, index);
  }

  /**
   * Opens a column
   * @action
   * @param column - The column to open
   */
  @action
  openColumn(column: ConfigColumn) {
    this.currentlyOpenColumn = column;
  }

  /**
   * Stores element reference and opens the default column after render
   * @param element - element inserted
   */
  @action
  setupElement(element: Element) {
    this.componentElement = element;
  }

  /**
   * Drawer transition
   * @param context - animation context
   */
  @action
  *drawerTransition(context: TODO) {
    const { insertedSprites, removedSprites } = context;
    const offset = 500; // 2x the size of the drawer
    const x = this.componentElement.getBoundingClientRect().left - offset;
    yield Promise.all([
      ...removedSprites.map((sprite: TODO) => {
        sprite.applyStyles({ 'z-index': '1' });
        sprite.endAtPixel({ x });
        return move(sprite, { easing: easeIn });
      }),
      ...insertedSprites.map((sprite: TODO) => {
        sprite.startAtPixel({ x });
        sprite.applyStyles({ 'z-index': '1' });
        return move(sprite, { easing: easeOut });
      })
    ]);
    this.args.drawerDidChange?.();
  }
}
