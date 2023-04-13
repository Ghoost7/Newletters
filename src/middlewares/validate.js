import * as yup from "yup"

const validate =
  ({ validators }) =>
  async (req, res, next) => {
    const validationSchema = yup.object().shape({
      params: yup.object().shape(validators.params),
      query: yup.object().shape(validators.query),
      body: yup.object().shape(validators.body),
    })

    try {
      const { params, query, body } = await validationSchema.validate(req, {
        abortEarly: false,
      })
      req.params = params
      req.body = body
      req.query = query
    } catch (err) {
      res.status(420).send({ error: err.errors })

      return
    }

    next()
  }

export default validate
