# Node-baserad byggmiljö
FROM node:22 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Produktion med Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
