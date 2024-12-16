FROM alpine:latest

ENV NGINX_VERSION=nginx-1.25.1

RUN apk add build-base bash linux-headers perl git libxslt-dev libgcc
RUN mkdir -p /tmp/src && \
    cd /tmp/src && \
    wget http://nginx.org/download/${NGINX_VERSION}.tar.gz && \
    tar -zxvf ${NGINX_VERSION}.tar.gz && \
    wget http://github.com/PCRE2Project/pcre2/releases/download/pcre2-10.42/pcre2-10.42.tar.gz && \
    tar -zxf pcre2-10.42.tar.gz && \
    wget https://github.com/madler/zlib/releases/download/v1.2.13/zlib-1.2.13.tar.gz && \
    tar -zxf zlib-1.2.13.tar.gz && \ 
    wget http://www.openssl.org/source/openssl-1.1.1v.tar.gz && \
    tar -zxf openssl-1.1.1v.tar.gz
RUN cd /tmp/src/pcre2-10.42 && \
    ./configure --prefix=/usr && \
    make && \
    make install
RUN cd /tmp/src/zlib-1.2.13 && \
    ./configure --prefix=/usr && \
    make && \
    make install
RUN cd /tmp/src/openssl-1.1.1v && \
    ./Configure linux-x86_64 --prefix=/usr && \
    make && \
    make install
RUN cd /tmp/src && \
    git clone https://github.com/nginx/njs
RUN cd /tmp/src && \
    wget https://github.com/openresty/lua-nginx-module/archive/refs/tags/v0.10.27.tar.gz -O lua-v0.10.27.tar.gz && \
    tar -zxf lua-v0.10.27.tar.gz
RUN cd /tmp/src && \
    wget https://github.com/openresty/luajit2/archive/refs/tags/v2.1-20241113.tar.gz -O luajit2-v2.1-20241113.tar.gz && \
    tar -zxf luajit2-v2.1-20241113.tar.gz && \
    cd /tmp/src/luajit2-2.1-20241113 && \
    make && \
    make install
RUN cd /tmp/src && \
    wget https://github.com/vision5/ngx_devel_kit/archive/refs/tags/v0.3.3.tar.gz -O ndk-v0.3.3.tar.gz && \
    tar -zxf ndk-v0.3.3.tar.gz
RUN cd /tmp/src/${NGINX_VERSION}  && \
    LUAJIT_LIB=/usr/local/lib LUAJIT_INC=/usr/local/include/luajit-2.1 ./configure \
    --add-dynamic-module=/tmp/src/njs/nginx \
    --add-dynamic-module=/tmp/src/lua-nginx-module-0.10.27 \
    --add-dynamic-module=/tmp/src/ngx_devel_kit-0.3.3 \
    --conf-path=/etc/nginx/nginx.conf \
    --error-log-path=/var/log/nginx/error.log \
    --group=nginx \
    --http-client-body-temp-path=/var/cache/nginx/client_temp \
    --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
    --http-log-path=/var/log/nginx/access.log \
    --http-proxy-temp-path=/var/cache/nginx/proxy_temp \
    --http-scgi-temp-path=/var/cache/nginx/scgi_temp \
    --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
    --lock-path=/var/run/nginx.lock \
    --modules-path=/usr/lib/nginx/modules \
    --pid-path=/var/run/nginx.pid \
    --prefix=/etc/nginx \
    --sbin-path=/usr/sbin/nginx \
    --user=nginx \
    --with-compat \
    --with-file-aio \
    --with-http_addition_module \
    --with-http_auth_request_module \
    --with-http_dav_module \
    --with-http_flv_module \
    --with-http_gunzip_module \
    --with-http_gzip_static_module \
    --with-http_mp4_module \
    --with-http_random_index_module \
    --with-http_realip_module \
    --with-http_secure_link_module \
    --with-http_slice_module \
    --with-http_ssl_module \
    --with-http_stub_status_module \
    --with-http_sub_module \
    --with-http_v2_module \
    --with-http_v3_module \
    --with-mail \
    --with-mail_ssl_module \
    --with-pcre-jit \
    --with-stream \
    --with-stream_realip_module \
    --with-stream_ssl_module \
    --with-stream_ssl_preread_module \
    --with-threads && \
    make && \
    make install 
RUN cd /tmp/src && \
    wget https://github.com/openresty/lua-resty-core/archive/refs/tags/v0.1.30.tar.gz -O lua-resty-core-0.1.30.tar.gz && \
    tar -zxf lua-resty-core-0.1.30.tar.gz && \
    cd lua-resty-core-0.1.30 && \
    make install PREFIX=/etc/nginx 
RUN cd /tmp/src && \
    wget https://github.com/openresty/lua-resty-lrucache/archive/refs/tags/v0.15.tar.gz -O lua-resty-lrucache-0.15.tar.gz && \
    tar -zxf lua-resty-lrucache-0.15.tar.gz && \
    cd /tmp/src/lua-resty-lrucache-0.15 && \
    make install PREFIX=/etc/nginx 
RUN apk del build-base && \
    rm -rf /var/cache/apk/* && \
    rm -rf /tmp/src

RUN addgroup -S nginx && \
    adduser -S nginx -G nginx && \
    mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp&& \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    chown -R nginx:nginx /var/cache/nginx

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

VOLUME ["/var/log/nginx"]

WORKDIR /etc/nginx

EXPOSE 443

COPY rootfiles /etc/nginx/

CMD ["nginx", "-g", "daemon off;"]