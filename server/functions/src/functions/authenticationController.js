const functions = require('firebase-functions');
const jwt = require('jsonwebtoken');

const secretKey = functions.config().auth.secret_key;
const adminPassword = functions.config().auth.password;
const adminUsername = functions.config().auth.username;


exports.login = functions
  .region("europe-west3")
  .runWith({
    timeoutSeconds: 540
  })
  .https
  .onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed');
      return;
    }

    const authHeader = request.headers.authorization;
    const { uid } = request.body;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      response.status(401).send("Unauthorized");
      return;
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username === adminUsername && password === adminPassword) {
      if (!uid) {
        response.status(400).send("Incomplete request");
        return;
      }

      const token = jwt.sign({ uid: uid }, secretKey, { expiresIn: '1h' });
      response.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
      response.status(200).json({ message: 'Login successful' });
    } else {
      response.status(401).send("Unauthorized");
    }
  });

