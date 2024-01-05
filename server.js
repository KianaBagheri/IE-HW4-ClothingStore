const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const User = require("./models/user");
const Cloth = require("./models/clothes");
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json()); // To parse JSON bodies

const mongoURI = 'mongodb://root:kiana1234@localhost:27017/ShoppingStore?authSource=admin';
mongoose.connect(mongoURI, {})
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('Error connecting to MongoDB:', error));


const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Shopping Store API',
            version: '1.0.0',
            description: 'API for Shopping Store',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./server.js'], // Path to the API docs
};

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.listen(3000, () => console.log('Server is running on port 3000'));

