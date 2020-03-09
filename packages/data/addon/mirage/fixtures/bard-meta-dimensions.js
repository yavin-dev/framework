export default {
  defaultDims: [
    {
      name: 'os',
      longName: 'Operating System',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'userDeviceType',
      longName: 'User Device Type',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'age',
      longName: 'Age',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'currency',
      longName: 'Currency',
      cardinality: 500,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'displayCurrency',
      longName: 'Display Currency',
      cardinality: 54,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'gender',
      longName: 'Gender',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'propertyCountry',
      longName: 'Property Country',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'loginState',
      longName: 'Logged-in State',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'platform',
      longName: 'Platform',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'userDeviceTypeV3',
      longName: 'User Device Type V3',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'productFamily',
      longName: 'Product Family',
      cardinality: 100,
      category: 'Asset',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'property',
      longName: 'Property',
      cardinality: 5000,
      category: 'Asset',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'browser',
      longName: 'Browser',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'browserVersion',
      longName: 'Browser Version',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'productRegion',
      longName: 'Product Region',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'platformVersion',
      longName: 'Platform Version',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'screenType',
      longName: 'Screen Type',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'lang',
      longName: 'Language',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'userCountry',
      longName: 'User Country',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'userRegion',
      longName: 'User Region',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'userSubRegion',
      longName: 'User Sub Region',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'productSubRegion',
      longName: 'Product Sub Region',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'outflowChannel',
      longName: 'Outflow Channel',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'outflowSite',
      longName: 'Outflow Site',
      cardinality: 100,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'contextId',
      longName: 'Context Id',
      cardinality: 0,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'none'
    },
    {
      name: 'multiSystemId',
      longName: 'Multi System Id',
      cardinality: 9999999,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded',
      fields: [
        { name: 'id', tags: ['id'] },
        { name: 'desc', tags: ['description'] },
        { name: 'key', tags: ['primaryKey'] }
      ]
    },
    {
      name: 'userSignupDate',
      longName: 'User Signup Date',
      cardinality: 39896,
      category: 'test',
      datatype: 'date',
      storageStrategy: 'loaded'
    },
    {
      name: 'commaDim',
      longName: 'Dimension with comma',
      cardinality: 2,
      category: 'test',
      datatype: 'text',
      storageStrategy: 'loaded'
    }
  ],

  highCardinalityDims: [
    {
      name: 'eventId',
      longName: 'EventId',
      cardinality: 9999999,
      category: 'Asset',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'parentEventId',
      longName: 'Parent Event Id',
      cardinality: 9999999,
      category: 'Asset',
      datatype: 'text',
      storageStrategy: 'loaded'
    }
  ],

  blockheadDims: [
    {
      name: 'item',
      longName: 'Item',
      cardinality: 100,
      category: 'Personal',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'container',
      longName: 'Container',
      cardinality: 100,
      category: 'Personal',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'location',
      longName: 'Location',
      cardinality: 100,
      category: 'World',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'requirement',
      longName: 'Requirement',
      cardinality: 100,
      category: 'World',
      datatype: 'text',
      storageStrategy: 'loaded'
    },
    {
      name: 'recipe',
      longName: 'Recipe',
      cardinality: 100,
      category: 'Personal',
      datatype: 'text',
      storageStrategy: 'loaded'
    }
  ]
};
