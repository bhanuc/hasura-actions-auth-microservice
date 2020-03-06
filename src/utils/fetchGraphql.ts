import { execute, makePromise, GraphQLRequest } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import fetch from 'isomorphic-fetch';

const link = new HttpLink({
  uri: process.env.HASURA_ENDPOINT,
  fetch,
  headers: {
    'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
  },
});

export async function fetchGraphql(operation: GraphQLRequest) {
  return makePromise(execute(link, operation));
}
