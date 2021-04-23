# $tag=$(git rev-parse --short HEAD)
# $id=localhost:5000/listenner:$tag

#https://gist.github.com/bademux/82767b85eb17aacdb8e3a24b24ac7a26

docker rmi k3d-registry.localhost:5000/listenner:latest
docker build ./ -t k3d-registry.localhost:5000/listenner:latest
docker image push  k3d-registry.localhost:5000/listenner:latest

