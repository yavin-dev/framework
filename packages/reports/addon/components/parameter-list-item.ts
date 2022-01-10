/**
 * Copyright 2022, Yahoo Holdings Inc.
 *
 * Component that is used to show items in parameter value power select
 */
import Component from '@glimmer/component';
import { PotentialParameterValue } from 'navi-data/addon/models/metadata/function-parameter';

export interface ParameterListItemArgs {
  argument: PotentialParameterValue;
}

export default class ParameterListItem extends Component<ParameterListItemArgs> {
  get value(): string {
    const displayField = this.args.argument.description ? 'description' : 'name';
    return this.args.argument[displayField] ?? '';
  }
}
