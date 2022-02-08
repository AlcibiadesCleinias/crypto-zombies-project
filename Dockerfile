FROM node:14.18.1

WORKDIR /opt

ENV TRUFFLE_VERSION=5.4.27

RUN npm install -g truffle@${TRUFFLE_VERSION}

COPY package*.json ./

RUN npm install

COPY . .

#CMD [ "node", "/usr/src/app/src/server.js" ]
CMD tail -f /dev/null
