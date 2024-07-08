const mongoose = require('mongoose')

const {Schema} = mongoose
const BatterySchema = new Schema({
    battery_number:{
        type:String
    },
    franchiser: {
        type: Schema.Types.ObjectId,
        ref: 'Franchiser' 
    },
    price:{
        type:Number
    },
    SOC:{
        type:Number
    },
    status: {
        type: String,
        enum: ['charged', 'uncharged']
        ,required: true 
    },
    mac_address:{
        type: String, 
        unique:true
    },
    batterylevel:{
        type: String
    },
    voltage:{
        type:String
    },
    ampere:{
        type:String
    },
    weight:{
        type:String
    },
    power:{
        type:String
    },
    capacity:{
        type:String
    },
    
});



const Battery = mongoose.model('Battery', BatterySchema );
module.exports =  Battery;