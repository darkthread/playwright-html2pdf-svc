FROM mcr.microsoft.com/playwright:v1.42.1-jammy
RUN mkdir -p /home/app
WORKDIR /home/app
COPY package*.json ./
RUN npm install
COPY webapi.js .
EXPOSE 3000
CMD ["node", "webapi.js"]