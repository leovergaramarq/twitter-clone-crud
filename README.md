# twitter-clone-crud

Simple CRUD based on twitter. Resources cover users, tweets, likes, follows and timelines.

## Built With
 - [Node.js](https://nodejs.org/es/)

 - [MongoDB Atlas](https://www.mongodb.com/es/atlas)

 - [Docker](https://www.docker.com)

 - [Visual Studio Code](https://code.visualstudio.com)

## Getting Started
You can clone this repsitory to get the source code

    git clone https://github.com/leovergaramarq/twitter-clone-crud.git

### Database

You have two options to run the database: remote (already hosted with MongoDB Atlas) and local (using Docker).

#### Remote (recommended)

Just proceed to the **API** section.

#### Local

Perfect for people with a lot of patience and time. Since the API uses **transaction operations**, it is necessary to use [MongoDb Replication](https://www.mongodb.com/docs/manual/replication/). Make sure you have **docker-compose** installed on your system.

1. Add "127.0.0.1 db0 db1 db2" to the end of the "/etc/hosts" file if using Linux or to "C:\Windows\System32\drivers\etc\hosts" if using Windows.

2. Locate your terminal on the project root directory. By default, you would run the API using Node.js. However, you can also run it using containers. To do this, uncomment the lines shown below in the "docker-compose.yml".

<img src="https://user-images.githubusercontent.com/73978713/200111535-cdeb0dcd-eb2f-42d2-9f7a-86a4f3199f68.png" height="360">

3. Run `docker-compose up --attach db-setup` to build the images and launch the containers. This will start 3 services: `db2`, `db1`, `db0` and `db-setup` (and, optionally, `api`). The option `--attach db-setup` will let you check the status from this service.

4. Unless the last output from the `db-setup` service looks like the image below, go back to **step 3**. **Note:** You might need to repeat this process up to 3 or 4 times (for some reason, Replica Sets are hard to coordinate using Docker). **Important:** the final log message should be `db-rs [direct: primary] twitter-clone-db> ********************** SETUP ENDED` (note the "direct: primary").

<img src="https://user-images.githubusercontent.com/73978713/200113157-600d4f2b-853a-47d1-b4f2-0c08024064f3.png" height="200">

5. Now, your Replica Set is configured and ready for the API to use it. If you are going to run the API using Node.js, don't forget to comment this line from the "/api/.env" file (relative to the project root directory):

<img src="https://user-images.githubusercontent.com/73978713/200113534-2d632385-a205-4064-96da-14914b11ad9d.png" height="160">

### API

On the project directory /api (you can run `cd api` from the project root directory), run

    npm start

This will start your server on port 3000

<img src="https://user-images.githubusercontent.com/73978713/200113735-7a8cd64d-c293-40a0-b0e0-93ecdfa41d73.png" height="100">

## Usage
|Method + Enpoint|Resource|JSON Body Fields|
|--|--|--|
|GET /users|Get all users||
|GET /users/:id|Get user by id||
|POST /users|Create user|name, username, bio, interests|
|PUT /users/:id|Update user by id|name, username, bio, interests|
|DELETE /users/:id|Delete user by id||
|GET /tweets|Get all tweets||
|GET /tweets/:id|Get tweet by id||
|POST /tweets|Create tweet|text, by|
|PUT /tweets/:id|Update tweet by id|text|
|DELETE /tweets/:id|Delete tweet by id||
|POST /follow|Follow|user (id), follow (id from user to follow)|
|DELETE /follow|Unfollow|user (id), follow (id from user to unfollow)|
|POST /like|Like|user (id), tweet (id from tweet to like)|
|DELETE /like|Remove like|user (id), tweet (id from tweet to "unlike")|
|GET /users/:id/timeline|Get user timeline (feed)||

## Acknowledgements

 - [Insomnia](https://insomnia.rest)
