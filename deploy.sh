#!/bin/bash

set -e

echo "📦 Installing dependencies..."
npm install

echo "🔁 Generating Prisma client..."
npx prisma generate

echo "🔨 Compiling TypeScript..."
npx tsc

echo "🧳 Running build script (zipping Lambdas)..."
npm run build

echo "🚀 Deploying with Terraform..."
cd terraform
terraform init
terraform apply -auto-approve
cd ..

echo "✅ Deployment complete!"
