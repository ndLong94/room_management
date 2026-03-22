# Refactor plan: align codebase with `.cursor/rules`

This plan maps each rule area to **concrete audits**, **refactors**, and **verification** steps. Work phases are ordered so earlier items reduce risk and duplication for later ones.

**Status (latest):** **Phase 7 done:** `InvoiceServiceIT` (Testcontainers PostgreSQL + Flyway) asserts `getById` and `list` populate room/property names and unit prices; `application-test.yml`; `maven-enforcer-plugin` requires JDK 17 for Maven runs. Frontend: ESLint `reportUnusedDisableDirectives: 'warn'`; unused imports/locals already enforced by `tsc` (`noUnusedLocals`). **Phase 6 done:** Single `api` in `src/lib/api.ts`; `api/health.ts`, `api/auth.ts`, `api/meterReadings` (and related hooks) used from pages; money display via `formatMoney` / `formatAmount` on targeted pages including `RoomInvoicePage`; `window.alert` replaced with `react-hot-toast` where touched; `LoginPage` OAuth navigation uses `payload.user`. **Phase 5 done:** Flyway migrations audited (V1–V24, `migration/README.md`, rule link). **Phase 4 done:** `com.management.util.Text#trimToNull` + refactors in `TenantService`, `OccupantService`, `PropertyService`, `RoomService`, `PricingSettingService`; `package-info` for `util` and `security`; `JwtUtil` class Javadoc. Phase 0 largely done (frontend `lint` + `build`; ESLint flat config added). Backend `mvn test` requires **JDK 17** on the machine (`java -version` must show 17+). Phase 1.1 + 1.3 implemented in code (`InvoiceService` bulk maps; `PropertyPricingDefaults`). Phase 1.2: controllers reviewed — no moves required in this pass. **Phase 2 done:** `ErrorResponse.FieldError` (renamed from `FieldErrorDto`); service methods use type-specific request parameter names (`createPropertyRequest`, `updateRoomRequest`, …); `RoomService` uses `MeterReading` import and `occupant` loop variable; `InvoiceService.list` uses `Objects::nonNull` for property ids. **Phase 3 done:** Zalo skip path → `debug` + ids; batch invoice failures → `log.error(..., e)`; uploads POSIX → warn with throwable; see Phase 3 section below.

---

## Phase 0 — Baseline and guardrails (0.5–1 day)

| Step | Action | Done when |
|------|--------|-----------|
| 0.1 | Run `mvn -q -f backend/pom.xml test` (or project test command) and `npm run lint` + `npm run build` in `frontend/` | All green; failures documented as pre-existing |
| 0.2 | Optional: add a short **“definition of done”** checklist per PR (lint + tests + touched layers follow rules) | Team agrees |
| 0.3 | Skim `.cursor/rules/*.mdc` once as a team | Shared understanding of naming vs reuse vs structure |

**Outcome:** Safe baseline; refactors can be validated incrementally.

---

## Phase 1 — Backend: performance and layering (`java-spring-backend`, `java-naming`, `java-reuse-utils`)

### 1.1 N+1 and redundant lookups

**Rule:** Avoid `findById` (or equivalent) inside loops over many ids; prefer bulk fetch + `Map`; use associations when already loaded.

| Priority | Location / issue | Suggested refactor |
|----------|------------------|----------------------|
| **P0** | `InvoiceService`: `toResponse(Invoice i)` (single-invoice path) chains `roomRepository.findById` + `propertyRepository.findById` | Reuse the same strategy as `list(...)`: resolve `roomId` → `Room`, `propertyId` → `Property` via **one** bulk load or a **single read** method (e.g. `getById` loads invoice + room + property in one query or join). At minimum, add `findAllById` for the two ids and avoid two sequential round-trips where batching is trivial. |
| **P1** | Full-repo grep: `findById` inside `for`, `forEach`, `stream` that iterates collections | For each hit, replace with `findAllById` / `findByIdIn` + map, or a repository query that returns DTOs. |
| **P2** | Services that re-fetch an entity already available from a loaded association | Use getters on the loaded graph; document exceptions (lazy-load boundaries). |

**Verify:** Re-run tests; optional: SQL/log profiling on hot endpoints (`GET` invoice by id, list invoices).

### 1.2 Controllers vs services

**Rule:** Controllers stay thin; business logic in `*Service`.

| Step | Action |
|------|--------|
| 1.2.1 | List controllers; flag methods with branching business rules or persistence | Move logic into appropriate `*Service` |
| 1.2.2 | Ensure `ResponseEntity`, `@Valid`, and HTTP status usage match existing patterns | Align only where inconsistent |

### 1.3 Magic numbers and defaults

**Rule:** Business thresholds and defaults in config where appropriate; **kebab-case** keys in YAML.

| Priority | Finding | Refactor |
|----------|---------|----------|
| **P1** | Default elec/water prices: `Property` entity defaults **and** `PropertyService` `DEFAULT_ELEC` / `DEFAULT_WATER` | Single source of truth: e.g. `@ConfigurationProperties` defaults + entity defaults reading from same config, or defaults **only** in DB migration + explicit set on create (pick one strategy and document). |
| **P2** | Other literals (cron, limits, file size) | Move to `application.yml` with clear names |

---

## Phase 2 — Backend: naming consistency (`java-naming`, `java-dtos-and-entities`)

**Done in repo:** See status block at top (DTO inner type rename, service parameter names, small stream/loop cleanups).

### 2.1 Naming audit (mechanical)

| Area | Check | Action |
|------|-------|--------|
| DTOs | `*Request` / `*Response`; no `*Dto` in public API | Rename only if violations exist |
| Services | `*Service` concrete classes | No `I*` interfaces unless you adopt that pattern project-wide |
| Packages | Controllers / services / dto / domain / repository | Move misplaced types if any |

### 2.2 Variables in large methods

**Rule:** Prefer specific names for DTO locals and IDs when ambiguity hurts readability.

| Step | Action |
|------|--------|
| 2.2.1 | Target the longest service methods (`InvoiceService`, `RoomService`, etc.) | Rename `request` → `createXRequest` where it clarifies; rename bare `id` → `roomId` / `invoiceId` when multiple ids in scope |
| 2.2.2 | Streams: prefer method references where readable | Mechanical cleanup in touched files |

**Verify:** Compile + tests; no behavior change intended.

---

## Phase 3 — Backend: logging (`java-logging`)

**Done in repo**

| Change | Location |
|--------|----------|
| Misconfigured Zalo: **warn → debug** + `zaloEnabled` / `accessTokenBlank`; comment that `IllegalStateException` still propagates | `ZaloNotificationService` |
| Zalo API non-2xx: **error** includes `zaloUserId`, status, body | same |
| Success info: **`zaloUserId={}`** in message | same |
| Batch invoice failure: **warn → error** + **full exception** + room/month/year/owner ids | `InvoiceGenerateItemWriter` |
| Uploads POSIX failure: **warn** logs **path + throwable** (was message-only) | `UploadsDirectoryInitializer` |
| Uploads not writable: **comment** why warn is kept | same |

`GlobalExceptionHandler` `log.warn` entries unchanged (client/validation paths).

**Rule (reference):** `debug` for expected “not found” / skip paths; `error` with exception as last arg for failures; avoid `warn` for those unless the codebase standard says otherwise.

| Step | Action |
|------|--------|
| 3.1 | Inventory `log.warn` in `service/**` (not global exception handler) | Classify: operational degradation (keep warn?) vs expected skip (→ `debug`) |
| 3.2 | Align `ZaloNotificationService`, batch writer warnings with team policy | Document decision in code comment if `warn` kept for ops visibility |
| 3.3 | Ensure `log.error(..., e)` pattern for caught exceptions in batch paths | Consistency pass |

**Note:** `GlobalExceptionHandler` warnings for client errors may stay as-is; focus on domain services.

---

## Phase 4 — Backend: reuse and shared utilities (`java-reuse-utils`)

**Done in repo:** `Text.trimToNull`; services listed in status no longer duplicate `trimOrNull` / nullable trim chains; package documentation and `JwtUtil` Javadoc as in plan 4.2.

### 4.1 Centralize duplicated validation / formatting

| Step | Action |
|------|--------|
| 4.1.1 | Grep for duplicate regex (email, phone) or repeated `BigDecimal` scale rules | Introduce `com.management.util.*` only when **two+** call sites need the same logic |
| 4.1.2 | Prefer Jakarta Validation on DTOs for input rules | Expand annotations where services manually validate the same fields |

### 4.2 Document shared entry points

| Step | Action |
|------|--------|
| 4.2.1 | Short Javadoc or package-info on `security` / future `util` | “Use `JwtUtil` for …” |

---

## Phase 5 — Database (`db-migrations`)

**Done in repo:** Audited `classpath:migration`: **V1–V24** present, sequential, single location in `application.yml`. Added **`backend/src/main/resources/migration/README.md`** (naming, next version **V25**, scope, Flyway pointer). **`.cursor/rules/db-migrations.mdc`** updated to reference that README.

| Step | Action |
|------|--------|
| 5.1 | Confirm all migrations live under `backend/src/main/resources/migration/` with `V{next}__*.sql` | Process doc only; no refactor unless files misplaced |
| 5.2 | For new migrations: one logical change per file | Enforce in review |

---

## Phase 6 — Frontend: structure and reuse (`frontend-react-typescript`, `frontend-reuse-utils`)

### 6.1 HTTP client

**Rule:** Single `api` in `src/lib/api.ts`.

| Step | Action |
|------|--------|
| 6.1.1 | Grep for `axios.create`, `fetch(` bypassing `api` | Replace with `api` or justify (e.g. special one-off) |

### 6.2 Formatting and errors

**Rule:** Reuse `formatMoney`, `formatAmount`, `formatDate`, `getErrorMessageVi`.

| Priority | Finding | Refactor |
|----------|---------|----------|
| **P1** | Pages using `x.toLocaleString()` for money (e.g. `RoomListPage`, `OccupantsPage`, `AllRoomsPage`) | Use `formatMoney` / `formatAmount` from `src/utils/format.ts` for consistent display |
| **P2** | Inline date parsing/formatting duplicating `format.ts` | Call shared helpers |
| **P1** | New API errors: ensure `getErrorMessageVi` map in `errors.ts` covers backend messages | Add entries when users see raw English |

### 6.3 Data fetching

| Step | Action |
|------|--------|
| 6.3.1 | Pages that call `api` directly instead of `src/api/*` + hooks | Gradually move to `api/<feature>.ts` + `hooks/use*.ts` for cache consistency |
| 6.3.2 | Align new features with existing React Query key patterns | Copy from nearest sibling feature |

### 6.4 UI feedback

| Step | Action |
|------|--------|
| 6.4.1 | Replace stray `alert()` with toast if any | Match `react-hot-toast` usage elsewhere |

---

## Phase 7 — Cross-cutting quality

**Done in repo:** `InvoiceServiceIT` + `AbstractPostgreSQLTest` (`backend/src/test/java/...`); `backend/src/test/resources/application-test.yml`. **Maven Enforcer** (`requireJavaVersion` `[17,)`) fails fast when the JVM running Maven is not 17+. Spotless/Checkstyle not added (Spotless plugin requires Java 11+ for the plugin runtime; project already targets 17). ESLint: `linterOptions.reportUnusedDisableDirectives`; hooks: `eslint-plugin-react-hooks` recommended rules in `eslint.config.js`.

| Step | Action |
|------|--------|
| 7.1 | Backend: consider Spotless / Checkstyle / Spring format (optional) | Automate what rules repeat manually |
| 7.2 | Frontend: ensure ESLint rules cover unused imports, hooks deps | Already in `npm run lint` |
| 7.3 | Add/adjust integration tests for refactored services (invoice load paths) | Protect P0 N+1 fixes |

---

## Suggested sequencing (summary)

1. **Phase 0** baseline  
2. **Phase 1.1** `InvoiceService` single-invoice response path (highest impact / clear rule violation risk)  
3. **Phase 6.2** + **6.1** frontend formatting + HTTP audit (quick wins, visible consistency)  
4. **Phase 1.3** default pricing single source of truth  
5. **Phase 2** + **3** naming + logging pass in touched areas  
6. **Phase 4** util extraction only when duplication proven  
7. **Phase 7** automation as needed  

---

## Effort rough order (relative)

| Phase | Effort |
|-------|--------|
| 0 | S |
| 1.1 (InvoiceService + grep fixes) | M–L |
| 1.2–1.3 | M |
| 2 | S–M |
| 3 | S |
| 4 | M (only if duplication found) |
| 5 | S (process) |
| 6 | M |
| 7 | M (optional tooling) |

---

## What not to do in this refactor

- Rename public REST paths or DTO JSON contracts **without** a versioning/migration plan for clients.  
- Introduce `I*Service` interfaces everywhere—rules allow concrete `*Service` as today.  
- Copy large utility catalogs from other repos—grow `util` only from real duplication in this codebase.
