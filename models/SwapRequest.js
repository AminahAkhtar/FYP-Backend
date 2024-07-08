const mongoose = require('mongoose')

const {Schema} = mongoose
const SwapRequestSchema = new Schema({
    biker: {
        type: Schema.Types.ObjectId,
        ref: 'Biker' 
    },
    franchiser: {
        type: Schema.Types.ObjectId,
        ref: 'Franchiser' 
    },
    battery: {
        type: Schema.Types.ObjectId,
        ref: 'Battery' 
    },
    batteryStatus: {
        type: String
    
    },
    request:{
        type: String  
    },
    amount:{
        type: String
        
    },
    datetime: {
        type: Date,
        default: Date.now 
    },
    token:{
        type: String
    }
    
});



const SwapRequest = mongoose.model('SwapRequest', SwapRequestSchema );
module.exports =  SwapRequest;