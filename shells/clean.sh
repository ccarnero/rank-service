find . -name tsconfig.tsbuildinfo -type f -delete 
rm -rf ./packages/**/dist 
rm -rf ./packages/**/node_modules
npx lerna clean -y