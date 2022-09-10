import { UserModelFieldNames } from './../models/user-model';
import { MessageDtoFieldNames } from './../dtos/message-dto';
import { messageValidator } from './../validators/message-validator';
import { incrementOne, arrayUnion, decrement49 } from './../utils/field-value-modifiers';
import { CreateChatDtoFiledNames } from './../dtos/create-chat-dto';
import { chatValidator, getChatValidator } from './../validators/chat-validator';
import { authMid, getUIDAccessVerificationMid, adminPolicyMid, getAuthUserEmail } from './../middlewares/authentication-middleware';
import { internalServerErrorStatusData, notFoundStatusData, LOCALIZATION_HEADER } from './../utils/contat-strings';
import * as express from 'express';
import * as admin from 'firebase-admin';
import { CreateChatDto } from '../dtos/create-chat-dto';
import { ChatModel, ChatModelFieldNames } from '../models/chat-model';
import { createdLocalization, StatusCode } from '../utils/status-code';
import { MessageDto } from '../dtos/message-dto';
import { MessageModel } from '../models/message-model';
import { sendChatNotification } from '../models/notification-model';
const CHAT_SEGMENT = '/chat';
const GET_CHAT_SEGMENT = '/chat/:chatId';
const CHAT_MESSAGE_SEGMENT = '/chat/message';

const chatController = express.Router();

const putChatAction: express.RequestHandler<{}, any, CreateChatDto> = async (req, res) => {
  const { sourceUserId, targetUserId } = req.body;
  const chatId = sourceUserId < targetUserId ? `${sourceUserId}_${targetUserId}` : `${targetUserId}_${sourceUserId}`;

  const firestore = admin.firestore();
  const docRef = firestore.doc(`chats/${chatId}`);

  try {
    await firestore.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(docRef);
  
      if (!docSnap.exists) {
        const chatModel: ChatModel = {
          size: 0,
          createdAt: new Date().toJSON(),
          UIDs: [sourceUserId, targetUserId],
          messages: [],
        }
  
        transaction.create(docRef, chatModel);
        res.setHeader(LOCALIZATION_HEADER, createdLocalization(req, `chat/${chatId}`));
        res.status(StatusCode.created).end();
        return;
      }
      
      res.status(StatusCode.ok).end();
    });
  } catch {
    res.status(StatusCode.internalServerError).json(internalServerErrorStatusData);
  }
}

const getChatAction: express.RequestHandler<{ chatId: string }> = async (req, res) => {
  const docRef = admin.firestore().doc(`chats/${req.params.chatId}`);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    res.status(StatusCode.notFound).json(notFoundStatusData);
  }

  res.status(StatusCode.ok).json(docSnap.data());
}

const postMessageAction: express.RequestHandler<{}, any, MessageDto> = async (req, res) => {
  const { sourceUserId, targetUserId, content } = req.body;
  const chatId = sourceUserId < targetUserId ? `${sourceUserId}_${targetUserId}` : `${targetUserId}_${sourceUserId}`;

  const firestore = admin.firestore();
  const docRef = firestore.doc(`chats/${chatId}`);
  let notFound = false;

  try {
    await firestore.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(docRef);
  
      if (!docSnap.exists) {
        res.status(StatusCode.notFound).json(notFoundStatusData);
        notFound = true;
        return;
      }
  
      const messageModel: MessageModel = {
        ownerID: sourceUserId, 
        createdAt: new Date().toJSON(),
        content
      }
  
      let messages: MessageModel[] | admin.firestore.FieldValue;
      let newSize: admin.firestore.FieldValue;
  
      if (docSnap.get(ChatModelFieldNames.size) === 450) {
        messages = (docSnap.get(ChatModelFieldNames.messages) as MessageModel[]).slice(50);
        messages.push(messageModel);
        newSize = decrement49
      } else {
        messages = arrayUnion(messageModel);
        newSize = incrementOne;
      }
  
      transaction.update(docRef, {
        [ChatModelFieldNames.size]: newSize,
        [ChatModelFieldNames.messages]: messages,
      });
    });

    if (notFound) {
      return;
    }

    const targetUserDocRef = firestore.doc(`users/${targetUserId}`);
    const isTargetUserActice = (await targetUserDocRef.get()).get(UserModelFieldNames.isActive) as boolean;

    if (!isTargetUserActice) {
      const authUserEmail = getAuthUserEmail(req);
      await sendChatNotification(sourceUserId, authUserEmail, targetUserId, content, firestore);
    }

    res.status(StatusCode.ok).end();
    
  } catch (e) {
    res.status(StatusCode.internalServerError).json(e);
  }
}


chatController.put(
  CHAT_SEGMENT,
  authMid,
  chatValidator,
  getUIDAccessVerificationMid('body', CreateChatDtoFiledNames.sourceUserId),
  putChatAction
);

chatController.get(
  GET_CHAT_SEGMENT,
  authMid,
  adminPolicyMid,
  getChatValidator,
  getChatAction
)

chatController.post(
  CHAT_MESSAGE_SEGMENT,
  authMid,
  messageValidator,
  getUIDAccessVerificationMid('body', MessageDtoFieldNames.sourceUserId),
  postMessageAction
)


export default chatController;