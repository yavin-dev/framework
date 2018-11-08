/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Delivery Rules Mock Data
 */

export default [
  {
    id: 1,
    createdOn: '2017-01-01 00:00:00',
    updatedOn: '2017-01-01 00:00:00',
    ownerId: 'navi_user',
    deliveredItemId: {
      type: 'report',
      id: 3
    },
    deliveryType: 'report',
    frequency: 'week',
    schedulingRules: {
      stopAfter: '2017-09-04 00:00:00',
      every: '2 weeks'
    },
    format: {
      type: 'csv'
    },
    recipients: ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
    version: 1
  },
  {
    id: 2,
    createdOn: '2017-07-01 00:00:00',
    updatedOn: '2017-08-01 00:00:00',
    ownerId: 'navi_user',
    deliveredItemId: {
      type: 'report',
      id: 4
    },
    deliveryType: 'report',
    frequency: 'month',
    schedulingRules: {
      stopAfter: '2017-09-01 00:00:00',
      every: '2 weeks'
    },
    format: {
      type: 'csv'
    },
    recipients: ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
    version: 1
  },
  {
    id: 3,
    createdOn: '2017-01-01 00:00:00',
    updatedOn: '2017-01-01 00:00:00',
    ownerId: 'navi_user',
    deliveredItemId: {
      type: 'dashboard',
      id: 2
    },
    deliveryType: 'dashboard',
    frequency: 'week',
    schedulingRules: {
      stopAfter: '2017-09-04 00:00:00',
      every: '2 weeks'
    },
    format: {
      type: 'pdf'
    },
    recipients: ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
    version: 1
  }
];
