const firebase = require("firebase/compat/app");
require("firebase/compat/storage");

const firebaseConfig = {
  apiKey: "AIzaSyALoTj3KDEa8QK3KoPGk4AMuKKpifNpnpk",
  authDomain: "incubation-sairam.firebaseapp.com",
  projectId: "incubation-sairam",
  storageBucket: "incubation-sairam.appspot.com",
  messagingSenderId: "225624996356",
  appId: "1:225624996356:web:cf889e3ca73bc76bf61351",
  measurementId: "G-N5W7VVSEEP"
};

const app = firebase.initializeApp(firebaseConfig);
const storageApp = firebase.storage().ref()

// const storageReference = storage.ref();

module.exports = storageApp;