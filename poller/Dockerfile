FROM node:20-bookworm

RUN npx -y playwright@1.43.0 install --with-deps chromium

WORKDIR /home/node/app
COPY package.json package-lock.json tsconfig.json /home/node/app/
RUN npm ci
COPY src /home/node/app/src

CMD ["npm", "start"]
