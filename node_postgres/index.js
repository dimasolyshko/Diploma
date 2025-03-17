const express = require('express');
const userRouter = require('./routes/user.routes')
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api/users', userRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));