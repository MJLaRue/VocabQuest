# Use official Node.js runtime
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install root dependencies first
RUN npm install

# Copy client package files
COPY client/package*.json ./client/

# Install client dependencies
RUN cd client && npm install

# Copy application code
COPY . .

# Copy and set permissions for entrypoint script
RUN chmod +x docker-entrypoint.sh

# Create uploads directory (if needed)
RUN mkdir -p uploads

# Expose ports
EXPOSE 3000
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set entrypoint and default command
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
