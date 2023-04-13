import { pbkdf2, randomBytes } from "crypto"
import config from "./config.js"

const hashPassword = async (
  password,
  salt = randomBytes(),
  iterations = config.security.password.iterations,
  keylen = config.security.password.keylen,
  digest = config.security.password.digest
) => (await pbkdf2(password, salt, iterations, keylen, digest)).toString("hex")

export default hashPassword
