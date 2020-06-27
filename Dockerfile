FROM node:12-alpine
LABEL maintainer "louis@giacinti.com"

WORKDIR /opt/cnbot

RUN apk --no-cache --no-progress add git

RUN git clone https://github.com/louisgiac/chinese-discord-bot.git /opt/cnbot && \
    npm install

ENTRYPOINT ["npm"]
CMD ["start"]
