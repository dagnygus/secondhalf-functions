import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import authController from "./controllers/auth";
import * as express from 'express';
import userController from "./controllers/user";
import likeController from "./controllers/like";
import * as cloudFunctions from './functions/functions';
import chatController from "./controllers/chat";
import imageController from "./controllers/image";
import notificationController from './controllers/notification';

admin.initializeApp();

const app = express();

app.use((_, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.setHeader('Access-Control-Expose-Headers', 'PAGINATION-TOTAL-PAGES');
	
	next();
});

app.use(authController);
app.use(userController);
app.use(likeController);
app.use(chatController);
app.use(imageController);
app.use(notificationController);

export const api = functions.https.onRequest(app);
export const onAuthCreate = cloudFunctions.onAuthCreate;
// export const userLogin = cloudFunctions.userLogin;
// export const userLogout = cloudFunctions.userLogout;
// export const onAuthDelete = cloudFunctions.onAuthDelete;