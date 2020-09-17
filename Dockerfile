FROM 14.11.0-alpine3.10

RUN mkdir /app
WORKDIR /app

COPY package.json /app/package.json
RUN npm install --production
COPY ./ /app

CMD ["node", "dist/server"]
