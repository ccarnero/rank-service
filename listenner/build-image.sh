
docker rmi k3d-rank-service.localhost:63333/listenner:latest
docker build . -t k3d-rank-service.localhost:63333/listenner:latest
docker image push k3d-rank-service.localhost:63333/listenner:latest
