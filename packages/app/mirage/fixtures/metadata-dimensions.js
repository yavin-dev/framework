/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

const fields = [
  { name: 'id', longName: 'Id LongName' },
  { name: 'desc', longName: 'Desc LongName' },
];

export default [
  {
    name: 'platform',
    longName: 'PlatformL',
    cardinality: 5000,
    category: 'Other',
    fields: [
      {
        name: 'id',
        longName: 'Id LongName',
        tags: ['show', 'id'],
      },
      {
        name: 'desc',
        longName: 'Desc LongName',
        tags: ['show', 'desc'],
      },
    ],
  },
  {
    name: 'game',
    longName: 'GameL',
    cardinality: 50000000,
    category: 'Other',
    fields,
  },
  {
    name: 'item',
    longName: 'ItemL',
    cardinality: 100,
    category: 'Other',
    fields,
  },
  {
    name: 'enemy',
    longName: 'EnemyL',
    cardinality: 100,
    category: 'Character',
    fields,
  },
  {
    name: 'character',
    longName: 'CharacterL',
    cardinality: 100,
    category: 'Character',
    fields,
  },
  {
    name: 'location',
    longName: 'LocationL',
    cardinality: 100,
    category: 'Other',
    fields,
  },
];
