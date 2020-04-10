/*
 * Copyright 2020, Verizon Media
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import gql from 'graphql-tag';
import TableFragment from '../fragments/table';

const query = gql`
  query($id: String!) {
    table(id: $id) {
      ...TableFragment
    }
  }
  ${TableFragment}
`;

export default query;
