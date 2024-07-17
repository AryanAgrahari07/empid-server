const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Company = require("../models/company.js")
const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({id} , 'your_jwt_secret', {expiresIn: '1d'});
}

router.post('/register', async(req,res)=>{
    try{
        const {username , email , password} = req.body;

        const hashedpassword = await bcrypt.hash(password, 10);

        await Company.create({
            name: username,
            email,
            password: hashedpassword,
        })

        const token = generateToken(Company._id);
        res.status(201).json({ token });
    }
    catch(error){
        console.log("Trouble in register", error);
        res.status(400).send(error);
    }

})




router.post('/login' , async(req, res)=> {
    try{
        const {email, password} = req.body;

        const user = await Company.findOne({email})

        if(!user){
            return res.status(404).json({ error: 'Check Credentials' });
        }
        if(!bcrypt.compare(password , user.password)){
            return res.status(401).json({ error: 'Wrong Password' });
        }
        else{
            const token = generateToken(user._id);
            const username = user.name;
            res.json({token,username});
            // res.send(user);
            console.log("Welcome Back", user.name)
        }
    }
    catch(error){
        console.log("error in login");
        res.status(404).json(error);
    }
})

router.get("/:companyId" , async(req, res) => {
    try{
        const company = await Company.findById(req.params.companyId);
        console.log(req.query);
        res.send(company);
    }
    catch(error){
        console.log("error" , error)
    }
})


// admin purpose only 
router.get("/allcompanies" , async(req, res) => {
    try{
        const companies = await Company.find({});
        console.log(req.query);
        res.json({
            success:true,
            companies,
        })
    }
    catch(error){
        console.log("error" , error)
    }
})






module.exports = router