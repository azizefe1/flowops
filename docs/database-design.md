# FlowOps Database Design

FlowOps uses PostgreSQL as the main relational database.

The database is designed for a multi-tenant B2B operations platform. Most business tables are connected to an organization so that each organization's data remains separated.

## Main Database Tables

```text
users
organizations
organization_members
products
inventory_movements
orders
order_items
audit_logs
```

## Users Table

The `users` table stores registered platform users.

Main fields:

```text
id
email
hashed_password
full_name
is_active
created_at
updated_at
```

Purpose:

* Store user account information
* Support authentication
* Connect users to organizations
* Track who created business records

## Organizations Table

The `organizations` table stores companies or workspaces created by users.

Main fields:

```text
id
name
slug
created_at
updated_at
```

Purpose:

* Represent a tenant in the system
* Separate business data by organization
* Connect products, orders, inventory movements, and audit logs to a specific organization

## Organization Members Table

The `organization_members` table connects users with organizations.

Main fields:

```text
id
organization_id
user_id
role
created_at
```

Purpose:

* Manage organization membership
* Control access to organization data
* Support roles such as owner, admin, and member

## Products Table

The `products` table stores products that belong to an organization.

Main fields:

```text
id
organization_id
name
sku
category
description
unit_price
stock_quantity
low_stock_threshold
is_active
created_at
updated_at
```

Purpose:

* Manage organization-specific product catalog
* Track product stock quantity
* Support low stock detection
* Prevent duplicate SKU values inside the same organization

## Inventory Movements Table

The `inventory_movements` table stores stock changes.

Main fields:

```text
id
organization_id
product_id
movement_type
quantity
previous_stock
new_stock
reason
created_by
created_at
```

Movement types:

```text
in
out
adjustment
```

Purpose:

* Track stock-in operations
* Track stock-out operations
* Track stock adjustments
* Keep stock history for each product

## Orders Table

The `orders` table stores customer orders.

Main fields:

```text
id
organization_id
order_number
customer_name
customer_email
status
total_amount
created_by
created_at
updated_at
```

Order statuses:

```text
pending
approved
shipped
completed
cancelled
```

Purpose:

* Store customer order information
* Track order status
* Calculate total order value
* Connect orders to organizations and users

## Order Items Table

The `order_items` table stores products inside an order.

Main fields:

```text
id
order_id
product_id
quantity
unit_price
line_total
```

Purpose:

* Support multiple products in a single order
* Store product price at the time of order
* Calculate line totals
* Keep order details separate from the main order record

## Audit Logs Table

The `audit_logs` table stores important system actions.

Main fields:

```text
id
organization_id
user_id
action
entity_type
entity_id
details
created_at
```

Purpose:

* Record important business actions
* Improve traceability
* Support debugging and monitoring
* Keep a history of user actions

Example actions:

```text
organization.created
product.created
product.updated
product.deactivated
inventory.movement.created
order.created
order.status_changed
```

## Main Relationships

```text
User 1──N OrganizationMember
Organization 1──N OrganizationMember

Organization 1──N Product
Organization 1──N InventoryMovement
Organization 1──N Order
Organization 1──N AuditLog

Product 1──N InventoryMovement
Product 1──N OrderItem

Order 1──N OrderItem

User 1──N InventoryMovement
User 1──N Order
User 1──N AuditLog
```

## Multi-Tenant Data Separation

FlowOps separates data by `organization_id`.

Tables that include `organization_id`:

```text
products
inventory_movements
orders
audit_logs
organization_members
```

Before accessing organization-specific data, the backend checks whether the current user is a member of the organization.

This prevents users from accessing another organization's products, orders, inventory records, dashboard data, or audit logs.

## Stock Management Design

Stock quantity is stored directly on the `products` table.

Every manual stock change creates an `inventory_movements` record.

Order creation automatically creates stock-out movements and reduces product stock.

Order cancellation restores stock and creates stock-in movements.

## Order Management Design

Each order has one main `orders` record and one or more `order_items`.

When an order is created:

```text
1. Product stock is checked
2. Stock is reduced
3. Order items are created
4. Inventory movement records are created
5. Order total amount is calculated
6. Audit log is created
```

When an order is cancelled:

```text
1. Order status is changed to cancelled
2. Product stock is restored
3. Stock-in movement records are created
4. Audit log is created
```

## Dashboard Data Source

The dashboard endpoint does not use a separate table.

It calculates summary data from existing tables:

```text
products
orders
inventory_movements
audit_logs
```

This keeps dashboard data consistent with the current database state.

## Migration Strategy

Alembic is used to manage database schema changes.

Migration files are stored in:

```text
backend/alembic/versions
```

Common commands:

```bash
alembic revision --autogenerate -m "migration message"
alembic upgrade head
```

## Current Database Status

The current database design supports:

* User authentication
* Multi-tenant organizations
* Organization membership
* Product management
* Inventory movement tracking
* Order management
* Dashboard summaries
* Audit logging
