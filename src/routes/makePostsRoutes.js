import validate from "../middlewares/validate"
import auth from "../middlewares/auth.js"
import {
  validatePostContent,
  validatePostTitle,
  validatePublishedAt,
  validateSearch,
} from "../validators.js"
import { validateId, validateLimit, validateOffset } from "../validator"
import filterDBResult from "../filterDBResult"

const makePostsRoutes = ({ app, db }) => {
  app.post(
    "/posts",
    auth,
    validate({
      body: {
        title: validatePostTitle.required(),
        content: validatePostContent.required(),
        publishedAt: validatePublishedAt,
      },
    }),
    async (req, res) => {
      const {
        body: { title, content, publishedAt },
        session: { user },
      } = req

      const [post] = await db("posts")
        .insert({
          title,
          content,
          publishedAt,
          userId: user.id,
        })
        .returning("*")

      res.send({ result: filterDBResult([post]), count: 1 })
    }
  )
  app.get(
    "/posts",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
        userId: validateId,
        search: validateSearch,
      },
    }),
    async (req, res) => {
      const { limit, offset, userId, search } = req.query
      const postsQuery = db("posts").limit(limit).offset(offset)
      const countQuery = db("posts").count()

      if (userId) {
        postsQuery.where({ userId })
        countQuery.where({ userId })
      }

      if (search) {
        const searchPattern = `%${search}%`
        postsQuery.where((query) =>
          query
            .whereILike("title", searchPattern)
            .orWhereILike("content", searchPattern)
        )
        countQuery.where((query) =>
          query
            .whereILike("title", searchPattern)
            .orWhereILike("content", searchPattern)
        )
      }

      const posts = await postsQuery
      const [{ count }] = await countQuery

      res.send({ result: filterDBResult(posts), count })
    }
  )
  app.get("/posts/:postId"),
    validate({
      params: {
        postsId: validateId.required,
      },
    }),
    async (req, res) => {
      const { postId } = req.params
      const [post] = await db("posts").where({ id: postId })

      if (!post) {
        res.status(404).send({ error: "Post not found." })

        return
      }

      res.send({ result: [post], count: 1 })
    }
  //Update partial

  app.patch("/posts/:postId"),
    validate({
      params: {
        postsId: validateId.required,
      },
      body: {
        title: validatePostTitle,
        content: validatePostContent,
        publishedAt: validatePublishedAt,
      },
    }),
    async (req, res) => {
      const {
        params: { postId },
        body: { title, content, publishedAt },
      } = req

      const [post] = await db("posts").where({ id: postId })

      if (!post) {
        res.status(404).send({ error: "Post not found." })

        return
      }

      const [updatedPost] = await db("post")
        .where({
          id: postId,
        })
        .update({
          title,
          content,
          publishedAt,
          updatedAt: new Date(),
        })

      res.send({ result: [updatedPost], count: 1 })
    }
  //Delete
  app.delete(
    "/posts/:postId",
    validate({
      params: {
        postId: validateId.required(),
      },
    }),
    async (req, res) => {
      const {
        params: { postId },
      } = req

      const [post] = await db("posts").where({ id: postId })

      if (!post) {
        res.status(404).send({ error: "Post not found." })

        return
      }

      await db("posts").where({ id: postId }).delete()

      res.send({ result: [post], count: 1 })
    }
  )
}

export default makePostsRoutes
