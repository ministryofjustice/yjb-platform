FROM nginxinc/nginx-unprivileged:1.31-alpine@sha256:f972e5322b9797dc2a6b830030094426437b1ae7032e4644496395336ac6fdac

WORKDIR /app

COPY ./src /usr/share/nginx/html
