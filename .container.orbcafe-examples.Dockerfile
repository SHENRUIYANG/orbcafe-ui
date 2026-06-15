FROM node:20-slim AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

WORKDIR /app/examples
RUN npm install

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app ./

WORKDIR /app/examples
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app/examples

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8777

COPY --from=builder /app /app

EXPOSE 8777

CMD ["npm", "run", "start"]
