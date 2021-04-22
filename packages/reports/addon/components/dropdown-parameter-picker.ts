/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { capitalize } from 'lodash-es';
import { tracked } from '@glimmer/tracking';
import FunctionParameter from 'navi-data/models/metadata/function-parameter';

interface Args {
  parameters: FunctionParameter[];
  parameterIndex: number;
  updateParameters: (key: string, value: string) => void;
  parameterKeys: string[];
  selectedParameter: string;
}

export default class ParameterPickerComponent extends Component<Args> {
  @tracked
  options: { groupName: string; options: string[] | undefined }[] = [];

  @action
  async fetchParameterOptions() {
    const valuesPromise = this.args.parameters[this.args.parameterIndex].values;
    this.options = [
      {
        groupName: this.parameterName,
        options: (await valuesPromise)?.map((el) => el.id),
      },
    ];
  }

  get parameterName() {
    return capitalize(this.args.parameters[this.args.parameterIndex].name);
  }

  get parameterKey() {
    return this.args.parameterKeys[this.args.parameterIndex];
  }

  @action
  updateSelected(id: string) {
    this.args.updateParameters(this.parameterKey, id);
  }
}
