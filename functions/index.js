const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

admin.initializeApp();

exports.createUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const {email, password, displayName} = req.body;

    try {
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: displayName,
      });

      return res.status(200).send({uid: userRecord.uid});
    } catch (error) {
      return res.status(500).send({error: error.message});
    }
  });
});
