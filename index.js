// const express = require('express');
// const dotenv = require("dotenv");



// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const cors = require("cors");
// const { createRemoteJWKSet } = require('jose-cjs');
// dotenv.config();
// const app = express();
// app.use(cors())
// const port = process.env.PORT || 8080;

// // username= mentora

// const uri = process.env.MONGODB_URI;

//   const JWKS = createRemoteJWKSet(
//      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
//     )


  
 
// console.log(process.env.CLIENT_URL);

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });



// const logger =  (req, res, next) => {
//           console.log(`${req.method} | ${req.url}`);
//           next();
//         };

//         const verifyToken = async (req, res, next) => {
//           const { authorization } = req.headers;
//           const token = authorization?.split(" ")[1];
//           // console.log(token);


//        if (!token) {
//           return res.status(401).json({ message: "Unauthorized" });
//        }  


//         try {
//     const JWKS = createRemoteJWKSet(
//       new URL('http://localhost:3000/api/auth/jwks')
//     )
//     const { payload } = await jwtVerify(token, JWKS,)
     
//     req.user = payload;
//     console.log(req.user);

//      next();
    
//   } catch (error) {
//     console.error('Token validation failed:', error)
//     throw error;
//      return res.status(401).json({ message: "Unauthorized" });
//   }
       
           
// }




       
      

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     // await client.db("admin").command({ ping: 1 });

//       // const db = client.db("mentoradb");
//       // const coursesCollection = db.collection("Tutor");
//       // const coursesCollection = db.collection("Tutor");
   
//       // app.get("/courses",async(req, res) => {
//       //   const cursor = coursesCollection.find();
//       //   const result = await cursor.toArray();
//       //   console.log(result);

//       // })

//     const db = client.db("mentoradb");
// const coursesCollection = db.collection("courses");
// const  enrollmentCollection = db.collection("enrollments");

// app.get("/courses", async (req, res) => {
//    const {search} = req.query;

//    let cursor;
//     if(search){
//       cursor = coursesCollection.find({ title: search });
//     } else {
//       cursor = coursesCollection.find();
//     }
  
  
//   const result = await cursor.toArray();
//   console.log(result);
  
//   res.send(result);
  

// });

//       app.get("/featured", async(req, res) => {
       
//          const cursor = coursesCollection.find().limit(6);
//          const result = await cursor.toArray();
        
//          res.send(result);

//       })
  

//       app.get("/tutors/:courseId", 
//         logger,
//         verifyToken,
//         async (req, res) => {
//          const { courseId } = req.params;
//         //  console.log(req.params);
         
//           const query = {_id: new ObjectId(courseId)}
//           const result = await coursesCollection.findOne(query);
//           res.send(result)
//         });

//         app.patch("/enrollments/:courseId", verifyToken, async(req, res) => {
//           const { courseId } = req.params;
//           const enrollmentData = req.body;

//           const tutors = await coursesCollection.findOne({_id: new ObjectId(courseId)});
//           if(!tutors){
//              res.status(404).json({ message: "Course not found" }); 
//           }

//           await coursesCollection.updateOne({_id: new ObjectId(courseId)}, {
//               $inc: { enrolledStudents: 1 },
//               $set: {
//                 lastEnrolledAt: new Date(),
//               }
//           })

//           const result = await enrollmentCollection.insertOne({
//           ...enrollmentData,
//           enrolledAt: new Date(),
//         }); 
//           res.send(result);

//         })

       


//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);







// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })




// // eyJhbGciOiJFZERTQSIsImtpZCI6IjZhMGUwYTkwNWYwNzg5ZDg2ZGQ1NjJjNyJ9.eyJpYXQiOjE3Nzk4MTc2OTcsIm5hbWUiOiJyaW1vbiIsImVtYWlsIjoiZW1vbnZAZ21haWwuY29tIiwiZW1haWxWZXJpZmllZCI6ZmFsc2UsImltYWdlIjoiaHR0cHM6Ly9waXhhYmF5LmNvbS9waG90b3MvZmxvd2VyLWhhcHB5LWVhc3Rlci1tYXJndWVyaXRlLTcyOTUxMC8iLCJjcmVhdGVkQXQiOiIyMDI2LTA1LTIwVDA5OjIwOjAyLjMxMFoiLCJ1cGRhdGVkQXQiOiIyMDI2LTA1LTIwVDA5OjIwOjAyLjMxMFoiLCJpZCI6IjZhMGQ3Y2MyYzBiZDI0NDg1NTA0Y2YyNCIsInN1YiI6IjZhMGQ3Y2MyYzBiZDI0NDg1NTA0Y2YyNCIsImV4cCI6MTc3OTgxODU5NywiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwIn0.WKXsSlKGuo_nO3sUa-PrI-eGY0GuGf5wO3B1gAUw4ovBt0Lsd7SGrvkkrYA7Yw881DR-pG3OIwZOK4FDQUktAg




const express = require('express');
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");

// FIXED: Added jwtVerify to the imports from jose-cjs
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json()); // Added middleware to parse JSON request bodies (needed for POST/PATCH)

const port = process.env.PORT || 8080;
const uri = process.env.MONGODB_URI;

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);

console.log(process.env.CLIENT_URL);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Logger Middleware
const logger = (req, res, next) => {
  console.log(`${req.method} | ${req.url}`);
  next();
};

// Token Verification Middleware
const verifyToken = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const JWKS = createRemoteJWKSet(
      new URL('http://localhost:3000/api/auth/jwks')
    );
    
    // This will now work perfectly since jwtVerify is imported above
    const { payload } = await jwtVerify(token, JWKS);
    
    req.user = payload;
    console.log(req.user);
    next();
    
  } catch (error) {
    console.error('Token validation failed:', error.message);
    // FIXED: Removed "throw error" so it gracefully responds instead of crashing the server
    return res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};

async function run() {
  try {
    await client.connect();
    
    const db = client.db("mentoradb");
    const coursesCollection = db.collection("courses");
    const enrollmentCollection = db.collection("enrollments");

    // Get all courses or search courses
    app.get("/courses", async (req, res) => {
      const { search } = req.query;
      let cursor;
      
      if (search) {
        cursor = coursesCollection.find({ title: search });
      } else {
        cursor = coursesCollection.find();
      }

      const result = await cursor.toArray();
      res.send(result);
    });

    // Get featured courses
    app.get("/featured", async (req, res) => {
      const cursor = coursesCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get single tutor/course details (Protected Route)
    app.get("/tutors/:courseId", 
      logger,
      verifyToken,
      async (req, res) => {
        const { courseId } = req.params;
        const query = { _id: new ObjectId(courseId) };
        const result = await coursesCollection.findOne(query);
        res.send(result);
      }
    );

    app.get("/enrollments/:userId", verifyToken, async (req, res) => {
      const { userId } = req.params;
      const result = await enrollmentCollection.find({ userId }).toArray();
      res.send(result);

    })

    // Enroll into a course (Protected Route)
    app.patch("/enrollments/:courseId", verifyToken, async (req, res) => {
      const { courseId } = req.params;
      const enrollmentData = req.body;

      const tutors = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
      if (!tutors) {
        return res.status(404).json({ message: "Course not found" });
      }

      await coursesCollection.updateOne(
        { _id: new ObjectId(courseId) }, 
        {
          $inc: { enrolledStudents: 1 },
          $set: { lastEnrolledAt: new Date() }
        }
      );

      const result = await enrollmentCollection.insertOne({
        ...enrollmentData,
        enrolledAt: new Date(),
      });
      
      res.send(result);
    });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});