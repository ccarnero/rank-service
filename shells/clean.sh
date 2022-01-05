find . -name tsconfig.tsbuildinfo -type f -delete 
# rm yarn.lock
rm -rf ./packages/**/dist 
rm -rf ./packages/**/node_modules
npx lerna clean -y