# Candidate rank

Simple candidates for job ranker service that uses fp-ts and mongodb event stream


# Monorepo approach

Some base articles:

* [this one](https://baltuta.eu/posts/typescript-lerna-monorepo-the-setup)
* [and this](https://medium.com/@NiGhTTraX/how-to-set-up-a-typescript-monorepo-with-lerna-c6acda7d4559)

# Local Kubernetes Cluster:
## Install k3d

Run ./gitops/k3d-local.sh, this generates a cluster and its local registry, the output should look like this:

\`\`\`
81...   registry:.   "..."   0.0.0.0:63333->5000/tcp   k3d-rank-registry
\`\`\`
this shows the port assigned to the local registry, [for more info here](https://k3d.io/usage/guides/registries/)

## Build Docker images and upload them

If necessary, correct the docker-compose.yml file and update the *image* attribute with the URL of the configured registry

\`\`\`
  listenner:
    image: k3d-rank-registry.localhost:63333/listenner:latest
\`\`\`

Run the command *docker-compose build* to generate Docker images

Run the command *docker-compose push* to send the Docker images to the local registry

## And finally, to deploy the images to the Kubernetes cluster:

\`\`\`
kubectl apply -f ./packages/SERVICE/gitops/candidates
\`\`\`

where SERVICE can be: listenner/puller/ranker

... with that we should be set

PS: in case you want to modify something you have to delete the k configuration manually by running

\`\`\`
kubectl delete -f ./packages/SERVICE/gitops/candidates
\`\`\`

**and GOTO to Build the...**

# Service Architecture

[This diagram](https://docs.google.com/drawings/d/1NnUBD5uDL-B5rHRX46Q4ml0Rd1yNSC489tuDKOocsjE/edit?usp=sharing)

The solution is divided into 3 services with the following responsibilities:

## listenner

Reacts to changes in the candidates/opportunities collections; every time any of the document properties affecting the rank are modified, it reacts and drops a message into an associated Redis channel

## puller

reacts when a message is stored in the associated Redis channel for each change. It is responsible for running the necessary MongoDB aggregations to obtain the tuples (candidate, opportunity) with the values of the necessary properties to calculate the rank; once it has obtained this information it sends it to the Redis channel associated with the Rank service

## ranker

There are 2 generic and 2 specific evaluations:

* between: evaluates that a value is in a range, applies to age and experience. If the value is within the range, it assigns a weight of 1, otherwise 0

* intersection: evaluates set intersections (arrays), applies to professions, skills and fieldsOfStudy. Assigns a weight equal to the quotient between the total values required by the opportunity and the values possessed by the candidate [for example](https://bitbucket.org/worcket/rank-service/src/0b97ebef6af9ffb10116ba424099b900650ce846/packages/ranker/tests/intersection.test.ts#lines-34)

* educationLevel: evaluates the level of education, applies only to educationLevel. Assigns a weight of 1 if the candidate has a higher or equal level of education than the vacancy; 0 otherwise

* languagesLevel evaluates languages, applies only to languagesLevel. Assigns a weight equal to the quotient between the total values required by the opportunity and the values possessed by the candidate using the following logic:
  * assigns 1 in case the language matches and the candidate's language level is GREATER or EQUAL to the required level
  * assigns 0.25 in case the language matches but the candidate's level is LOWER than the required level
  * otherwise assigns 0
  * ... [the tests](https://bitbucket.org/worcket/rank-service/src/release/packages/ranker/tests/languagesLevel.test.ts) make it clearer

## configuration

ALL services use the following environment variables:

* MONGODB_URI: mongodb+srv://USER:PASSW@qa-tihwj.mongodb.net/wrckdb
* REDIS_URI: redis://redis-bus:6379
* HEALTHCHECK_PORT: 3000
* DEBUG: verbose

the specific environment variables for each service are described below:

The **listenner** service configuration for detecting changes in **candidates** is as follows:
  * MONGODB_COLLECTION: candidates
  * REDIS_PUSH_CHANNEL: candidates
  * MONGODB_WATCH_PROPERTIES: age,experience,educationLevel,languages,professions,skills,fieldsOfStudy

The **listenner** service configuration for detecting changes in **opportunities** is as follows:
  * MONGODB_COLLECTION: opportunities
  * REDIS_PUSH_CHANNEL: opportunities
  * MONGODB_WATCH_PROPERTIES: ageRange,experienceRange,educationLevelsAdvanced,languages,professions,skillsReq,fieldsOfStudy

The **puller** service configuration for detecting changes in **candidates** is as follows:
  * REDIS_READ_CHANNEL: candidates
  * REDIS_PUSH_CHANNEL: ranker

The **puller** service configuration for detecting changes in **opportunities** is as follows:
  * REDIS_READ_CHANNEL: opportunities
  * REDIS_PUSH_CHANNEL: ranker

## deploy and data flow

As shown by the configuration, listenner and puller must be configured to work with candidates or opportunities, ranker on the other hand, is generic

[the following diagram shows what the deployment is](https://docs.google.com/drawings/d/1pjgPm0DxWJIIcslw2aX4SvNESYhvPJApu2zsKwrg_xc/edit?usp=sharing)
