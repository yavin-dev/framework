/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { capitalize } from 'lodash-es';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { parseParameterValue } from 'navi-data/utils/metric';
import type FunctionParameter from '@yavin/client/models/metadata/function-parameter';
import type { PotentialParameterValue } from '@yavin/client/models/metadata/function-parameter';
import type { ParameterValue } from '@yavin/client/request';
//@ts-ignore
import type { Dropdown } from 'ember-basic-dropdown/components/basic-dropdown';

interface Args {
  parameterMetadata: FunctionParameter;
  parameterValue: ParameterValue;
  onUpdate: (key: string, value: ParameterValue) => void;
}

export default class ParameterPickerComponent extends Component<Args> {
  @tracked
  options: { groupName: string; options: PotentialParameterValue[] }[] = [];

  get selected() {
    return this.args.parameterMetadata?.values?.then(
      (v) => v.find((value) => value.id === this.args.parameterValue)?.name ?? this.args.parameterValue
    );
  }

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
  onKeyDown(dropdown: Dropdown, e: KeyboardEvent) {
    if (e.key === 'Enter') {
      dropdown.actions.close();
    }
  }

  @action
  onInputClose(dropdown: Dropdown) {
    const { uniqueId } = dropdown;
    const inputEl = document.querySelector(`#dropdown-parameter-picker-input-${uniqueId}`) as HTMLInputElement;
    assert('Unable to find input element', inputEl);
    const inputValue = inputEl.value;
    this.onUpdate({ id: inputValue, name: inputValue });
  }

  @action
  onUpdate({ id: rawParamValue }: PotentialParameterValue) {
    const value = parseParameterValue(this.args.parameterMetadata, rawParamValue);
    this.args.onUpdate(this.args.parameterMetadata.id, value);
  }
}
