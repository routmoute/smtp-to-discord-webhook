FROM node:alpine
COPY ./app /app
WORKDIR /app
RUN npm install
ENTRYPOINT ["npm", "start"]
