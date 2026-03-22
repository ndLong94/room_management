# Flyway SQL migrations

Configured in `application.yml`:

```yaml
spring.flyway.locations: classpath:migration
```

## Rules

1. **Path:** only this folder — `backend/src/main/resources/migration/`.
2. **Name:** `V{version}__{description}.sql`  
   - `version` is the next integer **strictly after** the highest existing `V*.sql` in this directory (currently up to **V24**; the next file should be **V25__….sql**). After you merge a new migration, bump this sentence so the next developer picks the right number.  
   - `description`: lowercase, words separated by underscores.
3. **Scope:** one logical schema change per file when possible (single table/column/constraint story).
4. **Style:** match existing scripts — forward DDL/DML; do not introduce idempotent/repeatable patterns unless the rest of the history already uses them for the same kind of change.

After adding a migration, run the app or `mvn flyway:migrate` / tests so Flyway applies it against a dev database before merging.
