# FlowOps Frontend

This is the frontend application for FlowOps, a multi-tenant B2B operations platform.

The frontend is built with Next.js, TypeScript, Tailwind CSS, and App Router. It connects to the FastAPI backend and displays live organization, dashboard, product, order, and audit log data.

## Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* App Router
* LocalStorage token handling
* FastAPI backend integration

## Current Features

### Landing Page

The landing page introduces the FlowOps project and highlights the backend architecture, CI pipeline, API tests, and main business modules.

### Login Page

The login page sends credentials to the FastAPI backend:

```text
POST /api/auth/login
```

After a successful login, the JWT access token is saved in localStorage and the user is redirected to the dashboard.

### Dashboard Page

The dashboard page fetches live backend data from:

```text
GET /api/organizations
GET /api/organizations/{organization_id}/dashboard
```

It displays:

* Total products
* Active products
* Low stock products
* Total orders
* Pending orders
* Completed orders
* Cancelled orders
* Inventory movements
* Recent orders
* Low stock items

### Products Page

The products page fetches product data from:

```text
GET /api/organizations/{organization_id}/products
```

It displays:

* Product name
* SKU
* Category
* Unit price
* Stock quantity
* Low stock threshold
* Active / inactive status

### Orders Page

The orders page fetches order data from:

```text
GET /api/organizations/{organization_id}/orders
```

It displays:

* Order number
* Customer name
* Customer email
* Order status
* Total amount
* Order items
* Product IDs
* Quantity and line totals

### Audit Logs Page

The audit logs page fetches activity history from:

```text
GET /api/organizations/{organization_id}/audit-logs
```

It displays important actions such as:

* Organization creation
* Product creation
* Product updates
* Product deactivation
* Inventory movements
* Order creation
* Order status changes

## Shared AppShell

The frontend uses a shared `AppShell` component for authenticated pages.

The shared layout includes:

* Page title
* Page subtitle
* Navigation links
* Home link
* Logout button

Pages using AppShell:

```text
/dashboard
/products
/orders
/audit-logs
```

## Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

This value tells the frontend where the backend API is running.

## Local Development

Start the backend first:

```bash
cd ..
docker compose up -d
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## Main Routes

```text
/
/login
/dashboard
/products
/orders
/audit-logs
```

## Build

To create a production build:

```bash
npm run build
```

## Current Status

The frontend currently includes:

* Next.js project structure
* FlowOps landing page
* Login page connected to backend authentication
* JWT token saving with localStorage
* Dashboard connected to backend data
* Products page connected to backend data
* Orders page connected to backend data
* Audit Logs page connected to backend data
* Shared AppShell layout
* Tailwind-based dark UI design
