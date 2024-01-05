const express = require('express');
const morgan = require('morgan')
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

function CheckValidToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, "awziDiRFVTin0zFRceFx", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       500:
 *         description: Error creating user
 */
app.post('/signup', async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            password: req.body.password // Storing password in plain text
        });
        await user.save();
        res.status(201).send('User created successfully');
    } catch {
        res.status(500).send('Error creating user');
    }
});


/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, token returned
 *       401:
 *         description: Login failed
 */
app.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (user && req.body.password === user.password) {
        const token = jwt.sign({ username: user.username }, "awziDiRFVTin0zFRceFx", { expiresIn: '24h' });
        res.json({ token: token });
    } else {
        res.send('Login failed');
    }
});

/**
 * @swagger
 * /add-clothes:
 *   post:
 *     summary: Add a new clothing item
 *     tags: [Clothes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *     responses:
 *       201:
 *         description: New clothing item added successfully
 *       500:
 *         description: Error adding clothing item
 */
app.post('/add-clothes', CheckValidToken, async (req, res) => {
    try {
        const newCloth = new Cloth(req.body);
        await newCloth.save();
        res.status(201).send(newCloth);
    } catch (error) {
        res.status(500).send('Error adding clothes' + error);
    }
});

/**
 * @swagger
 * /get-clothes/{id}:
 *   get:
 *     summary: Retrieve a clothing item by ID
 *     tags: [Clothes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique ID of the clothing item
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Clothing item data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Clothes'
 *       404:
 *         description: Clothing item not found
 *       500:
 *         description: Error retrieving clothing item
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Clothes:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         discount:
 *           type: number
 */

// Endpoint to get clothes by id
app.get('/get-clothes/:id', CheckValidToken, async (req, res) => {
    try {
        const cloth = await Cloth.findById(req.params.id);
        if (!cloth) return res.status(404).send('Clothes not found');
        res.status(200).json(cloth);
    } catch (error) {
        res.status(500).send('Error getting clothes');
    }
});

/**
 * @swagger
 * /delete-clothes/{id}:
 *   delete:
 *     summary: Delete a clothing item by ID
 *     tags: [Clothes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique ID of the clothing item to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Clothing item deleted successfully
 *       404:
 *         description: Clothing item not found
 *       500:
 *         description: Error deleting clothing item
 */

// Endpoint to delete clothes by id
app.delete('/delete-clothes/:id', CheckValidToken, async (req, res) => {
    try {
        const result = await Cloth.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).send('Clothes not found');
        res.status(200).send('Clothes deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting clothes');
    }
});

/**
 * @swagger
 * /delete-all-clothes:
 *   delete:
 *     summary: Delete all clothing items
 *     tags: [Clothes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All clothing items deleted successfully
 *       500:
 *         description: Error deleting clothing items
 */
// Endpoint to delete all clothes
app.delete('/delete-all-clothes', CheckValidToken, async (req, res) => {
    try {
        await Cloth.deleteMany({});
        res.status(200).send('All clothes deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting clothes');
    }
});

/**
 * @swagger
 * /edit-clothes/{id}:
 *   patch:
 *     summary: Edit details of a clothing item by ID
 *     tags: [Clothes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique ID of the clothing item to edit
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Clothing item updated successfully
 *       404:
 *         description: Clothing item not found
 *       500:
 *         description: Error updating clothing item
 */
// Endpoint to edit clothes by id
app.patch('/edit-clothes/:id', CheckValidToken, async (req, res) => {
    try {
        const updatedCloth = await Cloth.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCloth) return res.status(404).send('Clothes not found');
        res.status(200).json(updatedCloth);
    } catch (error) {
        res.status(500).send('Error updating clothes');
    }
});

/**
 * @swagger
 * /get-final-price/{id}:
 *   get:
 *     summary: Get the final price of a clothing item after discount by ID
 *     tags: [Clothes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique ID of the clothing item for which the final price is calculated
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Final price of the clothing item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 finalPrice:
 *                   type: number
 *       404:
 *         description: Clothing item not found
 *       500:
 *         description: Error calculating final price
 */
// Endpoint to get final price of clothes by id
app.get('/get-final-price/:id', CheckValidToken, async (req, res) => {
    try {
        const cloth = await Cloth.findById(req.params.id);
        if (!cloth) return res.status(404).send('Clothes not found');
        const finalPrice = cloth.price - (cloth.price * cloth.discount / 100);
        res.status(200).json({ finalPrice });
    } catch (error) {
        res.status(500).send('Error calculating final price');
    }
});

console.log("hi");
