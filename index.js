const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require('cors')

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.drus3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri)
async function run() {
    try {
        await client.connect();
        const database = client.db('f2pData');
        const gameCollection = database.collection('f2pdata');
        const usersCollection = database.collection('users');

        //get API
        app.get('/games', async (req, res) => {
            const cursor = gameCollection.find({});
            const games = await cursor.toArray();
            res.send(games)
        })

        // get single item by GENRE
        app.get('/games/genre/:genre', async (req, res) => {
            const gameGenre = req.params.genre;
            // console.log(gameGenre);
            const query = { genre: gameGenre };
            // console.log(query);

            // const options = { projection: { _id: 0, title: 1 } };
            const options = {};
            // console.log(options)

            const cursor = gameCollection.find(query, options);
            const result = await cursor.toArray();
            res.json(result);
        })


        // get single item by ID
        app.get('/games/:id', async (req, res) => {
            const itemId = req.params.id;
            console.log(itemId)
            const query = { _id: ObjectId(itemId) };
            const singleGame = await gameCollection.findOne(query);
            res.json(singleGame);
        })


        // POST API
        app.post('/games', async (req, res) => {
            const addGame = req.body;
            console.log(addGame);
            const result = await gameCollection.insertOne(addGame);
            res.json(result);
        })

        // Delete API 
        app.delete('/games/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await gameCollection.deleteOne(query);
            res.json(result);
        })

        // Add game
        app.post('/games', async (req, res) => {
            const newGame = req.body;
            const result = await gameCollection.insertOne(newGame);
            res.send(result);
        })

        // users data post to mongodb
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log('user result', result);
            res.json(result);
        })


        // check admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


    }
    finally {
        // await client.close();
    }
}


run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Server Status: Up & Running')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})