/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { capitalize } from 'lodash-es';
import { tracked } from '@glimmer/tracking';
import { ColumnMetadata } from 'navi-data/models/metadata/column';

interface Args {
  columnMetadata: ColumnMetadata;
  parameterIndex: number;
  updateParameters: (key: string, value: string) => void;
  parameterKeys: string[];
  selectedParameters: { key: string };
}

export default class ParameterPickerComponent extends Component<Args> {
  @tracked
  selectedParameter = Object.values(this.args.selectedParameters)[this.args.parameterIndex];

  @tracked
  options: { groupName: string; options: string[] | undefined }[] = [];

  @action
  async fetchParameterOptions() {
    const valuesPromise = this.args.columnMetadata.parameters[this.args.parameterIndex].values;
    this.options = [
      {
        groupName: this.parameterName,
        options: (await valuesPromise)?.map((el) => el.id),
      },
    ];
  }

  get parameterName() {
    return capitalize(this.args.columnMetadata.parameters[this.args.parameterIndex].name);
  }

  get parameterKey() {
    return this.args.parameterKeys[this.args.parameterIndex];
  }

  @action
  updateSelected(id: string) {
    this.selectedParameter = id;
    this.args.updateParameters(this.parameterKey, this.selectedParameter);
  }
}
