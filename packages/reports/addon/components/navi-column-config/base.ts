/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Navi Request Column Config Base Component
 *
 * Usage:
 *  <NaviColumnConfig::Base
 *    @column={{this.column}}
 *    @onAddFilter={{this.onAddFilter}}
 *    @onRenameColumn={{this.onRenameColumn}}
 *    @onUpdateColumnParam={{this.onUpdateColumnParam}}
 *  />
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import FunctionParameterMetadataModel, {
  ColumnFunctionParametersValues,
} from 'navi-data/models/metadata/function-parameter';

interface NaviColumnConfigBaseArgs {
  column: TODO;
  metadata: TODO;
  onUpdateColumnName: (newColumnName: string) => void;
  onUpdateColumnParam: (param: string, paramValue: string) => void;
}

export default class NaviColumnConfigBase extends Component<NaviColumnConfigBaseArgs> {
  classId = guidFor(this);

  get apiColumnName(): string {
    return this.args.column.fragment.columnMetadata.id;
  }

  @action
  setParameter(param: FunctionParameterMetadataModel, paramValue: ColumnFunctionParametersValues[number]) {
    this.args.onUpdateColumnParam(param.id, paramValue.id);
  }
}
