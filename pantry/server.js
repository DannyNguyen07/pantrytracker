const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const admin = require("firebase-admin");
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert({
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  })
});
const db = admin.firestore();

const app = express();
const port = 5000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/recognize", upload.single("image"), async (req, res) => {
  const imageBuffer = req.file.buffer.toString("base64");

  try {
    const response = await fetch("https://api.openai.com/v1/images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        prompt: "Identify the object in this image in one word or a short phrase (less than 4 words).",
        image: imageBuffer
      })
    });

    const data = await response.json();
    const itemName = data.choices[0].text.trim(); 

    const docRef = db.collection("pantry").doc(itemName);
    const docSnap = await docRef.get();

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await docRef.set({ count: count + 1 });
    } else {
      await docRef.set({ count: 1 });
    }

    res.json({ item: itemName });
  } catch (error) {
    console.error("Error recognizing image:", error);
    res.status(500).send("Error recognizing image");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
