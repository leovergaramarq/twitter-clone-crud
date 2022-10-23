#!/bin/bash

echo "Waiting for startup..."
until curl http://db0:30001/serverStatus\?text\=1 2>&1 | grep uptime | head -1; do
  echo '.'
  sleep 1
done

mongosh --host db0:30001 -u admin -p secret <<EOF
    db = db.getSiblingDB('admin');
    db.auth('admin', 'secret');
    
    const cfg = {
        "_id": "db-rs",
        "version": 1,
        "members": [
            {
                "_id": 0,
                "host": 'db0:30001',
                "priority": 2
            },
            {
                "_id": 1,
                "host": 'db1:30002',
                "priority": 0
            },
            {
                "_id": 2,
                "host": 'db2:30003',
                "priority": 0
            }
        ],
        settings: {chainingAllowed: true}
    };
    rs.initiate(cfg, { force: true });
    rs.reconfig(cfg, { force: true });
    db.getMongo().setReadPref('primary');
    rs.status();
EOF
echo "Sleeping for 6 seconds..."
sleep 6

echo "********************** DB SETUP STARTING..."

mongosh --host db0:30001 -u admin -p secret <<EOF
    if(db.hello().secondary) {
        print("********************** NODE IS NOT PRIMARY, PLEASE RUN THIS CONTAINER AGAIN.\nEXITING...");
        quit();
    }

    const user = process.env.MONGO_USERNAME || 'user';
    const pwd = process.env.MONGO_PASSWORD || 'secret';
    const dbName = process.env.MONGO_INITDB_DATABASE || 'twitter-clone-db';

    if(!process.env.MONGO_INITDB_ROOT_USERNAME || !process.env.MONGO_INITDB_ROOT_PASSWORD) {
        // Select db 'admin'
        db = db.getSiblingDB('admin');
        // Create admin user
        // db.createUser( { user: 'admin', pwd: 'secret', roles: [ { role: 'userAdminAnyDatabase', db: 'admin' }, 'readWriteAnyDatabase' ] } );
        db.createUser( { user: 'admin', pwd: 'secret', roles: [ { role: 'root', db: 'admin' } ] } );
        db.auth('admin', 'secret');
    }
    // Use twitter db
    db = db.getSiblingDB(dbName);

    // Create twitter db user
    db.createUser( { user, pwd, roles: [ { role: 'readWrite', db: dbName } ] } );

    // Colllections
    db.createCollection('users');
    db.createCollection('tweets');
    db.createCollection('counters'); // For auto-incrementing ids

    // Insert data
    db.counters.insertMany([
        {
            _id: 'user_id',
            seq: 0
        },
        {
            _id: 'tweet_id',
            seq: 0
        }
    ]);

    // Indexes
    db.users.createIndex({ username: 1 }, { unique: true });

    rs.status();
EOF

echo "********************** SETUP ENDED"