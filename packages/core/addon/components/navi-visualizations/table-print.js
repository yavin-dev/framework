/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-visualizations/table-print
 *   model=model
 *   options=options
 *   onUpdateReport=(action 'onUpdateReport')
 * }}
 */
import Table from './table'

export default Table.extend({
  /**
   * @property {Array} classNames - list of component class names
   */
  classNames: [ 'table-widget', 'table-widget--print' ],

  /*
   * @property {Boolean} occlusion - whether or not to incremental render
   */
  occlusion: false
});
