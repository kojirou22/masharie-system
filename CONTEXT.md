# Context

Masharie is a project management and finance-tracking system for Shoun Almasharie community development work.

This file defines domain language. Keep implementation notes, temporary plans, and task progress out of this file.

## Glossary

### Project
A community development work item such as a mosque, well, school room, tank, house, store, food aid, or markaz. A project has a project number, donor, supervisor, address, budget, batch number, batch year, type, and status.

A project is the parent record for payment releases. It is not the same as a payment release or expense release.

### Project Number
The externally meaningful project identifier, for example `2026-10071`. It is shown in registry tables and detail pages and should be treated as a human-facing reference, not as the database primary key.

### Project Type
The category of work represented by a project. Current canonical values are: Mosque, House, Store, School Room, Tank, Well, School, Food Aid, and Markaz.

### Project Status
The lifecycle label for a project. Current canonical values are: Pending, On Going, On Hold, Completed, and Cancelled.

Do not confuse project status with payment or expense status. Project status describes the project lifecycle; payment and expense statuses describe financial release lifecycle.

### Batch Number
The operational grouping number assigned to imported or entered projects. It is stored separately from the project number.

### Batch Year
The calendar/import year associated with a project batch. It defaults to the current operational year in create/filter flows, but remains a project field.

### Payment Release
A database row recording released or pending money for one project. It may include check number, voucher number, amount, release date, notes, status, and releasing admin.

When one check or voucher covers multiple projects, Masharie stores one payment release row per project allocation, repeating the shared check/voucher/date/status fields.

### Payment Allocation
One line item inside a multi-project payment creation flow. Each allocation chooses one project and one positive amount. In a single payment batch, the same project must not appear twice.

A payment allocation becomes one `payment_releases` row after submission.

### Expense Release
A database row recording non-project or operational expense money. It includes date, check number, voucher number, amount, purpose, requester, account type, status, and creating admin.

When one check or voucher covers multiple expense purposes, Masharie stores one expense row per purpose, repeating the shared check/voucher/date/account/status fields.

### Expense Purpose
One line item inside a multi-expense creation flow. Each purpose requires a purpose description, requester, and positive amount.

### Account Type
The account bucket attached to an expense release. Current canonical values are: Project Account, Expenses Account, and Savings Account.

### Payment Status
The lifecycle label used by payment releases. Current canonical values are: Pending, Released, and Cancelled.

### Expense Status
The lifecycle label used by expense releases. Current canonical values are: Released and Cancelled.

### Public Route
A route available without admin permission. Public users can view registries and project details but cannot mutate data.

Examples: `/`, `/projects`, `/projects/[id]`, `/payments`, `/expenses`, `/login`.

### Admin Route
A route requiring admin permission through `src/proxy.ts` and server-side admin checks. Admin routes can create, edit, or inspect operational dashboard data.

Examples: `/dashboard`, `/projects/new`, `/projects/[id]/edit`, `/payments/new`, `/payments/[id]/edit`, `/expenses/new`, `/expenses/[id]/edit`.

## Relationships

- A project can have many payment releases.
- A payment release belongs to exactly one project.
- A multi-project payment form produces many payment release rows.
- A multi-purpose expense form produces many expense release rows.
- Public routes may display project, payment, and expense records.
- Admin routes may mutate project, payment, and expense records.
- Hiding links is not route protection. Admin mutation routes must remain protected by `src/proxy.ts` and server-side admin checks.

## Naming Rules

- Use `payment release` for a stored payment row.
- Use `payment allocation` for one line item before it becomes a stored payment row.
- Use `expense release` for a stored expense row.
- Use `expense purpose` for one line item before it becomes a stored expense row.
- Use `project number` for the human-facing identifier and `id` for the database UUID.
