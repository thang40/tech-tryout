# README

## Requirements

When running outside of the provided docker environment:

- MongoDB
- Node 12 LTS

## Instructions to run

Make sure the MongoDB server is already running and the connection string on the configuration is correct. Then run:

```
npm install
npm run start
```

## Demo docker environment

This environment is provided as a demo and it contains some preseed data. **The db data will be deleted everytime it runs so don't use it for production!**

Run:
```
docker-compose up -d
```

## Configuration

Multiple parameters can be configured in the .env file. A restart is required after editing it.

- `DB_URI` - Mongodb connection string
- `PORT` - port where the http server will run
- `AUTH_SECRET` - authentication secret
- `AUTH_USERNAME` - username to login
- `AUTH_PASSWORD` - password to login
