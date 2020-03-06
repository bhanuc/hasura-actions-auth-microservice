# Hasura Authentication Microservice

This is a microservice that enables JWT authentication for Hasura. It is built using NodeJS and Typescript.

The endpoints that this microservice exposes can be used as actions (more on actions).

## Prerequisites

Make sure you have these prerequisites installed:

- NodeJS 10+
- PostgreSQL
- A functioning Hasura endpoint (locally using Docker or on a cloud service)

## Hasura configuration

#### Tables

The microservice expects three tables to be created and accessible:

- `users`:
  - `id`: Primary key. Can be an integer or uuid.
  - `email`: String. Unique identifier to sign up/sign in.
  - `password`: String. Hashed password with argon2.


- `roles`:
  - `id`: Primary key. Can be an integer or uuid.
  - `name`: String. Unique identifier.

- `user_role`:
  - `id`: Primary key. Can be an integer or uuid.
  - `role_id`: Foreign key that references the `id` of the `role` table.
  - `user_id`: Foreign key that references the `id` of the `user` table.

It is possible to add more fields to the user table such as `first_name`, `last_name`, ... and it is also possible to use different unique identifier to sign up/sign in with such as a `phone_number` or `username`. This is simply a matter of tweaking the underling JS code this microservice provides.

#### JWKS Configuration

We need to make our Hasura endpoint is aware of the JWT configuration we have in place. We do this by setting the `HASURA_GRAPHQL_JWT_SECRET` environment variable in our `docker-compose.yaml` or as part of our CLI command to run the engine.

Setting the `HASURA_GRAPHQL_JWT_SECRET` environment variable can be done in two ways:

- We can use our public key in PEM format with the line breaks escaped (see the next section on how to do this).
  ```json
  { "type": "RS256", "key": "<AUTH_PUBLIC_KEY>" }
  ```
- We can provide a jwks_url, which this microservice also provides. 
  ```json
  { "type": "RS256", "jwk_url": "hostname:port/jwks" }
  ```
  _Sidenote_: If you are using Docker to run your Hasura Engine locally, the JWKS url will be `http://host.docker.internal:<port>/jwks`

### Local setup

##### Setting up the directory
If you made sure the prerequisites are in place. You can go ahead and clone this repo.

```bash
# Clone the repo
git clone https://github.com/reinvanimschoot/hasura-auth-actions-microservice

# Change directory
cd hasura-auth-actions-microservice

# Install dependencies
yarn
```

##### Setting up the RSA keys/environment variables

Make sure you rename the `.env.example` file to `.env`.

For our JWT/JWKS configuration, we need to generate a pair of RSA keys.

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout > public.pem
```

This will create a `private.pem` and a `public.pem`.

Since we want to use these keys as environment variables, we need to also format these keys in an escaped format. That way, we can add them to our `.env` file.

Let's start with the private key.

```bash
awk -v ORS='\n' '1' private.pem
```

This will print your private key in your CLI in an escaped format that looks something like this:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAsv4u3FIYrDT9sovTOzZUVkOFW9Cvp2HNfQQeqWZ2rrAeuQ4k
...
5HmkI6MdOAkRxiBAVawMV7Kqm++fW5MbLHb5Gcu95scAgcwP7u8t
-----END RSA PRIVATE KEY-----
```

But just a lot longer.

Make sure you copy the whole key and paste it in your `.env` file as `AUTH_PRIVATE_KEY`.

Now do the same thing for your public key.

```bash
awk -v ORS='\n' '1' public.pem
```
Copy this key and paste it in your `.env` file as `AUTH_PUBLIC_KEY`.

If you want to use the key as `HASURA_GRAPHQL_JWT_SECRET`, make sure to copy it there as well.

Now make sure you also provide the correct values for the other environment variables in your `.env` file:

- `DATABASE_URL`
- `HASURA_ENDPOINT`
- `HASURA_ADMIN_SECRET`

##### Starting the server

That's it for the configuration!

```bash
yarn dev
```

## Endpoints

### Signup

Once deployed or started locally, we can create an user using `/signup` API like below:

```bash
curl -H "Content-Type: application/json" \
     -d'{"username": "test123", "password": "test123", "confirmPassword": "test123"}' \
     http://localhost:8080/signup
```

On success, we get the response:

```json
{
  "id": "907f0dc7-6887-4232-8b6e-da3d5908f137",
  "username": "test123",
  "roles": ["user"],
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoicGlsb3UiLCJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsibWFuYWdlciIsInVzZXIiXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoidXNlciIsIngtaGFzdXJhLXVzZXItaWQiOiI5MDdmMGRjNy02ODg3LTQyMzItOGI2ZS1kYTNkNTkwOGYxMzcifSwiaWF0IjoxNTQ4OTI5MTY2LCJleHAiOjE1NTE1MjExNjYsInN1YiI6IjkwN2YwZGM3LTY4ODctNDIzMi04YjZlLWRhM2Q1OTA4ZjEzNyJ9.hoY-lZ-6rbN_WVFy0Taxbf6QCtDPaTm407l6opv2bz-Hui9T7l7aafStsx9w-UscWUFWHpeStIo1ObV-lT8-j9t-nw9q5fr8wuO2zyKBMXjhD57ykR6BcKvJQMxE1JjyetVLHpj5r4mIb7_kaA8Dj8Vy2yrWFReHXDczYpQGc43mxxC05B5_xdScQrSbs9MkgQRh-Z5EknlLKWkpbuxPvoyWcH1wgLum7UABGNO7drvmcDDaRk6Lt99A3t40sod9mJ3H9UqdooLOfBAg9kcaCSgqWDkmCLBwtM8ONbKZ4cEZ8NEseCQYKqIoyHQH9vbf9Y6GBaJVbBoEay1cI48Hig"
}
```




