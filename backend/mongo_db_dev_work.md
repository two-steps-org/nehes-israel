run docker-compose with mongo-db
[file] -

```yml
services:
  mongodb:
    image: mongo
    container_name: mongodb_with_volume
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

```sh
    docker-compose down
    docker-compose up -d
```

download mongo tools (if you don't already downloaded it) -
[link here](https://www.mongodb.com/try/download/database-tools)

run sync-db.sh - (on mac we have to try it on windows)
chmod +x sync-db.sh && ./sync-db.sh
