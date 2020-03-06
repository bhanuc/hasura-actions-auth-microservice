import argon2 from 'argon2';

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

export async function generateHash(password: string): Promise<string> {
  return argon2.hash(password);
}
