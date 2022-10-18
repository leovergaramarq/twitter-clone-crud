const user = process.env.MONGO_USERNAME || 'user';
const pwd = process.env.MONGO_PASSWORD || 'secret';
const dbName = process.env.MONGO_INITDB_DATABASE || 'twitter-clone-db';

if(!process.env.MONGO_INITDB_ROOT_USERNAME || !process.env.MONGO_INITDB_ROOT_PASSWORD) {
    // Select db 'admin'
    db = db.getSiblingDB('admin');
    // Create admin user
    db.createUser( { user: 'admin', pwd: 'secret', roles: [ { role: 'userAdminAnyDatabase', db: 'admin' }, 'readWriteAnyDatabase' ] } );
} else {
    // db.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD);
}
// Use twitter db
db = db.getSiblingDB(dbName);

// Create twitter db user
db.createUser( { user, pwd, roles: [ { role: 'readWrite', db: dbName } ] } );

// Authenticate twitter db user
// db.auth(user, pwd);

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
