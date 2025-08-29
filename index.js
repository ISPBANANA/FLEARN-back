const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { text } = require('body-parser');

const app = express();
const PORT = 8099; // Feel free to change port here.

const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/flearn';

app.use(cors());
app.use(express.json());
