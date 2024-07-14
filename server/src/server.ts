// Import thư viện Express
import express from 'express';
import { Request, Response } from 'express';
import {dbConnect} from './config/dbConnect'
import { checkAndUpdateEventStatus } from './controller/eventController';
import cron from 'node-cron';
require('dotenv').config()
const initRoutes = require("./routes/index")
const cookieParser = require("cookie-parser")
const cors = require("cors")

// Khởi tạo ứng dụng Express
const app = express();
const port = process.env.PORT || 8080
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
dbConnect()
initRoutes(app)

// Định nghĩa một route cơ bản
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// Lắng nghe cổng 3000 cho các kết nối HTTP
app.listen(port, () => {
  console.log('Server is running on port', port);
});


cron.schedule('0 0 * * *', () => {
  console.log('Running a daily job at midnight');
  checkAndUpdateEventStatus();
});
