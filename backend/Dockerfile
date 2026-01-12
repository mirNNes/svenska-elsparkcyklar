# Välj Node som bas
FROM node:18

# Skapa app-katalog
WORKDIR /usr/src/app

# Kopiera package.json och package-lock.json först 
COPY package*.json ./

# Installera beroenden
RUN npm install

# Kopiera resten av backend-koden
COPY . .

# Exponera port (t.ex. 5000)
EXPOSE 5000

# Starta server
CMD ["node", "src/server.js"]
