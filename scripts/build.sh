#!/usr/bin/env bash

echo "node: $(node -v)"
echo "npm: $(npm -v)"

npm install
npm install -g typescript
tsc --declaration
NODE_ENV=production npm run build
