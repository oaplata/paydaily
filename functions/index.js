const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.addUser = functions.https.onCall((data, context) => {
  return admin
      .auth()
      .createUser({
        email: data.email,
        password: data.password,
      })
      .then((userRecord) => {
        return {userId: userRecord.uid};
      })
      .catch((error) => {
        throw new functions.https.HttpsError("internal", error.message);
      });
});
