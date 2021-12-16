const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.otdtg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        // console.log('connected to database');
        const database = client.db('bike_hat');
        const productsCollection = database.collection('bikes');
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection('orders');
        const reviewCollection = database.collection('review');

        // GET API Products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // GET API review
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });


        // GET Single Product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific product', id);
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })
        // GET Single review
        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })

        // GET user
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

        // confirm order
        app.post("/confirmOrder", async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.send(result);
        });

        // get Order
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // POST API Products
        app.post('/products', async (req, res) => {
            // create a document to insert
            const product = req.body;
            // console.log('hit the post api', product);
            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result)
        });

        // POST API Users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        });

        //POST API User Review
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            // console.log(result);
            res.json(result)
        });

        // PUT API Products
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // PUT API Users/Admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });


        // DELETE Product API
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })

        //delete product
        app.delete("/deleteProduct/:id", async (req, res) => {
            console.log(req.params.id)
                ;
            const result = await productsCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            console.log(result);
            res.send(result);

        });

        //get myOrder
        app.get('/orders/:email', async (req, res) => {
            const result = await ordersCollection
                .find({ Email: req.params.email })
                .toArray();
            res.send(result);

        });


        // delete order
        app.delete("/deleteOrder/:id", async (req, res) => {
            const result = await ordersCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

        // update status
        app.put("/updateStatus/:id", (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body.status;
            const filter = { _id: ObjectId(id) };
            console.log(updatedStatus);
            ordersCollection
                .updateOne(filter, {
                    $set: { status: updatedStatus },
                })
                .then((result) => {
                    res.send(result);
                });
        });
    }
    finally {
        // await client.close();
    }
}


run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('bike hat server started!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})