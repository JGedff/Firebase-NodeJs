const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

require('dotenv').config();

const myRefreshToken = require('./firebaseKey.json'); // Get refresh token from OAuth2 flow

initializeApp({
  credential: cert(myRefreshToken),
  databaseURL: 'HTPS TO YOUR FIREBASE'
});

const db = getFirestore();

module.exports = db;