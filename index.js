const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

dotenv.config();

const app = express();

// =====================================================
// MIDDLEWARE (CORS & Credentials Setup)
// =====================================================

const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

const allowedOrigins = [
  clientUrl,
  "http://localhost:3000",
  "https://assigment-9-perject.vercel.app",
]; 

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-safe fallback
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// app.use(cors())

app.use(express.json());

// =====================================================
// ENV & CONFIG
// =====================================================

const port = process.env.PORT || 8080;
const uri = process.env.MONGODB_URI;
const BETTER_AUTH_URL =
  process.env.CLIENT_URL;

if (!uri) {
  console.error("❌ MONGODB_URI is not defined!");
}

// =====================================================
// MONGODB CLIENT SETUP (Optimized for Vercel Serverless)
// =====================================================

let cachedClient = null;
let cachedDb = null;

async function connectDB() {
  if (cachedDb) {
    return {
      db: cachedDb,
      coursesCollection: cachedDb.collection("courses"),
      bookingsCollection: cachedDb.collection("bookings"),
    };
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db("mentoradb");
  console.log("✅ Connected to MongoDB Atlas (mentoradb)");

  return {
    db: cachedDb,
    coursesCollection: cachedDb.collection("courses"),
    bookingsCollection: cachedDb.collection("bookings"),
  };
}

// Attach DB collections to request object
app.use(async (req, res, next) => {
  try {
    const { coursesCollection, bookingsCollection } = await connectDB();
    req.coursesCollection = coursesCollection;
    req.bookingsCollection = bookingsCollection;
    next();
  } catch (error) {
    console.error("❌ DB Connection Middleware Error:", error);
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// =====================================================
// LOGGER
// =====================================================

const logger = (req, res, next) => {
  console.log(`${req.method} | ${req.url}`);
  next();
};

app.use(logger);

// =====================================================
// BETTER AUTH SESSION VERIFICATION
// =====================================================

const verifyToken = async (req, res, next) => {
  try {
    const rawCookie = req.headers.cookie || "";
    const authorization = req.headers.authorization || "";

    const bearerToken = authorization.startsWith("Bearer ")
      ? authorization.split(" ")[1]
      : null;
      console.log(bearerToken )

    if (
      !rawCookie &&
      (!bearerToken ||
        bearerToken === "undefined" ||
        bearerToken === "null")
    ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Session expired or invalid",
      });
    }

    // const headersToForward = {
    //   ...(rawCookie ? { cookie: rawCookie } : {}),
    //   ...(authorization ? { authorization: authorization } : {}),
    // };

    // if (!rawCookie && bearerToken) {
    //   // headersToForward["cookie"] = `better-auth.session_token=${bearerToken}`;
     
    //      headersToForward["cookie"] = `better-auth.session_token=${bearerToken}; __Secure-better-auth.session_token=${bearerToken}`;
    // }

    // const authRes = await fetch(
    //   `${BETTER_AUTH_URL}/api/auth/get-session`,
    //   {
    //     method: "GET",
    //     headers: headersToForward,
    //   }
    // );
    // console.log(authRes)

    // if (!authRes.ok) {
    //   console.error(
    //     `❌ Better Auth responded with status: ${authRes.status}`
    //   );

    //   return res.status(401).json({
    //     success: false,
    //     message: "Unauthorized: Session expired or invalid",
    //   });
    // }

    // const sessionData = await authRes.json();
    // const user = sessionData?.user || sessionData?.data?.user;

    // if (!sessionData || !user) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Unauthorized: Session expired or invalid",
    //   });
    // } 
    // console.log(user)

    // req.user = {
    //   id: user.id || user._id,
    //   sub: user.id || user._id,
    //   email: user.email,
    //   name: user.name,
    //   role: user.role || "user",
    // };

    next();
  } catch (error) {
    console.error(
      "❌ Better Auth verification failed:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Unauthorized: Session expired or invalid",
    });
  }
};





// =====================================================
// ROUTES
// =====================================================

app.get("/", (req, res) => {
  res.send("🚀 MentorA Server Running Successfully!");
});

// -------------------------------------------------
// ADD TUTOR
// -------------------------------------------------

app.post("/tutors", verifyToken, async (req, res) => {
  try {
    const {
      tutorName,
      photoURL,
      subjectCategory,
      availableDaysAndTime,
      hourlyFee,
      totalSlot,
      sessionStartDate,
      institution,
      experience,
      location,
      teachingMode,
      userId,

    } = req.body;

    if (
      !tutorName ||
      !photoURL ||
      !subjectCategory ||
      !availableDaysAndTime ||
      hourlyFee === undefined ||
      totalSlot === undefined ||
      !sessionStartDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // const userId = req.user?.sub || req.user?.id || req.user?.email;

    const tutorDocument = {
      type: "tutor",
      tutorName: tutorName.trim(),
      photoURL: photoURL.trim(),
      subjectCategory: subjectCategory.trim(),
      availableDaysAndTime: availableDaysAndTime.trim(),
      hourlyFee: Number(hourlyFee),
      totalSlot: Number(totalSlot),
      sessionStartDate,
      institution: institution?.trim() || "",
      experience: experience?.trim() || "",
      location: location?.trim() || "",
      teachingMode: teachingMode || "Online",
      userId,
      createdAt: new Date(),
    };

    const result = await req.coursesCollection.insertOne(tutorDocument);

    return res.status(201).json({
      success: true,
      message: "Tutor added successfully!",
      insertedId: result.insertedId,
      tutor: {
        ...tutorDocument,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("❌ Add tutor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add tutor",
    });
  }
});

// -------------------------------------------------
// GET ALL TUTORS
// -------------------------------------------------

app.get("/tutors", async (req, res) => {
  try {
    const { searchTerm, startDate, endDate } = req.query;
    const query = { type: "tutor" };

    if (searchTerm && searchTerm.trim() !== "") {
      const searchRegex = {
        $regex: searchTerm.trim(),
        $options: "i",
      };

      query.$or = [
        { tutorName: searchRegex },
        { subjectCategory: searchRegex },
        { location: searchRegex },
      ];
    }

    if (startDate || endDate) {
      query.sessionStartDate = {};
      if (startDate) query.sessionStartDate.$gte = startDate;
      if (endDate) query.sessionStartDate.$lte = endDate;
    }

    const tutors = await req.coursesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(tutors);
  } catch (error) {
    console.error("❌ Get tutors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tutors",
    });
  }
});

// -------------------------------------------------
// GET MY TUTORS
// -------------------------------------------------

app.get("/my-tutors",verifyToken, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?.email;

    const tutors = await req.coursesCollection
      .find({
        type: "tutor",
        userId,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      tutors,
    });
  } catch (error) {
    console.error("❌ Get my tutors error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your tutors",
    });
  }
});
     
// -------------------------------------------------
// GET SINGLE TUTOR
// -------------------------------------------------

app.get("/tutors/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tutor ID",
      });
    }

    const tutor = await req.coursesCollection.findOne({
      _id: new ObjectId(id),
      type: "tutor",
    });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    return res.status(200).json(tutor);
  } catch (error) {
    console.error("❌ Get tutor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tutor",
    });
  }
});

// -------------------------------------------------
// UPDATE TUTOR
// -------------------------------------------------

app.put("/tutors/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tutor ID",
      });
    }

    const userId = req.user?.sub || req.user?.id || req.user?.email;

    const {
      tutorName,
      photoURL,
      subjectCategory,
      availableDaysAndTime,
      hourlyFee,
      totalSlot,
      sessionStartDate,
      institution,
      location,
      teachingMode,
      experience,
    } = req.body;

    if (
      !tutorName ||
      !photoURL ||
      !subjectCategory ||
      !availableDaysAndTime ||
      hourlyFee === undefined ||
      totalSlot === undefined ||
      !sessionStartDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const updatedTutor = {
      tutorName: tutorName.trim(),
      photoURL: photoURL.trim(),
      subjectCategory: subjectCategory.trim(),
      availableDaysAndTime: availableDaysAndTime.trim(),
      hourlyFee: Number(hourlyFee),
      totalSlot: Number(totalSlot),
      sessionStartDate,
      institution: institution?.trim() || "",
      location: location?.trim() || "",
      teachingMode: teachingMode || "Online",
      experience: experience?.trim() || "",
      updatedAt: new Date(),
    };

    const result = await req.coursesCollection.updateOne(
      {
        _id: new ObjectId(id),
        type: "tutor",
        userId,
      },
      {
        $set: updatedTutor,
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found or not authorized to edit",
      });
    }

    const updatedDocument = await req.coursesCollection.findOne({
      _id: new ObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: "Tutor updated successfully!",
      tutor: updatedDocument,
    });
  } catch (error) {
    console.error("❌ Update tutor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update tutor",
      error: error.message,
    });
  }
});

// -------------------------------------------------
// DELETE TUTOR
// -------------------------------------------------

// app.delete("/tutors/:id", verifyToken, async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid tutor ID",
//       });
//     }

//     const userId = req.user.id;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "User ID not found",
//       });
//     }

//     const tutor = await req.coursesCollection.findOne({
//       _id: new ObjectId(id),
//       type: "tutor",
//     });

//     if (!tutor) {
//       return res.status(404).json({
//         success: false,
//         message: "Tutor not found",
//       });
//     }

//     if (String(tutor.userId) !== String(userId)) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not authorized to delete this tutor",
//       });
//     }

//     const result = await req.coursesCollection.deleteOne({
//       _id: new ObjectId(id),
//       userId: userId,
//       type: "tutor",
//     });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Tutor not found or already deleted",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Tutor deleted successfully!",
//     });
//   } catch (error) {
//     console.error("❌ DELETE TUTOR ERROR:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server error while deleting tutor",
//     });
//   }
// });

app.delete("/tutors/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tutor ID",
      });
    }

    // সরাসরি ID দিয়ে ডিলিট
    const result = await req.coursesCollection.deleteOne({
      _id: new ObjectId(id),
      type: "tutor",
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found or already deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tutor deleted successfully!",
    });
  } catch (error) {
    console.error("❌ DELETE TUTOR ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting tutor",
    });
  }
});

// -------------------------------------------------
// CREATE BOOKING
// -------------------------------------------------

app.post("/api/bookings", verifyToken, async (req, res) => {
  try {
    const { tutorId, studentEmail, studentName, phone } = req.body;

    if (!tutorId || !ObjectId.isValid(tutorId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Tutor ID is required",
      });
    }

    const userId = req.user?.sub || req.user?.id || req.user?.email;

    const tutor = await req.coursesCollection.findOne({
      _id: new ObjectId(tutorId),
      type: "tutor",
    });

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    if (tutor.totalSlot === undefined || tutor.totalSlot <= 0) {
      return res.status(400).json({
        success: false,
        message: "No available slots left.",
      });
    }

    const existingBooking = await req.bookingsCollection.findOne({
      tutorId: new ObjectId(tutorId),
      userId,
      bookStatus: { $ne: "Cancelled" },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You have already booked this tutor",
      });
    }

    const slotUpdate = await req.coursesCollection.updateOne(
      {
        _id: new ObjectId(tutorId),
        totalSlot: { $gt: 0 },
      },
      {
        $inc: { totalSlot: -1 },
      }
    );

    if (slotUpdate.modifiedCount !== 1) {
      return res.status(400).json({
        success: false,
        message: "Failed to reduce slot or no slots left.",
      });
    }

    const bookingDoc = {
      userId,
      tutorId: new ObjectId(tutorId),
      tutorName: tutor.tutorName || "",
      studentName: studentName?.trim() || "",
      studentEmail: studentEmail?.trim() || "",
      phone: phone?.trim() || "",
      subjectCategory: tutor.subjectCategory || "",
      bookStatus: "Pending",
      createdAt: new Date(),
    };

    try {
      const result = await req.bookingsCollection.insertOne(bookingDoc);

      return res.status(201).json({
        success: true,
        message: "Booking confirmed successfully! 🎉",
        bookingId: result.insertedId,
      });
    } catch (insertError) {
      await req.coursesCollection.updateOne(
        { _id: new ObjectId(tutorId) },
        { $inc: { totalSlot: 1 } }
      );
      throw insertError;
    }
  } catch (error) {
    console.error("❌ Booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// -------------------------------------------------
// GET MY BOOKINGS
// -------------------------------------------------

app.get("/api/bookings/my-bookings", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?.email;

    const bookings = await req.bookingsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("❌ Get bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
});

// -------------------------------------------------
// CANCEL BOOKING
// -------------------------------------------------

app.delete("/api/bookings/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const userId = req.user?.sub || req.user?.id || req.user?.email;

    const booking = await req.bookingsCollection.findOne({
      _id: new ObjectId(id),
      userId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.bookStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking already cancelled",
      });
    }

    await req.bookingsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          bookStatus: "Cancelled",
          cancelledAt: new Date(),
        },
      }
    );

    if (booking.tutorId) {
      await req.coursesCollection.updateOne(
        { _id: new ObjectId(booking.tutorId) },
        { $inc: { totalSlot: 1 } }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully!",
    });
  } catch (error) {
    console.error("❌ Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
});

// Local test server
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`🚀 Local Server running on port ${port}`);
  });
}

module.exports = app;



