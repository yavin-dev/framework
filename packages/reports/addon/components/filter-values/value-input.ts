/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import Args from './args-interface';

export default class ValueInputComponent extends Component<Args> {
  get value() {
    return this.args.filter.values?.[0];
  }

  @action
  setValue({ target: { value } }: { target: HTMLInputElement }) {
    this.args.onUpdateFilter({
      values: [value]
    });
  }
}
