module.exports = {
  apps: [
    {
      name: 'auth-service',
      script: './index.js',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--require dotenv/config',
    },
  ],
};
