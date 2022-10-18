/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { helper } from '@ember/component/helper';
import type EmberArray from '@ember/array';

type Layout = EmberArray<LayoutWidget> | Array<LayoutWidget>;

type LayoutWidget = {
  column: number;
  row: number;
  height: number;
  width: number;
  widgetId: number;
};

export function sortByLayout([layout]: [Layout]): LayoutWidget[] {
  //extract something sortable in case of FragmentArray/EmberArray and copy array (shallow is fine since we do not manipulate objects)
  const sortedLayout = [...('toArray' in layout ? layout.toArray() : layout)];
  //sort by row and then by column
  sortedLayout.sort((a: LayoutWidget, b: LayoutWidget) => {
    if (a.row === b.row) {
      return a.column - b.column;
    } else {
      return a.row - b.row;
    }
  });
  return sortedLayout;
}

export default helper(sortByLayout);
