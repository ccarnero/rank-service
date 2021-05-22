# TODO

* configurar REDIS para que persista los mensajes, de esta forma si fallaran uno o varios servicios los mensajes deberian ser automomaticamente tomados por los servicios
* hay que refactorizar un poco el puller, [quedo meszclado FP con imperativo](https://bitbucket.org/worcket/rank-service/src/0b97ebef6af9ffb10116ba424099b900650ce846/packages/puller/src/modules/rankFactory.ts#lines-131), denle un poco de amor a eso, me lo agradeceran

# Arquitectura del servicio

[Este grafico](https://docs.google.com/drawings/d/1NnUBD5uDL-B5rHRX46Q4ml0Rd1yNSC489tuDKOocsjE/edit?usp=sharing)

La solucion se divide en 3 servicios con las siguientes responsabilidades:

## listenner

Reacciona a cambios en las colecciones de candidates/opportunities; cada ves que se modifican cualquiera de las propiedades del documento que afectan al rank reacciona y deposita un mensaje en una channel de Redis asociado

## puller

reacciona cuando se almacena un mensaje en el canal de Redis asociado a cada cambio. Es el encargado de ejecutar las agregaciones de MongoDB necesarias para obtener las tuplas (candidato, oportunidad) con los valores de las propiedades necesarias para calcular el rank; una ves que obtuvo esta informacion lo envia al channel de Redis asociado al servicio de Rank

## ranker

Existen 2 evaluaciones genericas y 2 particulares:

* between: evalua que un valor este en un rango, aplica a age y experience. Si el valor esta en el rango asigna un peso de 1, caso contrario 0

* intersection: evalua intersecciones de conjuntos (arrays), aplica a professions, skills y fieldsOfStudy. Asigna un peso igual al cociente entre el total de los valores requeridos por la oportunidad y los valores que posee el candidato [por ejemplo](https://bitbucket.org/worcket/rank-service/src/0b97ebef6af9ffb10116ba424099b900650ce846/packages/ranker/tests/intersection.test.ts#lines-34)

* educationLevel: evalua el nivel de educacion, aplica solo a educationLevel. Asigna un peso de 1 en caso que el candidato tenga un nivel de educacion mayor o igual que la vacante; 0 en caso contrario

* languagesLevel evalua los idiomas, aplica solo a languagesLevel. Asigna un peso igual al cociente entre el total de los valores requeridos por la oportunidad y los valores que posee el candidato aplicando la siguiente logica:
* * asigna 1 en caso que coincida el idioma y el nivel de idioma del candidato sea MAYOR o IGUAL al nivel requerido
* * asigna 0.25 en caso que coincida el idioma pero el nivel del candidato sea MENOR  al nivel requerido
* * caso contrario asigna 0 
* * ... [los tests](https://bitbucket.org/worcket/rank-service/src/release/packages/ranker/tests/languagesLevel.test.ts) lo dejan mas claro

**Se suman todos estos resultados y se los divide por 7 que es la la cantidad total de propiedades (age, experience, professions, skills, fieldsOfStudy, educationLevel, languageLevel) el cociente es el rank del candidato para la oportunidad**

## configuracion

TODOS los servicios utilizan las siguientes variables de entorno:

* MONGODB_URI: mongodb+srv://USER:PASSW@qa-tihwj.mongodb.net/wrckdb
* REDIS_URI: redis://redis-bus:6379
* HEALTHCHECK_PORT: 3000
* DEBUG: verbose

las variables de entorno particulares para cada servicio se describen a continuacion:

La configuracion del servicio **listenner** para detectar cabios en **candidates** es la siguiente:
  * MONGODB_COLLECTION: candidates
  * REDIS_PUSH_CHANNEL: candidates
  * MONGODB_WATCH_PROPERTIES: age,experience,educationLevel,languages,professions,skills,fieldsOfStudy
  
La configuracion del servicio **listenner** para detectar cabios en **opportunities** es la siguiente:
  * MONGODB_COLLECTION: opportunities
  * REDIS_PUSH_CHANNEL: opportunities
  * MONGODB_WATCH_PROPERTIES: ageRange,experienceRange,educationLevelsAdvanced,languages,professions,skillsReq,fieldsOfStudy

La configuracion del servicio **puller** para detectar cabios en **candidates** es la siguiente:
  * REDIS_READ_CHANNEL: candidates
  * REDIS_PUSH_CHANNEL: ranker
  
La configuracion del servicio **puller** para detectar cabios en **opportunities** es la siguiente:
  * REDIS_READ_CHANNEL: opportunities
  * REDIS_PUSH_CHANNEL: ranker
  
## deploy y flow de datos

Dentro de cada servicio esta la configuracion de gitops (/packages/SERVICIO/gitops) para desplegarlo en el cluster de kubernetes

Como lo muestra la configuracion, listenner y puller deben ser configurados para trabajar con candidatos o con opportunidades, ranker en cambio, es generico

[el siguiente diagrama muestra cual es el deployment](https://docs.google.com/drawings/d/1pjgPm0DxWJIIcslw2aX4SvNESYhvPJApu2zsKwrg_xc/edit?usp=sharing)

# ANEXO
# Config Monorepo

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
