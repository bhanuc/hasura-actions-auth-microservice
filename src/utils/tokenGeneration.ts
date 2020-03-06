import jwt from 'jsonwebtoken';

import jwtConfig from '../config/jwt';

export function generateTokenFromApiResponse(response: { id: string; user_roles: [{ role: { name: string } }] }) {
  const { id, user_roles } = response;

  const allowedRoles = user_roles.map(user_role => user_role.role.name);

  const hasuraClaims = {
    'x-hasura-allowed-roles': allowedRoles,
    'x-hasura-default-role': 'anonymous',
    'x-hasura-user-id': id,
  };

  const signOptions = {
    expiresIn: '30d',
  };

  const claim = {
    sub: id.toString(),
    'https://hasura.io/jwt/claims': hasuraClaims,
  };

  return jwt.sign(claim, jwtConfig.privateKey, signOptions);
}
