import { Request, Response } from 'express';
import gql from 'graphql-tag';
import rasha from 'rasha';

import jwtConfig from '../config/jwt';
import { fetchGraphql } from '../utils/fetchGraphql';
import { generateHash, verifyPassword } from '../utils/passwordEncryption';
import { generateTokenFromApiResponse } from '../utils/tokenGeneration';

type Jwk = {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
};

async function getJwks(request: Request, response: Response) {
  const jwkFromPem = await rasha.import({ pem: jwtConfig.publicKey, public: true });

  const jwk: Jwk = {
    ...jwkFromPem,
    alg: 'RS256',
    use: 'sig',
    kid: jwtConfig.kid,
  };

  const jwks = { keys: [jwk] };

  response.setHeader('Content-Type', 'application/json');

  return response.status(200).send(JSON.stringify(jwks, null, 2) + '\n');
}

async function postSignup(request: Request, response: Response) {
  const { email, password } = request.body.input;

  const usersQuery = gql`
    query users($email: String!) {
      users(where: { email: { _eq: $email } }) {
        email
      }
    }
  `;

  const usersQueryResult = await fetchGraphql({ query: usersQuery, variables: { email } });

  if (usersQueryResult.errors) {
    return response.status(400).send({ message: JSON.stringify(usersQueryResult.errors) });
  }

  if (usersQueryResult.data.users.length) {
    return response.status(400).send({ message: 'An account with this email already exists.' });
  }

  const hashedPassword = await generateHash(password);

  const createUserMutation = gql`
    mutation($email: String!, $hashedPassword: String!) {
      insert_users(
        objects: [
          {
            email: $email
            password: $hashedPassword
            user_roles: {
              data: [
                {
                  role: { data: { name: "user" }, on_conflict: { constraint: roles_name_key, update_columns: [name] } }
                }
              ]
            }
          }
        ]
      ) {
        returning {
          id
          user_roles {
            role {
              name
            }
          }
        }
      }
    }
  `;

  const createUserMutationResult = await fetchGraphql({
    query: createUserMutation,
    variables: { email, hashedPassword },
  });

  if (createUserMutationResult.errors) {
    return response.status(400).send({ message: JSON.stringify(createUserMutationResult.errors) });
  }

  const accessToken = generateTokenFromApiResponse(createUserMutationResult.data.insert_users.returning[0]);

  return response.status(200).send({ accessToken });
}

async function postSignin(request: Request, response: Response) {
  const { email, password } = request.body.input;

  const usersQuery = gql`
    query users($email: String!) {
      users(where: { email: { _eq: $email } }) {
        id
        password
        user_roles {
          role {
            name
          }
        }
      }
    }
  `;

  const usersQueryResult = await fetchGraphql({ query: usersQuery, variables: { email } });

  if (usersQueryResult.errors) {
    return response.status(400).send({ message: JSON.stringify(usersQueryResult.errors) });
  }

  if (!usersQueryResult.data.users.length) {
    return response.status(400).send({ message: 'No user found for these credentials.' });
  }

  const { password: hashedPassword, ...queryResult } = usersQueryResult.data.users[0];

  const isPasswordCorrect = await verifyPassword(hashedPassword, password);

  if (!isPasswordCorrect) {
    return response.status(400).send({ message: 'No user found for these credentials.' });
  }

  const accessToken = generateTokenFromApiResponse(queryResult);

  return response.status(200).send({ accessToken });
}

export default {
  getJwks,
  postSignup,
  postSignin,
};
