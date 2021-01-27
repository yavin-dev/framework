/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@glimmer/component';

interface Args {
  tag: unknown;
  index: number;
  isRemovable: boolean;
  onRemoveTag: (index: number) => void;
}
export default class NaviTagInputTag extends Component<Args> {
  get extraClassNames() {
    return '';
  }

  get state(): string | undefined {
    return undefined;
  }
}
