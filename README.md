# Banking System for Interview

## How to start the project?

```bash
$ git clone xxx
$ npm install
$ docker compose up
```

## How to run test?

```bash
# run database(mysql:8) by docker image
$ docker run --name banking-system-interview-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=123 -d mysql:8

# run test
$ npm run test
```

## Detail about the project

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

```

```
