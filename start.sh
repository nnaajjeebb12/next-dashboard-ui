#!/bin/sh

# Function to test PostgreSQL connection
test_postgresql() {
    psql "postgresql://myuser:mypassword@postgres:5432/school" -c '\q' 2>&1
}

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until test_postgresql; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 1
done
echo "PostgreSQL is ready!"

# Reset database (optional, remove if you want to persist data)
echo "Resetting database..."
npx prisma migrate reset --force

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma Client (just to be safe)
echo "Generating Prisma Client..."
npx prisma generate

# Verify database schema
echo "Verifying database schema..."
npx prisma db pull --force
if [ $? -eq 0 ]; then
    echo "Database schema verified successfully!"
else
    echo "Error: Database schema verification failed!"
    exit 1
fi

# Start the application
echo "Starting the application..."
npm start