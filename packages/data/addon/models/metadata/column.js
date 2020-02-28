/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A as arr } from '@ember/array';
import EmberObject from '@ember/object';

class Column extends EmberObject {
  /**
   * @property {String} identifierField - field used as the id
   */
  static identifierField = 'id';

  /**
   * @property {String} id
   */
  id;

  /**
   * @property {String} name - Display name
   */
  name;

  /**
   * @property {String} description
   */
  description;

  /**
   * @property {Table} table
   */
  table;

  /**
   * @property {Column} sourceColumn - defaults to self. point to the terminal source column
   */
  sourceColumn;

  /**
   * @property {String} category
   */
  category;

  /**
   * @property {ValueType} valueType - enum value describing what type the values of this column hold
   */
  valueType;

  /**
   * @property {Set} tags
   */
  tags = arr([]);
}

export default Column;
