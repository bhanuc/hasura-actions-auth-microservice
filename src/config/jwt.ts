import fs from 'fs';
import murmur from 'murmurhash-js';

const privateKey = (process.env.AUTH_PRIVATE_KEY || fs.readFileSync('private.pem').toString()).replace(/\\n/g, '\n');
const publicKey = (process.env.AUTH_PUBLIC_KEY || fs.readFileSync('public.pem').toString()).replace(/\\n/g, '\n');

const kid = murmur.murmur3(publicKey, 128).toString();

export default { privateKey, publicKey, kid };
