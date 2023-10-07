import { realTimeDatabase } from "../firebase/firebase";

export function initializeUser(userId) {
  const userRef = realTimeDatabase.ref("users/" + userId);
  userRef.once("value").then((snapshot) => {
    if (!snapshot.exists()) {
      userRef.set({ credits: 10000 }); // Initial buying power
    }
  });
}
