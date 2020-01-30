/*
 * Copyright 2020, Verizon Media
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import gql from 'graphql-tag';

const schema = gql`
  enum Type {
    DATE
    NUMBER
    TEXT
    COORDINATE
    BOOLEAN
    RELATIONSHIP
    ID
  }

  interface Column {
    id: ID!
    name: String
    longName: String
    description: String
    category: String
    ValueType: DataType
    columnTags: [String!] # Will make this into a Tag type later when valid values are more well defined
  }

  type Metric implements Column {
    id: ID!
    name: String
    longName: String
    description: String
    category: String
    ValueType: DataType
    columnTags: [String!] # Will make this into a Tag type later when valid values are more well defined
    defaultFormat: String
    SupportedFunction: MetricFunction
  }

  type DataType {
    Type: Type!
  }

  type MetricFunction {
    id: ID!
    name: String
    longName: String
    description: String
    Arguments: [FunctionArgument]
  }

  type FunctionArgument {
    id: ID!
    name: String
    description: String
    ValueType: DataType
  }

  type Query {
    getMetricByID(id: ID!): Metric
    getMetric(input: MetricInput): Metric
    allMetrics: [Metric]
  }

  input MetricInput {
    id: ID!
    # Will define what fields are needed in the input once we know more about the api's implementation
  }
`;

export default schema;
