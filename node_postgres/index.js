const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
  }));

app.use(express.json());

const userRouter = require('./routes/user.routes');
const foodRouter = require('./routes/food.routes');
app.use('/api/users', userRouter);
app.use('/api/foods', foodRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));