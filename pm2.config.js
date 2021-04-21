module.exports = {
  apps: [
    {
      name: 'auth-service',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--require dotenv/config',
    },
  ],
};
