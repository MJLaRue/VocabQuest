# Use official Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Copy and set permissions for entrypoint script
RUN chmod +x docker-entrypoint.sh

# Create uploads directory (if needed)
RUN mkdir -p uploads

# Expose port (Render will set this via $PORT)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application (entrypoint handles migrations and seeding)
CMD ["./docker-entrypoint.sh"]
