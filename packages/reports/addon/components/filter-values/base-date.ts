/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import { computed } from '@ember/object';
import Args from './args-interface';
import { Grain } from 'navi-data/addon/utils/date';

export default class BaseDateSelector extends Component<Args> {
  @computed('args.filter.{columnMetadata.metadataType,parameters.grain}')
  get timeGrain(): Grain {
    const { filter } = this.args;
    let timeGrain;
    if (filter.columnMetadata.metadataType === 'timeDimension') {
      timeGrain = filter.parameters.grain as Grain;
    }
    return timeGrain || 'day';
  }
}
