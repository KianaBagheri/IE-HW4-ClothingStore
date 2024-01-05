const mongoose = require('mongoose');

const clothSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    material: {
        type: String,
        enum: ['Cotton', 'Denim', 'Leather', 'Linen'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
});

const Cloth = mongoose.model('Cloth', clothSchema);

module.exports = Cloth;