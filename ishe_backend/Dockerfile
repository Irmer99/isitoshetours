FROM node:24-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:24-alpine
RUN apk add --no-cache tini
WORKDIR /app
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY . /app
COPY docker-start.sh /app/docker-start.sh
RUN mkdir -p uploads && chown -R node:node /app && chmod +x /app/docker-start.sh
USER node
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/app/docker-start.sh"]
