const { db } = require('../utils/firebaseAdmin');
const { filterForAllowedKeys, isValidEmail } = require("../utils/batchOperations");
const { userAllowedKeys } = require("../constants/constants");


/**
 * Saves a user to the database if they do not already exist.
 *
 * @param {string} uid - The unique identifier of the user.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the user already existed.
 */
async function saveUser(uid) {
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({ uid, role: 'Student' });
    return false;
  }
  return true;
}


/**
 * Retrieves a user by their unique identifier from the database.
 *
 * @param {string} uid - The unique identifier of the user.
 * @returns {Promise<Object>} A promise that resolves to the user data.
 * @throws {Error} If the user with the specified uid is not found.
 */
async function getUserById(uid) {
  const userDoc = await db.collection("users").doc(uid).get();

  if (!userDoc.exists) {
    throw new Error(`User with uid ${uid} not found`);
  }

  const user = userDoc.data();
  return user;
}


/**
 * Updates a user's information in the database.
 *
 * @param {string} uid - The unique identifier of the user.
 * @param {Object} updates - The updates to apply to the user's information.
 * @returns {Promise<string>} A promise that resolves to a success message.
 * @throws {Error} If the user with the specified uid is not found.
 */
async function updateUser(uid, updates) {
  const userRef = db.collection('users').doc(uid);

  const filteredUpdates = filterForAllowedKeys(updates, userAllowedKeys);

  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    console.log(`No user found with ID: ${uid}`);
    throw new Error(`No user found with ID: ${uid}`);
  } 

  await userRef.update(filteredUpdates);

  console.log(`User document with ID: ${uid} updated successfully.`);
  return `User document with ID: ${uid} updated successfully.`;
}


/**
 * Deletes a user from the database.
 *
 * @param {string} uid - The unique identifier of the user.
 * @returns {Promise<string>} A promise that resolves to a success message.
 * @throws {Error} If the user with the specified uid is not found.
 */
async function deleteUser(uid) {
  const userRef = db.collection('users').doc(uid);

  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    throw new Error(`No user found with ID: ${uid}`);
  }

  await userRef.delete();
  console.log(`User with ID: ${uid} deleted successfully.`);
  return 'User deleted successfully';
}

async function verifyUser(uid, email) {
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  if (!isValidEmail(email)) {
    throw new Error('Invalid email address');
  }
  
  //Send verification email or trigger other actions

  return true; 
}


module.exports = {
  saveUser,
  getUserById,
  updateUser,
  deleteUser,
  verifyUser
}
