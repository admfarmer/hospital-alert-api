# Fastify and TypeScript

## Installation

```
npm i typescript -g
npm i ts-node -g
```

```
git clone https://gitlab.com/siteslave/fastify-ts myApi
cd myApi
npm i
```

## Running

```
cp .env.example.txt .env
npm start
```

open browser and go to http://localhost:3000

## PM2

```
pm2 start --interpreter ts-node src/app.ts MyServerName
```
