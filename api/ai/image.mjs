// Vercel serverless function for POST /api/ai/image (logic lives in server/api.mjs).
import { apiMiddleware } from '../../server/api.mjs';

export default function handler(req, res) {
  apiMiddleware(req, res, () => {
    res.statusCode = 404;
    res.end();
  });
}
