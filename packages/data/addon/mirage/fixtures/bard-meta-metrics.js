export default {
  defaultMetrics: [
    {
      category: 'Sessions',
      name: 'timeSpent',
      longName: 'Time Spent',
      type: 'number'
    },
    {
      category: 'Page Views',
      name: 'pageViews',
      longName: 'Page Views',
      type: 'number'
    },
    {
      category: 'Page Views',
      name: 'addPageViews',
      longName: 'Additive Page Views',
      type: 'number'
    },
    {
      category: 'Page Views',
      name: 'totalPageViews',
      longName: 'Total Page Views',
      type: 'number'
    },
    {
      category: 'Identifiers',
      name: 'regUsers',
      longName: 'Registered Users',
      type: 'number'
    },
    {
      category: 'Identifiers',
      name: 'uniqueIdentifier',
      longName: 'Unique Identifiers',
      type: 'number'
    },
    {
      category: 'Clicks',
      name: 'otherClicks',
      longName: 'Other Clicks',
      type: 'number'
    },
    {
      category: 'Clicks',
      name: 'adClicks',
      longName: 'Ad Clicks',
      type: 'number'
    },
    {
      category: 'Clicks',
      name: 'totalClicks',
      longName: 'Total Clicks',
      type: 'number'
    },
    {
      category: 'Clicks',
      name: 'navClicks',
      longName: 'Nav Link Clicks',
      type: 'number'
    },
    {
      category: 'Sessions',
      name: 'networkSessions',
      longName: 'Network Sessions',
      type: 'number'
    },
    {
      category: 'Sessions',
      name: 'propertySessions',
      longName: 'Property Sessions',
      type: 'number'
    },
    {
      category: 'Sessions',
      name: 'propertySubsessions',
      longName: 'Property Sub-Sessions',
      type: 'number'
    },
    {
      category: 'Identifiers',
      name: 'unregThirdPartyCookies',
      longName: 'UnRegistered Third Party Cookies',
      type: 'number'
    },
    {
      category: 'Trend',
      name: 'totalPageViewsWoW',
      longName: 'Total Page Views WoW',
      type: 'number'
    },
    {
      category: 'Revenue',
      name: 'revenue',
      longName: 'Revenue',
      type: 'money',
      parameters: {
        currency: {
          type: 'dimension',
          dimensionName: 'displayCurrency',
          defaultValue: 'USD'
        }
      }
    },
    {
      category: 'Revenue',
      name: 'platformRevenue',
      longName: 'Platform Revenue',
      type: 'money',
      parameters: {
        currency: {
          type: 'dimension',
          dimensionName: 'displayCurrency',
          defaultValue: 'USD'
        }
      }
    },
    {
      category: 'Clicks',
      name: 'buttons',
      longName: 'button click count',
      type: 'number',
      parameters: {
        type: {
          type: 'enum',
          values: [
            { id: 'l', description: 'Left' },
            { id: 'r', description: 'Right' },
            { id: 'm', description: 'Middle' }
          ],
          defaultValue: 'l'
        }
      }
    }
  ],

  dayAvgMetrics: [
    {
      category: 'Sessions',
      name: 'dayAvgTimeSpent',
      longName: 'Time Spent (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Page Views',
      name: 'dayAvgPageViews',
      longName: 'Page Views (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Page Views',
      name: 'dayAvgAddPageViews',
      longName: 'Additive Page Views (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Page Views',
      name: 'dayAvgTotalPageViews',
      longName: 'Total Page Views (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Identifiers',
      name: 'dayAvgRegUsers',
      longName: 'Registered Users (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Identifiers',
      name: 'dayAvgUnregThirdPartyCookies',
      longName: 'UnRegistered Third Party Cookies (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Identifiers',
      name: 'dayAvgUniqueIdentifier',
      longName: 'Unique Identifiers (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Clicks',
      name: 'dayAvgOtherClicks',
      longName: 'Other Clicks (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Clicks',
      name: 'dayAvgAdClicks',
      longName: 'Ad Clicks (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Clicks',
      name: 'dayAvgNavClicks',
      longName: 'Nav Link Clicks (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Clicks',
      name: 'dayAvgTotalClicks',
      longName: 'Total Clicks (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Sessions',
      name: 'dayAvgNetworkSessions',
      longName: 'Network Sessions (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Sessions',
      name: 'dayAvgPropertySessions',
      longName: 'Property Sessions (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Sessions',
      name: 'dayAvgPropertySubsessions',
      longName: 'Property Sub-Sessions (Daily Avg)'
    },
    {
      category: 'Ratios',
      name: 'totalClicksPerUniqueIdentifier',
      longName: 'Total Clicks per Unique Identifier',
      type: 'number'
    },
    {
      category: 'Ratios',
      name: 'pageViewsPerUniqueIdentifier',
      longName: 'Page Views per Unique Identifier',
      type: 'number'
    },
    {
      category: 'Ratios',
      name: 'addPageViewsPerUniqueIdentifier',
      longName: 'Additive Page Views per Unique Identifier',
      type: 'number'
    },
    {
      category: 'Ratios',
      name: 'totalPageViewsPerUniqueIdentifier',
      longName: 'Total Page Views per Unique Identifier',
      type: 'number'
    },
    {
      category: 'Ratios',
      name: 'dayAvgTotalClicksPerUniqueIdentifier',
      longName: 'Total Clicks per Unique Identifier (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Ratios',
      name: 'dayAvgPageViewsPerUniqueIdentifier',
      longName: 'Page Views per Unique Identifier (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Ratios',
      name: 'dayAvgAddPageViewsPerUniqueIdentifier',
      longName: 'Additive Page Views per Unique Identifier (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Ratios',
      name: 'dayAvgTotalPageViewsPerUniqueIdentifier',
      longName: 'Total Page Views per Unique Identifier (Daily Avg)',
      type: 'number'
    },
    {
      category: 'Ratios',
      name: 'dayAvgUniqueIdentifiersPerTotalUniqueIdentifiers',
      longName: 'Unique Identifiers (Daily Avg) per Total Unique Identifiers (Percentage)',
      type: 'number'
    }
  ],

  blockheadMetrics: [
    {
      category: 'Personal',
      name: 'ownedQuantity',
      longName: 'Quantity of thing',
      type: 'number'
    },
    {
      category: 'Personal',
      name: 'usedAmount',
      longName: 'Used Amount',
      type: 'number'
    },
    {
      category: 'Personal',
      name: 'personalSold',
      longName: 'Personally sold amount',
      type: 'number'
    },
    {
      category: 'World',
      name: 'available',
      longName: 'How many are available',
      type: 'number'
    },
    {
      category: 'World',
      name: 'globalySold',
      longName: 'How many have sold worldwide',
      type: 'number'
    }
  ]
};
