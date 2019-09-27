let express = require("express")
let router = express.Router()
let mysql = require("mysql")
let http = require('https');
const multer = require('multer')
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'loandata'
});
//Login
router.post('/login', function (request, response) {
	var username = request.body.username;
	var password = request.body.password;
	console.log(request.body)
	response.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
	//request.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
	if (username && password) {
		connection.query('SELECT * FROM userdetails WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
			if (results.length > 0) {
				//	request.session.loggedin = true;
				// request.session.username = username;
				let responseData = { "status": true, "code": 200, "userDetails": results }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "message": "Incorrect Username and/or Password!" }
				response.json(responseData)
			}
			response.end();
		});
	} else {
		let responseData = { "status": false, "code": 401, "message": "Please enter Username and Password!" }
		response.json(responseData)
		response.end();
	}
});

//Register Employee
router.post('/registerEmployee', function (request, response) {
	console.log(request.body)
	var name = request.body.name;
	var username = request.body.username;
	var password = request.body.password;
	var email = request.body.email;
	var mobile = request.body.mobile;
	var language = request.body.language
	if (name && username && password && email && mobile && language) {
		connection.query(`INSERT INTO userdetails (name,username,email,password,mobile,language,usertype) VALUES ('${name}', '${username}','${email}','${password}','${mobile}','${language}','0')`, function (error, results, fields) {
			console.log(results)
			if (!error) {
				//	request.session.loggedin = true;
				// request.session.username = username;
				let responseData = { "status": true, "code": 200, "message": "Employee register successfully" }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "message": "Unable to register employee" }
				response.json(responseData)
			}
			response.end();
		});
	} else {
		let responseData = { "status": false, "code": 401, "message": "Please enter employee details" }
		response.json(responseData)
		response.end();
	}
});
router.get('/getAllEmpList', function (request, response) {
	connection.query('SELECT * FROM userdetails WHERE usertype = 0 ', function (error, results, fields) {
		if (results.length > 0) {
			//	request.session.loggedin = true;
			// request.session.username = username;
			let responseData = { "status": true, "code": 200, "userDetails": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "userDetails": [] }
			response.json(responseData)
		}
		response.end();
	});

});
router.get('/getAllALoanDetailsList', function (request, response) {
	connection.query('SELECT lt.emp_id,lt.loan_id,u.name FROM Loan_log_table lt JOIN userdetails u WHERE lt.emp_id = u.id AND lt.active = 1', function (error, results, fields) {
		if (results.length > 0) {
			//	request.session.loggedin = true;
			// request.session.username = username;
			let responseData = { "status": true, "code": 200, "assignedLoan": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "assignedLoan": [] }
			response.json(responseData)
		}
		response.end();
	});

});
router.post('/getLoanListByEmp', function (request, response) {
	var empId = request.body.empId
	connection.query(`SELECT * FROM Loan_log_table lt JOIN loan_details ld ON ld.id = lt.loan_id WHERE lt.active = 1 AND lt.emp_id ='${empId}'`, function (error, results, fields) {
		if (results.length > 0) {
			//	request.session.loggedin = true;
			// request.session.username = username;
			let responseData = { "status": true, "code": 200, "assignedLoanToEmp": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "assignedLoanToEmp": [] }
			response.json(responseData)
		}
		response.end();
	});

});
router.post('/assignLoanList', function (request, response) {
	var empid = request.body.empId;
	var loanid = request.body.loanId;
	var selectedEmpid = request.body.assignedEmpId
	console.log(loanid)
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth() + 1;
	var yyyy = today.getFullYear();
	if (dd < 10) {
		dd = '0' + dd

	} if (mm < 10) {

		mm = '0' + mm
	}
	var today = yyyy + '-' + mm + '-' + dd;
	let inserData = '';
	let queryTest 
	let dontInsert;
	let startQuery = 'INSERT INTO Loan_log_table (emp_id,loan_id,date,active) VALUES'
	console.log(`update Loan_log_table SET active = 0 WHERE loan_id IN (${loanid})`)
	if(loanid){
		connection.query(`update Loan_log_table SET active = 0 WHERE loan_id IN ('${loanid}')`, (er, res, field) => {
			console.log(res)
		})
	}
	loanid.map(lId => {	
		currentRow = `('${empid}','${lId}','${today}','1'),`

		currentRow = currentRow.replace(/\n|\r/g, "");
		currentRow = currentRow.replace(/~+$/, '');

		inserData = inserData + currentRow
	});
	inserData = inserData.replace(/,\s*$/, "");
	console.log(inserData)
	queryTest = startQuery + inserData;
	
	connection.query(queryTest, (err, results, fields) => {
		console.log(results)

		if (results) {
			let responseData = { "status": true, "code": 200, "message": "Loan assigned successfully" }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "message": "" }
			response.json(responseData)
		}
		response.end();
	});
	

});

router.post('/updateLoan', function (request, response) {
	if(request.body.loan_log_Id && request.body.current_Status){
		connection.query(`update Loan_log_table set current_Status ='${request.body.current_Status}',old_status ='${request.body.old_Status}',documents='${request.body.document}',comments='${request.body.comment}' where id = '${request.body.loan_log_Id}' AND active = 1`, function (error, results, fields) {
			if (results) {
				let responseData = { "status": true, "code": 200, "message": "Loan Details updated successfully" }
				response.json(responseData)
			}else{
				let responseData = { "status": false, "code": 401, "message": "Failed to update loan Details" }
				response.json(responseData)
			}
		});
	}
});
router.get('/getAllLoanDetailsList', function (request, response) {
	connection.query('SELECT * FROM loan_details ', function (error, results, fields) {
		if (results.length > 0) {
			//	request.session.loggedin = true;
			// request.session.username = username;
			let responseData = { "status": true, "code": 200, "loanDetails": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "loanDetails": [] }
			response.json(responseData)
		}
		response.end();
	});

});
router.get('/getLoanStatus', function (request, response) {
	connection.query('SELECT * FROM Loan_status ', function (error, results, fields) {
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "loanStatus": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "loanStatus": [] }
			response.json(responseData)
		}
		response.end();
	});

});

var xyz = multer.diskStorage(
    {
        destination: './LeadExcels/',
        filename: function ( request, file, cb ) {
            cb( null, Date.now()+"-"+file.originalname);
        }
    }
);

const uploadx = multer({
	storage: xyz,
	fileFilter : function(req, file, callback) { //file filter
		console.log(file)
		if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
			return callback(new Error('Wrong extension type'));
		}
		callback(null, true);
	}
}).single('leadExcel');

router.post("/uploadExcel", (request, response) => {
	// if(['xls', 'xlsx'].request.file.filename)
  // response.send("File "+request.file.filename+" uploaded successfully")
  var exceltojson; //Initialization
  uploadx(request,response,function(err){
	  if(err){
		response.json({error_code:1,err_desc:err});
		   return;
	  }
	  /** Multer gives us file info in req.file object */
	  if(!request.file){
		response.json({error_code:1,err_desc:"No file passed"});
		  return;
	  }
	  //start convert process
	  /** Check the extension of the incoming file and
	   *  use the appropriate module
	   */
	  if(request.file.originalname.split('.')[request.file.originalname.split('.').length-1] === 'xlsx'){
		  exceltojson = xlsxtojson;
	  } else {
		  exceltojson = xlstojson;
	  }
	  try {
		  exceltojson({
			  input: request.file.path, //the same path where we uploaded our file
			  output: null, //since we don't need output.json
			  lowerCaseHeaders:true
		  }, function(err,result){
			  if(err) {
				  return response.json({error_code:1,err_desc:err, data: null});
			  }
			  response.json({error_code:0,err_desc:null, data: result});
		  });
	  } catch (e){
		response.json({error_code:1,err_desc:"Corupted excel file"});
	  }
  });
})
router.post('/insertExcel', function (request, response) {
	var loanDetails = request.body.loanDetails;
    if (loanDetails == null) {
        let loanData = { "status": false, "code": 404, "message": "No Data" }
        response.json(loanData)
    } else {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd

        } if (mm < 10) {

            mm = '0' + mm
        }
        var today = yyyy + '-' + mm + '-' + dd;
        let inserData = '';
        let queryTest
		let startQuery = "INSERT INTO `loan_details` ( `Customer_id`, `Loan_Count`, `loanid`, `customer_Name`, `Gender`, `mobile`,`email`, `DOB`, `Age`, `city`, `pin_code`, `state`, `loan_id`, `disbursal_amt`, `disbursal_date`,`due_date`, `principal_amt`, `interest_amount`, `penalty_amt`, `repayment_amt`, `ref_type1`, `ref_name1`, `ref_mobile_num1`, `ref_type2`, `ref_name2`, `ref_mobile_num2`, `bucket`,`overdue_days`, `is_collected`, `ESIGN_MOBILE_NUMBER`, `repaid_date`,`date`) VALUES";
		let duplicateColumn = "ON DUPLICATE KEY UPDATE `Customer_id`=VALUES(`customer_id`), `Loan_Count`=VALUES(`loan_count`), `loanid`=VALUES(`loan_id`),`customer_Name`=VALUES(`customer_name`),`Gender`=VALUES(`gender`),`mobile`=VALUES(`mobile`),`email`=VALUES(`email`),`DOB`=VALUES(`dob`),`Age`=VALUES(`age`),`city`=VALUES(`city`) ,`pin_code`=VALUES(`pin_code`),`state`=VALUES(`state`),`loan_id`=VALUES(`loan_id`),`disbursal_amt`=VALUES(`disbursal_amt`),`disbursal_date`=VALUES(`disbursal_date`),`due_date`=VALUES(`due_date`),`principal_amt`=VALUES(`principal_amt`),`interest_amount`=VALUES(`interest_amount`),`penalty_amt`=VALUES(`penalty_amt`),`repayment_amt`=VALUES(`repayment_amt`),`ref_type1`=VALUES(`ref_type1`),`ref_name1`=VALUES(`ref_name1`),`ref_mobile_num1`=VALUES(`ref_mobile_num1`),`ref_type2`=VALUES(`ref_type2`),`ref_name2`=VALUES(`ref_name2`),`ref_mobile_num2`=VALUES(`ref_mobile_num2`),`bucket`=VALUES(`bucket`),`overdue_days`=VALUES(`overdue_days`),`is_collected`=VALUES(`is_collected`),`ESIGN_MOBILE_NUMBER`=VALUES(`esign_mobile_number`),`repaid_date`=VALUES(`repaid_date`),`date`=VALUES(`date`)"
        let responseData;
       // console.log(loanDetails)
        loanDetails.map(item => {
            currentRow = `('${item.customer_id}','${item.loan_count}' ,'${item.loan_id}' ,'${item.customer_name}' , '${item.gender}',  '${item.mobile}','${item.email}' ,
           '${item.dob}' ,'${item.age}' ,'${item.city}' ,
           '${item.pin_code}' ,'${item.state}' ,'${item.loan_id}' ,'${item.disbursal_amt}','${item.disbursal_date}' ,'${item.due_date}' ,'${item.principal_amt}' ,
           '${item.interest_amount}' ,'${item.penalty_amt}' ,'${item.repayment_amt}' ,'${item.ref_type1}' , 
           '${item.ref_name1}','${item.ref_mobile_num1}' , '${item.ref_type2}','${item.ref_name2}' ,'${item.ref_mobile_num2}' ,
           '${item.bucket}' ,'${item.overdue_days}' , '${item.is_collected}',
           '${item.esign_mobile_number}' , '${item.repaid_date}','${today}'),`

            currentRow = currentRow.replace(/\n|\r/g, "");
            currentRow = currentRow.replace(/~+$/, '');

            inserData = inserData + currentRow
           // inserData = inserData.replace(/,\s*$/, "");
			//console.log(queryTest)
		});
		inserData = inserData.replace(/,\s*$/, "");
		queryTest = startQuery + inserData + duplicateColumn;
		//console.log(queryTest)
		connection.query(queryTest, (err, results, fields) => {
			console.log(results)
			if (results) {
				//	request.session.loggedin = true;
				// request.session.username = username;
				let responseData = { "status": true, "code": 200, "message": "Excel uploaded successfully" }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "message": "" }
				response.json(responseData)
			}
			response.end();
		});
    }
});

var fileupload = multer.diskStorage(
    {
        destination: './files/',
        filename: function ( request, file, cb ) {
            cb( null, Date.now()+"-"+file.originalname);
        }
    }
);

const uploadFiles = multer({storage: fileupload})

router.post("/uploadFile", uploadFiles.single('files'), (request, response) => {
	// let responseData = { "status": true, "code": 200, "file": request }
	// 	response.json(responseData)
  	response.send(request.file.filename)

})
module.exports = router