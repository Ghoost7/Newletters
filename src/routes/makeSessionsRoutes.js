import hashPassword from "../hashPassword.js"
import validate from "../middlewares/validate.js"
import { validateEmailOrUsername, validatePassword } from "../validator.js"
import config from "../config.js"
import jsonwebtoken from "jsonwebtoken"

const makeSessionRoutes = ({ app, db }) => {
  app.post(
    "/sign-in",
    validate({
      emailOrUsername: validateEmailOrUsername.required(),
      password: validatePassword.required(),
    }),
    async (req, res) => {
      const { emailOrUsername, password } = req.body

      if (!emailOrUsername) {
        res.status(401).send({ error: ["Invalid credentials."] })

        return
      }

      const [user] = await db("users")
        .where({
          email: emailOrUsername,
        })
        .orWhere({
          username: emailOrUsername,
        })

      if (!user) {
        res.status(401).send({ error: ["Invalid credentials."] })

        return
      }

      const [passwordHash] = hashPassword(password, user.passwordSalt)

      if (passwordHash !== user.passwordHash) {
        res.status(401).send({
          error: ["Invalid credentials."],
        })

        return
      }

      const jwt = jsonwebtoken.sign(
        {
          session: {
            user: {
              Id: user.id,
              displayName: user.displayName,
              username: user.username,
            },
          },
        },
        config.security.jwt.secret,
        { expiresIn: config.security.jwt.expireIn }
      )

      res.send({ result: { jwt } })
    }
  )
}

export default makeSessionRoutes
