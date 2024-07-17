const mongoose = require("mongoose")


const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true },
    number: { type: String, required: true },
    role: { type: String, required: true },
    image: { type: String}, 
    attendance: [
        {
        date: {type: Date , default: Date.now},
        status: {type: String , enum: ['Present', 'Absent'], default: 'Absent'},
        },
],
});


const Schema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },

    email : {
        type: String,
        required:true
    },

    password : {
        type : String,
        require : true
    },

    employees: [EmployeeSchema]
})

const Company = mongoose.model('Company', Schema)
module.exports = Company