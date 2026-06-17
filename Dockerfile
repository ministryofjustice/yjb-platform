FROM nginxinc/nginx-unprivileged:1.31-alpine@sha256:26b5d4920434bc4d8c17a68201488cf4b3d2391f0d25305cdfe66ccdc6d18aa4

WORKDIR /app

COPY ./src /usr/share/nginx/html
