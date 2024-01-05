FROM docker.repos.balad.ir/node

WORKDIR /app

COPY package.json ./


RUN yarn

COPY . .


CMD [ "yarn" , "start" ]