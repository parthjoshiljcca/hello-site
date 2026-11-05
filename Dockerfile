FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=80
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev && npm cache clean --force
COPY server/*.js ./server/
COPY public ./public
EXPOSE 80
CMD ["node", "server/server.js"]
