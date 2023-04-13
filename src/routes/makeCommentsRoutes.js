import validate from "../middlewares/validate"
import auth from "../middlewares/auth.js"
import filterDBResult from "../filterDBResult"
import {
  validateCommentContent,
  validateSearch,
  validateId,
  validateLimit,
  validateOffset,
} from "../validators.js"

const makeCommentsRoutes = ({ app, db }) => {
  app.post(
    "/comments",
    auth,
    validate({
      body: {
        postId: validateId.required(),
        content: validateCommentContent.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { content, postId },
        session: { user },
      } = req

      const [post] = await db("comments")
        .insert({
          content,
          postId,
          userId: user.id,
        })
        .returning("*")

      res.send({ result: filterDBResult([post]), count: 1 })
    }
  )
  app.get(
    "/comments",
    validate({
      query: {
        limit: validateLimit,
        offset: validateOffset,
        userId: validateId,
        postId: validateId,
        search: validateSearch,
      },
    }),
    async (req, res) => {
      const { limit, offset, userId, search, postId } = req.query
      const commentsQuery = db("comments").limit(limit).offset(offset)
      const countQuery = db("comments").count()

      if (postId) {
        commentsQuery.where({ postId })
        countQuery.where({ postId })
      }

      if (userId) {
        commentsQuery.where({ userId })
        countQuery.where({ userId })
      }

      if (search) {
        const searchPattern = `%${search}%`
        commentsQuery.where((query) =>
          query.WhereILike("content", searchPattern)
        )
        countQuery.where((query) => query.WhereILike("content", searchPattern))
      }

      const comments = await commentsQuery
      const [{ count }] = await countQuery

      res.send({ result: filterDBResult(comments), count })
    }
  )
  //read single
  app.get(
    "/comments/:commentsId",
    validate({
      params: {
        commentId: validateId.required,
      },
    }),
    async (req, res) => {
      const { commentId } = req.params

      const [comment] = await db("comments").where({ id: commentId })

      if (!comment) {
        res.status(404).send({ error: "comment not found." })

        return
      }

      res.send({ result: [comment], count: 1 })
    }
  )
  //Update partial

  app.patch(
    "/comments/:commentsId",
    validate({
      params: {
        commentId: validateId.required,
      },
      body: {
        content: validateCommentContent.required(),
      },
    }),
    async (req, res) => {
      const {
        params: { commentId },
        body: { content },
      } = req

      const [comment] = await db("comments").where({ id: commentId })

      if (!comment) {
        res.status(404).send({ error: "Comment not found." })

        return
      }

      const [updatedComment] = await db("comments")
        .where({
          id: commentId,
        })
        .update({
          content,
          updatedAt: new Date(),
        })

      res.send({ result: [updatedComment], count: 1 })
    }
  )
  //Delete
  app.delete(
    "/comments/:commentsId",
    validate({
      params: {
        commentId: validateId.required(),
      },
    }),
    async (req, res) => {
      const {
        params: { commentId },
      } = req

      const [comment] = await db("comments").where({ id: commentId })

      if (!comment) {
        res.status(404).send({ error: "Comment not found." })

        return
      }

      await db("comments").where({ id: commentId }).delete()

      res.send({ result: [comment], count: 1 })
    }
  )
}

export default makeCommentsRoutes
