const mongoose = require('mongoose');

const { Schema } = mongoose;
const BikerSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    phoneNumber: {
        type: String,
        unique: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'] // Only allow "Point" type for location
        },
        coordinates: {
            type: [Number] // Array of numbers [longitude, latitude]
        }
    },
    datetime: {
        type: Date,
        default: Date.now
    }
});

// Define a 2dsphere index on the location field
BikerSchema.index({ location: '2dsphere' });

const Biker = mongoose.model('Biker', BikerSchema);

module.exports = Biker;
