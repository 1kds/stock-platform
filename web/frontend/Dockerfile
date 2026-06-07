FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

# --legacy-peer-deps: storybook peer dependency 충돌 무시
RUN npm ci --legacy-peer-deps

COPY . .

ENV NEXT_PUBLIC_API_BASE=http://fastapi-server:8000

RUN npm run build

# ------- 실행 스테이지 -------
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
