import { YavinClientConfig } from '@yavin/client/config/datasources';

export const config: YavinClientConfig = {
  dataSources: [
    {
      name: 'bardOne',
      displayName: 'Bard One',
      description: 'Interesting User Insights',
      uri: 'https://data.naviapp.io',
      type: 'bard',
      options: {
        enableDimensionSearch: true,
        sinceOperatorEndPeriod: 'P3M',
      },
    },
    {
      name: 'bardTwo',
      displayName: 'Bard Two',
      description: 'Awesome Revenue Analytics',
      uri: 'https://data2.naviapp.com',
      type: 'bard',
    },
    {
      name: 'elideOne',
      displayName: 'Elide One',
      description: 'Elide One Description',
      uri: 'https://data.naviapp.io/graphql',
      type: 'elide',
      namespaces: [
        {
          name: 'DemoNamespace',
          displayName: 'Demo Namespace',
          description: 'Demo Namespace Description',
        },
      ],
    },
    {
      name: 'elideTwo',
      displayName: 'Elide Two',
      description: 'Elide Two Description',
      uri: 'https://data2.naviapp.com/graphql',
      type: 'elide',
    },
  ],
  defaultDataSource: 'bardOne',
  cardinalities: {
    small: 600,
    medium: 50000,
  },
  dimensionCache: {
    maxSize: 100,
    timeoutMs: 10000,
  },
};
