let express = require("express")
let router = express.Router()
let mysql = require("mysql")
let http = require('https');
const multer = require('multer')
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var moment = require('moment-timezone');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'Sree@1254.',
	database: 'loandata',
	multipleStatements: true,
	dateStrings : true
});
var callApi = require('request');

//Login
router.post('/login', function (request, response) {
	var username = request.body.username;
	var password = request.body.password;
	// console.log(request.body)
	response.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
	//request.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
	if (username && password) {
		if(username == "admin"){
			connection.query('SELECT UD.id, UD.name, UD.username, UD.email, UD.mobile, UD.usertype FROM userdetails UD WHERE UD.username = ? AND UD.password = ? AND UD.active = ?', [username, password, 1], function (error, results, fields) {
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
		}else{
			connection.query('SELECT UD.id, UD.name, UD.username, UD.email, UD.mobile, BL.bucket, UD.usertype FROM userdetails UD JOIN bucket_list BL ON BL.id = UD.bucket_id WHERE UD.username = ? AND UD.password = ? AND UD.active = 1', [username, password, 1], function (error, results, fields) {
				if (results.length > 0) {
					callApi('http://148.72.212.163/datetime.php', function (dateTimeError, dateTimeResponse, dateTimeBody) {
						dateTimeBody = JSON.parse(dateTimeBody);
						let currentDate = dateTimeBody.date;
						let currentTime = dateTimeBody.time;

						connection.query(`INSERT INTO loginLogs (empId, type, date, time) VALUES ('${results[0].id}', '1', '${currentDate}', '${currentTime}')`, function (error, results, fields) {
						});
					});
					let responseData = { "status": true, "code": 200, "userDetails": results }
					response.json(responseData)
				} else {
					let responseData = { "status": false, "code": 401, "message": "Incorrect Username and/or Password!" }
					response.json(responseData)
				}
				response.end();
			});
		}
		
	} else {
		let responseData = { "status": false, "code": 401, "message": "Please enter Username and Password!" }
		response.json(responseData)
		response.end();
	}
});

router.post('/logoutAction', function (request, response) {
	var id = request.body.id;
	callApi('http://148.72.212.163/datetime.php', function (dateTimeError, dateTimeResponse, dateTimeBody) {
		dateTimeBody = JSON.parse(dateTimeBody);
		let currentDate = dateTimeBody.date;
		let currentTime = dateTimeBody.time;

		connection.query(`INSERT INTO loginLogs (empId, type, date, time) VALUES ('${id}', '0', '${currentDate}', '${currentTime}')`, function (error, results, fields) {
			let responseData = { "status": true, "code": 200 }
			response.json(responseData)
		});
	});
});

//Register Employee
router.post('/registerEmployee', function (request, response) {
	console.log(request.body)
	var name = request.body.name;
	var username = request.body.username;
	var password = request.body.password;
	var email = request.body.email;
	var mobile = request.body.mobile;
	var bucket = request.body.assignedbucket;
	var language = request.body.language
	if (name && username && password && email && mobile ) {
		var data = {
			client_id:"1",
			name: name,
			username: username,
			email:email,
			password: password,
			mobile:mobile,
			bucket_id:bucket,
			usertype: '0',
			active:"1"
		}
		connection.query('INSERT INTO userdetails SET ?', data, function (error, results, fields) {
			console.log(JSON.stringify(error))
			if(error){
				let responseData = { "status": false, "code": 402, "message": JSON.stringify(error) }
				response.json(responseData)
				response.end();
			}else{
				var lastinserttedId = results.insertId;
				let inserData = '';
				let queryTest
				let startQuery = "INSERT INTO `user_known_languages` (`userId`,`languageId`) VALUES";
				// let duplicateColumn = "ON DUPLICATE KEY UPDATE `userId`=VALUES(`userId`),`languageId`=VALUES(`languageId`)"
				let responseData;
				//console.log(loanDetails)
				language.map(item => {
					currentRow = `('${lastinserttedId}','${item.id}'),`
					currentRow = currentRow.replace(/\n|\r/g, "");
					currentRow = currentRow.replace(/~+$/, '');
					inserData = inserData + currentRow
				});
				inserData = inserData.replace(/,\s*$/, "");
				queryTest = startQuery + inserData;
				console.log(queryTest)
				connection.query(queryTest, (err, results, fields) => {
				//	console.log(results)
					if (results) {
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
			}
		});
	
	} else {
		let responseData = { "status": false, "code": 401, "message": "Please enter employee details" }
		response.json(responseData)
		response.end();
	}
});

router.post('/updateEmployee', function (request, response) {
	console.log(request.body)
	var id = request.body.id;
	var name = request.body.name;
	var username = request.body.username;
	var password = request.body.password;
	var email = request.body.email;
	var mobile = request.body.mobile;
	var bucket = request.body.assignedbucket;
	var language = request.body.language
	if (id) {
		connection.query(`update userdetails set name ='${name}',username ='${username}',email='${email}',mobile='${mobile}',bucket_id= '${bucket}' where id = '${id}'`, function (error, results, fields) {
			if (results) {
				//Deleting emp old languages
				connection.query(`DELETE FROM user_known_languages where userId = '${id}'`, function (error, results, fields) {
					if (results) {
						let inserData = '';
						let queryTest
						let startQuery = "INSERT INTO `user_known_languages` (`userId`,`languageId`) VALUES";
						// let duplicateColumn = "ON DUPLICATE KEY UPDATE `userId`=VALUES(`userId`),`languageId`=VALUES(`languageId`)"
						let responseData;
						//console.log(loanDetails)
						language.map(item => {
							currentRow = `('${id}','${item.id}'),`
							currentRow = currentRow.replace(/\n|\r/g, "");
							currentRow = currentRow.replace(/~+$/, '');
							inserData = inserData + currentRow
						});
						inserData = inserData.replace(/,\s*$/, "");
						queryTest = startQuery + inserData;
						console.log(queryTest)
						connection.query(queryTest, (err, results, fields) => {
							if (results) {
								let responseData = { "status": true, "code": 200, "message": "Employee Details updated successfully" }
								response.json(responseData)
							} else {
								let responseData = { "status": false, "code": 401, "message": "Failed to update Employee Details", "err" :  error}
								response.json(responseData)
							}
							response.end();
						});
					} else {
						let responseData = { "status": false, "code": 401, "message": "Failed to update Employee Details", "err" :  error}
						response.json(responseData)
					}
				});
			} else {
				let responseData = { "status": false, "code": 401, "message": "Failed to update Employee Details", "err" :  error}
				response.json(responseData)
			}
		});
	} else {
		let responseData = { "status": false, "code": 401, "message": "Please check details" }
		response.json(responseData)
		response.end();
	}
});

router.post('/deActivateEmployee', function (request, response) {
	var empid = request.body.empid;
	if(empid){
		connection.query(`update userdetails set active ='0' where id = '${empid}'`, function (error, results, fields) {
			if (results) {
				connection.query(`update loan_details set assigned_emp_id = NULL, is_assigned = 0 where assigned_emp_id = '${empid}'`, function (error, results, fields) {
					if (results) {
						let responseData = { "status": true, "code": 200, "message": "Employee Deactivate successfully" }
						response.json(responseData)
					} else {
						let responseData = { "status": false, "code": 401, "message": "Deactivated Employee Success. Failed to un assaign loans", "err" :  error}
						response.json(responseData)
					}
				});
			} else {
				let responseData = { "status": false, "code": 401, "message": "Failed to Deactivate Employee", "err" :  error}
				response.json(responseData)
			}
		});
	}else {
		let responseData = { "status": false, "code": 401, "message": "Please check details" }
		response.json(responseData)
		response.end();
	}
})
router.post('/activateEmployee', function (request, response) {
	var empid = request.body.empid;
	if(empid){
		connection.query(`update userdetails set active ='1' where id = '${empid}'`, function (error, results, fields) {
			if (results) {
				let responseData = { "status": true, "code": 200, "message": "Employee activate successfully" }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "message": "Failed to activate Employee", "err" :  error}
				response.json(responseData)
			}
		});
	}else {
		let responseData = { "status": false, "code": 401, "message": "Please check details" }
		response.json(responseData)
		response.end();
	}
})
//SELECT u.id,u.client_id,u.name,u.username,u.email,u.mobile,lt.state_name,u.bucket_id,bl.bucket,lt.name as language_name FROM userdetails u JOIN user_known_languages ukl ON ukl.userId = u.id JOIN language_table lt ON lt.id = ukl.languageId JOIN bucket_list bl ON bl.id = u.bucket_id WHERE u.usertype = 0 AND u.active = 1

router.get('/getAllEmpList', function (request, response) {
	connection.query('SELECT u.id,u.client_id,u.name,u.username,u.email,u.mobile,u.bucket_id,u.active as status,bl.bucket,(NULL) as language_name FROM userdetails u JOIN bucket_list bl ON bl.id = u.bucket_id WHERE u.usertype = 0', function (error, results, fields) {
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
const getRoleByCreds = (creds) => {
	let credentials = creds.split(':');
    return new Promise((resolve) => {
        connection.query(`SELECT ud.usertype, ud.id, bl.bucket FROM userdetails ud LEFT JOIN bucket_list bl ON ud.bucket_id = bl.id WHERE username = '${credentials[0]}' AND password = md5('${credentials[1]}')`, (err, rows, fields) => {
			resolve(rows)  
        })
    })
}

router.get("/getAllActiveEmpList", async(request, response) => {
	let base64Credentials =  request.headers.authorization.split(' ')[1];
	let Credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	let role = await getRoleByCreds(Credentials)
	let queryString = ""
	if(role[0].usertype == 1){
		let today = moment().tz("Asia/Kolkata").format('YYYY-MM-DD')
		queryString = "SELECT u.id,u.client_id,u.name,u.username,u.email,u.mobile,u.bucket_id,u.active as status,bl.bucket,GROUP_CONCAT(DISTINCT(LT.name)) as language_name FROM userdetails u LEFT JOIN bucket_list bl ON bl.id = u.bucket_id LEFT JOIN user_known_languages UKL ON UKL.userId = u.id LEFT JOIN language_table LT ON LT.id = UKL.languageId WHERE u.usertype = 0 AND u.active= '1' GROUP BY u.id"
	}
	if(role[0].usertype == 2){
		queryString = `SELECT u.id,u.client_id,u.name,u.username,u.email,u.mobile,u.bucket_id,u.active as status,bl.bucket,GROUP_CONCAT(DISTINCT(LT.name)) as language_name FROM userdetails u LEFT JOIN bucket_list bl ON bl.id = u.bucket_id LEFT JOIN user_known_languages UKL ON UKL.userId = u.id LEFT JOIN language_table LT ON LT.id = UKL.languageId WHERE u.usertype = 0 AND u.active= "1" AND u.parentId = ${role[0].id} GROUP BY u.id`
	}
	connection.query(queryString, function (error, results, fields) {
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
	connection.query('SELECT ld.id, ld.loan_id, ld.due_date, ld.overdue_days, ld.state, ld.principal_amt, ld.bucket, u.name FROM `loan_details` ld JOIN userdetails u Where u.id = ld.assigned_emp_id', function (error, results, fields) {
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
	let today = moment().tz("Asia/Kolkata").format('YYYY-MM-DD')
	// connection.query(`SELECT ld.*, LS.status_type as status FROM loan_details ld JOIN userdetails u on  u.id = ld.assigned_emp_id LEFT JOIN Loan_status LS ON ld.current_status = LS.id where u.id ='${empId}' AND ld.batch_status = 1 GROUP BY ld.id ORDER BY ld.current_status DESC`, function (error, results, fields) {
	// 	if (results.length > 0) {
	// 		//	request.session.loggedin = true;
	// 		// request.session.username = username;
	// 		let responseData = { "status": true, "code": 200, "assignedLoanToEmp": results }
	// 		response.json(responseData)
	// 	} else {
	// 		let responseData = { "status": false, "code": 401, "assignedLoanToEmp": [] }
	// 		response.json(responseData)
	// 	}
	// 	response.end();
	// });
	connection.query(`SELECT ld.*, LS.status_type as status, lsh.loan_comments, lsh.statusId FROM loan_details ld JOIN userdetails u on u.id = ld.assigned_emp_id LEFT JOIN (SELECT comments as loan_comments, loanId, statusId FROM loans_status_history WHERE active = 1 AND (dateTime LIKE '%${today}%' OR statusId = 5 OR statusId = 6) GROUP BY loanId) AS lsh ON ld.loanid = lsh.loanId LEFT JOIN Loan_status LS ON lsh.statusId = LS.id where u.id = ${empId} AND ld.batch_status = 1 GROUP BY ld.id ORDER BY lsh.statusId DESC`, function (error, results, fields) {
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

router.post('/getLoanListByEmpByDate', function (request, response) {
	var empId = request.body.empId
	let today = request.body.date
	connection.query(`SELECT ld.*, LS.status_type as status, lsh.loan_comments, lsh.statusId, lsh.callsDone 

					FROM loan_details ld 

					JOIN userdetails u on u.id = ld.assigned_emp_id 

					LEFT JOIN (SELECT comments as loan_comments, loanId, statusId, COUNT(id) as callsDone FROM loans_status_history WHERE active = 1 AND (dateTime LIKE '%${today}%' OR statusId = 5 OR statusId = 6 OR statusId = 1) GROUP BY loanId) AS lsh ON ld.loanid = lsh.loanId 

					LEFT JOIN Loan_status LS ON lsh.statusId = LS.id 

					where u.id = ${empId} AND ld.batch_status = 1 AND ld.is_assigned = 1 GROUP BY ld.id ORDER BY lsh.callsDone ASC`, function (error, results, fields) {
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "assignedLoanToEmp": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "assignedLoanToEmp": [] }
			response.json(responseData)
		}
		response.end();
	});
});

router.post('/getLoanPastStatus', function (request, response) {
	var loanId = request.body.loanId
	let yesterday = moment().tz("Asia/Kolkata").subtract(1, 'days').format('YYYY-MM-DD')
	let today = moment().tz("Asia/Kolkata").format('YYYY-MM-DD')
	connection.query(`SELECT lsh.comments as loan_comments, lsh.callType as callType, lsh.statusId, ls.status_type as status, lsh.dateTime FROM loans_status_history lsh JOIN Loan_status ls ON ls.id = lsh.statusId WHERE lsh.loanId = '${loanId}' AND (lsh.dateTime LIKE '%${yesterday}%' OR lsh.dateTime LIKE '%${today}%') ORDER BY lsh.id DESC`, function (error, results, fields) {
		if (results.length > 0) {
			//	request.session.loggedin = true;
			// request.session.username = username;
			let responseData = { "status": true, "code": 200, "loanPastStatus": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "loanPastStatus": [] }
			response.json(responseData)
		}
		response.end();
	});
});

router.post('/assignLoanList', function (request, response) {
	 var empid = request.body.empId;
	 var loanid = request.body.loanId;
	var queries='';
	loanid.map(lId => {
			queries += mysql.format(`UPDATE loan_details SET assigned_emp_id = '${empid}',is_assigned= '1' WHERE loan_id = '${lId}';`);
	});
	connection.query(queries, (err, results, fields) => {
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

router.post('/unassignLoanList', function (request, response) {
	var loanid = request.body.loanId;
   var queries='';
   loanid.map(lId => {
		   queries += mysql.format(`UPDATE loan_details SET assigned_emp_id = NULL,is_assigned= '0' WHERE loan_id = '${lId}';`);
   });
   connection.query(queries, (err, results, fields) => {
	   if (results) {
		   let responseData = { "status": true, "code": 200, "message": "Loan Unassigned successfully" }
		   response.json(responseData)
	   } else {
		   let responseData = { "status": false, "code": 401, "message": "" }
		   response.json(responseData)
	   }
	   response.end();
   });
});

// router.post('/assignLoanList', function (request, response) {
// 	var empid = request.body.empId;
// 	var loanid = request.body.loanId;
// 	var selectedEmpid = request.body.assignedEmpId
// 	console.log(loanid)
// 	var today = new Date();
// 	var dd = today.getDate();
// 	var mm = today.getMonth() + 1;
// 	var yyyy = today.getFullYear();
// 	if (dd < 10) {
// 		dd = '0' + dd

// 	} if (mm < 10) {

// 		mm = '0' + mm
// 	}
// 	var today = yyyy + '-' + mm + '-' + dd;
// 	let inserData = '';
// 	let queryTest
// 	let dontInsert;
// 	let startQuery = 'INSERT INTO Loan_log_table (emp_id,loan_id,date,active) VALUES'
// 	console.log(`update Loan_log_table SET active = 0 WHERE loan_id IN (${loanid})`)
// 	if (loanid) {
// 		connection.query(`update Loan_log_table SET active = 0 WHERE loan_id IN ('${loanid}')`, (er, res, field) => {
// 			console.log(res)
// 		})
// 	}
// 	loanid.map(lId => {
// 		currentRow = `('${empid}','${lId}','${today}','1'),`

// 		currentRow = currentRow.replace(/\n|\r/g, "");
// 		currentRow = currentRow.replace(/~+$/, '');

// 		inserData = inserData + currentRow
// 	});
// 	inserData = inserData.replace(/,\s*$/, "");
// 	console.log(inserData)
// 	queryTest = startQuery + inserData;

// 	connection.query(queryTest, (err, results, fields) => {
// 		if (results) {
// 			let responseData = { "status": true, "code": 200, "message": "Loan assigned successfully" }
// 			response.json(responseData)
// 		} else {
// 			let responseData = { "status": false, "code": 401, "message": "" }
// 			response.json(responseData)
// 		}
// 		response.end();
// 	});


// });

router.post('/updateLoan', function (request, response) {
	// console.log(request.body)
	if (request.body.loan_id && request.body.current_Status) {
		// let currentDateTime = moment().tz("Asia/Kolkata").format('YYYY-MM-DD hh:mm:ss')

		connection.query(`update loans_status_history set active = 0 where loanId = '${request.body.loan_id}'`, function (error, results, fields) {});

		callApi('http://148.72.212.163/datetime.php', function (dateTimeError, dateTimeResponse, dateTimeBody) {
			dateTimeBody = JSON.parse(dateTimeBody);
			let currentDateTime = dateTimeBody.dateTime;
			// let currentDate = dateTimeBody.date;
			// let currentTime = dateTimeBody.time;

			connection.query(`INSERT INTO loans_status_history (loanId, statusId, callType, comments, dateTime) VALUES ('${request.body.loan_id}', '${request.body.current_Status}', '${request.body.callType}', '${request.body.comment}', '${currentDateTime}')`, function (error, results, fields) {
				if (results) {
					if(request.body.callType == "Customer" && request.body.current_Status == "3"){
						// let query = `UPDATE loan_details JOIN (SELECT statusId FROM loans_status_history WHERE loanId = "${request.body.loan_id}" AND callType = "Customer" ORDER BY id DESC LIMIT 1,1) AS lsh SET is_assigned = 2 WHERE lsh.statusId = 3 AND loanid = "${request.body.loan_id}"`
						let query = `UPDATE loan_details SET is_assigned = 2 WHERE loanid = "${request.body.loan_id}"`
						connection.query(query, function (error, results, fields) {
							console.log(error);
						});	
					}
					let responseData = { "status": true, "code": 200, "message": "Loan Details updated successfully" }
					response.json(responseData)
				} else {
					let responseData = { "status": false, "code": 401, "message": "Failed to update loan Details", "err" :  error}
					response.json(responseData)
				}
			});
		});

	}else{
		let responseData = { "status": false, "code": 401, "message": "Failed to update loan Details" }
		response.json(responseData)
	}
});
router.get('/getAllLoanDetailsList', function (request, response) {
	connection.query('SELECT * FROM loan_details WHERE batch_status = 1 ORDER BY is_assigned ASC', function (error, results, fields) {
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
router.get('/getAssignedLoanDetailsList', async(request, response) => {
	let base64Credentials =  request.headers.authorization.split(' ')[1];
	let Credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	let role = await getRoleByCreds(Credentials)
	let queryString = ""
	if(role[0].usertype == 1){
		queryString = 'SELECT ld.id, ld.loan_id, ld.due_date, ld.overdue_days, ld.state, ld.principal_amt, ld.bucket, ld.assigned_emp_id, ld.Customer_id, ld.mobile, ld.ref_type1, ld.ref_name1, ld.ref_mobile_num1, ld.ref_type2, ld.ref_name2, ld.ref_mobile_num2, ld.repayment_amt, ld.customer_Name FROM loan_details ld WHERE batch_status = 1 AND is_assigned != 0'
	}
	if(role[0].usertype == 2){
		queryString = `SELECT ld.id, ld.loan_id, ld.due_date, ld.overdue_days, ld.state, ld.principal_amt, ld.bucket, ld.assigned_emp_id, ld.Customer_id, ld.mobile, ld.ref_type1, ld.ref_name1, ld.ref_mobile_num1, ld.ref_type2, ld.ref_name2, ld.ref_mobile_num2, ld.repayment_amt, ld.customer_Name FROM loan_details ld JOIN userdetails ud ON ld.assigned_emp_id = ud.id WHERE batch_status = 1 AND is_assigned != 0 AND ud.parentId = ${role[0].id}`
	}
	connection.query(queryString, function (error, results, fields) {
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "loanDetails": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "loanDetails": [] }
			response.json(responseData)
		}
		response.end();
	});

});
router.get('/getUnAssignedLoanDetailsList', async(request, response) => {
	let base64Credentials =  request.headers.authorization.split(' ')[1];
	let Credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	let role = await getRoleByCreds(Credentials)
	let queryString = ""
	if(role[0].usertype == 1){
		queryString = 'SELECT ld.id, ld.loan_id, ld.state, ld.principal_amt, ld.bucket FROM loan_details ld WHERE batch_status = 1 AND is_assigned = 0'
	}
	if(role[0].usertype == 2){
		queryString = `SELECT ld.id, ld.loan_id, ld.state, ld.principal_amt, ld.bucket FROM loan_details ld WHERE batch_status = 1 AND is_assigned = 0 AND ld.bucket = '${role[0].bucket}'`
	}
	connection.query(queryString, function (error, results, fields) {
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "loanDetails": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "loanDetails": [] }
			response.json(responseData)
		}
		response.end();
	});

});
router.get('/getUnAssignedLoanDetailsListForExport', async(request, response) => {
	let base64Credentials =  request.headers.authorization.split(' ')[1];
	let Credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	let role = await getRoleByCreds(Credentials)
	let queryString = ""
	if(role[0].usertype == 1){
		queryString = 'SELECT * FROM loan_details WHERE batch_status = 1 AND is_assigned = 0'
	}
	if(role[0].usertype == 2){
		queryString = `SELECT ld.* FROM loan_details ld WHERE batch_status = 1 AND is_assigned = 0 AND ld.bucket = '${role[0].bucket}'`
	}
	connection.query(queryString, function (error, results, fields) {
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "loanDetails": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "loanDetails": [] }
			response.json(responseData)
		}
		response.end();
	});

});
router.get('/getFilteredLoanDetailsList', async(request, response) => {
	let base64Credentials =  request.headers.authorization.split(' ')[1];
	let Credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	let role = await getRoleByCreds(Credentials)
	let queryString = ""
	if(role[0].usertype == 1){
		queryString = 'SELECT ld.id, ld.loan_id, ld.state, ld.principal_amt, ld.bucket, UD.name FROM loan_details ld JOIN userdetails UD ON UD.id = ld.assigned_emp_id WHERE batch_status = 1 AND is_assigned = 2'
	}
	if(role[0].usertype == 2){
		queryString = `SELECT ld.id, ld.loan_id, ld.state, ld.principal_amt, ld.bucket, UD.name FROM loan_details ld JOIN userdetails UD ON UD.id = ld.assigned_emp_id WHERE batch_status = 1 AND is_assigned = 2 AND ld.bucket = '${role[0].bucket}'`
	}
	connection.query(queryString, function (error, results, fields) {
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "loanDetails": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "loanDetails": [] }
			response.json(responseData)
		}
		response.end();
	});

});
router.get('/inactiveCurrentBatch', function (request, response) {
	connection.query('UPDATE loan_details SET `batch_status` = 0 WHERE `batch_status` = 1', function (error, results, fields) {
		let responseData = { "status": true, "code": 200, "message": "Current Batch Inactivated." }
		response.json(responseData)
	});

});

router.get('/getLoanStatus', function (request, response) {
	connection.query('SELECT * FROM Loan_status WHERE id!="6"', function (error, results, fields) {
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
		filename: function (request, file, cb) {
			cb(null, Date.now() + "-" + file.originalname);
		}
	}
);

const uploadx = multer({
	storage: xyz,
	fileFilter: function (req, file, callback) { //file filter
		console.log(file)
		if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
			return callback(new Error('Wrong extension type'));
		}
		callback(null, true);
	}
}).single('leadExcel');

router.post("/uploadExcel", (request, response) => {
	// if(['xls', 'xlsx'].request.file.filename)
	// response.send("File "+request.file.filename+" uploaded successfully")
	var exceltojson; //Initialization
	uploadx(request, response, function (err) {
		if (err) {
			response.json({ error_code: 1, err_desc: err });
			return;
		}
		/** Multer gives us file info in req.file object */
		if (!request.file) {
			response.json({ error_code: 1, err_desc: "No file passed" });
			return;
		}
		//start convert process
		/** Check the extension of the incoming file and
		 *  use the appropriate module
		 */
		if (request.file.originalname.split('.')[request.file.originalname.split('.').length - 1] === 'xlsx') {
			exceltojson = xlsxtojson;
		} else {
			exceltojson = xlstojson;
		}
		try {
			exceltojson({
				input: request.file.path, //the same path where we uploaded our file
				output: null, //since we don't need output.json
				lowerCaseHeaders: true
			}, function (err, result) {
				if (err) {
					return response.json({ error_code: 1, err_desc: err, data: null });
				}
				response.json({ error_code: 0, err_desc: null, data: result, filename: request.file.originalname });
			});
		} catch (e) {
			response.json({ error_code: 1, err_desc: "Corupted excel file" });
		}
	});
})
router.post('/insertExcelOld', function (request, response) {
	// let responseData = { "status": true, "code": 200, "message": "Excel uploaded successfully" }
	// response.json(responseData)
	var loanDetails = request.body.loanDetails;
	var filename = request.body.filename;
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

		if (filename) {
			var file = {
				client_id: "1",
				filename: filename,
				date: today,
				active: '1'
			}
			connection.query('INSERT INTO imported_files SET ?', file, (err, results, fields) => {
			//	console.log(results.insertId)
				var lastinserttedId = results.insertId;
				let inserData = '';
				let queryTest
				let startQuery = "INSERT INTO `loan_details` (`client_id`,`imported_file_id`,`Customer_id`, `Loan_Count`, `loanid`, `customer_Name`, `Gender`, `mobile`,`email`, `DOB`, `Age`, `city`, `pin_code`, `state`, `loan_id`, `disbursal_amt`, `disbursal_date`,`due_date`, `principal_amt`, `interest_amount`, `penalty_amt`, `repayment_amt`, `ref_type1`, `ref_name1`, `ref_mobile_num1`, `ref_type2`, `ref_name2`, `ref_mobile_num2`, `bucket`,`overdue_days`, `is_collected`, `ESIGN_MOBILE_NUMBER`, `repaid_date`,`is_assigned`,`date`) VALUES";
				let duplicateColumn = "ON DUPLICATE KEY UPDATE `client_id`=VALUES(`client_id`),`imported_file_id`=VALUES(`imported_file_id`),`assigned_emp_id`=VALUES(`assigned_emp_id`),`Customer_id`=VALUES(`customer_id`), `Loan_Count`=VALUES(`loan_count`), `loanid`=VALUES(`loan_id`),`customer_Name`=VALUES(`customer_name`),`Gender`=VALUES(`gender`),`mobile`=VALUES(`mobile`),`email`=VALUES(`email`),`DOB`=VALUES(`dob`),`Age`=VALUES(`age`),`city`=VALUES(`city`) ,`pin_code`=VALUES(`pin_code`),`state`=VALUES(`state`),`loan_id`=VALUES(`loan_id`),`disbursal_amt`=VALUES(`disbursal_amt`),`disbursal_date`=VALUES(`disbursal_date`),`due_date`=VALUES(`due_date`),`principal_amt`=VALUES(`principal_amt`),`interest_amount`=VALUES(`interest_amount`),`penalty_amt`=VALUES(`penalty_amt`),`repayment_amt`=VALUES(`repayment_amt`),`ref_type1`=VALUES(`ref_type1`),`ref_name1`=VALUES(`ref_name1`),`ref_mobile_num1`=VALUES(`ref_mobile_num1`),`ref_type2`=VALUES(`ref_type2`),`ref_name2`=VALUES(`ref_name2`),`ref_mobile_num2`=VALUES(`ref_mobile_num2`),`bucket`=VALUES(`bucket`),`overdue_days`=VALUES(`overdue_days`),`is_collected`=VALUES(`is_collected`),`ESIGN_MOBILE_NUMBER`=VALUES(`esign_mobile_number`),`repaid_date`=VALUES(`repaid_date`),`is_assigned`=VALUES(`is_assigned`),`date`=VALUES(`date`)"
				let responseData;
				//console.log(loanDetails)
				loanDetails.map(item => {
					currentRow = `('1','${lastinserttedId}','${item.customer_id}','${item.loan_count}' ,'${item.loanid}' ,'${item.customer_name}' , '${item.gender}',  '${item.mobile}','${item.email}' ,
					'NULL' ,'0' ,'${item.city}' ,
					'NULL' ,'${item.state}' ,'${item.loanid}' ,'${item.disbursal_amt}','${item.disbursal_date}' ,'${item.due_date}' ,'${item.principal_amt}' ,
					'${item.interest_amount}' ,'${item.penalty_amt}' ,'${item.repayment_amt}' ,'${item.ref_type1}' , 
					'${item.ref_name1}','${item.ref_mobile_num1}' , '${item.ref_type2}','${item.ref_name2}' ,'${item.ref_mobile_num2}' ,
					'${item.bucket}' ,'${item.overdue_days}' , 'NULL',
					'NULL' , '${item.repaid_date}','0','${today}'),`

					currentRow = currentRow.replace(/\n|\r/g, "");
					currentRow = currentRow.replace(/~+$/, '');

					inserData = inserData + currentRow
					// inserData = inserData.replace(/,\s*$/, "");
					//console.log(queryTest)
				});
				inserData = inserData.replace(/,\s*$/, "");
				queryTest = startQuery + inserData + duplicateColumn;
			//	console.log(queryTest)
				connection.query(queryTest, (err, results, fields) => {
				//	console.log(results)
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
				
			});
		}
	}
});

router.post('/insertExcel', function (request, response) {
	var loanDetails = request.body.loanDetails;
	var filename = request.body.filename;
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

		if (filename) {
			var file = {
				client_id: "1",
				filename: filename,
				date: today,
				active: '1'
			}
			connection.query('INSERT INTO imported_files SET ?', file, (err, results, fields) => {
				var lastinserttedId = results.insertId;
				let inserData = [];
				inserData[0] = ""
				let queryTest
				let startQuery = "INSERT INTO `loan_details` (`client_id`,`imported_file_id`,`Customer_id`, `Loan_Count`, `loanid`, `customer_Name`, `Gender`, `mobile`,`email`, `DOB`, `Age`, `city`, `pin_code`, `state`, `loan_id`, `disbursal_amt`, `disbursal_date`,`due_date`, `principal_amt`, `interest_amount`, `penalty_amt`, `repayment_amt`, `ref_type1`, `ref_name1`, `ref_mobile_num1`, `ref_type2`, `ref_name2`, `ref_mobile_num2`, `bucket`,`overdue_days`, `is_collected`, `ESIGN_MOBILE_NUMBER`, `repaid_date`,`is_assigned`,`date`, `batch_status`) VALUES";
				let duplicateColumn = "ON DUPLICATE KEY UPDATE `client_id`=VALUES(`client_id`),`imported_file_id`=VALUES(`imported_file_id`),`assigned_emp_id`=VALUES(`assigned_emp_id`),`Customer_id`=VALUES(`customer_id`), `Loan_Count`=VALUES(`loan_count`), `loanid`=VALUES(`loan_id`),`customer_Name`=VALUES(`customer_name`),`Gender`=VALUES(`gender`),`mobile`=VALUES(`mobile`),`email`=VALUES(`email`),`DOB`=VALUES(`dob`),`Age`=VALUES(`age`),`city`=VALUES(`city`) ,`pin_code`=VALUES(`pin_code`),`state`=VALUES(`state`),`loan_id`=VALUES(`loan_id`),`disbursal_amt`=VALUES(`disbursal_amt`),`disbursal_date`=VALUES(`disbursal_date`),`due_date`=VALUES(`due_date`),`principal_amt`=VALUES(`principal_amt`),`interest_amount`=VALUES(`interest_amount`),`penalty_amt`=VALUES(`penalty_amt`),`repayment_amt`=VALUES(`repayment_amt`),`ref_type1`=VALUES(`ref_type1`),`ref_name1`=VALUES(`ref_name1`),`ref_mobile_num1`=VALUES(`ref_mobile_num1`),`ref_type2`=VALUES(`ref_type2`),`ref_name2`=VALUES(`ref_name2`),`ref_mobile_num2`=VALUES(`ref_mobile_num2`),`bucket`=VALUES(`bucket`),`overdue_days`=VALUES(`overdue_days`),`is_collected`=VALUES(`is_collected`),`ESIGN_MOBILE_NUMBER`=VALUES(`esign_mobile_number`),`repaid_date`=VALUES(`repaid_date`),`is_assigned`=VALUES(`is_assigned`),`date`=VALUES(`date`), `batch_status` =VALUES(`batch_status`)"
				let responseData;
				let currentBatch = 0
				let rowCount = 0
				let allBatchSuccess = true
				loanDetails.map(item => {
					if(item.loanid !=""){
						currentRow = `("1","${lastinserttedId}","${item.customer_id}","${item.loan_count}" ,"${item.loanid}" ,"${item.customer_name}" , "${item.gender}",  "${item.mobile}","${item.email}" ,
						"NULL" ,"0" ,"${item.city}" ,
						"NULL" ,"${item.state}" ,"${item.loanid}" ,"${item.disbursal_amt}","${item.disbursal_date}" ,"${item.due_date}" ,"${item.principal_amt}" ,
						"${item.interest_amount}" ,"${item.penalty_amt}" ,"${item.repayment_amt}" ,"${item.ref_type1}" , 
						"${item.ref_name1}","${item.ref_mobile_num1}" , "${item.ref_type2}","${item.ref_name2}" ,"${item.ref_mobile_num2}" ,
						"${item.bucket}" ,"${item.overdue_days}" , "NULL",
						"NULL" , "${item.repaid_date}","0","${today}", "1"),`

						currentRow = currentRow.replace(/\n|\r/g, "");
						currentRow = currentRow.replace(/~+$/, '');
						currentRow = currentRow.replace(/'/g, "''");
						
						inserData[currentBatch] = inserData[currentBatch] + currentRow

						if(rowCount == 1000){
							currentBatch = currentBatch + 1
							rowCount = 0
							inserData[currentBatch] = ""
						}
						rowCount = rowCount + 1
					}
				});
				inserData.map( (batch, key) => {
					inserData[key] = inserData[key].replace(/,\s*$/, "");
					queryTest = startQuery + inserData[key] + duplicateColumn;
					connection.query(queryTest, (err, results, fields) => {
						if(!results){
							allBatchSuccess = false
						}
					});
				})
				if(allBatchSuccess){
					let responseData = { "status": true, "code": 200, "message": "Excel uploaded successfully" }
					response.json(responseData)
					response.end()
				}else{
					let responseData = { "status": true, "code": 401, "message": "something went wrong" }
					response.json(responseData)
					response.end()
				}
			});
		}
	}
});

router.post('/uploadSingleEmployeeDetails', function (request, response) {
	var loanDetails = request.body.loanDetails;
	var filename = request.body.filename;
	var employeeID = request.body.employeeId
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

		if (filename) {
			var file = {
				client_id: "1",
				filename: filename,
				date: today,
				active: '1'
			}
			connection.query('INSERT INTO imported_files SET ?', file, (err, results, fields) => {
				var lastinserttedId = results.insertId;
				let inserData = [];
				inserData[0] = ""
				let queryTest
				let startQuery = "INSERT INTO `loan_details` (`client_id`,`imported_file_id`,`Customer_id`, `Loan_Count`, `loanid`, `customer_Name`, `Gender`, `mobile`,`email`, `DOB`, `Age`, `city`, `pin_code`, `state`, `loan_id`, `disbursal_amt`, `disbursal_date`,`due_date`, `principal_amt`, `interest_amount`, `penalty_amt`, `repayment_amt`, `ref_type1`, `ref_name1`, `ref_mobile_num1`, `ref_type2`, `ref_name2`, `ref_mobile_num2`, `bucket`,`overdue_days`, `is_collected`, `ESIGN_MOBILE_NUMBER`, `repaid_date`,`is_assigned`,`date`, `assigned_emp_id`, `batch_status`) VALUES";
				let duplicateColumn = "ON DUPLICATE KEY UPDATE `client_id`=VALUES(`client_id`),`imported_file_id`=VALUES(`imported_file_id`),`assigned_emp_id`=VALUES(`assigned_emp_id`),`Customer_id`=VALUES(`customer_id`), `Loan_Count`=VALUES(`loan_count`), `loanid`=VALUES(`loan_id`),`customer_Name`=VALUES(`customer_name`),`Gender`=VALUES(`gender`),`mobile`=VALUES(`mobile`),`email`=VALUES(`email`),`DOB`=VALUES(`dob`),`Age`=VALUES(`age`),`city`=VALUES(`city`) ,`pin_code`=VALUES(`pin_code`),`state`=VALUES(`state`),`loan_id`=VALUES(`loan_id`),`disbursal_amt`=VALUES(`disbursal_amt`),`disbursal_date`=VALUES(`disbursal_date`),`due_date`=VALUES(`due_date`),`principal_amt`=VALUES(`principal_amt`),`interest_amount`=VALUES(`interest_amount`),`penalty_amt`=VALUES(`penalty_amt`),`repayment_amt`=VALUES(`repayment_amt`),`ref_type1`=VALUES(`ref_type1`),`ref_name1`=VALUES(`ref_name1`),`ref_mobile_num1`=VALUES(`ref_mobile_num1`),`ref_type2`=VALUES(`ref_type2`),`ref_name2`=VALUES(`ref_name2`),`ref_mobile_num2`=VALUES(`ref_mobile_num2`),`bucket`=VALUES(`bucket`),`overdue_days`=VALUES(`overdue_days`),`is_collected`=VALUES(`is_collected`),`ESIGN_MOBILE_NUMBER`=VALUES(`esign_mobile_number`),`repaid_date`=VALUES(`repaid_date`),`is_assigned`=VALUES(`is_assigned`),`date`=VALUES(`date`), `batch_status` =VALUES(`batch_status`)"
				let responseData;
				let currentBatch = 0
				let rowCount = 0
				let allBatchSuccess = true
				loanDetails.map(item => {
					if(item.loanid !=""){
						currentRow = `("1","${lastinserttedId}","${item.customer_id}","${item.loan_count}" ,"${item.loanid}" ,"${item.customer_name}" , "${item.gender}",  "${item.mobile}","${item.email}" ,
						"NULL" ,"0" ,"${item.city}" ,
						"NULL" ,"${item.state}" ,"${item.loanid}" ,"${item.disbursal_amt}","${item.disbursal_date}" ,"${item.due_date}" ,"${item.principal_amt}" ,
						"${item.interest_amount}" ,"${item.penalty_amt}" ,"${item.repayment_amt}" ,"${item.ref_type1}" , 
						"${item.ref_name1}","${item.ref_mobile_num1}" , "${item.ref_type2}","${item.ref_name2}" ,"${item.ref_mobile_num2}" ,
						"${item.bucket}" ,"${item.overdue_days}" , "NULL",
						"NULL" , "${item.repaid_date}","1","${today}","${employeeID}", "1"),`

						currentRow = currentRow.replace(/\n|\r/g, "");
						currentRow = currentRow.replace(/~+$/, '');
						currentRow = currentRow.replace(/'/g, "''");
						
						inserData[currentBatch] = inserData[currentBatch] + currentRow

						if(rowCount == 1000){
							currentBatch = currentBatch + 1
							rowCount = 0
							inserData[currentBatch] = ""
						}
						rowCount = rowCount + 1
					}
				});
				inserData.map( (batch, key) => {
					inserData[key] = inserData[key].replace(/,\s*$/, "");
					queryTest = startQuery + inserData[key] + duplicateColumn;
					connection.query(queryTest, (err, results, fields) => {
						if(!results){
							allBatchSuccess = false
						}
					});
				})
				if(allBatchSuccess){
					let responseData = { "status": true, "code": 200, "message": "Excel uploaded successfully" }
					response.json(responseData)
					response.end()
				}else{
					let responseData = { "status": true, "code": 401, "message": "something went wrong" }
					response.json(responseData)
					response.end()
				}
			});
		}
	}
});

router.post('/updateOldLoanDetails', function (request, response) {
	var ldata = request.body.loanupdateData;
	if (ldata) {
		let inserData = [];
		inserData[0] = ""
		let queryTest
		let startQuery = "INSERT INTO `loan_details` (`penalty_amt`, `repayment_amt`, `bucket`, `overdue_days`, `loanid`, `disbursal_date`, `due_date`) VALUES";
		let duplicateColumn = "ON DUPLICATE KEY UPDATE `penalty_amt`=VALUES(`penalty_amt`),`repayment_amt`=VALUES(`repayment_amt`),`bucket`=VALUES(`bucket`),`overdue_days`=VALUES(`overdue_days`),`disbursal_date`=VALUES(`disbursal_date`),`due_date`=VALUES(`due_date`)"
		let responseData;
		let currentBatch = 0
		let rowCount = 0
		let allBatchSuccess = true
		ldata.map(item=>{
			currentRow = `("${item.penalty_amt}", "${item.repayment_amt}", "${item.bucket}", "${item.overdue_days}", "${item.loanid}", "${item.disbursal_date}", "${item.due_date}"),`

			currentRow = currentRow.replace(/\n|\r/g, "");
			currentRow = currentRow.replace(/~+$/, '');
			currentRow = currentRow.replace(/'/g, "''");
			
			inserData[currentBatch] = inserData[currentBatch] + currentRow

			if(rowCount == 1000){
				currentBatch = currentBatch + 1
				rowCount = 0
				inserData[currentBatch] = ""
			}
			rowCount = rowCount + 1
		});
		inserData.map( (batch, key) => {
			inserData[key] = inserData[key].replace(/,\s*$/, "");
			queryTest = startQuery + inserData[key] + duplicateColumn;
			connection.query(queryTest, (err, results, fields) => {
				// console.log(err)
				// return false
				if(!results){
					allBatchSuccess = false
				}
			});
		})
		if(allBatchSuccess){
			let responseData = { "status": true, "code": 200, "message": "Loan Details updated successfully" }
			response.json(responseData)
			response.end()
		}else{
			let responseData = { "status": true, "code": 401, "message": "Failed to update loan Details" }
			response.json(responseData)
			response.end()
		}
		// var queries='';
		// ldata.map(item=>{
		// 	queries += mysql.format(`UPDATE loan_details SET penalty_amt= '${item.penalty_amt}',repayment_amt= '${item.repayment_amt}'  ,bucket= '${item.bucket}',overdue_days= '${item.overdue_days}' WHERE loan_id = '${item.loanid}';`);
		// })
		// console.log(queries)
		// connection.query(queries, function (error, results, fields) {
		// 	console.log(results)

		// 	if (results) {
		// 		let responseData = { "status": true, "code": 200, "message": "Loan Details updated successfully" }
		// 		response.json(responseData)
		// 	} else {
		// 		let responseData = { "status": false, "code": 401, "message": "Failed to update loan Details" }
		// 		response.json(responseData)
		// 	}
		// });
	}

})
router.post('/updateRepaymentStatus', function (request, response) {
	var ldata = request.body.repymentData;
	var selectedDate = request.body.selectedDate
	if (ldata) {
		var queriesStart = "INSERT INTO loans_status_history (loanId, statusId, dateTime) VALUES"
		var queries='';
		var updateQueries = ''
		// let today = moment().tz("Asia/Kolkata").format('YYYY-MM-DD')
		ldata.map(item=>{
			queries += mysql.format(`('${item.loanid}', '6', '${selectedDate}'),`);
			updateQueries += mysql.format(`UPDATE loans_status_history SET active = '0' WHERE loanId = '${item.loanid}';`);
			
		})
		// console.log(queries)
		connection.query(updateQueries, function (error, results, fields) {
			console.log(error)
			queries = queries.replace(/,\s*$/, "")
			let query = queriesStart+queries
			connection.query(query, function (error, results, fields) {
				console.log(error)
				if (results) {
					let responseData = { "status": true, "code": 200, "message": "Loan Details updated successfully" }
					response.json(responseData)
				} else {
					let responseData = { "status": false, "code": 401, "message": "Failed to update loan Details", "err" : error }
					response.json(responseData)
				}
			});
		});
	}

})
router.post('/updateLoanDetails', function (request, response) {
	var ldata = request.body.loanupdateData;
	if (ldata) {
		let startQuery = "UPDATE loan_details SET "
		let col1Start = "assigned_emp_id = (CASE loan_id "
		let col1Values = ""
		let col1End = "END) "
		let col2Start = "is_assigned = (CASE loan_id "
		let col2Values = ""
		let col2End = "END) "
		let endQuery = "WHERE loan_id IN("
		let endValues = ""
		ldata.map(item => {
			col1Values += `WHEN '${item.loan_id}' THEN '${item.assigned_emp_id}' `
			col2Values += `WHEN '${item.loan_id}' THEN 1 `
			endValues += `${item.loan_id},`
		})
		let col1 = col1Start+col1Values+col1End
		let col2 = col2Start+col2Values+col2End
		endValues = endValues.slice(0, -1)
		endQuery = endQuery+endValues+")"
		updateQuery = startQuery+col1+","+col2+endQuery
		if(endValues!=""){
			connection.query(updateQuery, function (error, results, fields) {
				if (results) {
					let responseData = { "status": true, "code": 200, "message": "Loan Details updated successfully" }
					response.json(responseData)
				} else {
					let responseData = { "status": false, "code": 401, "message": "Failed to update loan Details", "err" : error }
					response.json(responseData)
				}
			});
		}else{
			let responseData = { "status": true, "code": 200, "message": "Loan Details updated successfully" }
			response.json(responseData)
		}
	}

})
var fileupload = multer.diskStorage(
	{
		destination: './files/',
		filename: function (request, file, cb) {
			cb(null, Date.now() + "-" + file.originalname);
		}
	}
);

const uploadFiles = multer({ storage: fileupload })

router.post("/uploadFile", uploadFiles.single('files'), (request, response) => {
	// let responseData = { "status": true, "code": 200, "file": request }
	// 	response.json(responseData)
	response.send(request.file.filename)

})

router.get('/getBucketList', function (request, response) {
	connection.query('SELECT * FROM bucket_list ', function (error, results, fields) {
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "bucketList": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "bucketList": [] }
			response.json(responseData)
		}
		response.end();
	});

});

router.get('/getStateList', function (request, response) {
	connection.query('SELECT * FROM language_table ', function (error, results, fields) {
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "stateList": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "stateList": [] }
			response.json(responseData)
		}
		response.end();
	});

});

router.get('/getAllLanguage', function (request, response) {
	connection.query('SELECT * FROM language_table ', function (error, results, fields) {
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "languageList": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "languageList": [] }
			response.json(responseData)
		}
		response.end();
	});

});

router.get('/getUsersWithKnownLanguages', function (request, response) {
	connection.query('SELECT UKL.userId, UKL.languageId as language_id, LT.name as language_name, UD.email, UD.id, UD.mobile, UD.name, UD.bucket_id, LT.state_name, UD.client_id, BL.bucket as bucket, UD.username FROM user_known_languages UKL JOIN userdetails UD ON UKL.userId = UD.id JOIN language_table LT ON UKL.languageId = LT.id JOIN bucket_list BL ON BL.id = UD.bucket_id WHERE UD.active = 1', function (error, results, fields) {
		// console.log(results)
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "languageList": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "languageList": [] }
			response.json(responseData)
		}
		response.end();
	});
});

router.post('/getUsersWithKnownLanguagesOfTeam', function (request, response) {
	teamId = request.body.id;
	let query = 'SELECT UKL.userId, UKL.languageId as language_id, LT.name as language_name, UD.email, UD.id, UD.mobile, UD.name, UD.bucket_id, LT.state_name, UD.client_id, BL.bucket as bucket, UD.username FROM user_known_languages UKL JOIN userdetails UD ON UKL.userId = UD.id AND UD.parentId = '+teamId+' JOIN language_table LT ON UKL.languageId = LT.id JOIN bucket_list BL ON BL.id = UD.bucket_id WHERE UD.active = 1'
	connection.query(query, function (error, results, fields) {
		// console.log(results)
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "languageList": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "languageList": [] }
			response.json(responseData)
		}
		response.end();
	});
});

router.post('/getDayReport', async(request, response) => {
	var fromDate = request.body.fromDate;
	var toDate = request.body.toDate;
	var batch = request.body.batch
	let base64Credentials =  request.headers.authorization.split(' ')[1];
	let Credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	let role = await getRoleByCreds(Credentials)
	if(batch == 1){
		let queryString = ""
		if(role[0].usertype == 1){
			queryString = `SELECT UD.id, UD.name as employeeName, UDP.name as teamLead, UD.username as employeeID, bl.bucket, COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) as assignedAmount, COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) as assignedAmount_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 1 THEN LD.repayment_amt END), 0) as PTP_AMOUNT, COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) as PTP_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 2 THEN LD.repayment_amt END), 0) as RNR_AMOUNT, COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) as RNR_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 3 THEN LD.repayment_amt END), 0) as SWITCH_OFF, COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) as SWITCH_OFF_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 4 THEN LD.repayment_amt END), 0) as PAYMENT_EXPECTED_AT, COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) as PAYMENT_EXPECTED_AT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0) as WAITING_FOR_CONFIRMATION, COUNT(CASE WHEN lsh.statusId = 5 THEN lsh.statusId ELSE NULL END) as WAITING_FOR_CONFIRMATION_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) as collectedAmout, COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END) as collectedAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 7 THEN LD.repayment_amt END), 0) as NRAmout, COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) as NRAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 8 THEN LD.repayment_amt END), 0) as NCAmout, COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) as NCAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 9 THEN LD.repayment_amt END), 0) as INAmout, COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) as INAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 10 THEN LD.repayment_amt END), 0) as RTPAmout, COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) as RTPAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 11 THEN LD.repayment_amt END), 0) as CBAmout, COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) as CBAmout_COUNT, COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) as P3M_COUNT, COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) as ALD_COUNT, COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) as ATDC_COUNT, COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) as EMI_COUNT,COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) as PTPWIW_COUNT, COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) as PP_COUNT, COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) as RBI_COUNT, COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END) as CASH_COUNT, (COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)) as callCount, COALESCE(COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0)) as remainingAmount, (COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) - COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END)) as remainingAmount_COUNT, COALESCE(COALESCE(COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END)) - COALESCE((COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)))) as remainingCalls, COALESCE(((COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) / COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0)) * 100), 0) as inPercentage FROM userdetails UD JOIN userdetails UDP ON UDP.id = UD.parentId JOIN bucket_list bl ON bl.id = UD.bucket_id LEFT JOIN loan_details LD ON UD.id = LD.assigned_emp_id AND LD.batch_status = 1 LEFT JOIN (SELECT comments as loan_comments, loanId, statusId FROM loans_status_history WHERE active = 1 AND dateTime LIKE '%${fromDate}%' GROUP BY loanId) AS lsh ON LD.loanid = lsh.loanId WHERE UD.usertype = 0 AND UD.active = 1 GROUP BY UD.id`
		}
		if(role[0].usertype == 2){
			queryString = `SELECT UD.id, UD.name as employeeName, UDP.name as teamLead, UD.username as employeeID, bl.bucket, COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) as assignedAmount, COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) as assignedAmount_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 1 THEN LD.repayment_amt END), 0) as PTP_AMOUNT, COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) as PTP_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 2 THEN LD.repayment_amt END), 0) as RNR_AMOUNT, COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) as RNR_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 3 THEN LD.repayment_amt END), 0) as SWITCH_OFF, COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) as SWITCH_OFF_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 4 THEN LD.repayment_amt END), 0) as PAYMENT_EXPECTED_AT, COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) as PAYMENT_EXPECTED_AT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0) as WAITING_FOR_CONFIRMATION, COUNT(CASE WHEN lsh.statusId = 5 THEN lsh.statusId ELSE NULL END) as WAITING_FOR_CONFIRMATION_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) as collectedAmout, COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END) as collectedAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 7 THEN LD.repayment_amt END), 0) as NRAmout, COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) as NRAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 8 THEN LD.repayment_amt END), 0) as NCAmout, COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) as NCAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 9 THEN LD.repayment_amt END), 0) as INAmout, COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) as INAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 10 THEN LD.repayment_amt END), 0) as RTPAmout, COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) as RTPAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 11 THEN LD.repayment_amt END), 0) as CBAmout, COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) as CBAmout_COUNT, COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) as P3M_COUNT, COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) as ALD_COUNT, COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) as ATDC_COUNT, COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) as EMI_COUNT,COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) as PTPWIW_COUNT, COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) as PP_COUNT, COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) as RBI_COUNT, COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END) as CASH_COUNT, (COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)) as callCount, COALESCE(COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0)) as remainingAmount, (COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) - COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END)) as remainingAmount_COUNT, COALESCE(COALESCE(COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END)) - COALESCE((COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)))) as remainingCalls, COALESCE(((COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) / COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0)) * 100), 0) as inPercentage FROM userdetails UD JOIN userdetails UDP ON UDP.id = UD.parentId JOIN bucket_list bl ON bl.id = UD.bucket_id LEFT JOIN loan_details LD ON UD.id = LD.assigned_emp_id AND LD.batch_status = 1 LEFT JOIN (SELECT comments as loan_comments, loanId, statusId FROM loans_status_history WHERE active = 1 AND dateTime LIKE '%${fromDate}%' GROUP BY loanId) AS lsh ON LD.loanid = lsh.loanId WHERE UD.usertype = 0 AND UD.active = 1 AND UD.parentId = ${role[0].id} GROUP BY UD.id`
		}
		// console.log(queryString)
		connection.query(queryString, function (error, results, fields) {
			if (results.length > 0) {
				let responseData = { "status": true, "code": 200, "reportData": results }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "reportData": [] }
				response.json(responseData)
			}
			response.end();
		});
	}else{
		let queryString = ""
		if(role[0].usertype == 1){
			queryString = `SELECT UD.id, UD.name as employeeName, UDP.name as teamLead, UD.username as employeeID, bl.bucket, COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) as assignedAmount, COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) as assignedAmount_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 1 THEN LD.repayment_amt END), 0) as PTP_AMOUNT, COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) as PTP_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 2 THEN LD.repayment_amt END), 0) as RNR_AMOUNT, COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) as RNR_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 3 THEN LD.repayment_amt END), 0) as SWITCH_OFF, COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) as SWITCH_OFF_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 4 THEN LD.repayment_amt END), 0) as PAYMENT_EXPECTED_AT, COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) as PAYMENT_EXPECTED_AT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0) as WAITING_FOR_CONFIRMATION, COUNT(CASE WHEN lsh.statusId = 5 THEN lsh.statusId ELSE NULL END) as WAITING_FOR_CONFIRMATION_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) as collectedAmout, COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END) as collectedAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 7 THEN LD.repayment_amt END), 0) as NRAmout, COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) as NRAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 8 THEN LD.repayment_amt END), 0) as NCAmout, COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) as NCAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 9 THEN LD.repayment_amt END), 0) as INAmout, COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) as INAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 10 THEN LD.repayment_amt END), 0) as RTPAmout, COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) as RTPAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 11 THEN LD.repayment_amt END), 0) as CBAmout, COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) as CBAmout_COUNT, COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) as P3M_COUNT, COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) as ALD_COUNT, COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) as ATDC_COUNT, COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) as EMI_COUNT,COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) as PTPWIW_COUNT, COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) as PP_COUNT, COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) as RBI_COUNT, COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END) as CASH_COUNT, (COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)) as callCount, COALESCE(COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0)) as remainingAmount, (COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) - COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END)) as remainingAmount_COUNT, COALESCE(COALESCE(COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END)) - COALESCE((COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)))) as remainingCalls, COALESCE(((COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) / COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0)) * 100), 0) as inPercentage FROM userdetails UD JOIN userdetails UDP ON UDP.id = UD.parentId JOIN bucket_list bl ON bl.id = UD.bucket_id LEFT JOIN loan_details LD ON UD.id = LD.assigned_emp_id AND LD.batch_status = 1 LEFT JOIN (SELECT comments as loan_comments, loanId, statusId FROM loans_status_history WHERE active = 1 AND dateTime between '${fromDate} 00:00:00' and '${toDate} 23:59:00' GROUP BY loanId) AS lsh ON LD.loanid = lsh.loanId WHERE UD.usertype = 0 AND UD.active = 1 GROUP BY UD.id`
		}
		if(role[0].usertype == 2){
			queryString = `SELECT UD.id, UD.name as employeeName, UDP.name as teamLead, UD.username as employeeID, bl.bucket, COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) as assignedAmount, COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) as assignedAmount_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 1 THEN LD.repayment_amt END), 0) as PTP_AMOUNT, COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) as PTP_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 2 THEN LD.repayment_amt END), 0) as RNR_AMOUNT, COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) as RNR_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 3 THEN LD.repayment_amt END), 0) as SWITCH_OFF, COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) as SWITCH_OFF_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 4 THEN LD.repayment_amt END), 0) as PAYMENT_EXPECTED_AT, COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) as PAYMENT_EXPECTED_AT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0) as WAITING_FOR_CONFIRMATION, COUNT(CASE WHEN lsh.statusId = 5 THEN lsh.statusId ELSE NULL END) as WAITING_FOR_CONFIRMATION_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) as collectedAmout, COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END) as collectedAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 7 THEN LD.repayment_amt END), 0) as NRAmout, COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) as NRAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 8 THEN LD.repayment_amt END), 0) as NCAmout, COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) as NCAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 9 THEN LD.repayment_amt END), 0) as INAmout, COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) as INAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 10 THEN LD.repayment_amt END), 0) as RTPAmout, COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) as RTPAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 11 THEN LD.repayment_amt END), 0) as CBAmout, COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) as CBAmout_COUNT, COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) as P3M_COUNT, COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) as ALD_COUNT, COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) as ATDC_COUNT, COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) as EMI_COUNT,COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) as PTPWIW_COUNT, COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) as PP_COUNT, COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) as RBI_COUNT, COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END) as CASH_COUNT, (COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)) as callCount, COALESCE(COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0)) as remainingAmount, (COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) - COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END)) as remainingAmount_COUNT, COALESCE(COALESCE(COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END)) - COALESCE((COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)))) as remainingCalls, COALESCE(((COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) / COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0)) * 100), 0) as inPercentage FROM userdetails UD JOIN userdetails UDP ON UDP.id = UD.parentId JOIN bucket_list bl ON bl.id = UD.bucket_id LEFT JOIN loan_details LD ON UD.id = LD.assigned_emp_id AND LD.batch_status = 1 LEFT JOIN (SELECT comments as loan_comments, loanId, statusId FROM loans_status_history WHERE active = 1 AND dateTime between '${fromDate} 00:00:00' and '${toDate} 23:59:00' GROUP BY loanId) AS lsh ON LD.loanid = lsh.loanId WHERE UD.usertype = 0 AND UD.active = 1 AND UD.parentId = ${role[0].id} GROUP BY UD.id`
		}
		// console.log(queryString)
		connection.query(queryString, function (error, results, fields) {
			if (results.length > 0) {
				let responseData = { "status": true, "code": 200, "reportData": results }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "reportData": [] }
				response.json(responseData)
			}
			response.end();
		});
	}
});

router.post('/getCountAndSumReport', async(request, response) => {
	var fromDate = request.body.fromDate;
	var toDate = request.body.toDate;
	var batch = request.body.batch
	let base64Credentials =  request.headers.authorization.split(' ')[1];
	let Credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	let role = await getRoleByCreds(Credentials)
	if(batch == 1){
		let queryString = ""
		if(role[0].usertype == 1){
			queryString = `SELECT 

			COALESCE(SUM(CASE WHEN LSH.statusId = 1 THEN LD.repayment_amt ELSE 0 END), 0) as PTP_AMOUNT_TOTAL, 
			COUNT(CASE WHEN LSH.statusId = 1 THEN 1 ELSE NULL END) as PTP_AMOUNT_COUNT, 
			
			COALESCE(SUM(CASE WHEN LSH.statusId = 2 THEN LD.repayment_amt ELSE 0 END), 0) as RNR_AMOUNT_TOTAL, 
			COUNT(CASE WHEN LSH.statusId = 2 THEN 1 ELSE NULL END) as RNR_AMOUNT_COUNT, 
			
			COALESCE(SUM(CASE WHEN LSH.statusId = 3 THEN LD.repayment_amt ELSE 0 END), 0) as SWITCH_OFF_TOTAL, 
			COUNT(CASE WHEN LSH.statusId = 3 THEN 1 ELSE NULL END) as SWITCH_OFF_COUNT, 
			
			COALESCE(SUM(CASE WHEN LSH.statusId = 4 THEN LD.repayment_amt ELSE 0 END), 0) as PAYMENT_EXPECTED_AT_TOTAL, 
			COUNT(CASE WHEN LSH.statusId = 4 THEN 1 ELSE NULL END) as PAYMENT_EXPECTED_AT_COUNT, 
			
			COALESCE(SUM(CASE WHEN LSH.statusId = 5 THEN LD.repayment_amt ELSE 0 END), 0) as WAITING_FOR_CONFIRMATION_TOTAL, 
			COUNT(CASE WHEN LSH.statusId = 5 THEN 1 ELSE NULL END) as WAITING_FOR_CONFIRMATION_COUNT,
			
			COALESCE(SUM(CASE WHEN LSH.statusId = 6 THEN LD.repayment_amt ELSE 0 END), 0) as WAITING_FOR_CONFIRMATION_TOTAL, 
			COUNT(CASE WHEN LSH.statusId = 6 THEN 1 ELSE NULL END) as WAITING_FOR_CONFIRMATION_COUNT,
			
			LD1.ASSIGNED_TOTAL as ASSIGNED_TOTAL,
			LD1.ASSIGNED_COUNT as ASSIGNED_COUNT,
			
			LD1.UNASSIGNED_TOTAL as UNASSIGNED_TOTAL,
			LD1.UNASSIGNED_COUNT as UNASSIGNED_COUNT
			
			FROM loans_status_history LSH 
			
			JOIN loan_details LD ON LD.loanid = LSH.loanId 
			
			JOIN (SELECT 
				  COALESCE(SUM(CASE WHEN is_assigned = 1 THEN repayment_amt ELSE 0 END), 0) as ASSIGNED_TOTAL,
				  COUNT(CASE WHEN is_assigned = 1 THEN 1 ELSE NULL END) as ASSIGNED_COUNT,
				  COALESCE(SUM(CASE WHEN is_assigned = 0 THEN repayment_amt ELSE 0 END), 0) as UNASSIGNED_TOTAL,
				  COUNT(CASE WHEN is_assigned = 0 THEN 1 ELSE NULL END) as UNASSIGNED_COUNT
				  FROM loan_details WHERE batch_status = 1
				 ) AS LD1
			
			WHERE LSH.dateTime LIKE '%${fromDate}%'`
		}
		if(role[0].usertype == 2){
			// queryString = `SELECT UD.id, UD.name as employeeName, UDP.name as teamLead, UD.username as employeeID, bl.bucket, COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) as assignedAmount, COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) as assignedAmount_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 1 THEN LD.repayment_amt END), 0) as PTP_AMOUNT, COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) as PTP_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 2 THEN LD.repayment_amt END), 0) as RNR_AMOUNT, COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) as RNR_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 3 THEN LD.repayment_amt END), 0) as SWITCH_OFF, COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) as SWITCH_OFF_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 4 THEN LD.repayment_amt END), 0) as PAYMENT_EXPECTED_AT, COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) as PAYMENT_EXPECTED_AT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0) as WAITING_FOR_CONFIRMATION, COUNT(CASE WHEN lsh.statusId = 5 THEN lsh.statusId ELSE NULL END) as WAITING_FOR_CONFIRMATION_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) as collectedAmout, COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END) as collectedAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 7 THEN LD.repayment_amt END), 0) as NRAmout, COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) as NRAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 8 THEN LD.repayment_amt END), 0) as NCAmout, COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) as NCAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 9 THEN LD.repayment_amt END), 0) as INAmout, COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) as INAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 10 THEN LD.repayment_amt END), 0) as RTPAmout, COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) as RTPAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 11 THEN LD.repayment_amt END), 0) as CBAmout, COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) as CBAmout_COUNT, COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) as P3M_COUNT, COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) as ALD_COUNT, COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) as ATDC_COUNT, COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) as EMI_COUNT,COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) as PTPWIW_COUNT, COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) as PP_COUNT, COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) as RBI_COUNT, COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END) as CASH_COUNT, (COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)) as callCount, COALESCE(COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0)) as remainingAmount, (COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) - COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END)) as remainingAmount_COUNT, COALESCE(COALESCE(COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END)) - COALESCE((COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)))) as remainingCalls, COALESCE(((COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) / COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0)) * 100), 0) as inPercentage FROM userdetails UD JOIN userdetails UDP ON UDP.id = UD.parentId JOIN bucket_list bl ON bl.id = UD.bucket_id LEFT JOIN loan_details LD ON UD.id = LD.assigned_emp_id AND LD.batch_status = 1 LEFT JOIN (SELECT comments as loan_comments, loanId, statusId FROM loans_status_history WHERE active = 1 AND dateTime LIKE '%${fromDate}%' GROUP BY loanId) AS lsh ON LD.loanid = lsh.loanId WHERE UD.usertype = 0 AND UD.active = 1 AND UD.parentId = ${role[0].id} GROUP BY UD.id`
		}
		// console.log(queryString)
		connection.query(queryString, function (error, results, fields) {
			if (results.length > 0) {
				let responseData = { "status": true, "code": 200, "reportData": results }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "reportData": [] }
				response.json(responseData)
			}
			response.end();
		});
	}//else{
	// 	let queryString = ""
	// 	if(role[0].usertype == 1){
	// 		queryString = `SELECT UD.id, UD.name as employeeName, UDP.name as teamLead, UD.username as employeeID, bl.bucket, COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) as assignedAmount, COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) as assignedAmount_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 1 THEN LD.repayment_amt END), 0) as PTP_AMOUNT, COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) as PTP_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 2 THEN LD.repayment_amt END), 0) as RNR_AMOUNT, COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) as RNR_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 3 THEN LD.repayment_amt END), 0) as SWITCH_OFF, COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) as SWITCH_OFF_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 4 THEN LD.repayment_amt END), 0) as PAYMENT_EXPECTED_AT, COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) as PAYMENT_EXPECTED_AT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0) as WAITING_FOR_CONFIRMATION, COUNT(CASE WHEN lsh.statusId = 5 THEN lsh.statusId ELSE NULL END) as WAITING_FOR_CONFIRMATION_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) as collectedAmout, COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END) as collectedAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 7 THEN LD.repayment_amt END), 0) as NRAmout, COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) as NRAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 8 THEN LD.repayment_amt END), 0) as NCAmout, COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) as NCAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 9 THEN LD.repayment_amt END), 0) as INAmout, COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) as INAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 10 THEN LD.repayment_amt END), 0) as RTPAmout, COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) as RTPAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 11 THEN LD.repayment_amt END), 0) as CBAmout, COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) as CBAmout_COUNT, COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) as P3M_COUNT, COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) as ALD_COUNT, COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) as ATDC_COUNT, COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) as EMI_COUNT,COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) as PTPWIW_COUNT, COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) as PP_COUNT, COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) as RBI_COUNT, COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END) as CASH_COUNT, (COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)) as callCount, COALESCE(COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0)) as remainingAmount, (COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) - COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END)) as remainingAmount_COUNT, COALESCE(COALESCE(COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END)) - COALESCE((COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)))) as remainingCalls, COALESCE(((COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) / COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0)) * 100), 0) as inPercentage FROM userdetails UD JOIN userdetails UDP ON UDP.id = UD.parentId JOIN bucket_list bl ON bl.id = UD.bucket_id LEFT JOIN loan_details LD ON UD.id = LD.assigned_emp_id AND LD.batch_status = 1 LEFT JOIN (SELECT comments as loan_comments, loanId, statusId FROM loans_status_history WHERE active = 1 AND dateTime between '${fromDate} 00:00:00' and '${toDate} 23:59:00' GROUP BY loanId) AS lsh ON LD.loanid = lsh.loanId WHERE UD.usertype = 0 AND UD.active = 1 GROUP BY UD.id`
	// 	}
	// 	if(role[0].usertype == 2){
	// 		queryString = `SELECT UD.id, UD.name as employeeName, UDP.name as teamLead, UD.username as employeeID, bl.bucket, COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) as assignedAmount, COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) as assignedAmount_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 1 THEN LD.repayment_amt END), 0) as PTP_AMOUNT, COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) as PTP_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 2 THEN LD.repayment_amt END), 0) as RNR_AMOUNT, COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) as RNR_AMOUNT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 3 THEN LD.repayment_amt END), 0) as SWITCH_OFF, COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) as SWITCH_OFF_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 4 THEN LD.repayment_amt END), 0) as PAYMENT_EXPECTED_AT, COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) as PAYMENT_EXPECTED_AT_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0) as WAITING_FOR_CONFIRMATION, COUNT(CASE WHEN lsh.statusId = 5 THEN lsh.statusId ELSE NULL END) as WAITING_FOR_CONFIRMATION_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) as collectedAmout, COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END) as collectedAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 7 THEN LD.repayment_amt END), 0) as NRAmout, COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) as NRAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 8 THEN LD.repayment_amt END), 0) as NCAmout, COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) as NCAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 9 THEN LD.repayment_amt END), 0) as INAmout, COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) as INAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 10 THEN LD.repayment_amt END), 0) as RTPAmout, COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) as RTPAmout_COUNT, COALESCE(SUM(CASE WHEN lsh.statusId = 11 THEN LD.repayment_amt END), 0) as CBAmout, COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) as CBAmout_COUNT, COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) as P3M_COUNT, COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) as ALD_COUNT, COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) as ATDC_COUNT, COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) as EMI_COUNT,COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) as PTPWIW_COUNT, COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) as PP_COUNT, COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) as RBI_COUNT, COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END) as CASH_COUNT, (COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)) as callCount, COALESCE(COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN lsh.statusId = 5 THEN LD.repayment_amt END), 0)) as remainingAmount, (COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END) - COUNT(CASE WHEN lsh.statusId = 6 THEN lsh.statusId ELSE NULL END)) as remainingAmount_COUNT, COALESCE(COALESCE(COUNT(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE NULL END)) - COALESCE((COUNT(CASE WHEN lsh.statusId = 1 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 2 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 3 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 4 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 7 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 8 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 9 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 10 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 11 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 12 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 13 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 14 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 15 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 16 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 17 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 18 THEN lsh.statusId ELSE NULL END) + COUNT(CASE WHEN lsh.statusId = 20 THEN lsh.statusId ELSE NULL END)))) as remainingCalls, COALESCE(((COALESCE(SUM(CASE WHEN lsh.statusId = 6 THEN LD.repayment_amt END), 0) / COALESCE(SUM(CASE WHEN LD.is_assigned = 1 THEN LD.repayment_amt ELSE 0 END), 0)) * 100), 0) as inPercentage FROM userdetails UD JOIN userdetails UDP ON UDP.id = UD.parentId JOIN bucket_list bl ON bl.id = UD.bucket_id LEFT JOIN loan_details LD ON UD.id = LD.assigned_emp_id AND LD.batch_status = 1 LEFT JOIN (SELECT comments as loan_comments, loanId, statusId FROM loans_status_history WHERE active = 1 AND dateTime between '${fromDate} 00:00:00' and '${toDate} 23:59:00' GROUP BY loanId) AS lsh ON LD.loanid = lsh.loanId WHERE UD.usertype = 0 AND UD.active = 1 AND UD.parentId = ${role[0].id} GROUP BY UD.id`
	// 	}
	// 	// console.log(queryString)
	// 	connection.query(queryString, function (error, results, fields) {
	// 		if (results.length > 0) {
	// 			let responseData = { "status": true, "code": 200, "reportData": results }
	// 			response.json(responseData)
	// 		} else {
	// 			let responseData = { "status": false, "code": 401, "reportData": [] }
	// 			response.json(responseData)
	// 		}
	// 		response.end();
	// 	});
	// }
});

router.post('/getCountAndSumTeamLeadReport', async(request, response) => {
	var fromDate = request.body.fromDate;
	var toDate = request.body.toDate;
	var batch = request.body.batch
	let base64Credentials =  request.headers.authorization.split(' ')[1];
	let Credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	let role = await getRoleByCreds(Credentials)
	if(batch == 1){
		let queryString = ""
		if(role[0].usertype == 1){
			queryString = `SELECT TUD.id, TUD.name,

			COALESCE(SUM(CASE WHEN LSH.statusId = 1 THEN LD.repayment_amt ELSE 0 END), 0) as PTP_AMOUNT_TOTAL, 
			COUNT(CASE WHEN LSH.statusId = 1 THEN 1 ELSE NULL END) as PTP_AMOUNT_COUNT,
			
			COALESCE(SUM(CASE WHEN LSH.statusId = 2 THEN LD.repayment_amt ELSE 0 END), 0) as RNR_AMOUNT_TOTAL, 
			COUNT(CASE WHEN LSH.statusId = 2 THEN 1 ELSE NULL END) as RNR_AMOUNT_COUNT, 
						
			COALESCE(SUM(CASE WHEN LSH.statusId = 3 THEN LD.repayment_amt ELSE 0 END), 0) as SWITCH_OFF_TOTAL, 
			COUNT(CASE WHEN LSH.statusId = 3 THEN 1 ELSE NULL END) as SWITCH_OFF_COUNT, 
						
			COALESCE(SUM(CASE WHEN LSH.statusId = 4 THEN LD.repayment_amt ELSE 0 END), 0) as PAYMENT_EXPECTED_AT_TOTAL, 
			COUNT(CASE WHEN LSH.statusId = 4 THEN 1 ELSE NULL END) as PAYMENT_EXPECTED_AT_COUNT, 
						
			COALESCE(SUM(CASE WHEN LSH.statusId = 5 THEN LD.repayment_amt ELSE 0 END), 0) as WAITING_FOR_CONFIRMATION_TOTAL, 
			COUNT(CASE WHEN LSH.statusId = 5 THEN 1 ELSE NULL END) as WAITING_FOR_CONFIRMATION_COUNT,
						
			COALESCE(SUM(CASE WHEN LSH.statusId = 6 THEN LD.repayment_amt ELSE 0 END), 0) as WAITING_FOR_CONFIRMATION_TOTAL, 
			COUNT(CASE WHEN LSH.statusId = 6 THEN 1 ELSE NULL END) as WAITING_FOR_CONFIRMATION_COUNT
			
			FROM userdetails TUD
			
			JOIN userdetails UD ON UD.parentId = TUD.id AND UD.active = 1
			JOIN loan_details LD ON LD.assigned_emp_id = UD.id
			JOIN loans_status_history LSH ON LSH.loanId = LD.loanid AND LSH.dateTime LIKE '%${fromDate}%'
			
			WHERE TUD.usertype = 2 AND TUD.active = 1 GROUP BY TUD.name`
		}
		// console.log(queryString)
		connection.query(queryString, function (error, results, fields) {
			if (results.length > 0) {
				let responseData = { "status": true, "code": 200, "reportData": results }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "reportData": [] }
				response.json(responseData)
			}
			response.end();
		});
	}
});

router.post('/getDayAttendance', async(request, response) => {
	var date = request.body.date;
	let base64Credentials =  request.headers.authorization.split(' ')[1];
	let Credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	let role = await getRoleByCreds(Credentials)
	let queryString = ""
	if(role[0].usertype == 1){
		queryString = `SELECT COUNT(UD.id) as totalEMP, COUNT(LL.id) as present, COALESCE(COUNT(UD.id) - COUNT(LL.id)) as absent FROM userdetails UD LEFT JOIN loginLogs LL ON (LL.empId = UD.id AND LL.date = '${date}' AND time BETWEEN '08:00:00' AND '11:00:00') WHERE UD.usertype = 0 AND UD.active = 1`
	}
	// console.log(queryString)
	connection.query(queryString, function (error, results, fields) {
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "attendanceData": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "attendanceData": [] }
			response.json(responseData)
		}
		response.end();
	});
});

router.post('/getAttendancePresentData', async(request, response) => {
	var date = request.body.date;
	let base64Credentials =  request.headers.authorization.split(' ')[1];
	let Credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	let role = await getRoleByCreds(Credentials)
	let queryString = ""
	if(role[0].usertype == 1){
		queryString = `SELECT UD.id, UD.name FROM loginLogs LL JOIN userdetails UD ON UD.id = LL.empId WHERE LL.date = '${date}' AND LL.time BETWEEN '08:00:00' AND '11:00:00'`
	}
	// console.log(queryString)
	connection.query(queryString, function (error, results, fields) {
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "attendancePresentData": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "attendancePresentData": [] }
			response.json(responseData)
		}
		response.end();
	});
});

router.post('/getAttendanceAbsentData', async(request, response) => {
	var date = request.body.date;
	let base64Credentials =  request.headers.authorization.split(' ')[1];
	let Credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	let role = await getRoleByCreds(Credentials)
	let queryString = ""
	if(role[0].usertype == 1){
		queryString = `SELECT UD.id, UD.name FROM loginLogs LL JOIN userdetails UD ON UD.id = LL.empId WHERE LL.date = '${date}' AND LL.time BETWEEN '08:00:00' AND '11:00:00'`
	}
	// console.log(queryString)
	connection.query(queryString, function (error, results, fields) {
		if (results.length > 0) {
			let responseData = { "status": true, "code": 200, "attendanceAbsentData": results }
			response.json(responseData)
		} else {
			let responseData = { "status": false, "code": 401, "attendanceAbsentData": [] }
			response.json(responseData)
		}
		response.end();
	});
});

router.get('/getCurrentDetailedReportsDataForExcel', async(request, response) => {
	let base64Credentials =  request.headers.authorization.split(' ')[1];
	let Credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	let role = await getRoleByCreds(Credentials)
	let queryString = ""
	if(role[0].usertype == 1){
		queryString = `SELECT LD.loanid, LD.customer_Name, LD.disbursal_amt, LD.disbursal_date, LD.due_date, LD.principal_amt, LD.interest_amount, LD.penalty_amt, LD.repayment_amt, LD.bucket, LD.overdue_days, LD.is_collected, LD.repaid_date, UD.username as employeeUserName, UD.name as employeeName, LS.status_type as status, lsh.loan_comments, lsh.dateTime as status_updated_date, LT.name as language, UDP.name as team_lead FROM loan_details LD LEFT JOIN userdetails UD ON LD.assigned_emp_id = UD.id LEFT JOIN userdetails UDP ON UD.parentId = UDP.id LEFT JOIN (SELECT comments as loan_comments, loanId, statusId, dateTime FROM loans_status_history WHERE active = 1 GROUP BY loanId) AS lsh ON LD.loanid = lsh.loanId LEFT JOIN Loan_status LS ON lsh.statusId = LS.id LEFT JOIN language_table LT ON LOWER(LD.state) = LOWER(LT.state_name) WHERE LD.batch_status = 1 AND LD.is_assigned = 1 GROUP BY LD.id`;
	}
	if(role[0].usertype == 2){
		queryString = `SELECT LD.loanid, LD.customer_Name, LD.disbursal_amt, LD.disbursal_date, LD.due_date, LD.principal_amt, LD.interest_amount, LD.penalty_amt, LD.repayment_amt, LD.bucket, LD.overdue_days, LD.is_collected, LD.repaid_date, UD.username as employeeUserName, UD.name as employeeName, LS.status_type as status, lsh.loan_comments, lsh.dateTime as status_updated_date, LT.name as language, UDP.name as team_lead FROM loan_details LD LEFT JOIN userdetails UD ON LD.assigned_emp_id = UD.id LEFT JOIN userdetails UDP ON UD.parentId = UDP.id LEFT JOIN (SELECT comments as loan_comments, loanId, statusId, dateTime FROM loans_status_history WHERE active = 1 GROUP BY loanId) AS lsh ON LD.loanid = lsh.loanId LEFT JOIN Loan_status LS ON lsh.statusId = LS.id LEFT JOIN language_table LT ON LOWER(LD.state) = LOWER(LT.state_name) WHERE LD.batch_status = 1 AND LD.is_assigned = 1 AND UD.parentId = ${role[0].id} GROUP BY LD.id`;
	}
	connection.query(queryString, function (error, results, fields) {
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

router.post('/getEmployeeLanguages', function (request, response) {
	var empid = request.body.empid;
	if(empid){
		connection.query(`SELECT UKL.languageId as id, LT.name as language FROM user_known_languages UKL JOIN language_table LT ON UKL.languageId = LT.id WHERE UKL.userId = '${empid}' GROUP BY LT.name`, function (error, results, fields) {
			if (results) {
				let responseData = { "status": true, "code": 200, "languages": results }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "message": "Failed to Fetch Details Employee", "err" :  error}
				response.json(responseData)
			}
		});
	}else {
		let responseData = { "status": false, "code": 401, "message": "Please check details" }
		response.json(responseData)
		response.end();
	}
});

router.post('/getEmpListByBucket', function (request, response) {
	var bucketId = request.body.bucketId;
	if(bucketId){
		connection.query(`SELECT * FROM userdetails WHERE bucket_id = ${bucketId} AND usertype = 0 AND active = 1`, function (error, results, fields) {
			if (results) {
				let responseData = { "status": true, "code": 200, "employees": results }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "message": "Failed to Fetch employee list of bucket", "err" :  error}
				response.json(responseData)
			}
		});
	}else {
		let responseData = { "status": false, "code": 401, "message": "Please check details" }
		response.json(responseData)
		response.end();
	}
});

router.post('/registerTeamLead', function (request, response) {
	console.log(request.body)
	var name = request.body.name;
	var username = request.body.username;
	var password = request.body.password;
	var email = request.body.email;
	var mobile = request.body.mobile;
	var bucket = request.body.assignedbucket;
	var employees = request.body.employees
	employees = employees.join()
	if (name && username && password && email && mobile ) {
		var data = {
			client_id:"1",
			name: name,
			username: username,
			email:email,
			password: password,
			mobile:mobile,
			bucket_id:bucket,
			usertype: '2',
			active:"1"
		}
		connection.query('INSERT INTO userdetails SET ?', data, function (error, results, fields) {
			console.log(JSON.stringify(error))
			if(error){
				let responseData = { "status": false, "code": 402, "message": JSON.stringify(error) }
				response.json(responseData)
				response.end();
			}else{
				var lastinserttedId = results.insertId;
				let query = `UPDATE userdetails SET parentId = ${lastinserttedId} WHERE id IN (${employees})`
				connection.query(query, (err, results, fields) => {
					console.log(err)
					if (results) {
						let responseData = { "status": true, "code": 200, "message": "Team Lead register successfully" }
						response.json(responseData)
					} else {
						let responseData = { "status": false, "code": 401, "message": "Unable to register Team Lead" }
						response.json(responseData)
					}
					response.end();
				});
			}
		});
	
	} else {
		let responseData = { "status": false, "code": 401, "message": "Please enter Team Lead details" }
		response.json(responseData)
		response.end();
	}
});

router.get('/getAllActiveLeadsList', function (request, response) {
	let today = moment().tz("Asia/Kolkata").format('YYYY-MM-DD')
	let query = "SELECT u.id,u.client_id,u.name,u.username,u.email,u.mobile,u.bucket_id,u.active as status,bl.bucket FROM userdetails u LEFT JOIN bucket_list bl ON bl.id = u.bucket_id WHERE u.usertype = 2 AND u.active= '1' GROUP BY u.id"
	connection.query(query, function (error, results, fields) {
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

router.post('/getLeadEmployees', function (request, response) {
	var leadId = request.body.leadId;
	if(leadId){
		connection.query(`SELECT id, name as employee FROM userdetails WHERE parentId = ${leadId}`, function (error, results, fields) {
			if (results) {
				let responseData = { "status": true, "code": 200, "employees": results }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "message": "Failed to Fetch Details Employee", "err" :  error}
				response.json(responseData)
			}
		});
	}else {
		let responseData = { "status": false, "code": 401, "message": "Please check details" }
		response.json(responseData)
		response.end();
	}
});

router.post('/updateLead', function (request, response) {
	console.log(request.body)
	var id = request.body.id;
	var name = request.body.name;
	var username = request.body.username;
	var password = request.body.password;
	var email = request.body.email;
	var mobile = request.body.mobile;
	var bucket = request.body.assignedbucket;
	var employees = request.body.employees
	employees = employees.join()
	if (id) {
		connection.query(`update userdetails set name ='${name}',username ='${username}',email='${email}',mobile='${mobile}',bucket_id= '${bucket}' where id = '${id}'`, function (error, results, fields) {
			if (results) {
				//Deleting emp old languages
				connection.query(`update userdetails set parentId = NULL WHERE parentId = ${id}`, function (error, results, fields) {
					if (results) {
						let query = `UPDATE userdetails SET parentId = ${id} WHERE id IN (${employees})`
						connection.query(query, (err, results, fields) => {
							if (results) {
								let responseData = { "status": true, "code": 200, "message": "Lead Details updated successfully" }
								response.json(responseData)
							} else {
								let responseData = { "status": false, "code": 401, "message": "Failed to update Lead Details", "err" :  error}
								response.json(responseData)
							}
							response.end();
						});
					} else {
						let responseData = { "status": false, "code": 401, "message": "Failed to update Employee Details", "err" :  error}
						response.json(responseData)
					}
				});
			} else {
				let responseData = { "status": false, "code": 401, "message": "Failed to update Lead Details", "err" :  error}
				response.json(responseData)
			}
		});
	} else {
		let responseData = { "status": false, "code": 401, "message": "Please check details" }
		response.json(responseData)
		response.end();
	}
});

router.post('/deActivateLead', function (request, response) {
	var leadId = request.body.leadId;
	if(leadId){
		connection.query(`update userdetails set active ='0' where id = '${leadId}'`, function (error, results, fields) {
			if (results) {
				let responseData = { "status": true, "code": 200, "message": "Lead Deactivate successfully" }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "message": "Failed to Deactivate Lead", "err" :  error}
				response.json(responseData)
			}
		});
	}else {
		let responseData = { "status": false, "code": 401, "message": "Please check details" }
		response.json(responseData)
		response.end();
	}
})
router.post('/activateLead', function (request, response) {
	var leadId = request.body.leadId;
	if(leadId){
		connection.query(`update userdetails set active ='1' where id = '${leadId}'`, function (error, results, fields) {
			if (results) {
				let responseData = { "status": true, "code": 200, "message": "Lead activate successfully" }
				response.json(responseData)
			} else {
				let responseData = { "status": false, "code": 401, "message": "Failed to activate Lead", "err" :  error}
				response.json(responseData)
			}
		});
	}else {
		let responseData = { "status": false, "code": 401, "message": "Please check details" }
		response.json(responseData)
		response.end();
	}
})

router.get('/updateSwitchedOffData', function (request, response) {

	callApi('http://148.72.212.163/datetime.php', function (dateTimeError, dateTimeResponse, dateTimeBody) {
		dateTimeBody = JSON.parse(dateTimeBody);
		let dateTime = dateTimeBody.dateTime;

		connection.query(`SELECT LSH.loanId FROM loans_status_history LSH JOIN loan_details LD ON (LD.loanid = LSH.loanId AND LD.is_assigned = 1 AND LD.batch_status = 1) WHERE LSH.callType = "Customer" AND LSH.statusId = 3 AND LSH.active = 1 AND TIMESTAMPDIFF(HOUR, LSH.dateTime, '${dateTime}') >= 48`, function (error, results, fields) {
			if (results.length > 0) {
				let ids = []
				results.map(loan =>{
					ids.push(loan.loanId)
				})
				let joinedIds = ids.join()
				connection.query(`UPDATE loan_details SET is_assigned = 2 WHERE loanId in (${joinedIds})`, function (error, results, fields) {
					console.log(error)
					response.end();
				});
			}
		});
	});
});

module.exports = router
