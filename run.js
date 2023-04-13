import cors from "cors"
import express from "express"
import knex from "knex"
import config from "./config.js"
import makeUsersRoutes from "./routes/makeUsersRoutes.js"
import makePostsRoutes from "./src/routes/makePostsRoutes.js"
import makeSessionRoutes from "./src/routes/makeSessionsRoutes.js"
import makeCommentsRoutes from "./src/routes/makeCommentsRoutes.js"
const app = express()
const db = knex(config.db)

app.use(cors())
app.use(express.json())

makeUsersRoutes({ app, db })
makeSessionRoutes({ app, db })
makePostsRoutes({ app, db })
makeCommentsRoutes({ app, db })

app.listen(config.server.port, () =>
  // eslint-disable-next-line no-console
  console.log(`Listening on :${config.server.port}`)
)
