export const up = async (knex) => {
  await knex.schema.alterTable("comments", (table) => {
    table.dropForeign(["userId", "postId"])
    table
      .integer("userId")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .alter()
    table
      .integer("postId")
      .notNullable()
      .references("id")
      .inTable("posts")
      .onDelete("CASCADE")
      .alter()
  })
}
export const down = async (knex) => {
  await knex.schema.alterTable("comments", (table) => {
    table.dropForeign(["userId", "postId"])
    table
      .integer("userId")
      .notNullable()
      .references("id")
      .inTable("users")
      .alter()
    table
      .integer("postId")
      .notNullable()
      .references("id")
      .inTable("posts")
      .alter()
  })
}
