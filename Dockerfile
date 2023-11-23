FROM node:alpine
COPY ./app /app
WORKDIR /app
RUN npm install
EXPOSE 25
ENTRYPOINT ["npm", "start"]
