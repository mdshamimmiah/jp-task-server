const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const multer = require('multer'); // Multer ইমপোর্ট করা হয়েছে
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // Multer কনফিগারেশন

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6ouqbod.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    // await client.connect();
    // console.log("Connected to MongoDB successfully!");

    const database = client.db('admissionDB');
    const AdmissionCollection = database.collection('admission');
    const database1 = client.db('CollegeDB');
    const AdmissionCollection1 = database1.collection('college');
    
   
    // POST route to handle admission form submissions
    app.post('/admission', upload.single('image'), async (req, res) => {
      try {
        // Extract data from request
        const { name, subject, email, phone, address, dob, college } = req.body;
        const image = req.file.buffer;

        // Construct document to insert into MongoDB
        const data = {
          name, subject, email, phone, address, dob, college, image
        };

        // Insert document into MongoDB collection
        const result = await AdmissionCollection.insertOne(data);
        console.log("Inserted document with ID:", result.insertedId);

        // Send response
        res.status(201).json({ message: 'Application submitted successfully' });
      } catch (error) {
        console.error("Error inserting document:", error);
        res.status(500).json({ error: 'Failed to submit application' });
      }
    });
    app.get('/college', async (req, res) => {
      const result = await AdmissionCollection1.find().toArray();
      res.send(result);
    })
    app.get('/details/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await AdmissionCollection1.findOne(query);
      res.send(result);

    })
    app.get('/search', async (req, res) => {
      const filter = req.query.search;
      const query = {
        collegeName: { $regex: filter, $options: 'i' } // Case-insensitive search
      };

      try {
        const cursor = await AdmissionCollection1.find(query).toArray();
        res.json(cursor);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    });


    // GET route to fetch admission data
    app.get('/admission', async (req, res) => {
      try {
        const result = await AdmissionCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching admission data:", error);
        res.status(500).json({ error: 'Failed to fetch admission data' });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('jp task is running');
});

app.listen(port, () => {
  console.log(`jp task is running on port ${port}`);
});

