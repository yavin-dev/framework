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
  parameterMetadata: FunctionParameter;
  parameterValue: unknown;
  onUpdate: (key: string, value: unknown) => void;
}

export default class ParameterPickerComponent extends Component<Args> {
  @tracked
  options: { groupName: string; options: (string | undefined)[] | undefined }[] = [];

  @action
  async fetchParameterOptions() {
    const valuesPromise = await this.args.parameterMetadata?.values;
    this.options = [
      {
        groupName: capitalize(this.args.parameterMetadata.name),
        options: valuesPromise?.map((el) => el.name ?? el.id),
      },
    ];
  }

  @action
  async onUpdate(selected: unknown) {
    let id = await this.args.parameterMetadata.values?.then((parameters) => {
      return parameters.find((value) => value.name === selected)?.id ?? selected;
    });
    this.args.onUpdate(this.args.parameterMetadata.id, id);
  }

  get select() {
    return this.args.parameterMetadata?.values?.then((parameters) => {
      return parameters.find((value) => value.id === this.args.parameterValue)?.name ?? this.args.parameterValue;
    });
  }
}
