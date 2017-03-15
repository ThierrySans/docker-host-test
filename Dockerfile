FROM node

RUN mkdir -p /home/nodejs/app
COPY ./app /home/nodejs/app
WORKDIR /home/nodejs/app
RUN npm install --production

EXPOSE 80
CMD node app.js
