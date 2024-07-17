const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require('fs');
const cors = require("cors");
const companyroute = require("./routes/companylogin.js")
const bodyParser = require('body-parser');
const employeeroute = require("./routes/employeeadd.js")
const app = express();



app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
        credentials: true,
        optionsSuccessStatus: 204,
    })
);



// const allowCors = fn => async (req, res) => {
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
//     res.setHeader(
//         'Access-Control-Allow-Headers',
//         'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
//     );
//     if (req.method === 'OPTIONS') {
//         res.status(200).end();
//         return;
//     }
//     return await fn(req, res);
// };

// app.use(cors());
app.use(express.json());
app.use("/api/companies/", companyroute);
app.use("/api/employees/", employeeroute);
// app.use('/images', express.static(path.join(__dirname, '../src/images')));

// database connection 
mongoose.connect("mongodb+srv://aryan:aryan1000@cluster0.iz7agi6.mongodb.net/ems", {

}).then(() => {
    console.log("Database Connected");
}).catch((e) => {
    console.log(e);
});



if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client/build/index.html'));
    });
}


const port = process.env.PORT || 4000;

app.listen(port , () => {
    console.log(`Server is connected at port ${port}`);
})