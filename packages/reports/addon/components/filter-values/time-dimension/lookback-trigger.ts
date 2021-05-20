/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';

interface Args {
  extra: {
    placeholder?: string;
    value: string;
    onUpdate(value: string): void;
  };
}

export default class LookbackTrigger extends Component<Args> {
  @action
  focusOut({ target }: { target: HTMLInputElement }) {
    // If the input element's value is empty, reset it to show the current value
    if (isEmpty(target.value)) {
      target.value = this.args.extra.value;
    }
  }
}
