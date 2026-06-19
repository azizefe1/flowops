\# Database Design



Initial database tables planned for FlowOps:



\## users



Stores platform users.



\## organizations



Stores tenant organizations.



\## organization\_members



Connects users with organizations and stores role information.



\## products



Stores organization-specific products.



\## inventory\_movements



Stores stock increase, decrease, and adjustment records.



\## orders



Stores customer orders.



\## order\_items



Stores products inside each order.



\## audit\_logs



Stores important system actions for traceability.



\## Initial Table List



```text

users

organizations

organization\_members

products

inventory\_movements

orders

order\_items

audit\_logs

