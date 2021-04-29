# Monorepo

Algunos articulos que sirvieron de base:

* [este](https://baltuta.eu/posts/typescript-lerna-monorepo-the-setup)
* [y este](https://medium.com/@NiGhTTraX/how-to-set-up-a-typescript-monorepo-with-lerna-c6acda7d4559)

# Cluster de Kubernetes local:
## Instalar k3d

Ejecutar ./gitops/k3d-local.sh, esto genera un cluster y su registry local, el output deberia ser algo asi:

```
81...   registry:.   "..."   0.0.0.0:63333->5000/tcp   k3d-rank-registry
```
eso muestra el puerto asignado a la registry local, [para mas info aca](https://k3d.io/usage/guides/registries/)

## Buildear las imagenes de docker y subirlas

Si es necesario, corregir el archivo docker-compose.yml y actualizar el atributo *image* con la url de la registry configurada

```
  listenner:
    image: k3d-rank-registry.localhost:63333/listenner:latest

```

Ejecutar el comando *docker-compose build* para generar las imagenes de docker

Ejecutar el comando *docker-compose push* para enviar las imagenes de docker al registry local

## y finalmente para enviar las imgs al cluster de kubernetes:

```
kubectl apply -f ./packages/SERVICIO/gitops/candidates
```

donde SERVICIO puede ser: listenner/puller/ranker

... con eso deberiamos estar

PD: en caso que se quiera modificar algo hay que borrar la config de k a mano ejecutando 

```
kubectl delete -f ./packages/SERVICIO/gitops/candidates
```

**y GOTO a Buildear las...**



  
