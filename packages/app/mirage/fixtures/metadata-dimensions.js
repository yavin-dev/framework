/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

const fields = [
  { name: 'id', longName: 'LongId' },
  { name: 'desc', longName: 'LongDesc' },
];

export default [
  {
    name: 'platform',
    longName: 'LongPlatform',
    cardinality: 5000,
    category: 'Other',
    fields: [
      {
        name: 'id',
        longName: 'LongId',
        tags: ['show', 'id'],
      },
      {
        name: 'desc',
        longName: 'LongDesc',
        tags: ['show', 'desc'],
      },
    ],
  },
  {
    name: 'game',
    longName: 'LongGame',
    cardinality: 50000000,
    category: 'Other',
    fields,
  },
  {
    name: 'item',
    longName: 'LongItem',
    cardinality: 100,
    category: 'Other',
    fields,
  },
  {
    name: 'enemy',
    longName: 'LongEnemy',
    cardinality: 100,
    category: 'Character',
    fields,
  },
  {
    name: 'character',
    longName: 'LongCharacter',
    cardinality: 100,
    category: 'Character',
    fields,
  },
  {
    name: 'location',
    longName: 'LongLocation',
    cardinality: 100,
    category: 'Other',
    fields,
  },
];
