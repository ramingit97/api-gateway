FROM node:20

WORKDIR /app

COPY package.json .
COPY package-lock.json .

# RUN npm install

EXPOSE 3000
COPY . .

CMD ["npm", "run", "start:dev"]