FROM node:20-alpine AS build-stage
WORKDIR /app
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
