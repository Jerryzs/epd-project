#!/bin/sh

git checkout main
git fetch
git reset --hard origin/main
npx next build
sudo kill -9 $(sudo lsof -t -i:3000)
nohup npx next start 1>epd.out 2>epd.err &
