/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { capitalize } from 'lodash-es';
import { tracked } from '@glimmer/tracking';
import type FunctionParameter from 'navi-data/models/metadata/function-parameter';
import type { PotentialParameterValue } from 'navi-data/models/metadata/function-parameter';
import type { ParameterValue } from 'navi-data/addon/adapters/facts/interface';

interface Args {
  parameterMetadata: FunctionParameter;
  parameterValue: ParameterValue;
  onUpdate: (key: string, value: ParameterValue) => void;
}

export default class ParameterPickerComponent extends Component<Args> {
  @tracked
  options: { groupName: string; options: PotentialParameterValue[] }[] = [];

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
  onUpdate(selected: PotentialParameterValue) {
    this.args.onUpdate(this.args.parameterMetadata.id, selected.id);
  }

  get selected() {
    return this.args.parameterMetadata?.values?.then((parameters) => {
      return parameters.find((value) => value.id === this.args.parameterValue)?.name ?? this.args.parameterValue;
    });
  }
}
