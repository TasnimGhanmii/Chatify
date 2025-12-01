// Import the functions you need from the SDKs you need
import app from "firebase/compat/app";
import 'firebase/compat/auth'
import 'firebase/compat/database'
// TODO: Add SDKs for Firebase products that you want to use

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1BKcACpFdBCK0eo0NMImjPV98mDhe-Ds",
  authDomain: "whatsapp-d31ca.firebaseapp.com",
  projectId: "whatsapp-d31ca",
  storageBucket: "whatsapp-d31ca.firebasestorage.app",
  messagingSenderId: "173133978010",
  appId: "1:173133978010:web:159421d2a759edf457c223"
};

// Initialize Firebase
const firebase = app.initializeApp(firebaseConfig);
app.auth()
app.database()
export default firebase;

//init supabase
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://gbtjxnopfujqnpirlcxi.supabase.co'
const supabaseKey = 'sb_publishable_YbhcWskerQtQYrP6KywQ9w_5F7onlyA'
const supabase = createClient(supabaseUrl, supabaseKey)
export {supabase};