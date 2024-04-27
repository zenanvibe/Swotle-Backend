# Use an official Node.js runtime as a parent image
FROM node:20-alpine3.18

WORKDIR /app

ENV PORT=5000

COPY package*.json ./

COPY package*.json ./

COPY . .

EXPOSE 5000

CMD [ "npm" ,"start" ]