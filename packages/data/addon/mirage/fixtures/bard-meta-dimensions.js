export default {
  defaultDims: [
    {
      name: 'os',
      longName: 'Operating System',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'userDeviceType',
      longName: 'User Device Type',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'age',
      longName: 'Age',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'currency',
      longName: 'Currency',
      cardinality: 500,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'displayCurrency',
      longName: 'Display Currency',
      cardinality: 54,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'gender',
      longName: 'Gender',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'propertyCountry',
      longName: 'Property Country',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'loginState',
      longName: 'Logged-in State',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'platform',
      longName: 'Platform',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'userDeviceTypeV3',
      longName: 'User Device Type V3',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'productFamily',
      longName: 'Product Family',
      cardinality: 100,
      category: 'Asset',
      storageStrategy: 'loaded'
    },
    {
      name: 'property',
      longName: 'Property',
      cardinality: 5000,
      category: 'Asset',
      storageStrategy: 'loaded'
    },
    {
      name: 'browser',
      longName: 'Browser',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'browserVersion',
      longName: 'Browser Version',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'productRegion',
      longName: 'Product Region',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'platformVersion',
      longName: 'Platform Version',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'screenType',
      longName: 'Screen Type',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'lang',
      longName: 'Language',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'userCountry',
      longName: 'User Country',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'userRegion',
      longName: 'User Region',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'userSubRegion',
      longName: 'User Sub Region',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'productSubRegion',
      longName: 'Product Sub Region',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'outflowChannel',
      longName: 'Outflow Channel',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'outflowSite',
      longName: 'Outflow Site',
      cardinality: 100,
      category: 'test',
      storageStrategy: 'loaded'
    },
    {
      name: 'contextId',
      longName: 'Context Id',
      cardinality: 0,
      category: 'test',
      storageStrategy: 'none'
    },
    {
      name: 'multiSystemId',
      longName: 'Multi System Id',
      cardinality: 9999999,
      category: 'test',
      storageStrategy: 'loaded',
      fields: [{ name: 'id', tags: [] }, { name: 'desc', tags: ['description'] }, { name: 'key', tags: ['primaryKey'] }]
    }
  ],

  highCardinalityDims: [
    {
      name: 'eventId',
      longName: 'EventId',
      cardinality: 9999999,
      category: 'Asset',
      storageStrategy: 'loaded'
    },
    {
      name: 'parentEventId',
      longName: 'Parent Event Id',
      cardinality: 9999999,
      category: 'Asset',
      storageStrategy: 'loaded'
    }
  ]
};
