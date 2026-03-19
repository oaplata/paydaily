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

exports.recalculateLoanCharges = functions.pubsub
    .schedule("0 3 * * *")
    .timeZone("America/Bogota")
    .onRun(async () => {
      const dryRun = true;
      const db = admin.firestore();
      const companiesSnap = await db.collection("companies").get();
      let discrepancies = 0;

      for (const companyDoc of companiesSnap.docs) {
        const companyId = companyDoc.id;
        const loansSnap = await db
            .collection(`companies/${companyId}/loans`)
            .where("state", "==", "active")
            .get();

        for (const loanDoc of loansSnap.docs) {
          const loanData = loanDoc.data();
          const feesSnap = await db
              .collection(
                  `companies/${companyId}/loans/${loanDoc.id}/fees`,
              )
              .get();

          const actualCharged = feesSnap.docs.reduce(
              (sum, feeDoc) => sum + Number(feeDoc.data().value),
              0,
          );
          const expectedRemaining =
            Number(loanData.amount) - actualCharged;

          if (
            Number(loanData.charged) !== actualCharged ||
            Number(loanData.remaining) !== expectedRemaining
          ) {
            discrepancies++;

            if (dryRun) {
              functions.logger.warn(
                  `[DRY-RUN] Loan ${loanDoc.id} in company ` +
                  `${companyId}: charged ${loanData.charged} -> ` +
                  `${actualCharged}, remaining ` +
                  `${loanData.remaining} -> ${expectedRemaining}`,
              );
            } else {
              await loanDoc.ref.update({
                charged: actualCharged,
                remaining: expectedRemaining,
                state: expectedRemaining <= 0 ? "paid" : "active",
                updatedAt: admin.firestore.Timestamp.now(),
              });

              functions.logger.info(
                  `Recalculated loan ${loanDoc.id} in company ` +
                  `${companyId}: charged ${loanData.charged} -> ` +
                  `${actualCharged}, remaining ` +
                  `${loanData.remaining} -> ${expectedRemaining}`,
              );
            }
          }
        }
      }

      functions.logger.info(
          `Recalculation completed (dryRun=${dryRun}). ` +
          `Discrepancies found: ${discrepancies}`,
      );
      return null;
    });
