/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { Factory } from 'miragejs';

export default Factory.extend({
  index: (i: number) => i,

  id() {
    return `tableSource${this.index}`;
  },

  valueSourceIds() {
    return ['table0.dimension0'];
  },
});
