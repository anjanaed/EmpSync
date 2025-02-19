
FROM node:18 AS builder


WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

ENV DATABASE_URL=postgresql://postgres:anjana@postgres:5432/demo


RUN npx prisma generate


RUN npm run build


FROM node:18-alpine


WORKDIR /app


COPY --from=builder /app .

EXPOSE 3000

CMD ["sh", "-c", "sleep 10 && npx prisma migrate deploy && npm run start:prod"]
