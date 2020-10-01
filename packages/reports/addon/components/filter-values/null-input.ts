/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import Args from './args-interface';

export default class NullInput extends Component<Args> {
  constructor(owner: unknown, args: Args) {
    super(owner, args);
    const {
      onUpdateFilter,
      filter: { values }
    } = this.args;

    /*
     * Since this operator doesn't require values, set an empty array
     */
    if (values.length !== 0) {
      onUpdateFilter({ values: [] });
    }
  }
}
