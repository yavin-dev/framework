/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A } from '@ember/array';
import Component from '@glimmer/component';
import NumberFormats from 'navi-core/utils/enums/number-formats';

interface Args {
  format: string;
  onUpdateFormat: (format: string) => void;
}

export default class NumberFormatSelectorComponent extends Component<Args> {
  /**
   * @property {Array} predefinedFormats
   * list of format types shown to the user
   */
  predefinedFormats = NumberFormats;

  /**
   * @property {Boolean} isCustomFormat
   * returns true if the current format
   * is not one of the predefined formats
   */
  get isCustomFormat() {
    const predefinedFormats = A(this.predefinedFormats);
    const { format } = this.args;
    const match = predefinedFormats.findBy('format', format);

    if (match === undefined) {
      return true;
    } else if (match.format === '') {
      return true;
    } else {
      return false;
    }
  }
}
