const express = require("express");
const multer = require("multer");
const Company = require('../models/company.js');
const {protect} = require("../middleware/auth.js");
const fs = require("fs");
const path = require('path');

const router = express.Router();

// const upload = multer({ dest: 'uploads/' })
const uploadDir = path.join(__dirname, '../src/images');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});


 
const upload = multer({ storage: storage });

// add employee 
router.post('/add-employee/:companyId', protect, upload.single('image'), async(req, res) => {
    console.log(req.body);
    try{
        const {name , age , email, number, role} = req.body;
        const imageName = req.file.filename;
        let newEmployee = {name , age , email, number, role, image: imageName} ;

        // if (req.file) {
        //     newEmployee.image = {
        //         data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
        //         contentType: 'image/png'
        //     };
        // }
        
        const company = await Company.findById(req.params.companyId);
        if(!company){
            return res.status(404).json({message: 'Company not found'});
        }
        
        company.employees.push(newEmployee);
        await company.save();

        res.status(201).json(company.employees[company.employees.length - 1]);
    }
    catch(error){
        console.log("Trouble in adding employee", error);
        res.status(400).json({error: "Failed to add employee"});
    }
})


router.use('/images', express.static(path.join(__dirname, '../src/images')));

router.get('/image/:imageName',(req, res) => {
    try {
        const { imageName } = req.params;
        const imagePath = path.join(__dirname, `../src/images/${imageName}`);

        // Check if the file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Send the image file
        res.sendFile(imagePath);
    } catch (error) {
        console.error('Error sending file:', error);
        res.status(500).json({ error: 'Failed to retrieve image' });
    }
  });


router.get('/all-employees/:companyId',protect, async(req,res)=> {
    try{
        const company = await Company.findById(req.params.companyId).populate('employees');
        res.status(200).json(company.employees);
    }
    catch(error){
        console.log('Error fetching employees:', error);
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});



// Delete Employee 
router.delete('/:companyId/deleteemployee/:employeeId',protect , async(req, res) => {
    try{
        const {companyId, employeeId} = req.params;
        const company = await Company.findById(companyId);

        if(!company){
            return res.status(404).json({message: 'Company not found'});
        }

        const employeeindex = company.employees.findIndex((emp) => emp._id.toString() === employeeId)
        if(employeeindex === -1){
            return res.status(404).json({message: "Employee Not found"});
        }

        company.employees.splice(employeeindex,1);
        await company.save();

        res.status(201).json({message: "employee deleted successfully"});
    }
    catch(error){
        console.log('Trouble in deleting employee', error);
        res.status(400).json({ error: 'Failed to delete employee' });
    }
})



// edit employee 
router.put('/:companyId/editemployee/:employeeId', protect, async(req,res) => {
    
    try{
    const {employeeId, companyId} = req.params;
    const {name , age} = req.body;

    const company = await Company.findById(companyId);
    if(!company) return res.status(404).json({ message: 'Company not found' });

    const employee = company.employees.id(employeeId);
    if(!employee){
        return res.status(404).json({ message: 'Company not found' });
    }
    
    employee.name = name || employee.name;
    employee.age = age || employee.age;

    await company.save();
    res.status(200).json({ message: 'Employee updated successfully', employee });
    }
    catch(error){
        console.error('Error updating employee:', error);
        res.status(400).json({ error: 'Failed to update employee' });    
    }
})


router.get('/:companyId/employee/:employeeId', protect , async (req, res) => {
    try{
        const company = await Company.findById(req.params.companyId);
        if (!company) return res.status(404).json({ message: 'Company not found' });

        const employee = company.employees.id(req.params.employeeId);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        res.json(employee);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})



// mark attendance 
router.post('/:companyId/employee/:employeeId', async(req,res) => {
    try{
        const {companyId, employeeId} = req.params;
        const {status} = req.body;  //  Present hai kya
       
       const company = await Company.findById(companyId);
       if(!company){
        return res.status(404).json({message: 'Company not found'});
       }

       const employee = company.employees.id(employeeId);
       if(!employee){
        return res.status(404).json({message: 'Employee not found'});
       }

       const today = new Date();
       today.setHours(0,0,0,0);

       const attendanceRecord = employee.attendance.find(
        (att) =>{ 
        const attDate = new Date(att.date); 
        attDate.setHours(0,0,0,0);
        return attDate.getTime()  ===  today.getTime();
        }
       );

       if(attendanceRecord){
            attendanceRecord.status = status;
       }
       else{
            employee.attendance.push({date: new Date(), status});
       }

       await company.save();
       res.status(200).json({message : "Attendance marked successfully" , employee});
       
    } catch(error){
        console.error('Error marking attendance : ', error);
        res.status(400).json({error : 'Failed to mark attendance'});
    }
});



// retrive attendance 
router.get('/:companyId/employee/:employeeId/attendance' , async(req,res) => {
    try{
       const {companyId, employeeId} = req.params;

       const company = await Company.findById(companyId);
       if(!company){
        return res.status(404).json({message: 'Company not found'});
       }

       const employee = company.employees.id(employeeId);
       if(!employee){
        return res.status(404).json({message: 'Employee not found'});
       }

       res.status(200).json(employee.attendance);

       } catch(error){
        console.error('Error marking attendance : ', error);
        res.status(400).json({error : 'Failed to mark attendance'});
       }
})



// qr attendance 

router.post('/qrattendance', async(req,res) => {
    try{
        const {companyId, barcode} = req.body;
       
       const company = await Company.findById(companyId);
       if(!company){
        return res.status(404).json({message: 'Company not found'});
       }

       const employee = company.employees.id(barcode);
       if(!employee){
        return res.status(404).json({message: 'Employee not found'});
       }

       const today = new Date();
       today.setHours(0,0,0,0);

       const attendanceRecord = employee.attendance.find(
        (att) =>{ 
        const attDate = new Date(att.date); 
        attDate.setHours(0,0,0,0);
        return attDate.getTime()  ===  today.getTime();
        }
       );

       if(attendanceRecord){
            attendanceRecord.status = 'Present';
       }
       else{
            employee.attendance.push({date: today, status: 'Present'});
       }

       await company.save();
       res.status(200).json({message : "Attendance marked successfully" , employee});
       
    } catch(error){
        console.error('Error marking attendance : ', error);
        res.status(400).json({error : 'Failed to mark attendance'});
    }
});


module.exports = router