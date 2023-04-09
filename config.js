const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

require('dotenv').config();

const myRefreshToken = require('./firebaseKey.json');

initializeApp({
  credential: cert(myRefreshToken),
  databaseURL: '',
  storageBucket: '.appspot.com'
});

const db = getFirestore();

module.exports = db;