/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import gql from 'graphql-tag';

const schema = gql`
  scalar DeferredID

  scalar Long

  scalar Date

  scalar URL

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
    friendlyName: String
    isFact: Boolean
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
    friendlyName: String
    description: String
    table: Table
    category: String
    valueType: com_yahoo_elide_datastores_aggregation_metadata_enums_ValueType
    tags: [String!]
    columnType: ColumnType
    expression: String
  }

  type Metric implements Node & ColumnInterface {
    id: DeferredID!
    name: String
    friendlyName: String
    description: String
    table: Table
    category: String
    valueType: com_yahoo_elide_datastores_aggregation_metadata_enums_ValueType
    tags: [String!]
    defaultFormat: String
    metricFunction: metricFunction
    columnType: ColumnType
    expression: String
  }

  enum ValueSourceType {
    ENUM
    TABLE
    NONE
  }

  type Dimension implements Node & ColumnInterface {
    id: DeferredID!
    name: String!
    friendlyName: String
    description: String
    table: Table
    category: String
    valueType: com_yahoo_elide_datastores_aggregation_metadata_enums_ValueType
    tags: [String!]
    columnType: ColumnType
    expression: String
    valueSourceType: ValueSourceType!
    tableSource: String
    values: [String]
  }

  type TimeDimension implements Node & ColumnInterface {
    id: DeferredID!
    name: String!
    friendlyName: String
    description: String
    table: Table
    category: String
    valueType: com_yahoo_elide_datastores_aggregation_metadata_enums_ValueType
    tags: [String!]
    columnType: ColumnType
    expression: String
    supportedGrain: TimeDimensionGrainConnection
    timeZone: TimeZone
  }

  type TimeDimensionGrainConnection {
    edges: [TimeDimensionGrainEdge!]!
    pageInfo: PageInfo
  }

  type TimeDimensionGrainEdge {
    cursor: String
    node: TimeDimensionGrain!
  }

  type TimeDimensionGrain implements Node {
    id: DeferredID!
    expression: String
    format: String
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

  type AsyncQuery {
    id: DeferredID
    asyncAfterSeconds: Int
    createdOn: Date
    query: String
    queryType: QueryType
    status: QueryStatus
    updatedOn: Date
    result(op: RelationshipOp = FETCH, data: AsyncQueryResultInput): AsyncQueryResult
  }

  type AsyncQueryEdge {
    node: AsyncQuery
    cursor: String
  }

  type AsyncQueryConnection {
    edges: [AsyncQueryEdge]
    pageInfo: PageInfo
  }

  type AsyncQueryResult {
    id: DeferredID
    contentLength: Int
    createdOn: Date
    responseBody: String
    recordCount: Int
    httpStatus: Int
    updatedOn: Date
    query(op: RelationshipOp = FETCH, data: AsyncQueryInput): AsyncQuery
  }

  type TableExport {
    id: DeferredID
    asyncAfterSeconds: Int
    createdOn: Date
    query: String
    queryType: QueryType
    resultType: TableExportResultType
    status: QueryStatus
    updatedOn: Date
    result(op: RelationshipOp = FETCH, data: TableExportResultInput): TableExportResult
  }

  type TableExportEdge {
    node: TableExport
    cursor: String
  }

  type TableExportConnection {
    edges: [TableExportEdge]
    pageInfo: PageInfo
  }

  type TableExportResult {
    id: DeferredID
    createdOn: Date
    recordCount: Int
    httpStatus: Int
    updatedOn: Date
    url: URL
    message: String
    query(op: RelationshipOp = FETCH, data: TableExportInput): TableExport
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
    HOUR
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

  enum QueryType {
    GRAPHQL_V1_0
    JSONAPI_V1_0
  }

  enum QueryStatus {
    COMPLETE
    QUEUED
    PROCESSING
    CANCELLED
    TIMEDOUT
    FAILURE
  }

  enum TableExportResultType {
    CSV
    JSON
  }

  input AsyncQueryInput {
    id: ID
    asyncAfterSeconds: Int
    createdOn: Date
    query: String
    queryType: QueryType
    status: QueryStatus
    updatedOn: Date
    result: AsyncQueryResultInput
  }

  input AsyncQueryResultInput {
    id: ID
    contentLength: Int
    createdOn: Date
    responseBody: String
    httpStatus: Int
    recordCount: Int
    updatedOn: Date
    query: AsyncQueryInput
  }

  input TableExportInput {
    id: ID
    asyncAfterSeconds: Int
    createdOn: Date
    query: String
    queryType: QueryType
    resultType: TableExportResultType
    status: QueryStatus
    updatedOn: Date
    result: TableExportResultInput
  }

  input TableExportResultInput {
    id: ID
    createdOn: Date
    httpStatus: Int
    recordCount: Int
    updatedOn: Date
    url: URL
    message: String
    query: TableExportInput
  }

  type Query {
    table(
      op: RelationshipOp = FETCH
      ids: [String]
      filter: String
      sort: String
      first: String
      after: String
    ): TableConnection
    asyncQuery(
      op: RelationshipOp = FETCH
      ids: [String]
      filter: String
      sort: String
      first: String
      after: String
      data: [AsyncQueryInput]
    ): AsyncQueryConnection
  }

  type Mutation {
    asyncQuery(
      op: RelationshipOp = FETCH
      ids: [String]
      filter: String
      sort: String
      first: String
      after: String
      data: [AsyncQueryInput]
    ): AsyncQueryConnection
  }
`;

export default schema;
