\# FlowOps Architecture



FlowOps is designed as a multi-tenant B2B operations platform.



\## High-Level Architecture



The system is planned as a monorepo with separate frontend, backend, documentation, and infrastructure layers.



```text

Client Browser

&#x20;    |

&#x20;    v

Next.js Frontend

&#x20;    |

&#x20;    v

FastAPI Backend

&#x20;    |

&#x20;    v

PostgreSQL Database

