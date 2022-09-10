import * as express from "express";
import * as admin from 'firebase-admin';
import { StatusCode } from "../utils/status-code";
import { param } from "express-validator";

const IMAGE_SEGMENT = '/image/:userId'

const imageController = express.Router();

const getImagesStart: express.RequestHandler<{ userId: string }, any> = async (req, res) => {
  const prefix = `${req.params.userId}/images/`;
  const getFilesRepsonse = await admin.storage().bucket().getFiles({ prefix });

  if (getFilesRepsonse[0].length === 0) {
    res.status(StatusCode.ok).json([]);
    return;
  }

  const urls = getFilesRepsonse[0].map((item) => item.publicUrl());
  res.status(StatusCode.ok).json(urls);

}

imageController.get(
  IMAGE_SEGMENT,
  param('userId').exists({ checkFalsy: true }),
  getImagesStart
)

export default imageController;