FROM nginxinc/nginx-unprivileged:1.31-alpine@sha256:054e14f543eb688809d59ec2ad1644d1a61678e247c87a318ad605977eb37eaf

WORKDIR /app

COPY ./src /usr/share/nginx/html
