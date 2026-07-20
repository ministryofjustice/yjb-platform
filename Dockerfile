FROM nginxinc/nginx-unprivileged:1.31-alpine@sha256:18d67281256ded39ff65e010ae4f831be18f19356f83c60bc546492c7eb6dd23

WORKDIR /app

COPY ./src /usr/share/nginx/html
