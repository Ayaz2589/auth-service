#!/bin/bash

set -e

echo "📦 Cleaning old build..."
rm -rf dist login.zip signup.zip

echo "🔨 Compiling TypeScript..."
npx tsc

echo "🗜️  Zipping login function..."
cd dist
zip ../login.zip login.js utils.js types.js -r generated

echo "🗜️  Zipping signup function..."
zip ../signup.zip signup.js utils.js types.js -r generated

cd ..

echo "✅ Build complete!"
