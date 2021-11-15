const express = require('express')
const app = express();
require('dotenv').config();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;

app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.otdtg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("bike_hat");
        const bikesCollection = database.collection("bikes");
        const ordersCollection = database.collection("orders");
        const usersCollection = database.collection("users");
        const reviewCollection = database.collection("review");

        app.get('/', (req, res) => {
            res.send('Server connected');
        });
        // GET Method
        app.get('/bikes', async (req, res) => {
            const cursor = bikesCollection.find({})
            const result = await cursor.toArray();
            res.json(result);
        });
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({})
            const result = await cursor.toArray();
            res.json(result);
        });
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({})
            const result = await cursor.toArray();
            res.json(result);
        });

        app.get('/ordersByEmail', async (req, res) => {
            const email = req.query.email;
            const query = {email : email}
            const cursor = ordersCollection.find(query)
            const result = await cursor.toArray();
            res.json(result);
        });
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email : email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin : isAdmin})
        });
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({})
            const result = await cursor.toArray();
            console.log(result);
            res.json(result);
        });
        

        // POST Method
        app.post('/bikes', async (req, res) => {
            const newProduct = req.body;
            const result = await bikesCollection.insertOne(newProduct)
            res.json(result);
        });
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder)
            res.json(result);
        });
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            console.log(user);
            res.json(result);
        });
        app.post('/users/review', async (req, res) => {
            const review = req.body;
            console.log(review);
            const result = await reviewCollection.insertOne(review);
            console.log(result)
            res.json(result);
        });
        
        
        // PUT Method
        // app.put('/users', async (req, res) => {
        //     const user = req.body;
        //     const filter = {email : user.email};
        //     const options = {upsert : true};
        //     const updateDoc = {$set : user}
        //     const result = await usersCollection.updateOne(filter, updateDoc, options);
        //     res.json(result);
        // });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            console.log('admin role', user)
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result);
        });

        // DELETE Method
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id : ObjectId(id)}
            const result = await ordersCollection.deleteOne(query);
            res.json(result)
        })
        
        app.delete('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id : ObjectId(id)}
            const result = await bikesCollection.deleteOne(query);
            res.json(result)
        })
        
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log('listening with port ', port);
})