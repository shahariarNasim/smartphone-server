const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://smartphone:mE9g3k6zCDwgDl7L@cluster0.lgvfm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {

    await client.connect();
    const database = client.db('mobile')
    const productsCollection = database.collection('products')
    const reviewsCollection = database.collection('reviews')
    const ordersCollection = database.collection('orders')
    const usersCollection = database.collection('users')

    app.get('/products', async (req, res) => {
      const myProducts = productsCollection.find({});
      const products = await myProducts.toArray();
      res.send(products);
    })
    app.get('/products/:id', async (req, res) => {
      const productId = { _id: ObjectId(req.params.id) };
      const product = await productsCollection.findOne(productId);
      res.json(product);
    })
    app.get('/reviews', async (req, res) => {
      const reviews = reviewsCollection.find({})
      const allReview = await reviews.toArray();
      res.json(allReview);
    })
    app.get('/orders', async (req, res) => {
      const orders = ordersCollection.find({})
      const allOrders = await orders.toArray();
      res.json(allOrders);
    })

    app.get('/orders/:id', async (req, res) => {
      const orderId = { _id: ObjectId(req.params.id) };
      const order = await ordersCollection.findOne(orderId);
      res.json(order);
    })

    app.get('/users', async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });

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

    // ................................................................./

    app.post('/reviews', async (req, res) => {
      const productReveiew = await reviewsCollection.insertOne(req.body)
      res.json(productReveiew);
    })
    app.post('/orders', async (req, res) => {
      const orders = await ordersCollection.insertOne(req.body)
      res.json(orders);
    })

    app.post("/products", async (req, res) => {
      const addProduct = req.body;
      const result = await productsCollection.insertOne(addProduct);
      res.json(result);

    });
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result)
    });

    //PUI API
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })

    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
          $set: {
              status: updatedOrder.status,
          },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc, options)
      console.log('updating', updateDoc)
      res.json(result)
  })


    //Delete API
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      console.log("deleting user with id ", result);
      res.json(result);
    })

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      console.log("deleting user with id ", result);
      res.json(result);
    })

    app.delete("/Reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      console.log("deleting Review with id ", result);
      res.json(result);
    })


  }
  finally {
    // await client.close();
  }
}

run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Running my Server");
});

app.listen(port, () => {
  console.log("Running Server on port", port);
});
