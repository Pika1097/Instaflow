FROM node:22 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# 🔥 THIS LINE WAS MISSING
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]