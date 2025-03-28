# Use Node.js as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies including sharp
RUN npm install
RUN npm install sharp

# Copy the rest of the application code
COPY . .

# Make the startup script executable
RUN chmod +x start.sh

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000


# Start using the startup script
CMD ["./start.sh"]

# Start the Next.js application
CMD ["npm", "start"]
