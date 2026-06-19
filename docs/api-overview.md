\# API Overview



FlowOps backend will expose REST API endpoints.



\## Planned API Groups



```text

/api/auth

/api/organizations

/api/products

/api/inventory

/api/orders

/api/audit-logs

/api/dashboard

```



\## Planned Auth Endpoints



```text

POST /api/auth/register

POST /api/auth/login

GET  /api/auth/me

```



\## Planned Product Endpoints



```text

GET    /api/products

POST   /api/products

GET    /api/products/{id}

PUT    /api/products/{id}

DELETE /api/products/{id}

```



\## Planned Order Endpoints



```text

GET   /api/orders

POST  /api/orders

GET   /api/orders/{id}

PATCH /api/orders/{id}/status

```

