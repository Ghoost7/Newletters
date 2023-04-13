import filterDBResult from "../filterDBResult.js"
import hashPassword from "../hashPassword.js"
import validate from "../middlewares/validate.js"
import {
  validateOffset,
  validateLimit,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateUsername,
  validateId,
} from "../validators.js"

const makeUsersRoutes = ({ app, db }) => {
  app.post(
    "/users",
    validate({
      body: {
        email: validateEmail.required(),
        password: validatePassword.required(),
        username: validateUsername.required(),
        displayName: validateDisplayName.required(),
      },
    }),
    async (req, res) => {
      const { email, password, username, displayName } = req.body

      try {
        const [user] = await db("users")
          .insert({
            email,
            username,
            displayName,
            passwordHash: password,
            passwordSalt: password,
          })
          .returning("*")

        res.send({ result: user, count: 1 })
      } catch (err) {
        if (err.code === "23505") {
          res.status(409).send({
            error: [
              `Duplicated value for "${err.detail.match(/^key\((\w+)\)/)}`,
            ],
          })
        }
      }
    }
  )
  //READ collection
  app.get(
    "/users",
    validate({
      query: {
        offset: validateOffset,
        limit: validateLimit,
      },
    }),
    async (req, res) => {
      const { offset, limit } = req.query

      const [{ count }] = await db("users").count()

      const users = await db("users").limit(limit).offset(offset)

      res.send({ result: filterDBResult(users), count })
    }
  )
  //READ single
  app.get(
    "/users/:userId",
    validate({
      params: {
        userId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { userId } = req.params

      const [user] = await db("users").where({ id: userId })

      if (!user) {
        res.status(404).send({ error: ["User not found."] })

        return
      }

      res.send({ result: filterDBResult([user]), count: 1 })
    }
  )
  //UPDATE partial
  app.patch(
    "/users/:userId",
    validate({
      params: {
        userId: validateId.required(),
      },
      body: {
        email: validateEmail,
        password: validatePassword,
        username: validateUsername,
        displayName: validateDisplayName,
      },
    }),
    async (req, res) => {
      const {
        params: { userId },
        body: { email, username, password, displayName },
      } = req

      const [user] = await db("users").where({ id: userId })

      if (!user) {
        res.status(404).send({ error: ["User not found"] })

        return
      }

      let passwordHash
      let passwordSalt

      if (password) {
        const [hash, salt] = hashPassword(password, user.passwordSalt)

        passwordHash = hash
        passwordSalt = salt
      }

      try {
        const [updateUser] = await db("users")
          .where({ id: userId })
          .update({
            email,
            username,
            displayName,
            passwordHash,
            passwordSalt,
            updatedAt: new Date(),
          })

          .returning("*")

        res.send(updateUser)
      } catch (err) {
        if (err.code === "23505") {
          res.status(409).send({
            error: [
              `Duplicated value for "${err.detail.match(/^key\((\w+)\)/)}`,
            ],
          })

          return
        }
      }
    }
  )
  app.delete(
    "/users/:userId",
    validate({
      params: {
        userId: validateId.required(),
      },
    }),
    async (req, res) => {
      const { userId } = req.params

      const [user] = await db("users").where({ id: userId })

      if (!user) {
        res.status(404).send({ error: ["User not found."] })

        return
      }

      await db("users").delete().where({ id: userId })

      res.send({ result: filterDBResult([user]), count: 1 })
    }
  )
}

export default makeUsersRoutes
