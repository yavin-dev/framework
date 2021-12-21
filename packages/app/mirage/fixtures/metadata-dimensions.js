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
    category: 'Order',
    name: 'crmLineMasterOrderCurrencyCode',
    longName: 'Order Currency',
    description: 'Billing currency of the order.',
    datatype: 'number',
    fields: [
      {
        name: 'id',
        description: 'Billing currency of the order.',
        tags: ['primaryKey'],
      },
    ],
    values: 'https://uad-data.digits.ouryahoo.com:4443/v1/dimensions/crmLineMasterOrderCurrencyCode/values',
    cardinality: 46,
    storageStrategy: 'loaded',
    tables: [
      {
        category: 'General',
        name: 'allUad',
        longName: 'All UAD',
        granularity: 'day',
        uri: 'https://uad-data.digits.ouryahoo.com:4443/v1/tables/allUad/day',
      },
      {
        category: 'General',
        name: 'allUad',
        longName: 'All UAD',
        granularity: 'week',
        uri: 'https://uad-data.digits.ouryahoo.com:4443/v1/tables/allUad/week',
      },
    ],
  },
  {
    name: 'location',
    longName: 'Location',
    cardinality: 100,
    category: 'Other',
    fields,
  },
];
