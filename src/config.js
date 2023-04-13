import "dotenv/config"

const config = {
  server: {
    port: process.env.SERVER_PORT,
  },
  view: {
    results: {
      minLimit: 1,
      maxlimit: 10,
      defaultLimit: 10,
    },
  },
  db: {
    client: "pg",
    connection: {
      user: process.env.DB_USER,
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
    },
    migrations: {
      directory: "./src/db/migrations",
      stub: "./src/db/migrations.stub",
    },
  },
  security: {
    password: {
      iterations: 100000,
      keylen: 256,
      digest: "sha512",
      pepper: process.env.SECURITY_PASSWORD_PEPPER,
    },
    jwt: {
      expiresIn: "2 days",
      secret: process.env.SECURITY_JWT_SECRET,
    },
  },
}

export default config
