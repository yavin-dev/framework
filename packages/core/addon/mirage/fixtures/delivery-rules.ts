/**
 * Copyright 2022, Yahoo Holdings Inc.
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
      id: 3,
    },
    name: 'Email delivered csv every week',
    delivery: 'email',
    deliveryType: 'report',
    frequency: 'week',
    schedulingRules: {
      stopAfter: '2017-09-04 00:00:00',
      every: '2 weeks',
    },
    format: {
      type: 'csv',
    },
    recipients: ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
    version: 1,
    isDisabled: false,
  },
  {
    id: 2,
    createdOn: '2017-07-01 00:00:00',
    updatedOn: '2017-08-01 00:00:00',
    ownerId: 'navi_user',
    deliveredItemId: {
      type: 'report',
      id: 4,
    },
    name: 'Email delivered csv every month',
    delivery: 'email',
    deliveryType: 'report',
    frequency: 'month',
    schedulingRules: {
      stopAfter: '2017-09-01 00:00:00',
      every: '2 weeks',
    },
    format: {
      type: 'csv',
    },
    recipients: ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
    version: 1,
    isDisabled: false,
  },
  {
    id: 3,
    createdOn: '2017-01-01 00:00:00',
    updatedOn: '2017-01-01 00:00:00',
    ownerId: 'navi_user',
    deliveredItemId: {
      type: 'dashboard',
      id: 2,
    },
    name: 'Email delivered pdf every week',
    delivery: 'email',
    deliveryType: 'dashboard',
    frequency: 'week',
    schedulingRules: {},
    format: {
      type: 'pdf',
    },
    recipients: ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
    version: 1,
    isDisabled: false,
  },
  {
    id: 4,
    createdOn: '2017-01-01 00:00:00',
    updatedOn: '2017-01-01 00:00:00',
    ownerId: 'navi_user',
    deliveredItemId: {
      type: 'dashboard',
      id: 3,
    },
    name: 'Email delivered gsheet every week',
    deliveryType: 'dashboard',
    frequency: 'week',
    delivery: 'email',
    schedulingRules: {},
    format: {
      type: 'gsheet',
    },
    recipients: ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
    version: 1,
    isDisabled: false,
  },
  {
    id: 5,
    createdOn: '2017-01-01 00:00:00',
    updatedOn: '2017-01-01 00:00:00',
    ownerId: 'navi_user',
    deliveredItemId: {
      type: 'report',
      id: 2,
    },
    name: 'Email delivered csv every week',
    deliveryType: 'report',
    delivery: 'email',
    frequency: 'week',
    schedulingRules: {},
    format: {
      type: 'gsheet',
      options: {
        overwriteFile: true,
      },
    },
    recipients: ['user-or-list1@navi.io', 'user-or-list2@navi.io'],
    version: 1,
    isDisabled: false,
  },
];
