const express = require('express');
const userRouter = require('./routes/user.routes');
const foodRouter = require('./routes/food.routes');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/foods', foodRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));