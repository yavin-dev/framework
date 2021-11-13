/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

const fields = [
  { name: 'id', longName: 'Id' },
  { name: 'desc', longName: 'Desc' },
];

export default [
  {
    name: 'platform',
    longName: 'Platform',
    cardinality: 5000,
    category: 'Other',
    fields: [
      {
        name: 'id',
        longName: 'Id',
        tags: ['show', 'id'],
      },
      {
        name: 'desc',
        longName: 'Desc',
        tags: ['show', 'desc'],
      },
    ],
  },
  {
    name: 'game',
    longName: 'Game',
    cardinality: 50000000,
    category: 'Other',
    fields,
  },
  {
    name: 'item',
    longName: 'Item',
    cardinality: 100,
    category: 'Other',
    fields,
  },
  {
    name: 'enemy',
    longName: 'Enemy',
    cardinality: 100,
    category: 'Character',
    fields,
  },
  {
    name: 'character',
    longName: 'Character',
    cardinality: 100,
    category: 'Character',
    fields,
  },
  {
    name: 'location',
    longName: 'Location',
    cardinality: 100,
    category: 'Other',
    fields,
  },
];
