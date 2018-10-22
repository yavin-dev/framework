/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Delivery Rules Mock Data
 */

export default [
  {
    id: 1,
    createdOn: '2018-01-01 00:00:00',
    updatedOn: '2018-01-01 00:00:00',
    ownerId: 'navi_user',
    deliveredItemId: 1,
    deliveryType: 'report',
    frequency: 'week',
    schedulingRules: {
      stopAfter: '2018-09-04 00:00:00',
      every: '2 weeks'
    },
    format: {
      type: 'pdf'
    },
    recipients: ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
    version: 1
  },
  {
    id: 2,
    createdOn: '2018-07-01 00:00:00',
    updatedOn: '2018-08-01 00:00:00',
    ownerId: 'navi_user',
    deliveredItemId: 2,
    deliveryType: 'report',
    frequency: 'month',
    schedulingRules: {
      stopAfter: '2018-09-01 00:00:00',
      every: '2 weeks'
    },
    format: {
      type: 'csv'
    },
    recipients: ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
    version: 1
  }
];
