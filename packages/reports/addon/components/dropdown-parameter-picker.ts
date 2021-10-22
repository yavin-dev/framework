/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { capitalize } from 'lodash-es';
import { tracked } from '@glimmer/tracking';
import FunctionParameter, { ColumnFunctionParametersValues } from 'navi-data/models/metadata/function-parameter';

interface Args {
  parameterMetadata: FunctionParameter;
  parameterValue: unknown;
  onUpdate: (key: string, value: unknown) => void;
}

export default class ParameterPickerComponent extends Component<Args> {
  @tracked
  options: { groupName: string; options: ColumnFunctionParametersValues | undefined }[] = [];

  @action
  async fetchParameterOptions() {
    const valuesPromise = await this.args.parameterMetadata?.values;
    this.options = [
      {
        groupName: capitalize(this.args.parameterMetadata.name),
        options: valuesPromise,
      },
    ];
  }

  @action
  onUpdate(selected: any) {
    this.args.onUpdate(this.args.parameterMetadata.id, selected.id);
  }

  get select() {
    return this.args.parameterMetadata?.values?.then((parameters) => {
      return parameters.find((value) => value.id === this.args.parameterValue)?.name ?? this.args.parameterValue;
    });
  }
}
