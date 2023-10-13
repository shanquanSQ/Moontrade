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

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export function UserPage() {
  const userAuth = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savedDisplayName, setSavedDisplayName] = useState("");
  const [savedPhoneNumber, setSavedPhoneNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [refCode, setRefCode] = useState("");
  const [referrerCode, setReferrerCode] = useState("");

  const [inputRefCode, setInputRefCode] = useState("");
  const [refCodeError, setRefCodeError] = useState("");

  const [isVisible, setIsVisible] = useState(false);

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
          setRefCode(userData.refCode || "No Code");
          setRefCode(userData.refCode || "");
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

  const handleChangePassword = async () => {
    // Additional check: Ensure password length is adequate
    if (newPassword.length < 6) {
      setPasswordError("Password should be at least 6 characters long");
      return;
    }

    try {
      await userAuth.changePassword(newPassword);
      alert("Password changed successfully");
      setNewPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
    }
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

  // Handle Referral Code Submission and Validation

  const handleRefCodeSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if the user has already used a referral code.
      const userRef = ref(db, `users/${userAuth.user.uid}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.val().hasUsedReferral) {
        // If the user has used a referral, show an error message.
        setRefCodeError("You have already used a referral code.");
        return;
      }

      const referrerRef = ref(db, `users`);
      const snapshot = await get(referrerRef);

      if (snapshot.exists()) {
        let referrerUid = null;
        snapshot.forEach((userSnapshot) => {
          if (userSnapshot.val().refCode === inputRefCode) {
            referrerUid = userSnapshot.key;
          }
        });

        if (referrerUid) {
          // Update credits of the user and the referrer
          const userRef = ref(db, `users/${userAuth.user.uid}`);
          const referrerUserRef = ref(db, `users/${referrerUid}`);

          const referrerSnapshot = await get(referrerUserRef);
          const referrerData = referrerSnapshot.val();

          // Check if the referrer’s code has been used less than 10 times
          if (referrerData.refCodeUses && referrerData.refCodeUses >= 10) {
            setRefCodeError("This referral code has reached its usage limit.");
            return;
          }

          // Add credits to the referrer and referrer’s user
          await update(userRef, {
            credits: (await (await get(userRef)).val()).credits + 25000,
          });
          await update(referrerUserRef, {
            credits: (referrerData.credits || 0) + 25000,
            // Increment the refCodeUses by 1 or set to 1 if it doesn’t exist
            refCodeUses: (referrerData.refCodeUses || 0) + 1,
          });

          await update(userRef, { hasUsedReferral: true });

          alert(
            "Referral successful! Both you and the referrer have been credited 25,000 credits."
          );
          setInputRefCode("");
        } else {
          setRefCodeError("Invalid Referral Code");
        }
      }
    } catch (error) {
      console.error("Error handling referral code:", error);
    }
  };

  const toggleVisibility = async (e) => {
    e.preventDefault();
    setIsVisible(!isVisible);
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
              <div className="pb-12">
                <h2 className="text-base font-semibold leading-7 py-2 text-white">
                  Edit Your Profile
                </h2>
                <button onClick={toggleVisibility}>
                  {isVisible ? (
                    <EyeSlashIcon className="h-6 w-6 text-white" />
                  ) : (
                    <EyeIcon className="h-6 w-6 text-white" />
                  )}
                </button>

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
                        type={isVisible ? "text" : "password"}
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
                        type={isVisible ? "text" : "password"}
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

                {/* Change Password */}

                <h2 className="text-base font-semibold leading-7 py-4 text-white">
                  <label htmlFor="newPassword">Change Password</label>
                </h2>

                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
                {passwordError && (
                  <p style={{ color: "red" }}>{passwordError}</p>
                )}
                <button
                  type="button"
                  className="primary-cta-btn"
                  onClick={handleChangePassword}
                >
                  Submit New Password
                </button>

                {/* Referral Code Display */}

                <h2 className="text-base font-semibold leading-7 py-4 text-white">
                  Refer 10 friends for 25000 each
                </h2>
                <div className="sm:col-span-4 py-2">
                  <label className="block text-sm font-medium leading-6 text-white">
                    Your referral code
                  </label>
                  <div className="mt-2">
                    <p className="text-white">
                      <input
                        value={refCode}
                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                      />
                    </p>
                  </div>
                </div>

                {/* Referral Code Input */}
                <div className="sm:col-span-4 py-2">
                  <label className="block text-sm font-medium leading-6 text-white">
                    Enter Referral Code
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={inputRefCode}
                      onChange={(e) => setInputRefCode(e.target.value)}
                      className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                      placeholder="Enter Referral Code"
                    />
                  </div>
                  {refCodeError && (
                    <p className="mt-1 text-sm text-red-500">{refCodeError}</p>
                  )}
                </div>

                {/* Submit Referral Code Button */}
                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button
                    className="primary-cta-btn"
                    onClick={handleRefCodeSubmit}
                  >
                    Submit Referral Code
                  </button>
                </div>

                <h2 className="text-base font-semibold leading-7 py-2 text-white">
                  Buy 100,000 credits for $5
                </h2>
                {/* Top up credits */}
                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button
                    type="button" // Make sure to specify the type to prevent form submission
                    className="secondary-cta-btn"
                    onClick={handleTopUp}
                  >
                    Buy Credits
                  </button>
                </div>

                {/* Logout */}

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
