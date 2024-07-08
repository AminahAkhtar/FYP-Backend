const mongoose = require('mongoose')

const {Schema} = mongoose
const FranchiserSchema = new Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    phoneNumber:{
        type:String,
        unique:true
    },
    totalBatteries:{
        type:Number,
        default: 9
    },
    availableBatteries:{
        type:Number
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number] // Array of numbers [longitude, latitude]
        }
    },
    datetime:{
        type:Date,
        default: Date.now
    }
});

// Define a 2dsphere index on the location field
FranchiserSchema.index({ location: '2dsphere' });

const Franchiser = mongoose.model('Franchiser', FranchiserSchema );
module.exports =  Franchiser;