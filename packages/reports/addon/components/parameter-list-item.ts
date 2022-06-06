/**
 * Copyright 2022, Yahoo Holdings Inc.
 *
 * Component that is used to show items in parameter value power select
 */
import Component from '@glimmer/component';
import { isPresent } from '@ember/utils';
import { PotentialParameterValue } from '@yavin/client/models/metadata/function-parameter';

export interface ParameterListItemArgs {
  argument: PotentialParameterValue;
}

export default class ParameterListItem extends Component<ParameterListItemArgs> {
  get value(): string {
    const displayField = isPresent(this.args.argument.name) ? 'name' : 'id';
    return `${this.args.argument[displayField]}` ?? '';
  }
}
