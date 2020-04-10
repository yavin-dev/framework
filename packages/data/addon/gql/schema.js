/*
 * Copyright 2020, Verizon Media
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import gql from 'graphql-tag';

const schema = gql`
  type Table implements Node {
    id: String!
    name: String!
    description: String
    category: String
    metrics: MetricConnection
    cardinalitySize: CardinalitySize
    dimensions: DimensionConnection
    timeDimensions: TimeDimensionConnection
    tags: [String!]
  }

  type MetricConnection {
    pageInfo: PageInfo
    edges: [MetricEdge]!
  }

  type MetricEdge {
    cursor: String
    node: Metric!
  }

  type DimensionConnection {
    pageInfo: PageInfo
    edges: [DimensionEdge]!
  }

  type DimensionEdge {
    cursor: String
    node: Dimension
  }

  type TimeDimensionConnection {
    pageInfo: PageInfo
    edges: [TimeDimensionEdge]!
  }

  type TimeDimensionEdge {
    cursor: String
    node: TimeDimension
  }

  interface Node {
    id: String!
  }

  interface ColumnInterface {
    id: String!
    name: String
    description: String
    table: Table
    sourceColumn: ColumnInterface
    category: String
    valueType: ValueType
    tags: [String!]
  }

  type Metric implements Node & ColumnInterface {
    id: String!
    name: String
    description: String
    table: Table
    sourceColumn: Metric
    category: String
    valueType: ValueType
    tags: [String!]
    defaultFormat: String
    metricFunction: MetricFunction
  }

  type Dimension implements Node & ColumnInterface {
    id: String!
    name: String!
    description: String
    table: Table
    sourceColumn: Dimension
    category: String
    valueType: ValueType
    tags: [String!]
  }

  type TimeDimension implements Node & ColumnInterface {
    id: String!
    name: String!
    description: String
    table: Table
    sourceColumn: TimeDimension
    category: String
    valueType: ValueType
    tags: [String!]
    supportedGrains: [TimeGrain]
    timeZone: TimeZone
  }

  type MetricFunction {
    id: String!
    name: String
    description: String
    Arguments: [FunctionArgument]
  }

  type FunctionArgument {
    id: String!
    name: String
    description: String
    type: ValueType
    subType: String
  }

  enum CardinalitySize {
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

  enum ValueType {
    TIME
    NUMBER
    TEXT
    COORDINATE
    BOOLEAN
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
  }

  type Query {
    tables: [Table]
    table(id: String!): Table
  }
`;

export default schema;
