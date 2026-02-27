FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit

COPY . .

EXPOSE 3333
ENV PORT=3333
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "var p=process.env.PORT||3333; require('http').get('http://localhost:'+p+'/', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))" || exit 1
CMD ["sh", "-c", "node scripts/generate-config.js && exec ./node_modules/.bin/serve -l tcp://0.0.0.0:${PORT} -s"]
