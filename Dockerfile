FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit

COPY . .

EXPOSE 3333
CMD ["sh", "-c", "node scripts/generate-config.js && exec serve -l tcp://0.0.0.0:3333 -s"]
