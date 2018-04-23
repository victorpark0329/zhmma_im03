jQuery.sap.require("jquery.sap.storage");
jQuery.sap.require("zhmmaim.util.Formatter");
jQuery.sap.require("zhmmaim.util.Commons");
jQuery.sap.require("zhmmaim.util.APP_CONTAINS");
sap.ui.controller("zhmmaim.controller.CompleteIO", {
	onInit: function() {
		oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		oStorage = [];
		oName = [];
		oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
		window.oUserInfo = oJQueryStorage.get("UserInfo");

		oImageAttachValue = "";

	},

	handleImageChange: function(oEvent) { //Image Attachment -Preview
		var oImageDiv = this.getView().byId("oImage");
		var file = oEvent.getParameter("files");
		var reader = new FileReader();
		reader.onload = function(oEvent) {
			var strURL = oEvent.target.result;
			oImageDiv.setSrc(strURL);
		}
		reader.readAsDataURL(file[0]);

		var reader = new FileReader();
		var binary = "";
		reader.onload = function(readerEvt) {
			var bytes = new Uint8Array(reader.result);
			var length = bytes.byteLength;
			for (var i = 0; i < length; i++) {
				binary += String.fromCharCode(bytes[i]);
			}
			oImageAttachValue = btoa(binary);
		}
		reader.readAsArrayBuffer(file[0]);
	},

	onUpload: function() { //Standard Attachment
		var oData = this.getView().byId("oUploadCollection").getItems();
		var name = [];
		var oAttachmentItem = [];
		for (i = 0; i < oData.length; i++) { //Standard Attachment
			var filename = oData[i].getFileName(), //FileName
				requestId = oData[i]._requestIdName, //Upload 슏닔
				fileIndex = oData[i]._internalFileIndexWithinFileUploader; // FileIndex

			var oAttachmentFile = oData[i].getParent()._aFileUploadersForPendingUpload[requestId - 1].oFileUpload.files;
			//console.log(oData[i].getParent()._aFileUploadersForPendingUpload[requestId-1].oFileUpload.files[fileIndex-1]);

			var value = [];
			//Convert to xstring
			var binary = "";
			var pt = this;
			var reader = new FileReader();

			reader.fileName = oAttachmentFile[fileIndex - 1].name;
			reader.onload = function(readerEvt) {
				if (!readerEvt) { //IE
				} else { //Chrome
					binaryString = readerEvt.target.result;
					binaryfileName = readerEvt.target.fileName;

					name.push(binaryfileName);
					oName = [];
					oName.push(name);

					value.push(btoa(binaryString));
					//Temp binary data
					oStorage = [];
					oStorage.push(value);
				}
			};
			reader.readAsBinaryString(oAttachmentFile[fileIndex - 1]);
		}

		//Image Attachment
	},

	onSubmitDialog: function(oEvent) {
		var error = zhmmaim.util.Commons.oRequiredField(oEvent);
		if (error === false) {
			// sap.m.MessageBox.alert("Required Field is empty", {
			// 		    title: "Warning",                                   
			// 		    onClose: null  ,                                      
			// 		    styleClass: "sapThemeNegativeText" ,                                   
			// 		    initialFocus: null,                                 
			// 		    textDirection: sap.ui.core.TextDirection.Inherit     
			// 		    });
			sap.m.MessageToast.show("Required Field is empty");
			return false;
		}
		if (!this.getView().byId("oIOCreateWF").getModel()) {
			//sap.m.MessageBox.alert("Missing Approval path. Please select it", {
			//     title: "Warning",                                   
			//     onClose: null  ,                                      
			//     styleClass: "sapThemeNegativeText" ,                                   
			//     initialFocus: null,                                 
			//     textDirection: sap.ui.core.TextDirection.Inherit     
			//     });
			sap.m.MessageToast.show("Missing Approval path. Please select it");
			return false;
			// error = false;
		}
		if (error === true) {
			this.onUpload();
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new sap.m.Text({
					text: 'Are you sure you want to submit?'
				}),
				beginButton: new sap.m.Button({
					text: 'Submit',
					press: [function(oEvent) {
						this.onSubmit(oEvent);
						dialog.close();
						oLocalStorage.remove("Attachment");
						oLocalStorage.remove("AttachName");
					}, this]
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
						oLocalStorage.remove("Attachment");
						oLocalStorage.remove("AttachName");
					}
				}),
				afterClose: function() {
					dialog.destroy();
					oLocalStorage.remove("Attachment");
					oLocalStorage.remove("AttachName");
				}
			});
			dialog.open();
		}
	},

	onSubmit: function(oEvent) {
		/*Date Time Formatting - ARDAT , ARZET(ApprLineNavi)*/
		var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyyMMdd"
			}),
			timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: "HHmmss"
			});

		ARDAT = dateFormat.format(new Date());
		ARZET = timeFormat.format(new Date());

		var ApprLineItem = [];

		var oIOCompleteWFLength = this.getView().byId("oIOCreateWF").getModel().getProperty('/0').length;

		for (var i = 0; i < oIOCompleteWFLength; i++) {
			if (i === 0) { //if approver,
				ARESULT = "1"; //ARESULT = Approved
				oContextARDAT = ARDAT; // save approval date
				oContextARZET = ARZET; // save approval time
			} else { //if another person,
				ARESULT = "";
				oContextARDAT = "";
				oContextARZET = "";
			}
			ApprLineItem.push({
				"BGTDOC": "",
				"BGTSEQ": (i + 1).toString(),
				"ARESULT": ARESULT,
				"BGTTYPE": "A",
				"ARDAT": oContextARDAT,
				"ARZET": oContextARZET,
				"APERNR": this.getView().byId("oIOCreateWF").getModel().getProperty('/0/' + i + '').USER_ID,
				"DUTY_CODE": this.getView().byId("oIOCreateWF").getModel().getProperty('/0/' + i + '').DUTY_CODE,
				"DUTY_NAME": this.getView().byId("oIOCreateWF").getModel().getProperty('/0/' + i + '').DUTY_NAME,
				"ENGLISH_NAME": this.getView().byId("oIOCreateWF").getModel().getProperty('/0/' + i + '').ENGLISH_NAME
			});
		};
		//console.log(ApprLineItem);

		if (this.getView().byId("oIOCreateCP").getModel()) {
			var oIOCompleteCPLength = this.getView().byId("oIOCreateCP").getModel().getProperty('/').length;
			//Cooperation Line Add
			for (var i = 0; i < oIOCompleteCPLength; i++) {
				ApprLineItem.push({
					"BGTDOC": "",
					"BGTSEQ": (oIOCompleteWFLength + i + 1).toString(),
					"ARESULT": "",
					"BGTTYPE": "C",
					"ARDAT": "",
					"ARZET": "",
					"APERNR": this.getView().byId("oIOCreateCP").getModel().getProperty('/' + i + '').USER_ID,
					"DUTY_CODE": this.getView().byId("oIOCreateCP").getModel().getProperty('/' + i + '').DUTY_CODE,
					"DUTY_NAME": this.getView().byId("oIOCreateCP").getModel().getProperty('/' + i + '').DUTY_NAME,
					"ENGLISH_NAME": this.getView().byId("oIOCreateCP").getModel().getProperty('/' + i + '').ENGLISH_NAME,
					"ORIREQ": "",
					"BTDTYPE2": "",
					"CO_SEQ": "",
				});
			};
			//console.log(ApprLineItem);
		}

		//var oIOCreatePaybackLength = this.getView().byId("oIOPayTB").getModel().getProperty('/IMIOROINavi/results').length,
		var oPayCells = this.getView().byId("oIOPayTB").getRows()[0].getCells();
		var IMIOPRROIItem = [];
		for (var i = 0; i < 10; i++) {
			IMIOPRROIItem.push({
				"BGTDOC": "",
				"BGTSEQ": "001",
				"GJAHR": this.getView().byId("GJAHR" + [i + 1]).getText(),
				"RTNAMT": oPayCells[i].getValue()
			});
		};
		//console.log(IMIOPRROIItem);

		/*Attachment*/
		var oAttachmentItem = [];

		if (this.getView().byId("oUploadCollection").getItems().length.toString() !== "0") {
			var oData = this.getView().byId("oUploadCollection").getItems();
			//var oStorageAttachmentLength = oLocalStorage.get("Attachment").length;
			var oStorageAttachmentLength = oStorage[0].length;
			for (i = 0; i < oStorageAttachmentLength; i++) {
				//var filename = oData[i].getFileName(); //FileName
				//console.log(oLocalStorage.get("Attachment")[i]);
				oAttachmentItem.push({
					"BGTDOC": "",
					"BGTSEQ": "1",
					"SEQ": (i + 1).toString(),
					"FTYPE": "G",
					"ID": oName[0][i],
					"VALUE": oStorage[0][i]
				});
			}
			//console.log(oAttachmentItem);
			//oLocalStorage.remove("Attachment");
		}

		if (this.getView().byId("oImage").getSrc()) {
			//console.log(oAttachmentItem.length)
			oAttachmentItem.push({
				"BGTDOC": "",
				"BGTSEQ": "1",
				"SEQ": (i + 1).toString(),
				"FTYPE": "I",
				"ID": this.getView().byId("oImageUploader").getValue(),
				"VALUE": oImageAttachValue
			});
		}
		//console.log(oAttachmentItem);

		var oEntry = {
			"BGTDOC": "", //Document Number
			"RDATE": ARDAT, //Today
			"PERNR": oUserInfo.PERNR, //USER
			"KOSTL": oUserInfo.KOSTL, //Cost Center
			"RTYPE": "CL", //Document Type
			"BTSTS": "S", //
			"BTSUBJ": this.getView().byId("KTEXT").getValue(), //Document Title,Description
			"APPRV": "X", //BPM O
			"USER_ID": oUserInfo.PERNR, //USER_ID
			"ARESULT": "1", //Claim User Event Result Variable
			"IMIOPRNavi": [{
				"BGTDOC": "", //Document Number
				"BGTSEQ": "001", //Document Sequence
				"RTYPE": "CL",
				"AUFNR": this.getView().byId("AUFNR").getValue(), //IO
				"KTEXT": this.getView().byId("KTEXT").getValue(), //Description
				"PURPO": this.getView().byId("PURPO").getValue(), //Purpose
				"USER5": dateFormat.format(this.getView().byId("USER5").getDateValue()), //[Plan]Approval
				"USER7": dateFormat.format(this.getView().byId("USER7").getDateValue()), //[Plan]PR
				"PODATE": dateFormat.format(this.getView().byId("PODATE").getDateValue()), //[Plan]PO
				"GRDATE": dateFormat.format(this.getView().byId("GRDATE").getDateValue()), //[Plan]GR
				"INSDATE": dateFormat.format(this.getView().byId("INSDATE").getDateValue()), //[Plan]Install
				"USER8": dateFormat.format(this.getView().byId("USER8").getDateValue()), //[Plan]Finish
				"A_APP_DATE": dateFormat.format(this.getView().byId("A_APP_DATE").getDateValue()), //[Actual]Approval
				"A_PRDATE": dateFormat.format(this.getView().byId("A_PRDATE").getDateValue()), //[Actual]PR
				"A_PODATE": dateFormat.format(this.getView().byId("A_PODATE").getDateValue()), //[Actual]PO
				"A_GRDATE": dateFormat.format(this.getView().byId("A_GRDATE").getDateValue()), //[Actual]GR
				"A_INSDATE": dateFormat.format(this.getView().byId("A_INSDATE").getDateValue()), //[Actual]Install
				"A_FINISH": dateFormat.format(this.getView().byId("A_FINISH").getDateValue()), //[Actual]Finish
				"EFFTA": this.getView().byId("EFFTA").getValue(), //Tangible
				"EFFIN": this.getView().byId("EFFIN").getValue(), //Intangible
				"TPLNR": this.getView().byId("TPLNR").getValue(), // Location
				"IMIOPRROINavi": IMIOPRROIItem, //ROI Item
				"IMIOPRFileNavi": oAttachmentItem //Attachment Item
			}],
			"IMApprLineNavi": ApprLineItem //Approval Line
		};
		//console.log(oEntry);
		sap.ui.core.BusyIndicator.show(10);

		/*OData Request SAVE Process*/
		OData.request({

				requestUri: sServiceUrl +
					"/IMApprHead(BGTDOC='0000000001')/?$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi,IMIOPRNavi/IMIOPRFileNavi",
				method: "GET",
				headers: {
					"X-Requested-With": 'X',
				}
			},
			function(data, response) {
				var oHeaders = {
					"X-Requested-With": 'X',
					'Accept': 'application/json',
				};

				OData.request({
						requestUri: sServiceUrl + "/IMApprHead",
						method: "POST",
						headers: oHeaders,
						data: oEntry
					},
					function(data, request) {
						//     sap.m.MessageBox.alert("Creation Successfully.", {
						// title: "Success",                                   
						// onClose: zhmmaim.util.Commons.onSubmitSuccess  ,                                      
						// styleClass: "sapThemePositiveText" ,                                   
						// initialFocus: null,                                 
						// textDirection: sap.ui.core.TextDirection.Inherit     
						// });
						sap.m.MessageToast.show("Created Successfully.", {
							onClose: zhmmaim.util.Commons.onSubmitSuccess
						});
					},
					function(err) {
						var message = JSON.parse(err.response.body);
						var errorMessage = message.error.innererror.errordetails;
						var allMessage = "";
						for (var i = 0; i < errorMessage.length; i++) {
							allMessage += errorMessage[i].message + ".  ";
						}

						//sap.ui.core.BusyIndicator.hide();
						// sap.m.MessageBox.show(allMessage, {
						// 	title: "Creation Fail",
						// 	onClose: zhmmaim.util.Commons.onSubmitFail,
						// 	styleClass: "sapThemeNegativeText",
						// 	initialFocus: null,
						// 	textDirection: sap.ui.core.TextDirection.Inherit
						// });
						sap.m.MessageToast.show(allMessage, {
							onClose: zhmmaim.util.Commons.onSubmitFail
						});
					}
				);
			},
			function(err) {
				var request = err.request;
				var response = err.response;
				alert("Error in Get -- Request " + request + " Response " + response);
			});
	},

	/*Calculate Even Revenue & ROI (If Changed) - Init Value input when IODefaultValue function works*/
	onAverage: function(oEvent) {
		var oContext = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oEvent.getParameter("liveValue")),
			oContextCells = oEvent.getSource().getParent().getCells(),
			oContextLength = oContextCells.length,
			oContextUSER4 = this.getView().byId("CompleteIOCommons").getModel().getProperty("/USER4"); //Est.Cost 媛

		var oSum = 0, // sum
			oAverage = 0, // average
			oROI = 0, //ROI
			oBlank = 0; // the cell count (RTNAMT = 0)

		/*TextField Number Validation - RTNAMT*/
		//oContext = oContext.replace(/[^\d]/g,'');
		oEvent.getSource().setValue(oContext);

		for (i = 0; i < oContextLength; i++) {
			var oContextRTNAMT = oContextCells[i].getValue();
			if (parseFloat(oContextRTNAMT)) { //if value exsits
				oSum += parseFloat(oContextRTNAMT);
			} else { // if value not exists or "0"
				oBlank++;
			}
		}
		var oGJAHRCount = (oContextLength) - oBlank; // the year count which has value
		//oAverage = oSum / oGJAHRCount
		if (oSum !== 0) {
			oAverage = oSum / oGJAHRCount;
		} else {

		}
		//oROI = USER4 / oAverage
		if (oAverage !== 0) {
			oROI = oContextUSER4 / oAverage;
		} else {
			oROI = "";
		}

		//Display on the Screen
		this.getView().byId("ROI").setValue(oROI);

		//console.log(oAverage);
		//console.log(oROI);
	},

	/*generatePDF:function(oEvent){
	    var doc = new jsPDF('portrait','pt','letter');
	    var pdfPart1 = $('#__xmlview3--IODisplay');
	    var pdfPart2 = $('#__xmlview3--IOExpectScheduleDisplay');
	    var pdfPart3 = $('#__xmlview3--IOActualScheduleDisplay');
	    
	    doc.addHTML(document.body,function(){
            doc.save('IOCompelete.pdf');
        });
	    
	    doc.addHTML(pdfPart1,function(){
	    	doc.output('save','IOComplete.pdf');
	    });
	}*/
});