export const up = async (knex) => {
  await knex.schema.alterTable("users", (table) => {
    table.text("email").notNullable().unique().alter()
    table.text("username").notNullable().unique().alter()
  })
}

export const down = async (knex) => {
  await knex.schema.alterTable("users", (table) => {
    table.dropUnique(["email", "username"])
  })
}
