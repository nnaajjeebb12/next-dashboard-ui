#!/bin/sh

# Function to test PostgreSQL connection
test_postgresql() {
    psql "postgresql://najeeb12:Plutonium_239@postgres:5432/school" -c '\q' 2>&1
}

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until test_postgresql; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 1
done
echo "PostgreSQL is ready!"

# Run Prisma migrations (this only applies pending migrations, doesn't reset data)
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma Client (just to be safe)
echo "Generating Prisma Client..."
npx prisma generate

# Start the application
echo "Starting the application..."
npm start