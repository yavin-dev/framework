/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Visualization Manifest File for the Table Visualization
 * This file registers the visualization with navi
 *
 */
import NaviVisualizationBaseManifest from './base';
import RequestFragment from 'navi-core/models/request';

export default class TableManifest extends NaviVisualizationBaseManifest {
  name = 'table';
  niceName = 'Data Table';
  icon = 'table';

  typeIsValid(_request: RequestFragment) {
    return true;
  }
}
