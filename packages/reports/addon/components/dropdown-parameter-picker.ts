/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { capitalize } from 'lodash-es';
import FilterFragment from 'navi-core/addon/models/bard-request-v2/fragments/filter';

interface Args {
  filter: FilterFragment;
  parameterIndex: number;
  updateParameters: () => void;
  parameterKeys: string[];
}

export default class ParameterPickerComponent extends Component<Args> {
  selectedParameter = Object.values(this.args.filter.parameters)[this.args.parameterIndex];

  get parameterOptions() {
    return this.args.filter.columnMetadata.parameters[this.args.parameterIndex].values;
  }

  get parameterName() {
    return capitalize(this.args.filter.columnMetadata.parameters[this.args.parameterIndex].name);
  }

  get parameterKey() {
    return this.args.parameterKeys[this.args.parameterIndex];
  }

  get parameterValue() {
    return this.args.filter.parameters[this.args.parameterKeys[this.args.parameterIndex]];
  }
}
