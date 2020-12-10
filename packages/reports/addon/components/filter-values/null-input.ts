/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import Args from './args-interface';
import { action } from '@ember/object';

export default class NullInput extends Component<Args> {
  @action
  setupNullValues() {
    const { values } = this.args.filter;
    if (!(values.length === 1 && values[0] === true)) {
      this.args.onUpdateFilter({ values: [true] });
    }
  }
}
