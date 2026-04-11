FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Aseguramos que antes de arrancar Next.js, 
# se apliquen de forma segura los cambios en PostgreSQL.
CMD ["sh", "-c", "npm run db:migrate:prod && npm start"]