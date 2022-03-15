FROM node:17

LABEL version="0.0.1"
LABEL description="Script written in JavaScript (Node) that uploads entries from Diabetes Connect to Nightscout"

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

CMD [ "npm", "start" ]
