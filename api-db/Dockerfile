FROM node:22

WORKDIR /code

COPY package*.json ./

RUN npm install -g pnpm && npm install -g @nestjs/cli

RUN if [ ! -d node_modules ] && [ -f package.json ] && [ -f pnpm-lock.yaml ]; then pnpm install; fi

COPY . .

EXPOSE 3001

CMD ["pnpm", "start:dev"]