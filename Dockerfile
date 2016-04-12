FROM download13/node

RUN mkdir /app
WORKDIR /app

COPY package.json /app/package.json
RUN npm install
COPY ./ /app

CMD ["node", "dist/server"]
