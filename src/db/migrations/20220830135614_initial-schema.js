export const up = async (knex) => {
  await knex.schema.createTable("users", (table) => {
    table.increments("id")
    table.text("email").notNullable()
    table.text("passwordHash").notNullable()
    table.text("passwordSalt").notNullable()
    table.text("username").notNullable()
    table.text("displayName").notNullable()
    table.timestamps(true, true, true)
  })
  await knex.schema.createTable("posts", (table) => {
    table.increments("id")
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.datetime("publisheAt").notNullable()
    table.timestamps(true, true, true)
    table.integer("userId").notNullable().references("id").inTables("users")
  })
  await knex.schema.createTable("comments", (table) => {
    table.increments("id")
    table.text("content").notNullable()
    table.timestamps(true, true, true)
    table.integer("userId").notNullable().references("id").inTable("users")
    table.integer("postId").notNullable().references("id").inTable("posts")
  })

  await knex.schema.createTable("tags", (table) => {
    table.increments("id")
    table.text("name").notNullable()
    table.timestamps(true, true, true)
  })

  await knex.schema.createTable("rel_posts_tag", (table) => {
    table.integer("tagId").notNullable().references("id").inTable("tags"),
      table.integer("postId").notNullable().references("id").inTable("posts")
    table.primary(["postId", "tagId"])
  })

  await knex.schema.createTable("medias", (table) => {
    table.increments("id")
    table.text("uri").notNullable()
    table.text("type").notNullable()
    table.timestamps(true, true, true)
  })

  await knex.schema.createTable("rel_medias_posts", (table) => {
    table.integer("mediaId").notNullable().references("id").inTable("medias"),
      table.integer("postId").notNullable().references("id").inTable("posts")
    table.primary(["postId", "mediaId"])
  })
}
export const down = async (knex) => {
  await knex.schema.dropTable("rel_medias_posts")
  await knex.schema.dropTable("rel_medias_tags")
  await knex.schema.dropTable("tags")
  await knex.schema.dropTable("medias")
  await knex.schema.dropTable("comments")
  await knex.schema.dropTable("posts")
  await knex.schema.dropTable("users")
}
