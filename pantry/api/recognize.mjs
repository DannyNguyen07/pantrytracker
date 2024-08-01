import multer from 'multer';
import admin from 'firebase-admin';
import fetch from 'node-fetch';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

const upload = multer().single('image');

// Initialize Firebase if not already initialized
if (!admin.apps.length) {
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
}

const db = admin.firestore();

export default function handler(req, res) {
  console.log('Request received');
  
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).send(err.message);
    }

    const imageBuffer = req.file.buffer.toString('base64');
    console.log('Image received and converted to base64');

    try {
      const response = await fetch('https://api.openai.com/v1/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          prompt: 'Identify the object in this image in one word or a short phrase (less than 4 words).',
          image: imageBuffer
        })
      });

      console.log('OpenAI response received');

      const data = await response.json();
      const itemName = data.choices[0].text.trim(); // Adjust based on actual API response structure
      console.log('Item recognized:', itemName);

      // Add recognized item to Firestore
      const docRef = db.collection('pantry').doc(itemName);
      const docSnap = await docRef.get();

      if (docSnap.exists()) {
        const { count } = docSnap.data();
        await docRef.set({ count: count + 1 });
      } else {
        await docRef.set({ count: 1 });
      }

      console.log('Item added to Firestore');
      res.status(200).json({ item: itemName });
    } catch (error) {
      console.error('Error recognizing image:', error);
      res.status(500).send('Error recognizing image');
    }
  });
}

