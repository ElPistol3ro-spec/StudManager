
import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB0rqRTHsvlPD9nkdBXjYsYuWLph7wppiM",
  authDomain: "studmanager-2276b.firebaseapp.com",
  projectId: "studmanager-2276b",
  storageBucket: "studmanager-2276b.firebasestorage.app",
  messagingSenderId: "752416093954",
  appId: "1:752416093954:web:1423c10ec42a7cc854341b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
const githubProvider = new GithubAuthProvider()

export const signInWithGitHubPopup = async () => {
    const result = await signInWithPopup(auth, githubProvider)
    return result.user
}