import firebase from 'firebase/app';
import 'firebase/storage';
const firebaseConfig = {
    apiKey: "AIzaSyC4-AC8l33T-cERI-lUXvaoXUh2Zgi6YfQ",
    authDomain: "marketplace-fcdc3.firebaseapp.com",
    databaseURL: "https://marketplace-fcdc3.firebaseio.com",
    projectId: "marketplace-fcdc3",
    storageBucket: "gs://marketplace-fcdc3.appspot.com",
    messagingSenderId: "522322123720",
    appId: "1:522322123720:web:be885fd946cb9e14"
  };
firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

export {
    firebase , storage as default
}

