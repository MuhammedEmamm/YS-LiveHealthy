/*global $, angular, FB, console, language, lang, apiurl, alert, FormData*/
// resApp js
var myApp = angular.module("myApp", ["ngRoute", "ngCookies"]);

//routes js
myApp.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
	"use strict";
	$locationProvider.hashPrefix('');
	$routeProvider
		.when("/", {
			templateUrl: "assets/pages/" + lang + "/home.html",
			controller: "homeCtrl"
		})
		.when("/t&c", {
			templateUrl: "assets/pages/" + lang + "/terms-conditions.html",
			controller: "t&cCtrl"
		})
		.when("/doctor_registeration", {
			templateUrl: "assets/pages/" + lang + "/docregistration.html",
			controller: "DocRegCtrl"
		})
		.when("/about", {
			templateUrl: "assets/pages/" + lang + "/about.html",
			controller: "aboutCtrl"
		})
		.when("/doctors", {
			templateUrl: "assets/pages/" + lang + "/doctors.html",
			controller: "doctorsCtrl",
			authenticated: true
		})
		.when("/pharmacy", {
			templateUrl: "assets/pages/" + lang + "/pharmacy.html",
			controller: "pharmacyCtrl",
			authenticated: true
		})
		.when("/home_visit", {
			templateUrl: "assets/pages/" + lang + "/homeVisit.html",
			controller: "home_visitCtrl",
			authenticated: true
		})
		.when("/edit", {
			templateUrl: "assets/pages/" + lang + "/Edit.html",
			controller: "editCtrl",
			authenticated: true
		})
		.when("/profile", {
			templateUrl: "assets/pages/" + lang + "/profile.html",
			controller: "profileCtrl",
			authenticated: true
		})
		.when("/sub_profile", {
			templateUrl: "assets/pages/" + lang + "/subprofile.html",
			controller: "subprofileCtrl",
			authenticated: true
		})
		.otherwise({ //variable
			templateUrl: "assets/pages/" + lang + "/redirect.html",
			controller: "redirectCtrl"
		});
}]);

myApp.run(["$rootScope", "$location", "authFact", function ($rootScope, $location, authFact) {
	"use strict";
	$rootScope.$on("$routeChangeStart", function (event, next, current) {
		if (next.$$route.authenticated) {
			var userAuth = authFact.getAccessToken();
			if (!userAuth) {
				$location.path("/");
			}
		}
	});
}]);

//authFact js
myApp.factory("authFact", ["$cookies", function ($cookies) {
	"use strict";
	var authFact = {};
	authFact.setAccessToken = function (accessToken) {
		$cookies.putObject('accessToken', accessToken);
	};
	authFact.getAccessToken = function () {
		authFact.authToken = $cookies.get("accessToken");
		return authFact.authToken;
	};
	return authFact;
}]);
//headerCtrl js
myApp.controller("headerCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";
	//calender ready
	var d = 1,
		m = 1,
		y = 2017;
	$scope.dyasinmonth = [];
	$scope.monthsinyear = [];
	$scope.yearsrange = [];
	for (d; d <= 31; d = d + 1) {
		$scope.dyasinmonth.push(d);
	}
	for (m; m <= 12; m = m + 1) {
		$scope.monthsinyear.push(m);
	}
	for (y; y >= 1907; y = y - 1) {
		$scope.yearsrange.push(y);
	}
	//if already loged in
	$scope.userid = authFact.getAccessToken();
	if ($scope.userid === undefined || $scope.userid === null || $scope.userid === "" || $scope.userid === " " || $scope.userid === "0") {
		$cookies.remove('accessToken');
		$scope.islogedin = false;
	} else {
		$scope.islogedin = true;
		//get user details
		$http({
				method: "GET",
				url: apiurl + "Patient/PatientDetails?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&lang=" + lang,
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.patientdetails = response.data.Response;
					$scope.subprofiles = response.data.Response.SubProfiles;
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	}
	//goto page
	$scope.gotopage = function (x) {
		$('#regmodal').modal("hide");
		$location.path("/" + x);
	};
	$scope.gotopageinside = function (x) {
		if ($scope.islogedin) {
			$('#regmodal').modal("hide");
			$location.path("/" + x);
		} else {
			$('#loginmodal').modal("show");
		}
	};
	// for testing pharcmay
	$scope.PH = function (x) {
		$location.path("/" + x);
	}
	//login
	$scope.loginup = function () {
		$http({
				method: "POST",
				data: JSON.stringify({
					"Email": $scope.loginemail,
					"Password": $scope.loginpass,
					"lang": lang
				}),
				url: apiurl + "User/Login"
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					//(response.data.Response.UserDetails.User_ID);
					//(response.headers().token);
					$scope.PasswordUser = $scope.loginpass;
					$scope.username = response.data.Response.PatientDetails.Patient_Name;
					$scope.errorlogin = false;
					$scope.islogedin = true;
					$cookies.putObject('Patient_ID', response.data.Response.PatientDetails.Patient_ID);
					$cookies.putObject('User_ID', response.data.Response.UserDetails.User_ID);
					authFact.setAccessToken(response.headers().token);
					location.reload();
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
					$scope.errorlogin = true;
					$scope.islogedin = false;
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//register
	$scope.upregister = function () {
		//($scope.regemail);
		//(document.getElementById("regimage").files[0]);
		//($scope.regpass);
		//($scope.dob2 + "/" + $scope.dob1 + "/" + $scope.dob3);
		//($scope.regadd);
		//($scope.regmob);
		//($scope.regname);
		var form = new FormData();
		form.append("Image", document.getElementById("regimage").files[0]);
		form.append("Email", $scope.regemail);
		form.append("Password", $scope.regpass);
		form.append("Age", "0");
		form.append("DOB", $scope.dob2 + "/" + $scope.dob1 + "/" + $scope.dob3);
		form.append("Address", $scope.regadd);
		form.append("Gender", $scope.reggender);
		form.append("Mobile_number", $scope.regmob);
		form.append("Name", $scope.regname);
		var settings = {
			"async": true,
			"crossDomain": true,
			"url": "http://yakensolution.cloudapp.net:80/LiveHealthy/api/user/Registration",
			"method": "POST",
			"headers": {
				"cache-control": "no-cache",
				"postman-token": "b6d5e1e4-011f-35f4-693b-8913a32bf14f"
			},
			"processData": false,
			"contentType": false,
			"mimeType": "multipart/form-data",
			"data": form
		};

		$.ajax(settings).done(function (response) {
			//(JSON.parse(response));
			//(JSON.parse(response).isSuccess);
			if (JSON.parse(response).isSuccess) {
				$http({
						method: "POST",
						data: JSON.stringify({
							"Email": $scope.regemail,
							"Password": $scope.regpass,
							"lang": lang
						}),
						url: apiurl + "User/Login"
					})
					.then(function (response) {
						if (response.data.isSuccess) {
							//(response.data.Response);
							//(response.data.Response.UserDetails.User_ID);
							//(response.headers().token);
							$scope.username = response.data.Response.PatientDetails.Patient_Name;
							$scope.errorlogin = false;
							$scope.islogedin = true;
							$scope.PasswordUser = $scope.regpass;
							$cookies.putObject('Patient_ID', response.data.Response.PatientDetails.Patient_ID);
							$cookies.putObject('User_ID', response.data.Response.UserDetails.User_ID);
							authFact.setAccessToken(response.headers().token);
							location.reload();
						} else {
							$scope.errormsg = response.data.errorMessage;
							//($scope.errormsg);
							$scope.errorlogin = true;
							$scope.islogedin = false;
						}
					}, function (reason) {
						//(reason.data);
					});
			}
		});
	};
	//subregister
	$scope.subregister = function () {
		var form = new FormData();
		form.append("Image", document.getElementById("subregimage").files[0]);
		form.append("Email", $scope.subregemail);
		form.append("Password", $scope.subregpass);
		form.append("Age", "0");
		form.append("DOB", $scope.subdob2 + "/" + $scope.subdob1 + "/" + $scope.subdob3);
		form.append("Address", $scope.subregadd);
		form.append("Gender", $scope.subreggender);
		form.append("Mobile_number", $scope.subregmob);
		form.append("Name", $scope.subregname);
		var settings = {
			"async": true,
			"crossDomain": true,
			"url": apiurl + "user/Registration",
			"method": "POST",
			"headers": {
				"cache-control": "no-cache",
				"postman-token": "b6d5e1e4-011f-35f4-693b-8913a32bf14f"
			},
			"processData": false,
			"contentType": false,
			"mimeType": "multipart/form-data",
			"data": form
		};

		$.ajax(settings).done(function (response) {
			//(JSON.parse(response));
			//(JSON.parse(response).isSuccess);
			if (JSON.parse(response).isSuccess) {
				//add sub profile
				$http({
						method: "POST",
						data: JSON.stringify({
							"ToPatient_ID": JSON.parse(response).Response.Patient_ID,
							"FromPatient_ID": JSON.parse($cookies.get("Patient_ID")),
							"lang": lang
						}),
						url: apiurl + "Patient/AddSubProfile",
						headers: {
							"UserID": JSON.parse($cookies.get("User_ID")),
							"Token": JSON.parse($cookies.get("accessToken"))
						}
					})
					.then(function (response) {
						if (response.data.isSuccess) {
							location.reload();
						} else {
							$scope.errormsg = response.data.errorMessage;
							//(response.data);
							//($scope.errormsg);
						}
					}, function (reason) {
						//(reason.data);
					});
			}
		});
	};
	//facebook register
	$scope.fbregister = function () {
		var form = new FormData();
		form.append("Image", document.getElementById("regimage").files[0]);
		form.append("Email", $scope.regemail);
		form.append("Age", "0");
		form.append("DOB", $scope.dob2 + "/" + $scope.dob1 + "/" + $scope.dob3);
		form.append("Address", $scope.regadd);
		form.append("Gender", $scope.reggender);
		form.append("Mobile_number", $scope.regmob);
		form.append("Name", $scope.regname);
		form.append("FB_ID", $scope.fbid);
		var settings = {
			"async": true,
			"crossDomain": true,
			"url": "http://yakensolution.cloudapp.net:80/LiveHealthy/api/user/Registration",
			"method": "POST",
			"headers": {
				"cache-control": "no-cache",
				"postman-token": "b6d5e1e4-011f-35f4-693b-8913a32bf14f"
			},
			"processData": false,
			"contentType": false,
			"mimeType": "multipart/form-data",
			"data": form
		};

		$.ajax(settings).done(function (response) {
			//(response);
			//(JSON.parse(response));
			//(JSON.parse(response).isSuccess);
			if (JSON.parse(response).isSuccess) {
				$scope.FBLogin();
			}
		});
	};
	//facebook ready
	window.fbAsyncInit = function () {
		FB.init({
			appId: '128462914388023',
			cookie: false,
			xfbml: true,
			version: 'v2.8'
		});
		FB.AppEvents.logPageView();
	};
	(function (d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {
			return;
		}
		js = d.createElement(s);
		js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
	//facebook login
	$scope.FBLogin = function () {
		FB.login(function (response) {
			if (response.authResponse) {
				//('Welcome!  Fetching your information.... ');
				FB.api('/me', {
					fields: 'id,name,email,birthday,picture,gender'
				}, function (response) {
					//('Good to see you, ' + response.name + '.');
					$scope.fbloginreply = response;
					//($scope.fbloginreply);
					//($scope.fbloginreply.email);
					$scope.fbid = $scope.fbloginreply.id;
					$scope.fbemail = $scope.fbloginreply.email;
					if ($scope.fbloginreply.email === undefined) {
						$scope.fbemail = $scope.fbloginreply.id + "@facebook.com";
					}
					$http({
							method: "POST",
							data: JSON.stringify({
								"FB_ID": $scope.fbid,
								"lang": lang,
								"Email": $scope.fbemail
							}),
							url: apiurl + "User/Login"
						})
						.then(function (response) {
							if (response.data.isSuccess) {
								//(response.data.Response);
								//(response.data.Response.UserDetails.User_ID);
								//(response.headers().token);
								$scope.username = response.data.Response.PatientDetails.Patient_Name;
								$scope.errorlogin = false;
								$scope.islogedin = true;
								$cookies.putObject('Patient_ID', response.data.Response.PatientDetails.Patient_ID);
								$cookies.putObject('User_ID', response.data.Response.UserDetails.User_ID);
								authFact.setAccessToken(response.headers().token);
								location.reload();
							} else {
								$scope.errormsg = response.data.errorMessage;
								//($scope.errormsg);
								$scope.errorlogin = true;
								$scope.islogedin = false;
							}
						}, function (reason) {
							//(reason.data);
						});
				});
			} else {
				//('User cancelled login or did not fully authorize.');
			}
		});
	};
	//facebook get data at registration
	$scope.FBreg = function () {
		FB.login(function (response) {
			if (response.authResponse) {
				//('Welcome!  Fetching your information.... ');
				FB.api('/me', {
					fields: 'id,name,email,birthday,picture,gender'
				}, function (response) {
					//('Good to see you, ' + response.name + '.');
					$scope.fbregeply = response;
					//($scope.fbregeply);
					//($scope.fbregeply.email);
					$scope.fbid = $scope.fbregeply.id;
					$scope.regname = $scope.fbregeply.name;
					$scope.regemail = $scope.fbregeply.email;
					$scope.choosefacebook = true;
					document.getElementById("hidepass").setAttribute("style", "display:none");
				});
			} else {
				//('User cancelled login or did not fully authorize.');
			}
		});
	};
	//forget password
	$scope.forgetpass = function () {
		$http({
				method: "POST",
				data: JSON.stringify({
					"Email": $scope.forgetemail,
					"lang": lang
				}),
				url: apiurl + "User/ForgetPassword"
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.isSuccess);
					$('#resetform').tab('show');
				} else {
					$scope.forgeterrormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//reset password
	$scope.resetpass = function () {
		$http({
				method: "POST",
				data: JSON.stringify({
					"Email": $scope.forgetemail,
					"Password": $scope.newpass,
					"VerifyCode": $scope.newvercode,
					"lang": lang
				}),
				url: apiurl + "User/ResetPassword"
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.isSuccess);
					//(response.data.Response);
					$scope.loginemail = $scope.forgetemail;
					$scope.loginpass = $scope.newpass;
					$scope.vermessage = "Your password has been reset successfully please return to login";
				} else {
					$scope.forgeterrormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	$scope.subprofileview = function (x) {
		$cookies.putObject('subid', x);
		$location.path("/sub_profile");
	};
	//logout
	$scope.logout = function () {
		$cookies.remove('accessToken');
		$cookies.remove('Patient_ID');
		$cookies.remove('User_ID');
		$scope.islogedin = false;
		location.reload();
	};
}]);
//footerCtrl js
myApp.controller("footerCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";
	//if already loged in
	$scope.userid = authFact.getAccessToken();
	if ($scope.userid === undefined || $scope.userid === null || $scope.userid === "" || $scope.userid === " " || $scope.userid === "0") {
		$cookies.remove('accessToken');
		$scope.islogedin = false;
	} else {
		$scope.islogedin = true;
	}
	//goto page
	$scope.gotopage = function (x) {
		$location.path("/" + x);
	};
	$scope.gotopageinside = function (x) {
		if ($scope.islogedin) {
			$('#regmodal').modal("hide");
			$location.path("/" + x);
		} else {
			$('#loginmodal').modal("show");
		}
	};
	//contact us
	$scope.contactusform = function () {
		$http({
			method: "POST",
			url: apiurl + "Collection/ContactUs",
			data: JSON.stringify({
				"Email": $scope.contactemail,
				"Message": $scope.contactmsg,
				"Subject": $scope.contactsubject,
				"lang": lang
			})
		});
	};
	//join us
	$scope.joinusform = function () {
		$http({
			method: "POST",
			url: apiurl + "Collection/JoinUs",
			data: JSON.stringify({
				"Location": $scope.joinLocation,
				"Address": $scope.joinAddress,
				"DoctorName": $scope.joinDoctorName,
				"Speciality": $scope.joinSpeciality,
				"MobileNumber": $scope.joinMobileNumber,
				"Email": $scope.joinemail,
				"Message": $scope.joinmsg,
				"Type": $scope.joinType,
				"lang": lang
			})
		});
	};
}]);
//homeCtrl js
myApp.controller("homeCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";
	//goto page
	$scope.gotopage = function (x) {
		$location.path("/" + x);
	};
	//home search
	$scope.homesearch = function (a) {
		$cookies.putObject('searchkeyword', a);
		$location.path("/doctors");
	};
}]);
//t&cCtrl js
myApp.controller("t&cCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";

}]);
//aboutCtrl js
myApp.controller("aboutCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";

}]);
//pharmacyCtrl js
myApp.controller("pharmacyCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";
	//if select medication
	var MedId = 1;
	$scope.Editmed = false;
	$scope.toggleeditdetails = false;
	$scope.SubmitEdit = false;
	$scope.AddtoOrder = false;
	$scope.EditDetails = false;
	$scope.AddMedDetail = false;
	$scope.SubmitReq = false;
	if ($cookies.get("reqmed") === undefined || $cookies.get("reqmed") === null || $cookies.get("reqmed") === "" || $cookies.get("reqmed") === " " || $cookies.get("reqmed") === "0") {
		//('no meds selected');
	} else {
		$scope.medname = JSON.parse($cookies.get("reqmed"));
		$cookies.remove('reqmed', "");
		//('meds selected');
	}
	$scope.allmed = [];
	$scope.medName = {};
	$scope.Amount = {};

	//models for details 
	$scope.MedDetailName = {};
	$scope.MedDetailAmount = {};


	//get request list
	$scope.getprevlist = function () {
		$http({
				method: "GET",
				url: apiurl + "Order/PatientOrders?PatientID=" + JSON.parse($cookies.get("Patient_ID")) + "&PageNumber=1&NumberRecords=100&lang=" + lang,
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.prevreq = response.data.Response.Orders;
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	$scope.getprevlist();
	//open prev req (req.Order_ID, req.Address, req.Comment, req.Rate, req.Status, req.Message, req.Date, req.Order_Medications)
	$scope.openprevreq = function (a, b, c, d, e, f, g, h) {
		$scope.detilsid = a;
		$scope.detailsadd = b;
		$scope.detailscom = c;
		if($scope.detailscom == "" || $scope.detailscom =="undefined" || $scope.detailscom == null){
			$scope.detailscom = "";
		}
		$scope.detailsrate = d;
		$scope.detailstat = e;
		$scope.detailsmes = f;
		$scope.detailsdate = g;
		$scope.detailsmeds = h;

		$('#prevreqdetails').modal("show");
	};
	//edit list of medicines 
	$scope.editmedreq = function (x) {
		$http({
			method: "POST",
			url: apiurl + "Order/MedicineOrder_Medicines",
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			},
			data: {
				AllMedicines: $scope.detailsmeds,
				Order_ID: x,
				lang: lang
			}
		}).then(function (response) {
				//($scope.detailsmeds);
				//(x);
				//			//($sc)
				//(response);
				if (response.data.isSuccess)
					$scope.getprevlist();
			},
			function (response) {
				//("Error");
			});
	} ;  
	//edit or cancel req (detilsid, detailsadd, detailscom, detailsrate, 'Canceled')
	$scope.editreq = function (a, b, c, d, e) {
		$http({
				method: "POST",
				url: apiurl + "Order/EditOrder",
				data: JSON.stringify({
					"OrderID": a,
					"Address": b,
					"Comment": c,
					"Rate": d,
					"Status": e,
					"lang": lang
				}),
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					$scope.editmedreq(a);
					//(response.data.Response);
					$('#prevreqdetails').modal("hide");
					$scope.getprevlist();
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//set values for form and unit
	$scope.setValues = function () {
		$scope.FormE = [];
		$scope.FormE.push({
			"FormName": "Tablets-أقراص",
			"FormValue": "Tablets-أقراص"
		});
		$scope.FormE.push({
			"FormName": "Capsules-كبسولات",
			"FormValue": "Capsules-كبسولات"
		});
		$scope.FormE.push({
			"FormName": "Syrup-شراب",
			"FormValue": "Syrup-شراب"
		});
		$scope.FormE.push({
			"FormName": "Effervescent-فوار",
			"FormValue": "Effervescent-فوار"
		});
		$scope.FormE.push({
			"FormName": "Ointment-مرهم",
			"FormValue": "Ointment-مرهم"
		});
		$scope.FormE.push({
			"FormName": "Cream-كريم",
			"FormValue": "Cream-كريم"
		});
		$scope.FormE.push({
			"FormName": "Drops-نقط",
			"FormValue": "Drops-نقط"
		});
		$scope.FormE.push({
			"FormName": "Inhaler-بخاخ",
			"FormValue": "Inhaler-بخاخ"
	});
		$scope.FormE.push({
			"FormName": "Injection-حقن",
			"FormValue": "Injection-حقن"
		});
		$scope.FormE.push({
			"FormName": "Suppository-لبوس",
			"FormValue": "Suppository-لبوس"
		});
		$scope.FormE.push({
			"FormName": "Other-اخرى",
			"FormValue": "Other-اخرى"
		});
	};
	$scope.setValues();
	//drug form in edit
	$scope.getformEvalue = function (x) {
		//(x);
		$scope.FormEdit = x;
		$scope.UnitE = [];
		if (x == "Tablets-أقراص" || x == "Effervescent-فوار" || x == "Capsules-كبسولات" || x == "Suppository-لبوس" || x == "Injection-حقن") {
			$scope.UnitE.push({
				UnitName: "Box-علبة"
			});
		}
		if (x == "Tablets-أقراص" || x == "Capsules-كبسولات" || x == "Suppository") {
			$scope.UnitE.push({
				UnitName: "Strip-شريط"
			});
		}
		if (x == "Inhaler-بخاخ" || x == "Drops-نقط" || x == "Syrup-شراب") {
			$scope.UnitE.push({
				UnitName: "Bottle-زجاجة"
			});
		}
		if (x == "Ointment-مرهم" || x == "Cream-كريم") {
			$scope.UnitE.push({
				UnitName: "Tube-أنبوبة"
			});
		}
		if (x == "Injection-حقن") {
			$scope.UnitE.push({
				UnitName: "Ampoule-أمبول"
			});
		}
		if (x == "Effervescent-فوار") {
			$scope.UnitE.push({
				UnitName: "Sachet-كيس"
			});
		}
		if (x == "Other-اخرى") {
			$scope.UnitE.push({
				UnitName: "Other-اخرى"
			});
		}
		$scope.UnitEd = undefined ; 
	};
	// drug unit in edit
	$scope.getunitEvalue = function (x) {
		//(x) ; 	
		$scope.UnitName = x; 
	};
	//push medicine
	$scope.addmedicine = function () {
		$scope.AddtoOrder = true;
		////("IN") ; 
		if ($scope.medName.text!="" && $scope.medName.text != undefined && $scope.medName.text != null && $scope.Amount.text !=undefined && $scope.Amount.text != null && $scope.FormEdit != 0 && $scope.FormEdit != undefined && $scope.UnitName != 0 && $scope.UnitName != undefined) {
			$scope.AddtoOrder = false;
			$scope.allmed.push({
				"Medicine_ID": ($scope.allmed.length + 1),
				"Medicine_Name": $scope.medName.text,
				"Amount": $scope.Amount.text,
				"DrugForm": $scope.FormEdit,
				"DrugQuantity": $scope.UnitName,
			});
			//($scope.allmed);
		//($scope.medName.text);
		//($scope.Amount.text);
			$scope.Formprev = $scope.FormEdit;
			$scope.medName.text = undefined;
			$scope.Amount.text = undefined;
			$scope.FormEdD = 0;
			$scope.UnitEd = 0;
			$scope.AddtoOrder = false;
		}
		//($scope.allmed);
		//($scope.medName.text);
		//($scope.Amount.text);
		//($scope.Form);
		//($scope.Unit);
	};
	//toggle edit 
	$scope.toggleedit = function () {
		//($scope.Editmed);
		$scope.Editmed = !$scope.Editmed;
	};
	//Edit Med In the order 
	$scope.EditMed = function (x) {
		$scope.SubmitEdit = true;
		for (var i = 0; i < $scope.allmed.length; i++) {
			if ((i + 1) == x) {
				if (($scope.FormEdit != undefined && $scope.FormEdit != "0" && $scope.FormEdit != null) && ($scope.UnitName != undefined && $scope.UnitName != "0" && $scope.UnitName != null)) {

					$scope.allmed[i].Medicine_Name = $scope.MedEditname.text;
					$scope.allmed[i].Amount = $scope.MedEditamount.text;
					$scope.allmed[i].DrugForm = $scope.FormEdit;
					$scope.allmed[i].DrugQuantity = $scope.UnitName;
					$scope.Editmed = false;
					$scope.meddetails(x);
					//($scope.allmed);
					break;
				}
			}
		}

	};
	//med details 
	$scope.meddetails = function (x) {
		//(x);
		$scope.SubmitEdit = false;
		for (var i = 0; i < $scope.allmed.length; i++) {
			if ((i + 1) == x) {
				//alert("inside IF") ; 
				$scope.MedcName = $scope.allmed[i].Medicine_Name;
				$scope.AmountDetail = $scope.allmed[i].Amount;
				$scope.DrugFormDetail = $scope.allmed[i].DrugForm;
				$scope.DrugQuantityDetail = $scope.allmed[i].DrugQuantity;
				$scope.MedID = x;
				break;
			}
		}
		//($scope.MedcName);
		//($scope.AmountDetail);
		//($scope.DrugFormDetail);
		//($scope.DrugQuantityDetail);
		$("#getmeddetails").modal("show");
		$scope.MedEditname = {}
		$scope.MedEditname.text = $scope.MedcName;
		$scope.MedEditamount = {}
		$scope.MedEditamount.text = $scope.AmountDetail;
		$scope.MedEditDrugForm = {}
		$scope.MedEditDrugForm.text = $scope.DrugFormDetail;
		$scope.MedEditDrugQuantity = {}
		$scope.MedEditDrugQuantity.text = $scope.DrugQuantityDetail;

	};
	//Delete item from medicines array 
	$scope.DeleteMed = function (x) {
		$scope.allmed.splice(x - 1, 1);
		//($scope.allmed);
		for (var i = 0; i < $scope.allmed.length; i++) {
			$scope.allmed[i].Medicince_ID = i + 1;
		}
		//($scope.allmed);
	};
	//Putting medicines in the order 
	$scope.RequestMed = function (x) {

		$http({
			method: "POST",
			url: apiurl + "Order/MedicineOrder_Medicines",
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			},
			data: {
				AllMedicines: $scope.allmed,
				Order_ID: x,
				lang: lang
			}
		}).then(function (response) {
				//($scope.allmed);
				//(x);
				//			//($sc)
				//(response);
				if (response.data.isSuccess) {
					$scope.OrderID = x;
					$("#successorder").modal("show");
					$scope.getprevlist();
					var size = $scope.allmed.length;
					for (var i = 0; i < size; i++) {
						$scope.allmed.splice(0, 1);
					}
					$scope.medaddress = "";
					$scope.medcomment = "";
				}
			},
			function (response) {
				//("Error");
			});
	};
	//request medication
	$scope.requestmedication = function () {

		//   //($scope.medname);
		//($scope.medaddress);
		//($scope.medcomment);
		$scope.SubmitReq = false;
		var form = new FormData();
		form.append("Image", document.getElementById("prescription").files[0]);
		form.append("Patient_ID", JSON.parse($cookies.get("Patient_ID")));
		form.append("Address", $scope.medaddress);
		form.append("Comment", $scope.medcomment);
		form.append("lang", lang);
		var settings = {
			"async": true,
			"crossDomain": true,
			"url": apiurl + "Order/MedicineOrder",
			"method": "POST",
			"headers": {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			},
			"processData": false,
			"contentType": false,
			"mimeType": "multipart/form-data",
			"data": form
		};

		$.ajax(settings).done(function (response) {
			//(response);
			//(JSON.parse(response));
			//(JSON.parse(response).isSuccess);
			//(JSON.parse(response).Response.OrderID);
			$scope.Order_ID = JSON.parse(response).Response.OrderID;
			//($scope.Order_ID);
			if (JSON.parse(response).isSuccess) {
				$scope.RequestMed($scope.Order_ID);
			}
		});
	};
	//set Submit Req  
	$scope.SetSubmit = function () {
		$scope.SubmitReq = true;
		//($scope.medaddress);
		//($scope.SubmitReq);
	}
	//Details Functions on prev list 

	//toggle div to edit and delete 
	$scope.toggledetailsedit = function () {
		$scope.toggleeditdetails = !($scope.toggleeditdetails);
		//($scope.toggleeditdetails);
		if ($scope.toggleeditdetails) {
			$scope.AddMedDetail = false;
		}
	};
	//Switch Edit bool 
	$scope.SwitchDet = function () {
		$scope.EditDetails = !$scope.EditDetails;
		if (!$scope.EditDetails) {
			$scope.AddMedDetail = false;
			$scope.toggleeditdetails = false;
		}
		//($scope.EditDetails);
	};
	//go to edit medicine in details 
	$scope.ToEditDetails = function (x) {
		$scope.MedEditdamount = {};
		$scope.MedEditdname = {};
		$scope.toggleeditdetails = true;


		//(x);
		for (var i = 0; i < $scope.detailsmeds.length; i++) {
			if (i == x) {
				//($scope.detailsmeds[i].Medicine_Name);
				//($scope.detailsmeds[i].Amount);
				$scope.MedEditdname.text = $scope.detailsmeds[i].Medicine_Name;
				$scope.MedEditdamount.text = $scope.detailsmeds[i].Amount;
				$scope.FormDet = $scope.detailsmeds[i].DrugForm;
				$scope.UnitDet = $scope.detailsmeds[i].DrugQuantity ; 
				$scope.MedicId = x;
				break;
			}
		}
	};
	//edit medicine
	$scope.EditMedDetails = function (x) {
		$scope.SubmitEdit = true;
		//(x);
		if ($scope.FormEdit != 0 && $scope.FormEdit != undefined && $scope.UnitName != 0 && $scope.UnitName != undefined) {
			for (var i = 0; i < $scope.detailsmeds.length; i++) {
				if (i == x) {

					//($scope.detailsmeds[i].Medicine_Name);
					//($scope.detailsmeds[i].Amount);
					$scope.detailsmeds[i].Medicine_Name = $scope.MedEditdname.text;
					$scope.detailsmeds[i].Amount = $scope.MedEditdamount.text;
					$scope.detailsmeds[i].DrugForm = $scope.FormEdit;
					$scope.detailsmeds[i].DrugQuantity = $scope.UnitName;
					//($scope.detailsmeds);
					$scope.toggleeditdetails = false;
					break;
				}
			}
		}
	};
	//switch div to add medicine 
	$scope.SwitchAdd = function () {
		$scope.AddMedDetail = !$scope.AddMedDetail;
		//($scope.AddMedDetail);
		if ($scope.AddMedDetail) {
			$scope.FormEdit = undefined ; 
			$scope.UnitName = undefined ; 
			$scope.toggleeditdetails = false;
		}

	};
	//add medicine 
	$scope.AddMedDetails = function () {
		$scope.AddtoOrder = true;
		//($scope.MedDetailName.text);
		//($scope.MedDetailAmount.text);
		//($scope.FormEdit);
		//($scope.UnitName);
		if ($scope.FormEdit != 0 && $scope.FormEdit != undefined && $scope.UnitName != 0 && $scope.UnitName != undefined) {
			//alert("BEEEB INSIDE IF") ; 
			$scope.AddtoOrder = false;
			$scope.detailsmeds.push({
				"Medicine_ID": ($scope.detailsmeds.length + 1),
				"Medicine_Name": $scope.MedDetailName.text,
				"Amount": $scope.MedDetailAmount.text,
				"DrugForm": $scope.FormEdit,
				"DrugQuantity": $scope.UnitName,
			});
			$scope.MedDetailName.text = "";
			$scope.MedDetailAmount.text = "";
			$scope.FormEdD = "0";
			$scope.AddMedDetail = false;
		}
		//($scope.detailsmeds);
	};
	//Delete medicine in details
	$scope.DeleteMedDet = function (x) {
		$scope.detailsmeds.splice(x, 1);
		$scope.toggleeditdetails = false;

		//($scope.detailsmeds);
		for (var i = 0; i < $scope.detailsmeds.length; i++) {
			$scope.detailsmeds[i].Medicine_ID = i ;
		}
		//($scope.detailsmeds);
	};
	//reset bools 
	$scope.resetbools = function () {
		$scope.EditDetails = false;
		$scope.toggleeditdetails = false;
		$scope.AddMedDetail = false;
		$scope.SubmitEdit = false;
		$scope.AddtoOrder = false ; 
	};

}]);
//doctorsCtrl js
myApp.controller("doctorsCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";
	//search
	$scope.booking = false;
	$scope.Nothing = undefined;
	$scope.minpricee = {} ; 
	$scope.maxpricee = {} ; 
	$scope.namee = {} ; 
	$scope.filter = function (x) {
		//($scope.Gender) ; 
		//($scope.minpricee.text) ; 
		//($scope.maxpricee.text) ; 
		//($scope.namee.text) ; 
		$scope.name = $scope.namee.text ; 
		$scope.maxprice = $scope.maxpricee.text ; 
		$scope.minprice = $scope.minpricee.text
		$scope.gender = $scope.Gender ; 
		$scope.rate = $scope.Rate ; 
		$scope.consult = $scope.Consult ;
		//(JSON.stringify({
//					"City": $scope.CityName,
//					"Area": $scope.AreaName,
//					"Rate": $scope.rate,
//					"Gender": $scope.gender,
//					"Speciality": x,
//					"MaxPrice": $scope.maxprice,
//					"MinPrice": $scope.minprice,
//					"Name": $scope.name,
//					"Insurance": $scope.InsName,
//					"Consultancy": $scope.consult,
//					"PageNumber": "1",
//					"NumberRecords": "100",
//					"lang": lang
//				}));
		$http({
				method: "POST",
				data: JSON.stringify({
					"City": $scope.CityName,
					"Area": $scope.AreaName,
					"Rate": $scope.Rate,
					"Gender": $scope.Gender,
					"Speciality": x,
					"MaxPrice": $scope.maxprice,
					"MinPrice": $scope.minprice,
					"Name": $scope.name,
					"Insurance": $scope.InsName,
					"Consultancy": $scope.Consult,
					"PageNumber": "1",
					"NumberRecords": "10000",
					"lang": lang
				}),
				url: apiurl + "Doctor/FilterDoctor",
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.searchres = response.data.Response.List;
					if($scope.searchres.length ==0){
						$scope.Spec = " " ; 
					}
					//($scope.searchres);
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//if already loged in
	if ($cookies.get("searchkeyword") === undefined || $cookies.get("searchkeyword") === null || $cookies.get("searchkeyword") === "" || $cookies.get("searchkeyword") === " " || $cookies.get("searchkeyword") === "0") {
		$scope.filter($scope.Nothing);
	} else {
		$scope.name = JSON.parse($cookies.get("searchkeyword"));
		$cookies.putObject('searchkeyword', "");
		$scope.filter($scope.Nothing);
	}
	//get insurance
	$http({
			method: "GET",
			url: apiurl + "Collection/GetInsurance?PageNumber=1&NumberRecords=100&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.insurances =[] ; 
				$scope.insurances.push({
					ID:"",
					Name:"Insurances-التأمين"
				})
				$scope.y  = response.data.Response.Insurances;
				for(var i = 0 ; i < $scope.y.length ; i++){
					$scope.y.ID = $scope.y.Name ; 
				}
				$scope.insurances = $scope.insurances.concat($scope.y) ; 
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get specialist
	$http({
			method: "GET",
			url: apiurl + "Collection/GetSpecialities?PageNumber=1&NumberRecords=100&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.specialists = response.data.Response.Specialities;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get cities
	$http({
			method: "GET",
			url: apiurl + "Collection/GetCities?PageNumber=1&NumberRecords=100&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.cities  = [] ; 
				$scope.cities.push({
					City_ID : "",
					Name:"City-المدينة"
				}) ; 
				$scope.x = response.data.Response.Areas;
				$scope.citiesID = [] ; 
				for(var i = 0 ; i<$scope.x.length ; i++){
					$scope.citiesID.push({
						City_ID : $scope.x[i].City_ID
					}) ; 
				}				
				$scope.cities = $scope.cities.concat($scope.x ) ; 
				for(var i = 1 ; i<$scope.cities.length ; i++){
					$scope.cities[i].City_ID =$scope.cities[i].Name ;   
				}
				//($scope.cities) ; 
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get area
	$scope.initarea = function(){
				$scope.areas = []  ; 
					$scope.areas.push({
						Area_ID : "" , 
						Name : "Area-المنطقة"
					}) ; 
	
	} ; 
	$scope.getarea = function (a) {
		//(a);
		for (var i = 0; i < $scope.x.length; i++) {
			if ($scope.x[i].Name == a) {
				//($scope.citiesID[i].City_ID) ; 
				a = $scope.citiesID[i].City_ID;
			}
		};
		$http({
				method: "GET",
				url: apiurl + "Collection/GetAries?City_ID=" + a + "&PageNumber=1&NumberRecords=100&lang=" + lang,
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.initarea() ; 
					$scope.MainAreas = response.data.Response.Areas;
					for(var i = 0 ; i<$scope.MainAreas.length ; i++){
						$scope.MainAreas[i].Area_ID =$scope.MainAreas[i].Name ;   
					}
					$scope.areas = $scope.areas.concat($scope.MainAreas) ; 
					//($scope.areas) ; 
					
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//get clinic doctors
	$scope.getclinicdoctors = function (x) {
		//(x);
		$scope.clinicdoctors = "";
		if ($scope.city === null || $scope.city === undefined) {
			$scope.city = "";
		}
		if ($scope.area === null || $scope.area === undefined) {
			$scope.area = "";
		}
		if ($scope.rate === null || $scope.rate === undefined) {
			$scope.rate = "";
		}
		if ($scope.gender === null || $scope.gender === undefined) {
			$scope.gender = "";
		}
		if ($scope.speciality === null || $scope.speciality === undefined) {
			$scope.speciality = "";
		}
		if ($scope.maxprice === null || $scope.maxprice === undefined) {
			$scope.maxprice = "";
		}
		if ($scope.minprice === null || $scope.minprice === undefined) {
			$scope.minprice = "";
		}
		if ($scope.name === null || $scope.name === undefined) {
			$scope.name = "";
		}
		if ($scope.insurance === null || $scope.insurance === undefined) {
			$scope.insurance = "";
		}
		if ($scope.consult === null || $scope.consult === undefined) {
			$scope.consult = "";
		}
		$http({
				method: "GET",
				url: apiurl + "Doctor/GetClinicDoctors?Clinic_ID=" + x + "&City=" + $scope.city + "&Area=" + $scope.area + "&Rate=" + $scope.rate + "&Gender=" + $scope.gender + "&Speciality=" + $scope.speciality + "&MaxPrice=" + $scope.maxprice + "&MinPrice=" + $scope.minprice + "&Name=" + $scope.name + "&Insurance=" + $scope.insurance + "&Consultancy=" + $scope.consult + "&PageNumber=1&NumberRecords=100&lang=" + lang,
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.clinicdoctors = response.data.Response.List;
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//get doctor clinics
	$scope.getdoctorclinics = function (x, y) {
		//(x);
		$scope.DocId = x;
		$scope.booking = false;
		$scope.DocName = y;
		$scope.doctorclinics = "";
		if ($scope.city === null || $scope.city === undefined) {
			$scope.city = "";
		}
		if ($scope.area === null || $scope.area === undefined) {
			$scope.area = "";
		}
		if ($scope.rate === null || $scope.rate === undefined) {
			$scope.rate = "";
		}
		if ($scope.gender === null || $scope.gender === undefined) {
			$scope.gender = "";
		}
		if ($scope.speciality === null || $scope.speciality === undefined) {
			$scope.speciality = "";
		}
		if ($scope.maxprice === null || $scope.maxprice === undefined) {
			$scope.maxprice = "";
		}
		if ($scope.minprice === null || $scope.minprice === undefined) {
			$scope.minprice = "";
		}
		if ($scope.name === null || $scope.name === undefined) {
			$scope.name = "";
		}
		if ($scope.insurance === null || $scope.insurance === undefined) {
			$scope.insurance = "";
		}
		if ($scope.consult === null || $scope.consult === undefined) {
			$scope.consult = "";
		}
		$http({
				method: "GET",
				url: apiurl + "Doctor/GetDoctorClinics?Doctor_ID=" + x + "&City=" + $scope.city + "&Area=" + $scope.area + "&Rate=" + $scope.rate + "&Gender=" + $scope.gender + "&Speciality=" + $scope.speciality + "&MaxPrice=" + $scope.maxprice + "&MinPrice=" + $scope.minprice + "&Name=" + $scope.name + "&Insurance=" + $scope.insurance + "&Consultancy=" + $scope.consult + "&PageNumber=1&NumberRecords=100&lang=" + lang,
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.doctorclinics = response.data.Response.Clinics;
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//booking ready
	$scope.prebooking = function (x, z, w, y) {
		$scope.selecteddoctorid = z;
		$scope.selecteddoctorname = w;
		$scope.selectedclinicid = x;
		$scope.selectedclinicname = y;
		//($scope.selecteddoctorid);
		//($scope.selecteddoctorname);
		//($scope.selectedclinicid);
		//($scope.selectedclinicname);
		$scope.bookingconfirm = false;
		$http({
				method: "GET",
				url: apiurl + "Doctor/DoctorTimes?Doctor_ID=" + $scope.selecteddoctorid + "&Clinic_ID=" + $scope.selectedclinicid + "&lang=" + lang,
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response.Days);
					$scope.bookingdays = response.data.Response.Days;
					//					for(var i = 0 ; $scope.bookingdays.length ; i++){
					//						$scope.bookingdays.FH = 0 ; 	
					//					}
					//(response.data.Response.Days);

				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//book doctor and clinic
	$scope.booking = function () {
		//($scope.selecteddoctorid);
		//($scope.selecteddoctorname);
		//($scope.selectedclinicid);
		//($scope.selectedclinicname);
		$http({
				method: "POST",
				data: JSON.stringify({
					"Patient_ID": JSON.parse($cookies.get("Patient_ID")),
					"Doctor_ID": $scope.selecteddoctorid,
					"Visit_Date": $scope.vdate,
					"Visit_Info": $scope.vinfo,
					"Clinic_ID": $scope.selectedclinicid,
					"lang": lang
				}),
				url: apiurl + "Order/DoctorVisit",
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.bookingconfirm = true;
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	$scope.togglebooking = function () {
		$scope.booking = !$scope.booking;
	};
	$scope.getSpecValue = function (x) {
		for (var i = 0; i < $scope.specialists.length; i++) {
			if (x != $scope.specialists[i].Id) {
				$("#collapseOne" + $scope.specialists[i].Id).collapse('hide');
			} else {
				var Nam = $scope.specialists[i].Name;
				$scope.CityName = "";
				$scope.AreaName = "";
				$scope.InsName = "";
				$scope.name = "";
				$scope.Gender = "";
				$scope.minprice = "";
				$scope.maxprice = "";
				$scope.namee.text ="" ; 
				$scope.maxpricee.text = "" ; 
				$scope.minpricee.text ="" ; 
				$scope.Rate = "";
				$scope.Consult = "";
				
				$scope.city = "";
				$scope.area = "";
				$scope.gender ="" ; 
				$scope.consult=""; 
				$scope.rate="" ;
				$scope.Spec = Nam;
				$scope.filter($scope.Spec);
				if ($('#collapseOne' + x).attr("aria-expanded") == "true") {
					$scope.Spec = undefined;
				} else if ($('#collapseOne' + x).attr("aria-expanded") == "false") {
					$scope.Spec = Nam;
				$scope.CityName = "";
				$scope.AreaName = "";
				$scope.InsName = "";
				$scope.name = "";
				$scope.Gender = "";
				$scope.minprice = "";
				$scope.maxprice = "";
				$scope.namee.text ="" ; 
				$scope.maxpricee.text = "" ; 
				$scope.minpricee.text ="" ; 
				$scope.Rate = "";
				$scope.Consult = "";
					
				$scope.city = "";
				$scope.area = "";
				$scope.gender ="" ; 
				$scope.consult=""; 
				$scope.rate="" ;
					//$scope.filter($scope.Spec);

				}
				//($scope.Spec);
			}
		}
	} ; 
	$scope.Explore = function(){
				$scope.CityName = "";
				$scope.AreaName = "";
				$scope.InsName = "";
				$scope.name = "";
				$scope.namee.text ="" ; 
				$scope.maxpricee.text = "" ; 
				$scope.minpricee.text ="" ; 
				$scope.Gender = "";
				$scope.minprice = "";
				$scope.maxprice = "";
				$scope.Rate = "";
				$scope.Consult = "";
				$scope.city = "";
				$scope.area = "";
				$scope.gender ="" ; 
				$scope.consult=""; 
				$scope.rate="" ;
				$scope.Spec  = undefined ; 
		$scope.filter($scope.Spec) ; 
	} ; 
	//setters 
	$scope.SetGender = function() {
		$scope.GenderAE  = []  ;
		$scope.GenderAE.push({
			GenderName:"Gender-الجنس",
			GenderValue : ""
		})
		$scope.GenderAE.push({
			GenderName:"Male-ذكر", 
			GenderValue : "Male"
		}) ; 
		$scope.GenderAE.push({
			GenderName:"Female-انثي" , 
			GenderValue :"Female"
		});
	} ; 
	$scope.SetGender() ; 
	$scope.SetRate = function(){
		$scope.RateAE = [] ; 
		$scope.RateAE.push({
			RateName:"Rate-التقييم",
			RateValue:""
		}) ;
		$scope.RateAE.push({
			RateName:"1",
			RateValue:"1"
		}) ;
		$scope.RateAE.push({
			RateName:"2",
			RateValue:"2"
		}) ;
		$scope.RateAE.push({
			RateName:"3",
			RateValue:"3"
		}) ;
		$scope.RateAE.push({
			RateName:"4",
			RateValue:"4"
		}) ;
		$scope.RateAE.push({
			RateName:"5",
			RateValue:"5"
		}) ; 
	} ; 
	$scope.SetRate() ; 
	$scope.SetConsult = function(){
		$scope.ConsultAE = [] ; 
		$scope.ConsultAE.push({
			ConsultName:"Consultancy-الدرجة العلمية",
			ConsultValue:""
		}) ; 
		$scope.ConsultAE.push({
			ConsultName:"Specialist-مختص",
			ConsultValue:"Specialist"
		}) ;
		$scope.ConsultAE.push({
			ConsultName:"Consultant-استشاري",
			ConsultValue:"Consultant"
		}) ; 
	} ; 
	$scope.SetConsult() ; 
	
	$scope.GetCityName = function (x) {
		$scope.CityName = x;
	} ; 
	$scope.GetAreaName = function (x) {
		$scope.AreaName = x;
	} ; 
	$scope.GetInsName = function (x) {
		$scope.InsName = x;
	} ; 
	$scope.GetGender = function(x){
		//(x) ; 
		$scope.Gender = x ; 
	} ; 
	$scope.GetRate = function(x) {
		//(x)  ; 
		$scope.Rate = x ; 
	} ; 
	$scope.GetConsult = function(x) {
		//(x) ; 
		$scope.Consult = x ; 
	} ; 

}]);
//home_visitCtrl js
myApp.controller("home_visitCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";
	//calender ready
	var d = 1,
		m = 1,
		y = 2018,
		h = 0,
		min = 0;
	$scope.dyasinmonth = [];
	$scope.monthsinyear = [];
	$scope.yearsrange = [];
	$scope.hourinday = [];
	$scope.mininhour = [];
	for (d; d <= 31; d = d + 1) {
		$scope.dyasinmonth.push(d);
	}
	for (m; m <= 12; m = m + 1) {
		$scope.monthsinyear.push(m);
	}
	for (y; y >= 2017; y = y - 1) {
		$scope.yearsrange.push(y);
	}
	for (h; h <= 23; h = h + 1) {
		$scope.hourinday.push(h);
	}
	for (min; min <= 59; min = min + 1) {
		$scope.mininhour.push(min);
	}
	//get nurse price
	$http({
			method: "GET",
			url: apiurl + "Collection/GetNursePrice?lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.nurseprice = response.data.Response.Price.Price;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get cities
	$http({
			method: "GET",
			url: apiurl + "Collection/GetCities?PageNumber=1&NumberRecords=100&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.cities = response.data.Response.Areas;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get area
	$scope.getarea = function (a) {
		$http({
				method: "GET",
				url: apiurl + "Collection/GetAries?City_ID=" + a + "&PageNumber=1&NumberRecords=100&lang=" + lang,
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.areas = response.data.Response.Areas;
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//get spetiality
	$scope.getspetial = function (a) {
		$http({
				method: "GET",
				url: apiurl + "Collection/GetHVSpecialities?PageNumber=1&NumberRecords=100&Area_ID=" + a + "&lang=" + lang,
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.speciality = response.data.Response.Specialities;
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//get spetiality
	$scope.getdocprice = function (a) {
		//(a);
	};
	//edit patient details
	$scope.housevisit = function (a, b, d, e, f, g, h, i, j, k, m, n) {
		//(hvnmae, hvnumber, hvday, hvmonth, hvyear, hvhour, hvmin, hvinfo, 'type', hvadd, hvspecial, hvtest)
		//(JSON.stringify({
		//			"PatientName": a,
		//			"PatientNumber": b,
		//			"Patient_ID": JSON.parse($cookies.get("Patient_ID")),
		//			"Visit_Date": f + "-" + e + "-" + d + " " + g + ":" + h,
		//			"Visit_Info": i,
		//			"Type": j,
		//			"Address": k,
		//			"Location": k,
		//			"Speciality": m,
		//			"Tests": [n],
		//			"lang": lang
		//		}));
		$http({
				method: "POST",
				url: apiurl + "Order/CreateHVist",
				data: JSON.stringify({
					"PatientName": a,
					"PatientNumber": b,
					"Patient_ID": JSON.parse($cookies.get("Patient_ID")),
					"Visit_Date": f + "-" + e + "-" + d + " " + g + ":" + h,
					"Visit_Info": i,
					"Type": j,
					"Address": k,
					"Location": k,
					"Speciality": m,
					"Tests": [n],
					"lang": lang
				}),
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//("true");
					$location.path("/profile");
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
}]);
//editCtrl js
myApp.controller("editCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";
	//if already loged in

	$scope.userid = authFact.getAccessToken();
	if ($scope.userid === undefined || $scope.userid === null || $scope.userid === "" || $scope.userid === " " || $scope.userid === "0") {
		$cookies.remove('accessToken');
		$scope.islogedin = false;
	} else {
		$scope.islogedin = true;
	}
	//calender ready
	var d = 1,
		m = 1,
		y = 2017;
	$scope.dyasinmonth = [];
	$scope.monthsinyear = [];
	$scope.yearsrange = [];
	for (d; d <= 31; d = d + 1) {
		$scope.dyasinmonth.push(d);
	}
	for (m; m <= 12; m = m + 1) {
		$scope.monthsinyear.push(m);
	}
	for (y; y >= 1907; y = y - 1) {
		$scope.yearsrange.push(y);
	}
	//get user details
	$http({
			method: "GET",
			url: apiurl + "Patient/PatientDetails?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.patientdetails = response.data.Response.PatientDetails;
				$scope.dob1 = response.data.Response.PatientDetails.DOB.substring(8, 10);
				$scope.dob2 = response.data.Response.PatientDetails.DOB.substring(5, 7);
				$scope.dob3 = response.data.Response.PatientDetails.DOB.substring(0, 4);
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//edit patient details
	$scope.editdetails = function () {
		$http({
				method: "POST",
				url: apiurl + "Patient/EditPatient",
				data: JSON.stringify({
					"Address": $scope.patientdetails.Address,
					"Address_AR": $scope.patientdetails.Address,
					"DOB": $scope.dob3 + "-" + $scope.dob2 + "-" + $scope.dob1 + "T00:00:00",
					"Gender": $scope.patientdetails.Gender,
					"Mobile_number": $scope.patientdetails.Mobile_number,
					"Name": $scope.patientdetails.Name,
					"Name_AR": $scope.patientdetails.Name,
					"Patient_ID": JSON.parse($cookies.get("Patient_ID")),
					"Email": $scope.patientdetails.Email,
					"lang": lang
				}),
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//("true");
					$location.path("/profile");
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//edit patient picture
	$scope.editpicture = function () {
		var formData = new FormData();
		formData.append("myFile", document.getElementById("editimage").files[0]);
		//(formData);
		var settings = {
			"async": true,
			"crossDomain": true,
			"url": "http://yakensolution.cloudapp.net:80/LiveHealthy/api/Patient/UpdatePatientPicture?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")),
			"method": "POST",
			"headers": {
				"userid": JSON.parse($cookies.get("User_ID")),
				"token": JSON.parse($cookies.get("accessToken"))
			},
			"processData": false,
			"contentType": false,
			"mimeType": "multipart/form-data",
			"data": formData
		};
		$.ajax(settings).done(function (response) {
			//(response);
			location.reload();
		});
	};

	//goto page
	$scope.gotopage = function (x) {
		$location.path("/" + x);
	};
}]);
//profileCtrl js
myApp.controller("profileCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";
	$scope.newpassword = {};
	$scope.PassChanged = false;
	$scope.switchPass = function () {
		$scope.PassChanged = !$scope.PassChanged;
	};
	$scope.resetBool = function () {
		///$('#passmodal').modal("show") ; 
		$scope.newpassword.text = "";
		$scope.PassChanged = false;
	}
	//if already loged in

	$scope.userid = authFact.getAccessToken();
	if ($scope.userid === undefined || $scope.userid === null || $scope.userid === "" || $scope.userid === " " || $scope.userid === "0") {
		$cookies.remove('accessToken');
		$scope.islogedin = false;
	} else {
		$scope.islogedin = true;
	}
	//get user details
	$http({
			method: "GET",
			url: apiurl + "Patient/PatientDetails?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.patientdetails = response.data.Response;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get notifications
	$scope.getnotifications = function () {
		$http({
				method: "GET",
				url: apiurl + "Patient/PatientNotifications?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&PageNumber=" + "1" + "&NumberRecords=" + "100" + "&lang=" + lang,
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.patientnotifications = response.data.Response.Notifications;
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//get patient profile
	$http({
			method: "GET",
			url: apiurl + "Patient/GetProfile?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.patientprofile = response.data.Response;
				$scope.notelist = [];
				//var i = 0;
				//for (i; i < response.data.Response.medicalNotes.length; i = i + 1) {
				//    $scope.notelist.push(response.data.Response.medicalNotes[i].Note_ID);
				//    //(response.data.Response.medicalNotes[i].Note_ID);
				//}
				$scope.patientheight = response.data.Response.Height;
				$scope.patientweight = response.data.Response.Weight;
				$scope.seperator = response.data.Response.Pressure.indexOf("/");
				$scope.patientpressure1 = response.data.Response.Pressure.substring(0, $scope.seperator);
				$scope.patientpressure2 = response.data.Response.Pressure.substring($scope.seperator + 1);
				$scope.patientnotes = response.data.Response.medicalNotes;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get notes
	$http({
			method: "GET",
			url: apiurl + "Patient/GetNotes?lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.allnotes = response.data.Response.Notes;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//set note list
	$scope.setnotelist = function (x, y) {
		if (x) {
			$scope.notelist.push(y);
			//if($scope.diabetes[i].IsSelected) list.push($scope.diabetes[i]);
		} else {
			$scope.notelist.splice($scope.notelist.indexOf(y), 1);
		}
		//($scope.notelist);
	};
	//edit medical profile
	$scope.editmprofile = function () {
		//($scope.patientheight);
		//($scope.patientweight);
		//($scope.patientpressure1);
		//($scope.patientpressure2);
		//($scope.notelist);
		$http({
				method: "POST",
				url: apiurl + "Patient/EditProfile",
				data: JSON.stringify({
					"Patient_ID": JSON.parse($cookies.get("Patient_ID")),
					"Height": $scope.patientheight,
					"Weight": $scope.patientweight,
					"Pressure": $scope.patientpressure1 + "/" + $scope.patientpressure2,
					"Note_IDs": $scope.notelist,
					"lang": lang
				}),
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//("true");
					location.reload();
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//get appointments
	$http({
			method: "GET",
			url: apiurl + "Patient/Appointments?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&PageNumber=1&NumberRecords=100&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.patientappoint = response.data.Response.Appointments;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get Medicines
	$http({
			method: "GET",
			url: apiurl + "Patient/GetMedicine?Patient_ID=" + JSON.parse($cookies.get("Patient_ID")) + "&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.patientmedicine = response.data.Response.Medicines;
				$scope.newmedication = [];
				var i = 0;
				for (i; i < response.data.Response.Medicines.length; i = i + 1) {
					$scope.newmedication.push(response.data.Response.Medicines[i]);
					//(response.data.Response.Medicines[i]);
				}
				//($scope.newmedication);
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//cancel appointment
	$scope.cancelappoint = function (x, y) {
		$http({
				method: "POST",
				url: apiurl + "Patient/CancelAppointment",
				data: JSON.stringify({
					"Patient_ID": JSON.parse($cookies.get("Patient_ID")),
					"Type": y,
					"Visit_ID": x
				}),
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data);
					location.reload();
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//rate appointment
	$scope.rateappoint = function (x, y, z) {
		$http({
				method: "POST",
				url: apiurl + "Patient/RateAppointment",
				data: JSON.stringify({
					"Patient_ID": JSON.parse($cookies.get("Patient_ID")),
					"Type": x,
					"Visit_ID": y,
					"Rate": z
				}),
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data);
					location.reload();
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//find medication
	$scope.findmed = function (x) {
		$http({
				method: "GET",
				url: apiurl + "Collection/GetMedications?SearchString=" + x + "&PageNumber=1&NumberRecords=100&lang=" + lang,
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.foundmeds = response.data.Response.Areas;
					//(x);
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//find medication
	$scope.selectmed = function (x, y) {
		$scope.selectedmedname = x;
		$scope.selectedmedid = y;
	};
	//request med
	$scope.requestmed = function (a) {
		$cookies.putObject('reqmed', a);
		$location.path("/pharmacy");
	};
	//update medication
	$scope.updatemed = function (x, y, z, w) {
		//(x); //add or remove(true or false)
		//(y); //med id
		//(z); //name
		//(w); //dosage
		if (x) {
			$scope.newmedication.push({
				"Medicine_ID": y,
				"Name": z,
				"Dosage": w
			});
		} else {
			var i = 0;
			for (i; i < $scope.newmedication.length; i = i + 1) {
				//($scope.newmedication[i].Medicine_ID);
				if ($scope.newmedication[i].Medicine_ID === y) {
					//(i);
					$scope.newmedication.splice(i, 1);
				}
			}
		}
		//($scope.newmedication);
		$http({
				method: "POST",
				url: apiurl + "Patient/UpdateProfileMedications",
				data: JSON.stringify({
					"AllMedications": $scope.newmedication,
					"Patient_ID": JSON.parse($cookies.get("Patient_ID")),
					"lang": lang
				}),
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					location.reload();
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//reset password
	$scope.resetpassword = function () {
		////("Na gowa el function") ; 
		$http({
				method: "POST",
				data: JSON.stringify({
					"Email": $scope.patientdetails.PatientDetails.Email,
					"Password": $scope.newpassword.text,
					"VerifyCode": "0000",
					"lang": lang
				}),
				url: apiurl + "User/ResetPassword",
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				//($scope.patientdetails.PatientDetails.Email);
				//($scope.newpassword.text);
				if (response.data.isSuccess) {
					$scope.PassChanged = true;
					//					alert("sdandjasdn") ; 
					//(response.data.isSuccess);
					//(response.data.Response);
					$scope.loginpass = $scope.newpassword.text;
					$scope.vermessage = "Your password has been reset successfully please return to login";
				} else {
					$scope.forgeterrormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//goto page
	$scope.gotopage = function (x) {
		$('#regmodal').modal("hide");
		$location.path("/" + x);
	};
}]);
//subprofileCtrl js
myApp.controller("subprofileCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";
	//if already loged in
	$scope.userid = authFact.getAccessToken();
	if ($scope.userid === undefined || $scope.userid === null || $scope.userid === "" || $scope.userid === " " || $scope.userid === "0") {
		$cookies.remove('accessToken');
		$scope.islogedin = false;
	} else {
		$scope.islogedin = true;
	}
	//get user details
	$http({
			method: "GET",
			url: apiurl + "Patient/PatientDetails?Patient_ID=" + JSON.parse($cookies.get("subid")) + "&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.patientdetails = response.data.Response;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get notifications
	$scope.getnotifications = function () {
		$http({
				method: "GET",
				url: apiurl + "Patient/PatientNotifications?Patient_ID=" + JSON.parse($cookies.get("subid")) + "&PageNumber=" + "1" + "&NumberRecords=" + "100" + "&lang=" + lang,
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.patientnotifications = response.data.Response.Notifications;
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//get patient profile
	$http({
			method: "GET",
			url: apiurl + "Patient/GetProfile?Patient_ID=" + JSON.parse($cookies.get("subid")) + "&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.patientprofile = response.data.Response;
				$scope.notelist = [];
				//var i = 0;
				//for (i; i < response.data.Response.medicalNotes.length; i = i + 1) {
				//    $scope.notelist.push(response.data.Response.medicalNotes[i].Note_ID);
				//    //(response.data.Response.medicalNotes[i].Note_ID);
				//}
				$scope.patientheight = response.data.Response.Height;
				$scope.patientweight = response.data.Response.Weight;
				$scope.seperator = response.data.Response.Pressure.indexOf("/");
				$scope.patientpressure1 = response.data.Response.Pressure.substring(0, $scope.seperator);
				$scope.patientpressure2 = response.data.Response.Pressure.substring($scope.seperator + 1);
				$scope.patientnotes = response.data.Response.medicalNotes;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get notes
	$http({
			method: "GET",
			url: apiurl + "Patient/GetNotes?lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.allnotes = response.data.Response.Notes;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//set note list
	$scope.setnotelist = function (x, y) {
		if (x) {
			$scope.notelist.push(y);
			//if($scope.diabetes[i].IsSelected) list.push($scope.diabetes[i]);
		} else {
			$scope.notelist.splice($scope.notelist.indexOf(y), 1);
		}
		//($scope.notelist);
	};
	//edit medical profile
	$scope.editmprofile = function () {
		//($scope.patientheight);
		//($scope.patientweight);
		//($scope.patientpressure1);
		//($scope.patientpressure2);
		//($scope.notelist);
		$http({
				method: "POST",
				url: apiurl + "Patient/EditProfile",
				data: JSON.stringify({
					"Patient_ID": JSON.parse($cookies.get("subid")),
					"Height": $scope.patientheight,
					"Weight": $scope.patientweight,
					"Pressure": $scope.patientpressure1 + "/" + $scope.patientpressure2,
					"Note_IDs": $scope.notelist,
					"lang": lang
				}),
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//("true");
					location.reload();
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//get appointments
	$http({
			method: "GET",
			url: apiurl + "Patient/Appointments?Patient_ID=" + JSON.parse($cookies.get("subid")) + "&PageNumber=1&NumberRecords=100&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.patientappoint = response.data.Response.Appointments;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get Medicines
	$http({
			method: "GET",
			url: apiurl + "Patient/GetMedicine?Patient_ID=" + JSON.parse($cookies.get("subid")) + "&lang=" + lang,
			headers: {
				"UserID": JSON.parse($cookies.get("User_ID")),
				"Token": JSON.parse($cookies.get("accessToken"))
			}
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.patientmedicine = response.data.Response.Medicines;
				$scope.newmedication = [];
				var i = 0;
				for (i; i < response.data.Response.Medicines.length; i = i + 1) {
					$scope.newmedication.push(response.data.Response.Medicines[i]);
					//(response.data.Response.Medicines[i]);
				}
				//($scope.newmedication);
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//cancel appointment
	$scope.cancelappoint = function (x, y) {
		$http({
				method: "POST",
				url: apiurl + "Patient/CancelAppointment",
				data: JSON.stringify({
					"Patient_ID": JSON.parse($cookies.get("subid")),
					"Type": y,
					"Visit_ID": x
				}),
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data);
					location.reload();
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//rate appointment
	$scope.rateappoint = function (x, y, z) {
		$http({
				method: "POST",
				url: apiurl + "Patient/RateAppointment",
				data: JSON.stringify({
					"Patient_ID": JSON.parse($cookies.get("subid")),
					"Type": x,
					"Visit_ID": y,
					"Rate": z
				}),
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data);
					location.reload();
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//find medication
	$scope.findmed = function (x) {
		$http({
				method: "GET",
				url: apiurl + "Collection/GetMedications?SearchString=" + x + "&PageNumber=1&NumberRecords=100&lang=" + lang,
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.foundmeds = response.data.Response.Areas;
					//(x);
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//find medication
	$scope.selectmed = function (x, y) {
		$scope.selectedmedname = x;
		$scope.selectedmedid = y;
	};
	//request med
	$scope.requestmed = function (a) {
		$cookies.putObject('reqmed', a);
		$location.path("/pharmacy");
	};
	//update medication
	$scope.updatemed = function (x, y, z, w) {
		//(x); //add or remove(true or false)
		//(y); //med id
		//(z); //name
		//(w); //dosage
		if (x) {
			$scope.newmedication.push({
				"Medicine_ID": y,
				"Name": z,
				"Dosage": w
			});
		} else {
			var i = 0;
			for (i; i < $scope.newmedication.length; i = i + 1) {
				//($scope.newmedication[i].Medicine_ID);
				if ($scope.newmedication[i].Medicine_ID === y) {
					//(i);
					$scope.newmedication.splice(i, 1);
				}
			}
		}
		//($scope.newmedication);
		$http({
				method: "POST",
				url: apiurl + "Patient/UpdateProfileMedications",
				data: JSON.stringify({
					"AllMedications": $scope.newmedication,
					"Patient_ID": JSON.parse($cookies.get("subid")),
					"lang": lang
				}),
				headers: {
					"UserID": JSON.parse($cookies.get("User_ID")),
					"Token": JSON.parse($cookies.get("accessToken"))
				}
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					location.reload();
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//goto page
	$scope.gotopage = function (x) {
		$('#regmodal').modal("hide");
		$location.path("/" + x);
	};
}]);
//redirectCtrl js
myApp.controller("redirectCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";
	var locationurl = window.location.href;
	if (locationurl.indexOf("DoctorUpdate") >= 0) {
		$scope.docupdate = true; // required url not found
	} else {
		$scope.isnotfound = true; // required url not found
	}
}]);
//404Ctrl js
myApp.controller("404Ctrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";
	//home page
	$scope.homepage = function () {
		$location.path("/");
	};
}]);
//updatedoctorCrtl js
myApp.controller("updatedoctorCrtl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
	"use strict";
	$scope.doctoken = window.location.href.slice((window.location.href.indexOf("DoctorUpdate/") + 13));
	//($scope.doctoken);
	$scope.docarabic = false;
	//time ready
	var h = 0,
		min = 0;
	$scope.hourinday = [];
	$scope.mininhour = [];
	for (h; h <= 23; h = h + 1) {
		$scope.hourinday.push(h);
	}
	for (min; min <= 59; min = min + 1) {
		$scope.mininhour.push(min);
	}
	//get doc id
	$http({
			method: "GET",
			url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/GetDoctorLoginData?DoctorToken=" + $scope.doctoken
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.docid = response.data.Response.UserDetails.DoctorID;
				$scope.docuserid = response.data.Response.UserDetails.User_ID;
				////($scope.docid);
				////($scope.docuserid);
			} else {
				$location.path("/notfound");
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			$location.path("/notfound");
			//(reason.data);
		});
	//get specialist
	$http({
			method: "GET",
			url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Specialities/GetSpecialities?PageNumber=1&NumberRecords=100"
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.specialists = response.data.Response;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get days
	$http({
			method: "GET",
			url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Days/GetDays?PageNumber=1&NumberRecords=10"
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.weekdays = response.data.Response;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get cities
	$http({
			method: "GET",
			url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Cities/GetCities?PageNumber=1&NumberRecords=100"
		})
		.then(function (response) {
			if (response.data.isSuccess) {
				//(response.data.Response);
				$scope.cities = response.data.Response;
			} else {
				$scope.errormsg = response.data.errorMessage;
				//($scope.errormsg);
			}
		}, function (reason) {
			//(reason.data);
		});
	//get area
	$scope.getarea = function (a) {
		$http({
				method: "GET",
				url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Areas/GetAreas?City_ID=" + a + "&PageNumber=1&NumberRecords=100"
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.areas = response.data.Response;
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//edit doctor details
	$scope.docdetails = function (a, b, c, d, e, f, g) { //docnumber arname enname specialityid docemail endescription ardescription
		$http({
				method: "POST",
				url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/DoUpdateDoctorDetails",
				data: JSON.stringify({
					"Doctor_ID": $scope.docid,
					"Mobile_Number": a,
					"Name_AR": b,
					"Name": c,
					"Speciality_ID": d,
					"Email": e,
					"Descrpition": f,
					"Descrpition_AR": g,
					"lang": lang
				})
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					$scope.docdatachanged = true;
					//(response.data);
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//create clinic list
	$scope.listofclinics = [];
	//add or remove clinic
	$scope.addremoveclinic = function (x, y, a, b, c, d, e, f, g, h, i, j, k) { //ClinicName, ClinicNameAR, ClinicPrice, ClinicAddress, ClinicAddressAR, ClinicCityID, ClinicAreaID, MobileNumber, ClinicLandLine, ClinicRequestsPerDay, ClinicDiscount
		////(x);//add or remove(true or false)
		if (x) {
			$scope.listofclinics.push({
				"Clinic_ID": 0,
				"Clinic_Name": a,
				"Clinic_Name_AR": b,
				"Price": c,
				"Address": d,
				"Address_AR": e,
				"City_ID": f,
				"Area_ID": g,
				"Mobile_Number": " ",
				"Land_Line": i,
				"Requests_Per_Day": j,
				"Discount": k
			});
		} else {
			var i = 0;
			for (i; i < $scope.listofclinics.length; i = i + 1) {
				//($scope.listofclinics[i].Clinic_ID);
				if ($scope.listofclinics[i].Clinic_ID === y) {
					////(i);
					$scope.listofclinics.splice(i, 1);
				}
			}
		}
		//($scope.listofclinics);
		$scope.ClinicName = "";
		$scope.ClinicNameAR = "";
		$scope.ClinicPrice = "";
		$scope.ClinicAddress = "";
		$scope.ClinicAddressAR = "";
		$scope.ClinicCityID = "";
		$scope.ClinicAreaID = "";
		$scope.MobileNumber = "";
		$scope.ClinicLandLine = "";
		$scope.ClinicRequestsPerDay = "";
		$scope.ClinicDiscount = "";
	};
	//update clinics
	$scope.sendclinics = function () {
		//($scope.listofclinics);
		//(JSON.stringify({
		//			"AllClinics": JSON.parse(angular.toJson($scope.listofclinics)),
		//			"Doctor_ID": $scope.docid,
		//			"lang": lang
		//		}));
		$http({
				method: "POST",
				url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/DoUpdateDoctorClinics",
				data: JSON.stringify({
					"AllClinics": JSON.parse(angular.toJson($scope.listofclinics)),
					"Doctor_ID": $scope.docid,
					"lang": lang
				})
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$http({
							method: "GET",
							url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/DoGetDoctorClinics?Doctor_ID=" + $scope.docid + "&PageNumber=1&NumberRecords=100&lang=" + lang
						})
						.then(function (response) {
							if (response.data.isSuccess) {
								//(response.data.Response);
								$scope.savedclinics = response.data.Response.Clinics;
							} else {
								$scope.errormsg = response.data.errorMessage;
								//($scope.errormsg);
							}
						}, function (reason) {
							//(reason.data);
						});
					$scope.clinicsaved = true;
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	$scope.daysofclinic = [];
	//add or remove clinic
	$scope.addschedul = function (a, b, c) {
		$scope.daysofclinic.push({
			"DayID": a,
			"From_Hour": JSON.stringify(b).substr(15, 8),
			"To_Hour": JSON.stringify(c).substr(15, 8)
		});
		////($scope.daysofclinic);
		$scope.wday = "";
		$scope.fromtime = "";
		$scope.totime = "";
	};
	//update clinic times
	$scope.saveclinicschedule = function (a) {
		$http({
				method: "POST",
				url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/DoUpdateDoctorTimes",
				data: JSON.stringify({
					"AllSlots": $scope.daysofclinic,
					"DoctorID": $scope.docid,
					"Clinic_ID": a
				})
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.daysofclinic.splice(0, $scope.daysofclinic.length);
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
	//Finish
	$scope.finish = function () {
		$http({
				method: "GET",
				url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/SendConfirmationMail?DoctorID=" + $scope.docid
			})
			.then(function (response) {
				if (response.data.isSuccess) {
					//(response.data.Response);
					$scope.mailsent = true;
				} else {
					$scope.errormsg = response.data.errorMessage;
					//($scope.errormsg);
				}
			}, function (reason) {
				//(reason.data);
			});
	};
}]);
myApp.controller('DocRegCtrl', function ($scope, $http) {

	//$('#SuccessModal').modal("show");
	$scope.Submit = false;
	$scope.DocNameEn = {};
	$scope.DocNameAr = {};
	$scope.Address = {};
	$scope.WorkAuthNo = {};
	$scope.landline = {};
	$scope.Email = {};
	$scope.MobileNum = {};
	$scope.location = {};
	$scope.tittleEn = {};
	$scope.tittleAr = {};
	$scope.SocialMedia = {};
	$scope.DescEn = {};
	$scope.DescAr = {};
	$http({
		method: "GET",
		url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Specialities/GetSpecialities?PageNumber=1&value&NumberRecords=1000"

	}).then(function (response) {
			//(response.data);
			$scope.AllSpecialiteis = response.data.Response;
		},
		function (response) {
			alert("Error");
		})
	$scope.GetSpecialityID = function (x) {
		$scope.SpecialistID = x;
	}
	$scope.docregister = function () {
		//($scope.SpecialistID);
		if ($scope.SpecialistID != 0 && $scope.SpecialistID != undefined) {
			$http({
				method: "POST",
				url: "http://yakensolution.cloudapp.net:80/LiveHealthyAdmin/api/Doctors/DoCreateDoctorRequest",
				header: 'content-type/application/json',
				data: {
					Consultant_ID: $scope.type,
					Description: $scope.DescEn.text,
					Description_AR: $scope.DescAr.text,
					Email: $scope.Email.text,
					Gender: $scope.Gender,
					Land_Line: $scope.landline.text,
					Mobile_Number: $scope.MobileNum.text,
					Name: $scope.DocNameEn.text,
					Name_AR: $scope.DocNameAr.text,
					Social_Media: $scope.SocialMedia.text,
					Speciality_ID: $scope.SpecialistID,
					Title: $scope.tittleEn.text,
					Title_AR: $scope.tittleAr.text,
					Work_Auth_No: $scope.WorkAuthNo.text,
				}
			}).then(function (response) {
					//($scope.WorkAuthNo.text);
					//($scope.DocNameEn.text);
					//($scope.DocNameAr.text);
					//($scope.Address.text);
					//($scope.Email.text);
					//($scope.MobileNum.text);
					//($scope.landline.text);
					//($scope.tittleEn.text);
					//($scope.tittleAr.text);
					//($scope.DescEn.text);
					//($scope.DescAr.text);
					//($scope.Gender);
					//($scope.type);
					//($scope.SpecialistID);
					//(response.data);
					if (response.data.isSuccess) {
						if (lang == "en")
							alert("We’re honored to have you as a member of our growing team, One of our medical affairs specialists will contact you to finalize your registration");
						else
							alert("يشرفنا انضمامكم لفريق عملنا المتنامي، سيقوم أحد ممثلي العلاقات الطبية بالتواصل معكم في أسرع وقت لإنهاء خطوات التسجيل")
					} else {
						alert(response.data.errorMessage);
					}
				},
				function (response) {
					//("Error");
				})


		}

	}
});