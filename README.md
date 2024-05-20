# Banking System for Interview

```txt

Q2：Design a simple banking system with these features: (Typescript or Javascript
 or Golang)

- Implement System by restful API
- Account balance cannot be negative
- Create an account with name and balance
- Able to deposit money to an account
- Able to withdraw money from an account
- Able to transfer money from one account to another account
- Generate transaction logs for each account transfer(when, how much, to what
account)
- Support atomic transaction
- Include unit tests & integration test
- provide a docker container run server
P.S. Do not worry about persisting the data, you can save everything in-memory

```

### API

POST /account
payload: { name, balance }
response: { account }

POST /deposit
payload: { name, amount }
response: { account }

POST /withdraw
payload: { name, amount }
response: { account }

POST /transfer
payload: { fromName, toName, amount }
response: { from: account, to: account }

### Data Schema

Account

- name (pk)
- balance

TransactionLog

- id
- type
- destination (fk)
- source (fk)
- amount
- result
