![SonarQube](https://github.com/RedHitMark/2_FACES_NET-backend/workflows/SonarQube/badge.svg)

# 2_FACES_NET - Backend
This is the backend application to manage 2Faces malware

## Installation
You can install this backend using Docker container or using node.js locally

### MongoDB
```
docker run --name 2facesnetmongo --restart always --volume ./mongo:/docker-entrypoint-initdb.d --env-file ./mongo/mongo.env -p 59999:27017 --detach  mongo:latest
```

### Run with Docker
Prerequisites:
* Install Docker on your machine
* Install docker-compose

Clone the repository
```
git clone https://github.com/RedHitMark/2_FACES_NET-backend.git
```
Move in the folder of the repository
```
cd 2faces-backend
```
Create a .env file based on this template
```
DOCKER_RUNNING=1
MONGO_USER=2_FACES_NET_USER
MONGO_PASSWORD=2_FACES_NET_PWD
MONGO_DATABASE=2_FACES_NET_DB
MONGO_PORT=60000
HOSTNAME=192.168.1.6
SERVER_PORT=60001
SOCKET_MAIN_PORT=60002
SOCKET_CODE_SENDER=60100
SOCKET_CODE_SENDER1=60300
SOCKET_COLLECTOR=60500
SOCKET_COLLECTOR1=60600
```
Run with docker-compose
```
sudo docker-compose up --build -d
```

### Run with NPM
Prerequisites:
* Install node.js on your machine
* Install npm on your machine
* Setup a mongodb server
* Import mongodb dump (check mongo folder)

Clone the repository
```
git clone https://github.com/RedHitMark/2_FACES_NET-backend.git
```
Move in the folder of the repository
```
cd 2faces-backend
```
Move in the app folder
```
cd app
```
Install dependencies
```
npm install && npm audit fix -- force
```
Launch server
```
npm start
```

### API endpoints available
Endpoint | Method | Description
------------ | ------------ | -------------
/web | GET | Landing page of 2Faces
/api/v.1.0/payloads | GET| Returns all available payloads
/api/v.1.0/payloads?payload_id=% | GET| Returns payload with given payload_id
/api/v.1.0/payloads | POST | Creates new payload 
/api/v.1.0/payloads?payload_id=% | PUT | Edits payload with given payload_id
/api/v.1.0/payloads?payload_id=% | DELETE | Deletes payload with given payload_id
/api/v.1.0/attacks | GET | Returns all attack's results
/api/v.1.0/attacks?attack_id=% | GET | Returns attack's result with given attack_id
/api/v.1.0/attacks?attack_id=% | DELETE | Deletes attack's result with given attack_id
/api/v.1.0/healthcheck | GET | Checks if the server is running
/api/v.1.0/devices | GET | Returns all Android devices connected
/api/v.1.0/devices | POST | Sends payload with given payload_id to device at given port 

