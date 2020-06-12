/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import gql from 'graphql-tag';

const schema = gql`
  scalar DeferredID

  scalar Long

  scalar Date

  type TableConnection {
    pageInfo: PageInfo
    edges: [TableEdge!]!
  }

  type TableEdge {
    cursor: String
    node: Table!
  }

  type Table implements Node {
    id: DeferredID!
    name: String
    description: String
    category: String
    metrics: MetricConnection
    cardinality: com_yahoo_elide_datastores_aggregation_annotation_CardinalitySize
    dimensions: DimensionConnection
    timeDimensions: TimeDimensionConnection
    tableTags: [String!]
  }

  type MetricConnection {
    pageInfo: PageInfo
    edges: [MetricEdge!]!
  }

  type MetricEdge {
    cursor: String
    node: Metric!
  }

  type DimensionConnection {
    pageInfo: PageInfo
    edges: [DimensionEdge!]!
  }

  type DimensionEdge {
    cursor: String
    node: Dimension!
  }

  type TimeDimensionConnection {
    pageInfo: PageInfo
    edges: [TimeDimensionEdge!]!
  }

  type TimeDimensionEdge {
    cursor: String
    node: TimeDimension!
  }

  interface Node {
    id: DeferredID!
  }

  interface ColumnInterface {
    id: DeferredID!
    name: String
    description: String
    table: Table
    category: String
    valueType: com_yahoo_elide_datastores_aggregation_metadata_enums_ValueType
    columnTags: [String!]
    columnType: ColumnType
    expression: String
  }

  type Metric implements Node & ColumnInterface {
    id: DeferredID!
    name: String
    description: String
    table: Table
    category: String
    valueType: com_yahoo_elide_datastores_aggregation_metadata_enums_ValueType
    columnTags: [String!]
    defaultFormat: String
    metricFunction: metricFunction
    columnType: ColumnType
    expression: String
  }

  type Dimension implements Node & ColumnInterface {
    id: DeferredID!
    name: String!
    description: String
    table: Table
    category: String
    valueType: com_yahoo_elide_datastores_aggregation_metadata_enums_ValueType
    columnTags: [String!]
    columnType: ColumnType
    expression: String
  }

  type TimeDimension implements Node & ColumnInterface {
    id: DeferredID!
    name: String!
    description: String
    table: Table
    category: String
    valueType: com_yahoo_elide_datastores_aggregation_metadata_enums_ValueType
    columnTags: [String!]
    columnType: ColumnType
    expression: String
    supportedGrains: TimeDimensionGrainConnnection
    timeZone: TimeZone
  }

  type TimeDimensionGrainConnnection {
    edges: [TimeDimensionGrainEdge!]!
    pageInfo: PageInfo
  }

  type TimeDimensionGrainEdge {
    node: TimeDimensionGrain
    cursor: String!
  }

  type TimeDimensionGrain implements Node {
    id: DeferredID!
    expression: String
    grain: TimeGrain
  }

  type metricFunction {
    id: DeferredID!
    name: String
    description: String
    arguments: [functionArgument]
  }

  type functionArgument {
    id: DeferredID!
    name: String
    description: String
    valueType: com_yahoo_elide_datastores_aggregation_metadata_enums_ValueType
    type: FunctionArgumentType
    expression: String
  }

  enum FunctionArgumentType {
    ref
    primitive
  }

  enum com_yahoo_elide_datastores_aggregation_annotation_CardinalitySize {
    SMALL
    MEDIUM
    LARGE
  }

  enum TimeGrain {
    DAY
    WEEK
    MONTH
    QUARTER
    YEAR
  }

  enum com_yahoo_elide_datastores_aggregation_metadata_enums_ValueType {
    TIME
    NUMBER
    TEXT
    COORDINATE
    BOOLEAN
  }

  enum ColumnType {
    ref
    formula
    field
  }

  enum RelationshipOp {
    FETCH
    DELETE
    UPSERT
    REPLACE
    REMOVE
    UPDATE
  }

  type TimeZone { # modeled after java.util.TimeZone
    long: String
    short: String
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    totalRecords: Long
  }

  type Query {
    table(
      op: RelationshipOp
      ids: [String]
      filter: String
      sort: String
      first: String
      after: String
    ): TableConnection
  }
`;

export default schema;
