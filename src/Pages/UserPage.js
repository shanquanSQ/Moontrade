import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";
import {
  getStorage,
  getDownloadURL as getStorageDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";
import { useAuth } from "../util/auth.js";
import { useNavigate } from "react-router-dom";

export function UserPage() {
  const userAuth = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savedDisplayName, setSavedDisplayName] = useState("");
  const [savedPhoneNumber, setSavedPhoneNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const db = getDatabase();
  const navigate = useNavigate();

  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userAuth.user) return;

      try {
        const userRef = ref(db, `users/${userAuth.user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setDisplayName(userData.displayName || "");
          setSavedDisplayName(userData.displayName || "");
          setPhoneNumber(userData.phoneNumber || "");
          setSavedPhoneNumber(userData.phoneNumber || "");
        }

        const profileImageRef = storageRef(
          getStorage(),
          `profilePictures/${userAuth.user.uid}`
        );
        const downloadURL = await getStorageDownloadURL(profileImageRef);
        setProfileImage(downloadURL);
      } catch (error) {
        console.error("Error retrieving user data:", error);
      }
    };

    fetchUserData();
  }, [userAuth.user, db]);

  const handleSave = async () => {
    try {
      const user = userAuth.user;
      if (!user) return;

      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, {
        displayName,
        phoneNumber,
      });

      setSavedDisplayName(displayName);
      setSavedPhoneNumber(phoneNumber);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    const validPhoneNumber = /^\d+$/.test(value);
    if (validPhoneNumber || value === "") {
      setPhoneNumber(value);
      setPhoneNumberError("");
    } else {
      setPhoneNumberError("Phone number must consist of numbers only.");
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    const profileImageRef = storageRef(
      getStorage(),
      `profilePictures/${userAuth.user.uid}`
    );

    try {
      const uploadTask = uploadBytesResumable(profileImageRef, file);
      await uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          console.error("Error uploading profile picture:", error);
        },
        () => {
          getStorageDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setProfileImage(downloadURL);
          });
        }
      );
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("Successfully logged out");
        navigate("/"); // Redirect to the login page
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div>
      {userAuth.isLoggedIn && (
        <div>
          <br />
          <h2>Profile Page</h2>
          <br />
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <p>Email: {userAuth.user && userAuth.user.email}</p>
              <br />
              <label>
                Display Name:
                <br />
                <input
                  type="text"
                  value={isEditing ? displayName : savedDisplayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  readOnly={!isEditing}
                />
              </label>
              <br />
              <label>
                Phone Number:
                <br />
                <input
                  type="text"
                  value={isEditing ? phoneNumber : savedPhoneNumber}
                  onChange={handlePhoneNumberChange}
                  readOnly={!isEditing}
                />
              </label>
              {phoneNumberError && (
                <p style={{ color: "red" }}>{phoneNumberError}</p>
              )}
              <br />
              {isEditing ? (
                <button onClick={handleSave}>Save</button>
              ) : (
                <button onClick={() => setIsEditing(true)}>Edit</button>
              )}
              <br />
              <button onClick={handleLogout}>Log Out</button>
            </div>
            <div style={{ flex: 1, marginLeft: 20 }}>
              <label>
                Profile Picture:
                <br />
                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    overflow: "hidden",
                    borderRadius: "50%",
                  }}
                >
                  <img
                    src={profileImage}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <br />
                <label>
                  New Profile Picture:
                  <br />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    disabled={!isEditing}
                  />
                </label>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
