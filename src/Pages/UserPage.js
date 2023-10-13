import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { getDatabase, ref, set, update, get } from "firebase/database";
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
  const handleSave = async (event) => {
    event.preventDefault();

    try {
      const user = userAuth.user;
      if (!user) return;
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
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

  const toggleEditing = (event) => {
    event.preventDefault();
    setIsEditing(!isEditing);
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

  // Define the Stripe Payment Link
  const stripePaymentLink = "https://buy.stripe.com/test_7sIaEQ4zbdR6dgc000";

  const handleTopUp = () => {
    // Redirect to the Stripe Payment Link URL
    window.open(stripePaymentLink, "_blank");
    updateCredits();
  };

  const updateCredits = async () => {
    // Mock logic to update user's credits in your app. For simulation and not for production.
    if (!userAuth.user) return;
    try {
      const userRef = ref(db, `users/${userAuth.user.uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const newCredits = (userData.credits || 0) + 100000; // Adding 100000 credits for testing
        await update(userRef, {
          credits: newCredits,
        });
      }
    } catch (error) {
      console.error("Error updating credits:", error);
    }
  };

  return (
    <div className="structure">
      <div className="contentcontainer">
        <div className="titlestructure">
          <h1 className="titleheading">Profile Page</h1>
        </div>
        {userAuth.isLoggedIn && (
          <form>
            <div className="space-y-12">
              <div className="border-b border-white/10 pb-12">
                <h2 className="text-base font-semibold leading-7 text-white">
                  Your Profile
                </h2>

                {/* Top up credits */}
                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button
                    type="button" // Make sure to specify the type to prevent form submission
                    className="secondary-cta-btn"
                    onClick={handleTopUp}
                  >
                    Top Up Credits
                  </button>
                </div>

                {/* Display Name */}
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Display Name
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="displayName"
                        id="displayName"
                        autoComplete="displayName"
                        value={isEditing ? displayName : savedDisplayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        readOnly={!isEditing}
                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                        placeholder="Your Display Name"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Phone Number
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber"
                        autoComplete="tel"
                        value={isEditing ? phoneNumber : savedPhoneNumber}
                        onChange={handlePhoneNumberChange}
                        readOnly={!isEditing}
                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                        placeholder="Your Phone Number"
                      />
                    </div>
                    {phoneNumberError && (
                      <p className="mt-1 text-sm text-red-500">
                        {phoneNumberError}
                      </p>
                    )}
                  </div>

                  {/* Profile Picture */}
                  <div className="col-span-full">
                    <label
                      htmlFor="photo"
                      className="block text-sm font-medium leading-6 text-white"
                    >
                      Profile Picture
                    </label>
                    <div className="mt-2 flex items-center gap-x-3">
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
                      <label className="block text-sm font-medium leading-6 text-white">
                        New Profile Picture:
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          disabled={!isEditing}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Save and Edit Buttons */}
                <div className="mt-6 flex items-center justify-end gap-x-6">
                  {isEditing ? (
                    <button className="secondary-cta-btn" onClick={handleSave}>
                      Save
                    </button>
                  ) : (
                    <button className="primary-cta-btn" onClick={toggleEditing}>
                      Edit
                    </button>
                  )}
                </div>

                {/* Save and Edit Buttons */}

                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button className="primary-cta-btn" onClick={handleLogout}>
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
