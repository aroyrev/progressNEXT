module.exports = function(app){

	var util = require('util');
	var querystring = require('querystring');
	var request = require('request');

	var twitter_key = "izLJro1uum9hxVI2vjSGy57J7";
	var twitter_secret = "Xflf3110Xk9Ukjx9MGrcL76JPn5jmrLBMaagUlfwPGn0Gt8f6B";

	var mongoose = require(__dirname + "/../connect");

	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var SessionSchema = new Schema({
			sessionId : String,
			room : String,
			title: String,
			roomId: String,
			num_of_attendees: Number
	});

	var AttendeeSchema = new Schema({
			email: String,
			data: String,
			firstName: String,
			lastName: String,
			organization: String,
			title : String,
			tagId: Number,
			phone: String,
			wanted : Number
	});

	var PersonSchema = new Schema({
			email: String,
			firstName: String,
			lastName: String,
			organization: String,
			title : String,
			tagId: Number,
			wanted : Number
	});

	var NotificationSchema = new Schema({
			email : String,
			message: String,
			ballroom1: Boolean,
			accacia1: Boolean,
			grand: Boolean
	});

	var EventSchema = new Schema({
			email: String,
			name : String,
			created: Date,
			entered : Boolean,
			Room: String
	});

	mongoose.model('session', SessionSchema);
	mongoose.model('attendee', AttendeeSchema);
	mongoose.model('event', EventSchema);
	mongoose.model('person', PersonSchema);
	mongoose.model('notification', NotificationSchema);


	var rollbase = {
			uri : "https://www.rollbase.com/rest/api/",
			username : "mhossain",
			password : "Eu38Et11",
			custId	 : "168407119"
	};

	function generateVCard(json){
		var vCard = require('vcards-js');
		var vCard = vCard();

		for (key in json) {
			if (json[key] && typeof json[key] === "string") {
				vCard[key] = json[key];
			}
		}

		return  vCard.getFormattedString();
	}


	// exports.webhook = function(req, res){
	// 	res.json({success : true});
	// }

	app.get('/search', function(req, res){
			res.render('search');
	});

	app.get('/api/attendee', function(req, res){
			var Person = mongoose.model('person');
			Person.find({}, function(err, data){
					res.json(data);
			})
	});
	app.post('/api/attendee', function(req, res){
		  var body = req.body;

			var Notification = mongoose.model('notification');

			Notification.findOne({email : body.email}, function(err, notification){

				if (!notification){
						notification = new Notification({
							email : body.email
						});
				}
				notification.grand = body.grand;
				notification.accacia1 = body.accacia1;
				notification.ballroom1 = body.ballroom1;
				notification.message = body.message;

				notification.save(function(err, notificaiton){
					var Person = mongoose.model('person');

					Person.findOne({ email: body.email}, function(err, person){
							if (person){
									person.wanted = true;

									person.save(function(err, person){
											// done.
									});
							}
					});

					res.json({ success : true});
				})
			});
	});

	app.post('/api/qrcode', function(req, res){
		var data = req.body;
		var email = data.workEmail;
		var Attendee = mongoose.model('attendee');

		Attendee.findOne({ email : email}, function(err, attendee){
				if (!attendee){
						var uri = util.format("https://www.rollbase.com/rest/api/login?loginName=%s&password=%s&custId=%s&output=json", rollbase.username, rollbase.password, rollbase.custId);

						request({
								uri : uri
						}, function(error, response, body){
								var json = JSON.parse(body);

								var selectQuery = util.format("SELECT email,firstName,lastName,title,Company_Name, phone FROM %s WHERE email = '%s'", "App_Users", email);
								var filter = JSON.stringify({ "sqlQuery": selectQuery });

								if (json.status === "ok"){
										var record = {
												query : selectQuery,
												objName : "Attendee5",
												sessionId: json.sessionId,
												output: 'json'
										}
										var uri  = util.format("%s%s?%s", rollbase.uri, "selectQuery", querystring.stringify(record));
										request({
												uri : uri
										} , function(error, response, body){
												var obj = JSON.parse(body);

												obj = obj[0];

												var QRCode = require('qrcode');
												var Canvas = require('canvas');

												QRCode.canvas = new Canvas(req.body.width, req.body.width);

												QRCode.toDataURL(generateVCard({
															workEmail : obj[0], // email
															firstName: obj[1], // firstname
															lastName : obj[2], // lastname
															title : obj[3], // title
															organization: obj[4], // company
															workPhone: obj[5]
												}),function(err,d){
															var attendee = new Attendee({
																		email : obj[0],
																		firstName :  obj[1],
																		lastName: obj[2],
																		title : obj[3],
																		organization: obj[4],
																		phone : obj[5], // phone
																		data : d
															});
															attendee.save(function(err, attendee){
																	res.json({
																			url : d,
																			email:attendee.email
																	});
															});
												});
										});
								}
						});
				}
				else {
						res.json({
								url : attendee.data,
								email:attendee.email
						});
				}
		});
	});

	exports.clear = function(req, res){
		var Attendee = mongoose.model('attendee');
		Attendee.remove({}, function(err){
				res.json({
					success : true
				})
		});
	}

	app.get('/api/qrcode', function(req, res){
			var query = require('url').parse(req.url, false).query
			var data = querystring.parse(query);

			var Attendee = mongoose.model('attendee');

			Attendee.findOne({email : data.email}, function(err, attendee){
					if (attendee){
						  if (data.target == "blank"){
								res.render("image", {
									 data: attendee.data
								});
							}else{
								var viewName = "attendee";

								if (data.target === "banner"){
										viewName = "banner";
								}

								res.render(viewName, {
										data : attendee.data,
										firstName: attendee.firstName,
										lastName: attendee.lastName,
										company: attendee.organization
								});
						}
					}
					else{
							res.json({
									message : "No image found."
							})
					}
			});
	});

	exports.attendee = function(req, res){
		var uri = util.format("https://www.rollbase.com/rest/api/login?loginName=%s&password=%s&custId=%s&output=json", rollbase.username, rollbase.password, rollbase.custId);

		var xlsx = require('node-xlsx');

		var path = util.format("%s%s", __dirname, '/../public/input/tags.xlsx');
		var obj = xlsx.parse(path); // parses a file

		var entries = obj[0].data;

		request({
				uri : uri
		}, function(error, response, body){

			  var json = JSON.parse(body);

				if (json.status === "ok"){

					  for (var index = 0; index < entries.length; index++){
								if (entries[index].length > 0){
										var entry = entries[index];
										var record = {
												First_Name : entry[0], // first name
												Last_Name : entry[1], // last name
												company: entry[2], // company
												Import_ID: entry[3], //tag
												objName : "Attendee5",
												sessionId: json.sessionId,
												output: 'json'
										}
										var uri  = util.format("%s/%s?%s", rollbase.uri, "createRecord", querystring.stringify(record));
										request.post({
												uri : uri
										} , function(error, response, body){
													console.log(JSON.parse(body));
										});
								}
						}

						res.json({ status : true});

				} // status === ok
		});
	}

	// exports.import = function(req, res){
	// 	var query = require('url').parse(req.url, false).query
	// 	var data = querystring.parse(query);
	//
	// 	var QRCode = require('qrcode');
	// 	var Canvas = require('canvas');
	// 	var xlsx = require('node-xlsx');
	//
	// 	QRCode.canvas = new Canvas(100, 100);
	//
	// 	var path = util.format("%s%s", __dirname, '/../public/data/Partners.xls');
	// 	var obj = xlsx.parse(path); // parses a file
	//
	// 	var entries = obj[0].data;
	//
	// 	var Attendee = mongoose.model('attendee');
	//
	// 	var excelbuilder = require('msexcel-builder');
	//
	// 	var workbook = excelbuilder.createWorkbook(__dirname +'/../public/output/', 'partners.xlsx')
	//
	// 	// Create a new worksheet with 10 columns and 12 rows
	//   var sheet = workbook.createSheet('sheet1', 6, entries.length);
	//
	// 	sheet.set(1, 1, "Email");
	// 	sheet.set(2, 1, "FirstName");
	// 	sheet.set(3, 1, "LastName");
	// 	sheet.set(4, 1, "Company");
	// 	sheet.set(5, 1, "Title");
	// 	sheet.set(6, 1, "QRCode");
	//
	// 	var count = 1;
	//
	// 	function generate(model, entry, length){
	// 				Attendee.findOne({email: entry[0] }, function(err, attendee){
	// 						var data = {
	// 							workEmail : entry[0],
	// 							firstName : entry[1],
	// 							lastName : entry[2],
	// 							organization: entry[3],
	// 							title: entry[4],
	// 							tagId: entry[5]
	// 						};
	//
	// 						if(!attendee){
	// 								attendee = new model({
	// 									email : data.workEmail
	// 								});
	// 						}
	//
	// 						attendee.title = data.title,
	// 						attendee.firstName = data.firstName,
	// 						attendee.lastName = data.lastName,
	// 						attendee.organization = data.organization,
	//
	// 						QRCode.toDataURL(generateVCard(data),function(err, d){
	// 								attendee.data = d
	// 								if (count === length){
	// 									workbook.save(function(err){
	// 										if (err){
	// 											console.log(err);
	// 										}
	// 										else{
	// 											console.log('Congratulations, your workbook created');
	// 										}
	// 									});
	// 									res.end();
	// 								}
	// 								else {
	// 									++ count;
	// 									sheet.set(1, count, attendee.email);
	// 									sheet.set(2, count, attendee.firstName);
	// 									sheet.set(3, count, attendee.lastName);
	// 									sheet.set(4, count, attendee.organization);
	// 									sheet.set(5, count, attendee.title);
	// 									sheet.set(6, count, util.format("http://%s/api/qrcode?email=%s", req.headers.host,  attendee.email));
	//
	// 									res.write([attendee.firstName, attendee.lastName].join(" "));
	// 									res.write("\n");
	// 								}
	// 								attendee.save();
	// 						});
	// 			});
	// 	}
	//
	// 	for (var index = 1; index < entries.length; index++){
	// 			generate(Attendee, entries[index], entries.length - 1);
	// 	}
	//
	// };

 	app.get('/api/vcard', function(req, res){
		var query = require('url').parse(req.url, false).query
		var data = querystring.parse(query);

		if (data.firstName && data.lastName){
		    res.set('Content-Type',util.format('text/x-vcard; charset=utf-8;', data.firstName, data.lastName));
		    res.set('Content-Disposition', util.format('attachment; filename="%s+%s.vcf"', data.firstName, data.lastName));
		    //send the response
		    res.send(generateVCard(data));
		}else{
			res.send('Invalid Request');
		}

	});

	var antenaId = function(name){
			var roomId = name.replace(/\s+/ig, "").toLowerCase();

			switch(roomId){
				 case "acacia1":
				 	return "usa:lasVegas:fourSeasons:level2:AccaciaBR1";
				 case "acacia2":
				  return "usa:lasVegas:fourSeasons:level2:AccaciaBR1";
				 case "ballroom1":
				 	return "usa:lasVegas:fourSeasons:level2:FSBR1";
				 case "grandballroom":
	 			 	return "usa:lasVegas:fourSeasons:level2:GBR";
				 case "ballroom1":
					 return "usa:lasVegas:fourSeasons:level2:FSBR1";
	 			 default:
				 	 return ""
			}
	}

	// exports.sendNotification = function(req, res)=>
	// 	// var body = { email :  'eduardo@progress.com'};
	// 	// call platform to send notificaiton to an email
	// 	//res.send("SUCCESS");

	var queryRoomStatus = function(session, cb){
			var id = antenaId(session.room);
		  if (id !== ""){

				var uri = 	util.format("https://dap.amtech.mx/amtech/things/entities/%s", id);
				var buffer = new Buffer(util.format("%s:%s", "progressnextfollower@amtech.mx/progressnextfollower", "Follow3r2016"));
				var auth = util.format("Basic %s", buffer.toString('base64'));

				request({
					uri : uri,
					headers: {
						"Authorization": auth,
					}
				}, function(error, response, body){
						if (!error){
							var json  = JSON.parse(body);
							cb({
								success : true,
								num_of_attendees : json.attendants,
								overflow : parseInt(json.attendants) > parseInt(json.capacity),
								capacity:json.capacity
							});
					}
					else {
						cb ({success : false});
					}
				});
			}
			else{
				cb({ success: false });
			}
	};

	app.get('/api/session', function(req, res){
		var query = require('url').parse(req.url, false).query
		var data = querystring.parse(query);

		var uri = util.format("https://www.rollbase.com/rest/api/login?loginName=%s&password=%s&custId=%s&output=json", rollbase.username, rollbase.password, rollbase.custId);

		request({
				uri : uri
		}, function(error, response, body){
				var json = JSON.parse(body);

				if (json.status === "ok"){
						var record = {
								objName : "Session5",
								id : data.id,
								sessionId: json.sessionId,
								output: 'json'
						}

						var Session = mongoose.model('session');

						Session.findOne({ sessionId : data.id}, function(err, session){
								if (!session){
										var uri  = util.format("%s%s?%s", rollbase.uri, "getRecord", querystring.stringify(record));
										request({
												uri : uri
										} , function(error, response, body){
												var obj = JSON.parse(body);

												var session = new Session({
															sessionId : obj.id,
															title : obj.name,
															room :  obj.Room
												});

												queryRoomStatus(session, function(result){
													session.num_of_attendees = parseInt(result.num_of_attendees);
													session.save(function(err, session){
															res.json(result);
													});
												});
										});
								}
								else {
										queryRoomStatus(session, function(result){
												var num_of_attendees =  parseInt(result.num_of_attendees);
												// existing session object or greater count
												if (!session.num_of_attendees || parseInt(session.num_of_attendees) < num_of_attendees){
														session.num_of_attendees = num_of_attendees;
														session.save(function(err, session){
																// nothing.
														})
												}
												res.json(result);
										})
								}
						});
				}
		});
	});

	function getAttendeeForTag(tagId, cb){
		var data = req.body;
		var email = data.workEmail;

		var uri = util.format("https://www.rollbase.com/rest/api/login?loginName=%s&password=%s&custId=%s&output=json", rollbase.username, rollbase.password, rollbase.custId);

		request({
				uri : uri
		}, function(error, response, body){

				var json = JSON.parse(body);

				var selectQuery = util.format("SELECT email,firstName,lastName,title,company,Import_ID FROM %s WHERE Import_ID = '%s'", "Attendee5", tagId);
				var filter = JSON.stringify({ "sqlQuery": selectQuery });

				if (json.status === "ok"){
						var record = {
								query : selectQuery,
								objName : "Attendee5",
								sessionId: json.sessionId,
								output: 'json'
						}
						var uri  = util.format("%s%s?%s", rollbase.uri, "selectQuery", querystring.stringify(record));
						request({
								uri : uri
						} , function(error, response, body){
									cb(JSON.parse(body));
						});
				} // status === ok
		});

	}

	app.post ('/api/notification', function(req, res){
		var body  = req.body;

		getAttendeeForTag(body.tag, function(result){
			var attendee = data[0];
			var email = attendee[0];

			sendPushNotification(email, body.message, res.json);
		});
	});

	function sendPushNotification(email, message, cb){
		if (email){
			var uri = "http://api.everlive.com/v1/6kmvocccx4woagty/Push/Notifications";
			var filter = JSON.stringify({ "Parameters.email" : email});

			request.post({
				uri: uri,
				headers : {
					 Authorization : "Masterkey vefPLZ1apnZfAcigp0KlJmOY73dVKYjx",
					 "Content-Type" : "application/json"
				},
				body: {
					Filter: filter,
					IOS : {
						"aps": {
							"sound" : "default",
							"alert" : message
						}
					},
					Android : {
						"data": {
									"title": "Progress NEXT",
									"message": message
						 }
					}
				},
				json : true
			}, function(error, response, body){
				if (!error){
					cb(body);
				}
				else{
					cb({
						success : false
					});
				}
			});
		}
	}

	app.get('/api/tweets', function(req, res) {
		var query = require('url').parse(req.url, false).query
		var data = querystring.parse(query);

		var buffer = new Buffer(util.format("%s:%s", twitter_key, twitter_secret));
		var auth = util.format("Basic %s", buffer.toString('base64'));

		var body = querystring.stringify({
			"grant_type" : "client_credentials"
		});

		var options = {
			method : 'POST',
			uri : 'https://api.twitter.com/oauth2/token',
			headers: {
				"Authorization": auth,
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
			},
			body: body
		};

		request(options, function(error, response, body){
			var json = JSON.parse(body);

			if (json.access_token){
				if (!data.since_id){
						data.since_id= 0;
				}

				var uri = util.format('https://api.twitter.com/1.1/search/tweets.json?q=%s&count=%s&since_id=%s', encodeURIComponent(data.q), data.pageSize, data.since_id);

				request({
					uri: uri,
					headers : {
						"Authorization": util.format("Bearer %s", json.access_token)
					}
				}, function(error, response, body){
					if (!error){
						res.json(JSON.parse(body).statuses);
					}
					else{
						res.json({
							success : false
						});
					}
				});
			}else {
				res.json({
					success : false
				});
			}
		});
	});

	app.post('/api/track', function(req, res){
	  	var json = req.body;

		  var entites = 	json.info.split(" ").filter(function(el) {
				return el.length != 0
			});;

			if (entites[0].toLowerCase() === "attendee"){
					var tagId = entites[1].replace(/urn:epc:tag:grai:/ig, "");
					var match = tagId.match(/[0-9]+$/ig);
					if (match.length){
							tagId = parseInt(match[0]);
							var Person = mongoose.model('person');
							Person.findOne({ tagId : tagId}, function(err, person){
									if (!person){
										var uri = util.format("https://www.rollbase.com/rest/api/login?loginName=%s&password=%s&custId=%s&output=json", rollbase.username, rollbase.password, rollbase.custId);

										request({
												uri : uri
										}, function(error, response, body){

												var json = JSON.parse(body);

												if (json.status === "ok"){
													var selectQuery = util.format("SELECT email,First_Name,Last_Name,title,company,Import_ID FROM %s WHERE Import_ID = '%s'", "Attendee5", tagId);

													var filter = JSON.stringify({ "sqlQuery": selectQuery });

														var record = {
																query : selectQuery,
																objName : "Attendee5",
																sessionId: json.sessionId,
																output: 'json'
														}
														var uri  = util.format("%s%s?%s", rollbase.uri, "selectQuery", querystring.stringify(record));
														request({
																uri : uri
														} , function(error, response, body){

																	var result = JSON.parse(body)[0];

																	if (result){

																		person = new Person({
																			 email :   result[0], // email
																			 firstName : result[1], // first name
																			 lastName: result[2], // last name
																			 title : result[3],
																			 organization: result[4],
																			 tagId : result[5]
																		});

																		person.save(function(err, person){
																				if (!err){
																						// socket and push
																						processAttendee(entites, person);

																				}
																		});
																}else{
																	processAttendee(entites, null);
																}
														});
												} // status === ok
										});
									} else {
											processAttendee(entites, person);
									}
							});
					}
			}

			function processAttendee(entites, attendee){
				var entered = entites[2].toLowerCase() === "entered";
				var roomId = entites[entites.length - 1];

				var action = entered ? "entered" : "left";

				if (attendee){
					var name = [attendee.firstName, attendee.lastName].join(" ");

					var Event = mongoose.model("event");

					var e = new Event({
							email : attendee.email,
							name : name,
							created: new Date(),
							entered: entered,
							roomId : roomId
					});

					e.save(function(err, event){
						var info = util.format("%s from %s %s %s", name, attendee.organization, action, reverseRoomLocate(entites[entites.length - 1]))
							//socket.emit(info);
							app.socket.emit("message", info);
							sendNotification(entites[entites.length - 1], entered, attendee);
					});
				}
				else{
					var info = util.format("%s from %s %s %s", entites[1], "Unknown", action, reverseRoomLocate(entites[entites.length - 1]))
					// socket.io
					app.socket.emit("message", info);
				}
			}

			function sendNotification(roomId, entered,  attendee){
				  roomId = roomId.replace(/^[\/a-z]+[^usa:]/ig, "");

					var Notification = mongoose.model('notification');

					Notification.findOne({email : attendee.email}, function(err, notification){
						if (notification && entered){
								if ((notification.grand && roomId === "usa:lasVegas:fourSeasons:level2:GBR")
									|| (notification.ballroom1 && roomId === "usa:lasVegas:fourSeasons:level2:FSBR1")
								  || (notification.accacia1 && roomId === "usa:lasVegas:fourSeasons:level2:AccaciaBR1")){

										sendPushNotification(notification.email, notification.message, function(result){
										});

										notification.grand = false;
										notification.accacia1 = false;
										notification.ballroom1 = false;

										notification.save(function(){
												var Person = mongoose.model('person');
												Person.findOne({email: notification.email}, function(err, person){
														person.wanted = false;
														person.save(function(err, person){
																// Nothing here for now.
														})
												});
										});
								}
						}
					});
			}

			function reverseRoomLocate(id){
				id = id.replace(/^[\/a-z]+[^usa:]/ig, "");
				switch(id){
					 case "usa:lasVegas:fourSeasons:level2:AccaciaBR1":
						return "Accacia Ballroom 1";
					 case "usa:lasVegas:fourSeasons:level2:FSBR1":
						return "Ballroom 1";
					 case "usa:lasVegas:fourSeasons:level2:GBR":
						return "Grand Ballroom";
					 default:
						 return ""
				}
			}

			res.end();
	});

}
