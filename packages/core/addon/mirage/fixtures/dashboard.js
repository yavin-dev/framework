export default [
  {
    id: 1,
    title: 'Tumblr Goals Dashboard',
    authorId: 'navi_user',
    dashboardWidgetIds: [1, 2, 3],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
    deliveryRuleIds: [],
    presentation: {
      version: 1,
      layout: [
        { column: 0, row: 0, height: 4, width: 6, widgetId: 1 },
        { column: 6, row: 0, height: 4, width: 6, widgetId: 2 },
        { column: 0, row: 4, height: 4, width: 12, widgetId: 3 }
      ],
      columns: 12
    }
  },
  {
    id: 2,
    title: 'Dashboard 2',
    authorId: 'navi_user',
    dashboardWidgetIds: [4, 5],
    createdOn: '2016-02-01 00:00:00',
    updatedOn: '2016-02-01 00:00:00',
    deliveryRuleIds: [3],
    filters: [
      {
        dimension: 'property',
        operator: 'contains',
        field: 'id',
        values: ['114', '100001']
      },
      {
        dimension: 'property',
        operator: 'notin',
        field: 'id',
        values: ['1']
      },
      {
        dimension: 'property',
        operator: 'notin',
        field: 'id',
        values: ['2', '3', '4']
      },
      {
        dimension: 'eventId',
        operator: 'in',
        field: 'id',
        values: ['1']
      }
    ],
    presentation: {
      version: 1,
      layout: [
        { column: 0, row: 0, height: 6, width: 9, widgetId: 4 },
        { column: 0, row: 6, height: 5, width: 9, widgetId: 5 }
      ],
      columns: 40
    }
  },
  {
    id: 3,
    title: 'Dashboard 3',
    authorId: 'ciela',
    dashboardWidgetIds: [],
    createdOn: '2016-01-03 00:00:00',
    updatedOn: '2016-01-03 00:00:00',
    deliveryRuleIds: [],
    presentation: {
      version: 1,
      layout: [{ column: 0, row: 0, height: 6, width: 9, widgetId: 4 }],
      columns: 40
    }
  },
  {
    id: 4,
    title: 'Dashboard 4',
    authorId: 'ciela',
    dashboardWidgetIds: [],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
    deliveryRuleIds: [],
    filters: [
      {
        dimension: 'userSignupDate',
        operator: 'lt',
        field: 'id',
        values: ['2019-05-05']
      }
    ],
    presentation: {
      version: 1,
      layout: [], //TODO
      columns: 15
    }
  },
  {
    id: 5,
    title: 'Empty Dashboard',
    authorId: 'navi_user',
    dashboardWidgetIds: [],
    createdOn: '2016-01-01 03:00:00',
    updatedOn: '2016-01-01 03:00:00',
    deliveryRuleIds: [],
    presentation: {
      version: 1,
      layout: [],
      columns: 15
    }
  }
];
