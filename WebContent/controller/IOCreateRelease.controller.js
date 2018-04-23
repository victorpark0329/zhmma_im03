jQuery.sap.require("jquery.sap.storage");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("zhmmaim.util.Formatter");
jQuery.sap.require("zhmmaim.util.Commons");
jQuery.sap.require("zhmmaim.util.APP_CONTAINS");

sap.ui.controller("zhmmaim.controller.IOCreateRelease", {
	inputId: '',
	onInit: function() {
		oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		oStorage = [];
		oName = [];
		oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
		window.oUserInfo = oJQueryStorage.get("UserInfo");

		oImageAttachValue = "";

		var oIOPaybackData = [{
				"GJAHR": "",
				"RTNAMT": ""
			}, //this year
			{
				"GJAHR": "",
				"RTNAMT": ""
			}, {
				"GJAHR": "",
				"RTNAMT": ""
			}, {
				"GJAHR": "",
				"RTNAMT": ""
			}, {
				"GJAHR": "",
				"RTNAMT": ""
			}, {
				"GJAHR": "",
				"RTNAMT": ""
			}, {
				"GJAHR": "",
				"RTNAMT": ""
			}, {
				"GJAHR": "",
				"RTNAMT": ""
			}, {
				"GJAHR": "",
				"RTNAMT": ""
			}, {
				"GJAHR": "",
				"RTNAMT": ""
			}, //this year + 9
		];
		var oIOPaybackJSONModel = new sap.ui.model.json.JSONModel();
		oIOPaybackJSONModel.setData(oIOPaybackData);
		this.getView().byId("oIOPayTB").setModel(oIOPaybackJSONModel);

		//Add Existing Assest Token
		var oExistAssestToken = this.getView().byId("oExistAssestToken");

		oExistAssestToken.addValidator(function(args) {
			var text = args.text;
			return new sap.m.Token({
				key: text,
				text: text
			});
		});

		//Default Capital Date ( the Last day of this Year)
		var AKTIV = new Date(new Date().getFullYear(), 11, 31);
		this.getView().byId("AKTIV").setDateValue(AKTIV);

		//Default IM-IO Schedule Date (today)
		var TODAY = new Date();
		this.getView().byId("USER5").setDateValue(TODAY);

		//Default Payback Period Year (this year~ this year+10)
		var GJAHR = new Date().getFullYear(),
			oPayTBLength = this.getView().byId("oIOPayTB").getModel().getProperty('/').length;
		for (var i = 0; i < oPayTBLength; i++) {
			this.getView().byId("GJAHR" + [i + 1]).setText(parseInt(GJAHR) + parseInt([i]));
		}

		//Call Table Navigation Function
		zhmmaim.util.Commons.tableNavigation(this.getView().byId("oIOPayTB"), oIOPaybackJSONModel);

		/*Edit Block - input(Possible Entry) Field*/
		this.getView().onAfterRendering = function() {
			jQuery('input[aria-autocomplete=list]').each(function() {
				if (this.id === "__xmlview3--oExistAssestToken-inner") {} else {
					jQuery('#' + this.id).attr('disabled', true);
				}
			});
		};
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
		for (i = 0; i < oData.length; i++) {
			var filename = oData[i].getFileName(), //FileName
				requestId = oData[i]._requestIdName, //Upload 슏닔
				fileIndex = oData[i]._internalFileIndexWithinFileUploader; // FileIndex

			var oAttachmentFile = oData[i].getParent()._aFileUploadersForPendingUpload[requestId - 1].oFileUpload.files;
			//console.log(oData[i].getParent()._aFileUploadersForPendingUpload[requestId-1].oFileUpload.files[fileIndex-1]);

			var value = [];
			//Convert to xstring
			var reader = new FileReader();

			reader.fileName = oAttachmentFile[fileIndex - 1].name;

			//var binaryfileName = readerEvt.target.fileName;
			/*var binaryfileName = reader.fileName;
			name.push(binaryfileName);
			oName = [];
			oName.push(name);*/
			//oLocalStorage.put("AttachName",name);

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
			var readAsBinary = reader.readAsBinaryString(oAttachmentFile[fileIndex - 1]);
		}
	},

	onSubmitDialog: function(oEvent) {
		var error = zhmmaim.util.Commons.oRequiredField(oEvent);
		var oSwitchMOD = this.getView().byId("ASSET_MOD").getState();

		if (error === false) {
			// sap.m.MessageBox.alert("Required Field is empty", {
			// 	    title: "Warning",                                   
			// 	    onClose: null  ,                                      
			// 	    styleClass: "sapThemeNegativeText" ,                                   
			// 	    initialFocus: null,                                 
			// 	    textDirection: sap.ui.core.TextDirection.Inherit     
			// 	    });
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
		if (!this.getView().byId("USER5").getValue() || !this.getView().byId("USER7").getValue() || !this.getView().byId("USER8").getValue()) {
			// sap.m.MessageBox.alert("Schedule Date Field is empty", {
			// 	    title: "Warning",                                   
			// 	    onClose: null  ,                                      
			// 	    styleClass: "sapThemeNegativeText" ,                                   
			// 	    initialFocus: null,                                 
			// 	    textDirection: sap.ui.core.TextDirection.Inherit     
			// 	    });

			sap.m.MessageToast.show("Schedule Date Field is empty");
			return false;
			// error = false;
		}
		if (oSwitchMOD === true && this.getView().byId("oExistAssestToken").getTokens().length === 0) {
			// sap.m.MessageBox.alert("Existing Assest Field is empty", {
			// 	    title: "Warning",                                   
			// 	    onClose: null  ,                                      
			// 	    styleClass: "sapThemeNegativeText" ,                                   
			// 	    initialFocus: null,                                 
			// 	    textDirection: sap.ui.core.TextDirection.Inherit     
			// 	    });

			sap.m.MessageToast.show("Existing Assest Field is empty");
			this.getView().byId("oExistAssestToken").setValueState(sap.ui.core.ValueState.Error);
			return false;
			// error = false;
		} else {
			this.getView().byId("oExistAssestToken").setValueState(sap.ui.core.ValueState.Success);
		}

		if (error === true) {
			this.onUpload();
			this.getView().byId("oExistAssestToken").setValueState(sap.ui.core.ValueState.Success);
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

	/*Creation IO Submit Process*/
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

		/*Approval&Cooperation Line*/
		var oIOCreateWFLength = this.getView().byId("oIOCreateWF").getModel().getProperty('/0').length;

		//Approval Line Add
		for (var i = 0; i < oIOCreateWFLength; i++) {
			/*initial Requester's ATYPE = "A", Default ATYPE = "Q" */
			//if(i===0){ATYPE="A";}else{ATYPE="";}
			if (i === 0) { // if approver,
				ARESULT = "1"; //ARESULT = Approved
				oContextARDAT = ARDAT; // save approval date 
				oContextARZET = ARZET; // save approval time
			} else { // if another person
				ARESULT = "";
				oContextARDAT = "";
				oContextARZET = "";
			}
			ApprLineItem.push({
				"BGTDOC": "",
				"BGTSEQ": (i + 1).toString(),
				//"ATYPE":ATYPE,
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

		//console.log(ApprLineItem.length);

		if (this.getView().byId("oIOCreateCP").getModel()) {
			var oIOCreateCPLength = this.getView().byId("oIOCreateCP").getModel().getProperty('/').length;
			//Cooperation Line Add
			for (var i = 0; i < oIOCreateCPLength; i++) {
				ApprLineItem.push({
					"BGTDOC": "",
					"BGTSEQ": (oIOCreateWFLength + i + 1).toString(),
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
						//oLocalStorage.get("Attachment")[i]
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

		/*ROI*/
		var oIOCreatePaybackLength = this.getView().byId("oIOPayTB").getModel().getProperty('/').length,
			oPayCells = this.getView().byId("oIOPayTB").getRows()[0].getCells();
		var IMIOPRROIItem = [];

		for (var i = 0; i < oIOCreatePaybackLength; i++) {
			IMIOPRROIItem.push({
				"BGTDOC": "",
				"BGTSEQ": "001",
				"GJAHR": this.getView().byId("GJAHR" + [i + 1]).getText(),
				"RTNAMT": oPayCells[i].getValue()
			});
		};

		//console.log(IMIOPRROIItem);
		/*Asset Item*/
		var TokensLength = this.getView().byId("oExistAssestToken").getTokens().length;
		var IMIOPRAssetItem = [];
		for (var i = 0; i < TokensLength; i++) {
			IMIOPRAssetItem.push({
				"BGTDOC": "",
				"BGTSEQ": "001",
				"SEQ": (i + 1).toString(),
				"ANLN1": this.getView().byId("oExistAssestToken").getTokens()[i].getText()
			});
		};

		/*Disposal of Existing Asset Value Range*/
		var ASSET_DIS = this.getView().byId("ASSET_DIS").getSelectedIndex();
		if (ASSET_DIS === 0) {
			ASSET_DIS = "Y";
		} else if (ASSET_DIS === 1) {
			ASSET_DIS = "N";
		};

		/*Already Approved*/
		var oContextAPPROVED = this.getView().byId("APPROVED").getChecked();
		if (oContextAPPROVED === true) {
			APPROVED = "Y";
		} else {
			APPROVED = "";
		}

		var oEntry = {
			"BGTDOC": "", //Document Number
			"RDATE": ARDAT, //Today
			"PERNR": oUserInfo.PERNR, //USER 
			"KOSTL": oUserInfo.KOSTL, //Cost Center
			"RTYPE": "IO", // Document Type
			"BTSTS": "S", //
			"BTSUBJ": this.getView().byId("KTEXT").getValue(), //Document Title, Description
			"APPRV": "X", //BPM O
			"USER_ID": oUserInfo.PERNR, //USER_ID
			"ARESULT": "1", //Claim User Event Result Variable
			"IMIOPRNavi": [{
				"BGTDOC": "", //Document Number
				"BGTSEQ": "001", //Document Sequence
				"RTYPE": "IO", //Document Type
				"APPROVED": APPROVED, // Already Approved
				"BGTYPE": this.getView().byId("IOTypeSelect").getSelectedKey(), //IO Type
				"USER4": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("USER4").getValue()), // Estimate Cost
				"POSID": this.getView().byId("POSID").getValue(), // Project ID
				"GJAHR": this.getView().byId("Year").getValue(), // Project Year
				"WERKS": this.getView().byId("WERKS").getValue(), // Plant code
				"WERKSD": this.getView().byId("WERKSD").getValue(), // Plant Description
				"KOSTV": this.getView().byId("KOSTV").getValue(), // CC.Request 
				"KOSTVD": this.getView().byId("KOSTVD").getValue(), // CC.Request Description
				"AKSTL": this.getView().byId("AKSTL").getValue(), // CC.Response
				"AKSTLD": this.getView().byId("AKSTLD").getValue(), // CC.Response Description
				"USER0": this.getView().byId("USER0").getValue(), //Applicant
				"USER1": this.getView().byId("USER1").getValue(), // Applicant Telephone
				"USER2": this.getView().byId("USER2").getValue(), // Person.Responsible
				"KTEXT": this.getView().byId("KTEXT").getValue(), // Description
				"PURPO": this.getView().byId("PURPO").getValue(), // Purpose
				"USER5": dateFormat.format(this.getView().byId("USER5").getDateValue()), //[Plan]Approval 
				"USER7": dateFormat.format(this.getView().byId("USER7").getDateValue()), //[Plan]PR
				"PODATE": dateFormat.format(this.getView().byId("PODATE").getDateValue()), //[Plan]PO
				"GRDATE": dateFormat.format(this.getView().byId("GRDATE").getDateValue()), //[Plan]GR
				"INSDATE": dateFormat.format(this.getView().byId("INSDATE").getDateValue()), //[Plan]Install
				"USER8": dateFormat.format(this.getView().byId("USER8").getDateValue()), //[Plan]Finish
				"IVPRO": this.getView().byId("IVPRO").getValue(), //IM.Profile
				"IVPROD": this.getView().byId("IVPROD").getValue(), //IM.Profile Description
				"IZWEK": this.getView().byId("IZWEK").getValue(), //IM.Reason
				"IZWEKD": this.getView().byId("IZWEKD").getValue(), //IM.Reason Description
				"ANLKL": this.getView().byId("ANLKL").getValue(), //Asset Class
				"ANLKLD": this.getView().byId("ANLKLD").getValue(), //Asset Class Description
				"AKTIV": dateFormat.format(this.getView().byId("AKTIV").getDateValue()), //Capital.Date
				"TXT50": this.getView().byId("TXT50").getValue(), //Asset Name
				"EFFTA": this.getView().byId("EFFTA").getValue(), //Tangible
				"EFFIN": this.getView().byId("EFFIN").getValue(), //Intangible
				"TPLNR": this.getView().byId("TPLNR").getValue(), //Location
				"ASSET_DIS": ASSET_DIS, //Disposal of existing asset
				"IMIOPRROINavi": IMIOPRROIItem, //ROI Item
				"IMIOPRFileNavi": oAttachmentItem, //Attachment Item
				"IMIOPRAssetNavi": IMIOPRAssetItem //Asset Item
			}],
			"IMApprLineNavi": ApprLineItem //Approval Line Item
		};
		//console.log(oEntry);

		sap.ui.core.BusyIndicator.show(10);

		/*OData Request SAVE Process*/
		OData.request({

				requestUri: sServiceUrl +
					"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi",
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
						// sap.m.MessageBox.show("Creation Successfully.", {
						// 	title: "Success",
						// 	onClose: zhmmaim.util.Commons.onSubmitSuccess,
						// 	styleClass: "sapThemePositiveText",
						// 	initialFocus: null,
						// 	textDirection: sap.ui.core.TextDirection.Inherit
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

	POSIDDefaultValue: function(oEvent) {

		var oContextPOSID = this.getView().byId("POSID").getId().split('--')[1],
			oContextPOSNR = this.getView().byId("POSID").getValue(),
			// oContextGJAHR = oEvent.getSource().getValue();
			oContextGJAHR = this.getView().byId("Year").getValue();

		if (oContextGJAHR === "") {
			this.getView().byId("Year").setValueState(sap.ui.core.ValueState.Error);
			return;
		} else {
			this.getView().byId("Year").setValueState(sap.ui.core.ValueState.Success);
		}

		var back_oContextPOSNR = oContextPOSNR;
		if (oEvent.sId === "valueHelpRequest") {
			this.getView().byId("POSID").setValue("");
		}

		//oContextKOSTL = this.getView().byId("KOSTL").getValue();
		if (!this.getView().byId("POSID").getValue()) { //if POSID field is empty and input YEAR field - dialog
			//if YEAR field is empty and input POSID field - validation
			//if YEAR field is not empty and input POSID field - validation
			oContextPOSID = oContextPOSID.toUpperCase();
			oContextPOSID = oContextPOSID.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');

			var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl_Code, true);
			var oJsonModel = new sap.ui.model.json.JSONModel();

			oModel.read("IMCodeCommon/?", null, ["$filter=FIELD_NAME eq '" + oContextPOSID + "' and PERNR eq '" + oUserInfo.PERNR +
					"' and GJAHR eq '" + oContextGJAHR + "'"
				], false,
				function(oData, response) {
					oJsonModel.setData(oData);
				});

			inputId = this.getView().byId("POSID").getId();
			var oIOPossibleEntry = new sap.ui.xmlfragment("zhmmaim.fragment.PossibleEntryDialog", this);
			oIOPossibleEntry.open();
			oIOPossibleEntry.setModel(oJsonModel);
			this.getView().byId("POSID").setValue(back_oContextPOSNR);

		} else { //if POSID field is not empty and input YEAR field -  validation
			//console.log(oContextPOSNR)
			//console.log(oContextGJAHR)
			//Remove Special Charater when Input POSID
			oContextPOSNR = oContextPOSNR.toUpperCase();
			oContextPOSNR = oContextPOSNR.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');

			var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl, true);
			var oJsonModel = new sap.ui.model.json.JSONModel();

			console.log(encodeURIComponent(oContextPOSNR))

			oModel.read("/IMIODefault(POSNR='" + encodeURIComponent(oContextPOSNR) + "',GJAHR='" + oContextGJAHR + "',PERNR='" + oUserInfo.PERNR +
				"')", null, null, false,
				function(oData, response) {
					oJsonModel.setData(oData);
				});

			this.getView().byId("IOCreationCommons").setModel(oJsonModel);

			$("#__xmlview3--POSID-inner").focus();

			if (oJsonModel.getProperty("/TYPE") === "E") { //if Type = E , print the Error Message and  change valueState to error
				var Message = oJsonModel.getProperty("/MESSAGE");
				this.getView().byId("POSIDD").setValue(Message);
				this.getView().byId("POSID").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("POSID").setValue("");
				oEvent.getSource().setValue("");
				return;
			} else {
				this.getView().byId("POSID").setValueState(sap.ui.core.ValueState.Success);

				//Change the IZWEK & WERKS value to bind
				this.getView().byId("POSIDD").setValue(oJsonModel.getData().POSIDD);
				this.getView().byId("IVPRO").setValue(oJsonModel.getData().IVPRO);
				this.getView().byId("IZWEK").setValue(oJsonModel.getData().IZWEK);
				this.getView().byId("WERKS").setValue(oJsonModel.getData().WERKS);
				this.getView().byId("KOSTV").setValue(oJsonModel.getData().KOSTV);
				this.getView().byId("AKSTL").setValue(oJsonModel.getData().AKSTL);
				this.getView().byId("ANLKL").setValue(oJsonModel.getData().ANLKL);

				//Asset Name Default Value
				this.getView().byId("TXT50").setValue(oJsonModel.getData().KTEXT);

				//Applicant
				/*this.getView().byId("USER0").setValue(oJsonModel.getData().AKSTLD);*/

				//Person.Responsive
				this.getView().byId("USER2").setValue(oUserInfo.PERNR);

				/*FireChange Function - Year Field*/
				this.getView().byId("Year").$().find('INPUT').keypress(function(oEvent) {
					if (oEvent.keyCode === 13) {
						this.getView().byId("Year").fireChange({});
					}
					if (this.getView().byId("oIOCreateWF").getModel()) {
						this.getView().byId("oIOCreateWF").getModel().setData("");
					}
					if (this.getView().byId("oIOCreateCP").getModel()) {
						this.getView().byId("oIOCreateCP").getModel().setData("");
					}
				}.bind(this));

				this.getView().byId("Year").$().find('INPUT').click(function(oEvent) {
					//reset approval and cooperation line
					//this.getView().byId("POSID").setValue("");
					this.getView().byId("Year").setValue("");
				}.bind(this));
			}
		}
	},

	POSNRDefaultValue: function(oEvent) {
		var oContextPOSNR = this.getView().byId("POSID").getValue(),
			oContextGJAHR = this.getView().byId("Year").getValue(),
			oContextUSER4 = this.getView().byId("USER4").getValue(),
			oContextC_Balance = this.getView().byId("C_Balance").getText();

		oContextPOSNR = oContextPOSNR.toUpperCase();
		oContextPOSNR = oContextPOSNR.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');

		if (oContextPOSNR && oContextGJAHR) {
			var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl, true);
			var oJsonModel = new sap.ui.model.json.JSONModel();
			oModel.read("/IMIODefault(POSNR='" + encodeURIComponent(oContextPOSNR) + "',GJAHR='" + oContextGJAHR + "',PERNR='" + oUserInfo.PERNR +
				"')", null, null, false,
				function(oData, response) {
					oJsonModel.setData(oData);
				});

			this.getView().byId("IOCreationCommons").setModel(oJsonModel);

			$("#__xmlview3--POSID-inner").focus();

			if (oJsonModel.getProperty("/TYPE") === "E") { //if Type = E , print the Error Message and  change valueState to error
				var Message = oJsonModel.getProperty("/MESSAGE");
				this.getView().byId("POSIDD").setValue(Message);
				this.getView().byId("POSID").setValueState(sap.ui.core.ValueState.Error);
				if (oContextPOSNR && oContextGJAHR) {
					this.getView().byId("POSID").setValue("");
					this.getView().byId("Year").setValue("");
				}
			} else {
				this.getView().byId("POSID").setValueState(sap.ui.core.ValueState.Success);

				//Change the IZWEK & WERKS value to bind
				this.getView().byId("POSID").setValue(oJsonModel.getData().POSID);
				this.getView().byId("POSIDD").setValue(oJsonModel.getData().POSIDD);
				this.getView().byId("IVPRO").setValue(oJsonModel.getData().IVPRO);
				this.getView().byId("IZWEK").setValue(oJsonModel.getData().IZWEK);
				this.getView().byId("WERKS").setValue(oJsonModel.getData().WERKS);
				this.getView().byId("KOSTV").setValue(oJsonModel.getData().KOSTV);
				this.getView().byId("AKSTL").setValue(oJsonModel.getData().AKSTL);
				this.getView().byId("ANLKL").setValue(oJsonModel.getData().ANLKL);
				//Asset Name Default Value
				this.getView().byId("TXT50").setValue(oJsonModel.getData().KTEXT);
				//Applicant
				/*this.getView().byId("USER0").setValue(oJsonModel.getData().AKSTLD);*/

				//Person.Responsive
				this.getView().byId("USER2").setValue(oUserInfo.USER_ID);

				/*FireChange Function - POSID Field*/
				/*Fire Approval& Cooperation Function - POSID Field*/
				this.getView().byId("POSID").$().find('INPUT').keypress(function(oEvent) {
					if (oEvent.keyCode === 13) {
						this.getView().byId("POSID").fireChange({});
					}
					if (this.getView().byId("oIOCreateWF").getModel()) {
						this.getView().byId("oIOCreateWF").getModel().setData("");
					}
					if (this.getView().byId("oIOCreateCP").getModel()) {
						this.getView().byId("oIOCreateCP").getModel().setData("");
					}
				}.bind(this));

				this.getView().byId("Year").$().find('INPUT').click(function(oEvent) {
					//reset approval and cooperation line
					this.getView().byId("POSID").setValue("");
					this.getView().byId("Year").setValue("");
				}.bind(this));
			}
		} else {}
		//if change the USER4 field value,
		if (oContextUSER4) {
			var RP_oContextUSER4 = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextUSER4),
				oContextRC_Balance = this.getView().byId("C_Balance").getText(),
				FloatC_Balance = zhmmaim.util.Formatter.CurrencyFormatter(oContextC_Balance),
				ErrorState = sap.ui.core.ValueState.Error,
				SuccessState = sap.ui.core.ValueState.Success;
			//Check the Balance Amount
			if (parseFloat(RP_oContextUSER4) > parseFloat(oContextRC_Balance)) {
				// sap.m.MessageBox.alert("Budget Balance is " + this.getView().byId("C_Balance").getText() + " , Try Again.", {
				// 	    title: "Warning",                                   
				// 	    onClose: null  ,                                      
				// 	    styleClass: "sapThemeNegativeText" ,                                   
				// 	    initialFocus: null,                                 
				// 	    textDirection: sap.ui.core.TextDirection.Inherit     
				// 	    });

				sap.m.MessageToast.show("Budget Balance is " + this.getView().byId("C_Balance").getText() + " , Try Again.");

				this.getView().byId("USER4").setValueState(ErrorState);
				this.getView().byId("USER4").setValue("");

			} else {
				this.getView().byId("USER4").setValueState(SuccessState);
				this.getView().byId("USER4").setValue(oContextUSER4);
			}
		}
	},

	/*Calculate Even Revenue & ROI*/
	onAverage: function(oEvent) {
		/*Calculate Payback Period*/
		var oContext = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oEvent.getParameter("liveValue")),
			oContextCells = oEvent.getSource().getParent().getCells(),
			oContextLength = oContextCells.length,
			oContextUSER4 = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("USER4").getValue()); //Est.Cost 媛

		var oSum = 0, // Sum
			oAverage = 0, // Average
			oROI = 0, //ROI
			oBlank = 0; // The cell count( RTNAMT = 0 )

		/*TextField Number Validation - RTNAMT*/
		oEvent.getSource().setValue(oContext);

		for (i = 0; i < oContextLength; i++) {
			var oContextRTNAMT = oContextCells[i].getValue();
			if (parseFloat(oContextRTNAMT)) { //if value is not empty,
				oSum += parseFloat(oContextRTNAMT);
			} else { // if value is empty or "0"
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
			oROI = oROI.toFixed(2);
		} else {
			oROI = "";
		}

		//Display on the Screen
		//this.getView().byId("EvenRev").setValue(oAverage);
		this.getView().byId("ROI").setValue(oROI);

		//console.log(oAverage);
		//console.log(oROI);
	},

	onAlreadyAP: function(oEvent) {
		/*WorkFlow Initialize*/
		if (this.getView().byId("oIOCreateWF").getModel()) {
			this.getView().byId("oIOCreateWF").getModel().setData("");
		}
		if (this.getView().byId("oIOCreateCP").getModel()) {
			this.getView().byId("oIOCreateCP").getModel().setData("");
		}
	},

	/*Set Asset Name same with the Description of the Position ID*/
	handleLiveChange: function(oEvent) {
		var sValue = oEvent.getParameter("value");
		this.getView().byId("TXT50").setValue(sValue);
	},
});