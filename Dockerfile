FROM node:24-alpine AS build
WORKDIR /app

ARG PUBLIC_SITE_URL=https://portfolio.example.com
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
