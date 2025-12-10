// backend/firebase.js

const admin = require('firebase-admin');
const serviceAccount = require('./firebase-adminsdk.json'); // Rename your file to this

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
