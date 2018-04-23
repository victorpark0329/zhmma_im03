jQuery.sap.require("jquery.sap.storage");
jQuery.sap.require("zhmmaim.util.Formatter");
jQuery.sap.require("zhmmaim.util.Commons");
jQuery.sap.require("zhmmaim.util.APP_CONTAINS");

sap.ui.controller("zhmmaim.controller.CreatePR", {
	inputId: '',
	onInit: function() {
		oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
		oStorage = [];
		oName = [];
		oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		window.oUserInfo = oJQueryStorage.get("UserInfo");

		var sData = {
			/*Vendor Default Line(4)*/
			supplierData: [{
				"supplier": "supplier 1",
				"LIFNR": "",
				"NAME1": "",
				"NETWR": "",
				"ZSABE": "",
				"TEL_NUMBER": "",
				"ACCEPT": "",
				"KVERM": ""
			}, {
				"supplier": "supplier 2",
				"LIFNR": "",
				"NAME1": "",
				"NETWR": "",
				"ZSABE": "",
				"TEL_NUMBER": "",
				"ACCEPT": "",
				"KVERM": ""
			}, {
				"supplier": "supplier 3",
				"LIFNR": "",
				"NAME1": "",
				"NETWR": "",
				"ZSABE": "",
				"TEL_NUMBER": "",
				"ACCEPT": "",
				"KVERM": ""
			}, {
				"supplier": "supplier 4",
				"LIFNR": "",
				"NAME1": "",
				"NETWR": "",
				"ZSABE": "",
				"TEL_NUMBER": "",
				"ACCEPT": "",
				"KVERM": ""
			}],
			/*MM Item Default Line(4)*/
			itemData: [{
					"MATNR": "",
					"MAKTX": "",
					"MENGE": "",
					"MEINS": "",
					"PREIS": "",
					"TOT": ""
				}, {
					"MATNR": "",
					"MAKTX": "",
					"MENGE": "",
					"MEINS": "",
					"PREIS": "",
					"TOT": ""
				}, {
					"MATNR": "",
					"MAKTX": "",
					"MENGE": "",
					"MEINS": "",
					"PREIS": "",
					"TOT": ""
				}, {
					"MATNR": "",
					"MAKTX": "",
					"MENGE": "",
					"MEINS": "",
					"PREIS": "",
					"TOT": ""
				}
				// ,
				// {"MATNR":"","MAKTX":"","MENGE":"","MEINS":"","PREIS":"","TOT":""},
				// {"MATNR":"","MAKTX":"","MENGE":"","MEINS":"","PREIS":"","TOT":""},
				// {"MATNR":"","MAKTX":"","MENGE":"","MEINS":"","PREIS":"","TOT":""}
			]
		};

		var oJsonModel = new sap.ui.model.json.JSONModel();
		oJsonModel.setData(sData);
		this.getView().byId("oSupplierTB").setModel(oJsonModel);
		this.getView().byId("oItemTB").setModel(oJsonModel);
		this.getView().byId("oSupplierTB").bindRows("/supplierData");
		this.getView().byId("oItemTB").bindRows("/itemData");

		//Default RDATE/LFDAT (today)
		var TODAY = new Date();
		this.getView().byId("LFDAT").setDateValue(TODAY);

		//Default Ship to Location(WERKS) - Favorite Table
		//oData List
		var oModel = new sap.ui.model.odata.ODataModel(
			sServiceUrl_Code, true);
		var oJsonModel = new sap.ui.model.json.JSONModel();

		oModel.read("IMFavorite?", null, ["$filter=PERNR eq '" + oUserInfo.PERNR + "' and FIELD_NAME eq 'WERKS'"], false,
			function(oData, response) {
				oJsonModel.setData(oData);
			});

		//this.getView().byId("WERKS").setModel(oJsonModel);
		//console.log(oJsonModel);
		this.getView().byId("WERKS").setValue(oJsonModel.getProperty("/results/0/INPUT"));
		this.getView().byId("WERKSD").setValue(oJsonModel.getProperty("/results/0/TEXT"));
		//this.getView().byId("WERKS").setValue(oJsonModel.getData().WERKS);

		var oLGORTJsonModel = new sap.ui.model.json.JSONModel();

		oModel.read("IMFavorite?", null, ["$filter=PERNR eq '" + oUserInfo.PERNR + "' and FIELD_NAME eq 'LGORT'"], false,
			function(oData, response) {
				oLGORTJsonModel.setData(oData);
			});

		this.getView().byId("LGORT").setValue(oLGORTJsonModel.getProperty("/results/0/INPUT"));
		this.getView().byId("LGORTD").setValue(oLGORTJsonModel.getProperty("/results/0/TEXT"));

		var oEKGRPJsonModel = new sap.ui.model.json.JSONModel();

		oModel.read("IMFavorite?", null, ["$filter=PERNR eq '" + oUserInfo.PERNR + "' and FIELD_NAME eq 'EKGRP'"], false,
			function(oData, response) {
				oEKGRPJsonModel.setData(oData);
			});

		this.getView().byId("EKGRP").setValue(oEKGRPJsonModel.getProperty("/results/0/INPUT"));
		this.getView().byId("EKGRPD").setValue(oEKGRPJsonModel.getProperty("/results/0/TEXT"));

		//Default Approval Line(not use)
		/*    var sServiceUrl ="http://haeccd00.hmma.hmgc.net:8000/sap/opu/odata/SAP/Z_IM_APPROVAL_SRV/";
		    var oModel = new sap.ui.model.odata.ODataModel(
		        sServiceUrl,true);
		    var oJsonModel = new sap.ui.model.json.JSONModel();
		    var items = [];

		    oModel.read("IMPRApprLine?",null,["$filter=USER_ID eq '"+oUserInfo.PERNR+"' and DOC_TYPE eq 'PR'"],false,
		        function(oData,response){
		      //Results Set -> 0 Set
		      for(var key in oData){
		        items.push(oData[key]);
		      }
		    });
		    oJsonModel.setData(items);
		    this.getView().byId("oIOCreateWF").setModel(oJsonModel);*/

		/*Call Table Navigation Function*/
		zhmmaim.util.Commons.tableNavigation(this.getView().byId("oSupplierTB"), oJsonModel);
		zhmmaim.util.Commons.tableNavigation(this.getView().byId("oItemTB"), oJsonModel);

		/*Edit Block - input(Possible Entry) Field*/
		this.getView().onAfterRendering = function() {
			jQuery('input[aria-autocomplete=list]').each(function() {
				jQuery('#' + this.id).attr('disabled', true);
			});
		};
	},

	/*Supplier code default value */
	supplierDefaultValue: function(oEvent) {
		var oContextLIFNR = oEvent.getSource().getValue();

		/*Converts a string to uppercase letters */
		oContextLIFNR = oContextLIFNR.toUpperCase();
		oEvent.getSource().setValue(oContextLIFNR);

		var oModel = new sap.ui.model.odata.ODataModel(
			sServiceUrl_Code, true);
		var oJsonModel = new sap.ui.model.json.JSONModel();
		oModel.read("IMVendor(LIFNR='" + oContextLIFNR + "')", null, null, false,
			function(oData, response) {
				oJsonModel.setData(oData);
			});

		this.getView().byId("PRSupplierDisplay").setModel(oJsonModel);

		var NAME1 = this.getView().byId("PRSupplierDisplay").getModel().getData().NAME1,
			TEL_NUMBER = this.getView().byId("PRSupplierDisplay").getModel().getData().TEL_NUMBER,
			ZSABE = this.getView().byId("PRSupplierDisplay").getModel().getData().ZSABE;

		var VenderCells = oEvent.getSource().getParent().getCells();
		VenderCells[2].setValue(NAME1);
		VenderCells[5].setValue(TEL_NUMBER);
		VenderCells[6].setValue(ZSABE);
	},

	/*Meterial code default value*/
	MeterialDefaultValue: function(oEvent) {
		var oContextMATNR = oEvent.getSource().getValue();

		/*Converts a string to uppercase letters */
		oContextMATNR = oContextMATNR.toUpperCase();
		oEvent.getSource().setValue(oContextMATNR);

		var oModel = new sap.ui.model.odata.ODataModel(
			sServiceUrl_Code, true);
		var oJsonModel = new sap.ui.model.json.JSONModel();
		oModel.read("IMMaterial(MATNR='" + oContextMATNR + "')", null, null, false,
			function(oData, response) {
				oJsonModel.setData(oData);
			});

		this.getView().byId("PRItemDisplay").setModel(oJsonModel);
		var MAKTX = this.getView().byId("PRItemDisplay").getModel().getData().MAKTX,
			MEINS = this.getView().byId("PRItemDisplay").getModel().getData().MEINS;

		var MeterialCells = oEvent.getSource().getParent().getCells();
		//console.log(MeterialCells)
		MeterialCells[1].setValue(MAKTX);
		MeterialCells[3].setValue(MEINS);

		// if (oContextMATNR !== "") {
		// 	MeterialCells[6].setVisible(true); 
		// } else {
		// 	MeterialCells[6].setVisible(false); 
		// }
	},

	addMeterialItemRow: function(oEvent) {
		var oMeterialItemTB = this.getView().byId("oItemTB"),
			oPath = oMeterialItemTB.getBinding().getPath(),
			oModel = oMeterialItemTB.getModel().getProperty(oPath);
		//console.log(oModel);
		oModel.push({
			"MATNR": "",
			"MAKTX": "",
			"MENGE": "",
			"MEINS": "",
			"PREIS": "",
			"TOT": ""
		});
		oMeterialItemTB.getModel().setProperty("/modelData", oModel);
		oMeterialItemTB.bindRows("/modelData");
	},

	onUpload: function() {
		var oData = this.getView().byId("oUploadCollection").getItems();
		var name = [];
		var oAttachmentItem = [];

		for (i = 0; i < oData.length; i++) {
			var filename = oData[i].getFileName(), //FileName
				requestId = oData[i]._requestIdName, //Upload count
				fileIndex = oData[i]._internalFileIndexWithinFileUploader; // FileIndex

			var oAttachmentFile = oData[i].getParent()._aFileUploadersForPendingUpload[requestId - 1].oFileUpload.files;
			//console.log(oData[i].getParent()._aFileUploadersForPendingUpload[requestId-1].oFileUpload.files[fileIndex-1]);

			var value = [];
			//Convert to xstring
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
			var readAsBinary = reader.readAsBinaryString(oAttachmentFile[fileIndex - 1]);
		}
	},

	onSubmitDialog: function(oEvent) {
		var error = zhmmaim.util.Commons.oRequiredField(oEvent);
		if (error === false) {
			//sap.m.MessageBox.alert("Required Field is empty", {
			//    title: "Warning",
			//    onClose: null  ,
			//    styleClass: "sapThemeNegativeText" ,
			//    initialFocus: null,
			//    textDirection: sap.ui.core.TextDirection.Inherit
			//    });

			sap.m.MessageToast.show("Required Field is empty");
			return false;

		}
		if (!this.getView().byId("oIOCreateWF").getModel()) {
			//sap.m.MessageBox.alert("Missing Approval path. Please select it", {
			//   title: "Warning",
			//   onClose: null  ,
			//   styleClass: "sapThemeNegativeText" ,
			//   initialFocus: null,
			//   textDirection: sap.ui.core.TextDirection.Inherit
			//   });

			sap.m.MessageToast.show("Missing Approval path. Please select it");
			return false;

			// error = false;
		}
		//Supplier Table
		/*var supplier = false;
		for(i=0;i<4;i++){
		  if(this.getView().byId("oSupplierTB").getRows()[i].getCells()[1].getValue()){
		    supplier = true;
		    break;
		  }
		}
		if(supplier === false){
		  sap.m.MessageBox.alert("Supplier Table is empty", {
		      title: "Warning",
		      onClose: null  ,
		      styleClass: "sapThemeNegativeText" ,
		      initialFocus: null,
		      textDirection: sap.ui.core.TextDirection.Inherit
		      });
		  error = false;
		}*/

		var materialtable = false;
		var oMaterialTableId = this.getView().byId("oItemTB"),
			oMaterailTableLength = oMaterialTableId.getModel().getProperty("/itemData").length;
		for (i = 0; i < oMaterailTableLength; i++) {
			if (oMaterialTableId.getRows()[i].getCells()[0].getValue() !== "" || oMaterialTableId.getRows()[i].getCells()[1].getValue() !== "") {
				materialtable = true;
				break;
			}
		}
		if (materialtable === false) {
			//sap.m.MessageBox.alert("Material Table is empty", {
			//    title: "Warning",
			//    onClose: null  ,
			//    styleClass: "sapThemeNegativeText" ,
			//    initialFocus: null,
			//    textDirection: sap.ui.core.TextDirection.Inherit
			//    });

			sap.m.MessageToast.show("Material Table is empty");
			return false;

			// error = false;
		}

		//Material Table
		var material = true;
		var oMaterialId = this.getView().byId("oItemTB");
		var oMaterialItems = oMaterialId.getModel().getProperty("/itemData");
		var oMaterailLength = oMaterialId.getModel().getProperty("/itemData").length;

		jQuery.each(oMaterialItems, function(key, value) {
			if (value.MATNR !== "" || value.MAKTX !== "") {
				//and qty,unit,@price,Net Amount not exist
				if (value.MENGE !== "" && value.MEINS !== "" && value.PREIS !== "" && value.TOT !== "") {} else {
					material = false;
				}
			} else { //when MM#, Description not exist,
				if (value.MENGE !== "" || value.MEINS !== "" || value.PREIS !== "" || value.TOT !== "") {
					material = false;
				} else {
					//Do Nothing
				}
			}
		});

		/*    for(i=0;i<oMaterailLength-1;i++){
		      //when MM# , Description exist
		      if(oMaterialId.getRows()[i].getCells()[0].getValue() !== ""
		        || oMaterialId.getRows()[i].getCells()[1].getValue() !== ""){
		        //and qty,unit,@price,Net Amount not exist
		        if(oMaterialId.getRows()[i].getCells()[2].getValue() !==""
		          &&oMaterialId.getRows()[i].getCells()[3].getValue() !==""
		          &&oMaterialId.getRows()[i].getCells()[4].getValue() !==""
		          &&oMaterialId.getRows()[i].getCells()[5].getValue() !=="")
		          {
		            //DO NOTHING
		          } else{
		            material = false;
		          }
		      }else{//when MM#, Description not exist,
		        if(oMaterialId.getRows()[i].getCells()[2].getValue() !==""
		          ||oMaterialId.getRows()[i].getCells()[3].getValue() !==""
		          ||oMaterialId.getRows()[i].getCells()[4].getValue() !==""
		          ||oMaterialId.getRows()[i].getCells()[5].getValue() !==""){
		          material = false;
		        }else{
		        }
		      }
		    } */
		if (material === false) {
			//sap.m.MessageBox.alert("Required Field in the Material Table is empty.", {
			//    title: "Warning",
			//    onClose: null  ,
			//    styleClass: "sapThemeNegativeText" ,
			//    initialFocus: null,
			//    textDirection: sap.ui.core.TextDirection.Inherit
			//    });

			sap.m.MessageToast.show("Required Field in the Material Table is empty.");
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
	/*Creation PR Submit Process*/
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
		var oContextApproved = "";
		var oPRCreateWFLength = this.getView().byId("oIOCreateWF").getModel().getProperty('/0').length;

		for (var i = 0; i < oPRCreateWFLength; i++) {
			/*initial Requester's ATYPE = "A", Default ATYPE = "Q" */
			//if(i===0){ATYPE="A";}else{ATYPE="";}
			if (i === 0) { // if approver,
				ARESULT = "1"; //ARESULT = Approved
				oContextARDAT = ARDAT; //save approval date
				oContextARZET = ARZET; //save approval time
			} else { // if another person,
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
			//console.log(ApprLineItem);

			if (this.getView().byId("oIOCreateCP").getModel()) { //if cooperation exists
				var oPRCreateCPLength = this.getView().byId("oIOCreateCP").getModel().getProperty('/').length;
				//Cooperation Line Add
				for (var i = 0; i < oPRCreateCPLength; i++) {
					ApprLineItem.push({
						"BGTDOC": "",
						"BGTSEQ": (oPRCreateWFLength + i + 1).toString(),
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
		}

		var oPRSupplierLength = this.getView().byId("oSupplierTB").getModel().getProperty('/supplierData').length;
		var IMIOPRSupplierItem = [];
		for (var i = 0; i < oPRSupplierLength; i++) {
			IMIOPRSupplierItem.push({
				"BGTDOC": "",
				"BGTSEQ": "001",
				"SEQ": (i + 1).toString(),
				"LIFNR": this.getView().byId("oSupplierTB").getModel().getProperty('/supplierData/' + i + '').LIFNR,
				"NAME1": this.getView().byId("oSupplierTB").getModel().getProperty('/supplierData/' + i + '').NAME1,
				"NETWR": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("oSupplierTB").getModel().getProperty(
					'/supplierData/' + i + '').NETWR),
				"ZSABE": this.getView().byId("oSupplierTB").getModel().getProperty('/supplierData/' + i + '').ZSABE,
				"TEL_NUMBER": this.getView().byId("oSupplierTB").getModel().getProperty('/supplierData/' + i + '').TEL_NUMBER,
				"ACCEPT": this.getView().byId("oSupplierTB").getModel().getProperty('/supplierData/' + i + '').ACCEPT,
				"KVERM": this.getView().byId("oSupplierTB").getModel().getProperty('/supplierData/' + i + '').KVERM
			});
		};
		//console.log(IMIOPRSupplierItem);

		var oPRMaterialLength = this.getView().byId("oItemTB").getModel().getProperty('/itemData').length;
		var IMIOPRMaterialItem = [];
		for (var i = 0; i < oPRMaterialLength; i++) {
			if (this.getView().byId("oItemTB").getModel().getProperty('/itemData/' + i + '').MATNR ||
				this.getView().byId("oItemTB").getModel().getProperty('/itemData/' + i + '').MAKTX) {
				IMIOPRMaterialItem.push({
					"BGTDOC": "",
					"BGTSEQ": "001",
					"SEQ": (i + 1).toString(),
					"MATNR": this.getView().byId("oItemTB").getModel().getProperty('/itemData/' + i + '').MATNR,
					"MAKTX": this.getView().byId("oItemTB").getModel().getProperty('/itemData/' + i + '').MAKTX,
					"MENGE": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("oItemTB").getModel().getProperty('/itemData/' + i +
						'').MENGE),
					"MEINS": this.getView().byId("oItemTB").getModel().getProperty('/itemData/' + i + '').MEINS,
					"PREIS": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("oItemTB").getModel().getProperty('/itemData/' + i +
						'').PREIS),
					"TOT": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("oItemTB").getModel().getProperty('/itemData/' + i +
						'').TOT)
				});
			}
		};
		//console.log(IMIOPRMaterialItem);

		/*Attachment*/
		var oAttachmentItem = [];
		var aItems = this.getView().byId("oUploadCollection").getItems();

		if (aItems.length.toString() !== "0") { //if uploaded files exist
			if (oStorage[0]) { //add new uploaded files
				var oStorageAttachmentLength = oStorage[0].length;
				for (i = 0; i < oStorageAttachmentLength; i++) {
					oAttachmentItem.push({
						"BGTDOC": "",
						"BGTSEQ": "1",
						"SEQ": (i + 1).toString(), //seq
						"FTYPE": "G", //general attachment
						"ID": oName[0][i], //filename
						"VALUE": oStorage[0][i] //xstring value of file
					});
				}
			}
		}

		var ogItems = this.getView().byId("oAlreadyUpload").getItems();

		for (var i = 0; i < ogItems.length; i++) { //add original uploaded files
			var dPath = ogItems[i].getBindingContext().sPath;
			oAttachmentItem.push({
				"BGTDOC": "",
				"BGTSEQ": "1",
				"SEQ": (oAttachmentItem.length + 1).toString(), //seq
				"FTYPE": this.getView().byId("oAlreadyUpload").getModel().getProperty(dPath).FTYPE, //origin  ftpoe
				"ID": this.getView().byId("oAlreadyUpload").getModel().getProperty(dPath).ID, //origin filename
				"VALUE": this.getView().byId("oAlreadyUpload").getModel().getProperty(dPath).VALUE, //origin xstring value,
				"URI": this.getView().byId("oAlreadyUpload").getModel().getProperty(dPath).URI //origin uri
			});
		}

		var oEntry = {
			"BGTDOC": "", //Document Number
			"RDATE": ARDAT, //Today
			"PERNR": oUserInfo.PERNR, //USER
			"KOSTL": oUserInfo.KOSTL, //Cost Center
			"RTYPE": "PR", //Document Type
			"BTSTS": "S",
			"BTSUBJ": this.getView().byId("KTEXT").getValue(), //Document Title,Description
			"APPRV": "X", //BPM O
			"USER_ID": oUserInfo.PERNR, //USER_ID
			"ARESULT": "", // Claim User Event Result Variable
			"IMIOPRNavi": [{
				"BGTDOC": "", //Document Number
				"BGTSEQ": "001", //Document Sequence
				"RTYPE": "PR", //Document Type
				"APPROVED": oContextApproved, // Already Approved
				"AUFNR": this.getView().byId("AUFNR").getValue(), //IO
				"KTEXT": this.getView().byId("KTEXT").getValue(), //Description
				"PURPO": this.getView().byId("PURPO").getValue(), //Purpose
				"WERKS": this.getView().byId("WERKS").getValue(), //Ship to Loc
				"WERKSD": this.getView().byId("WERKSD").getValue(), //Ship to Loc Description
				"LGORT": this.getView().byId("LGORT").getValue(), //Storage location
				"LGORTD": this.getView().byId("LGORTD").getValue(), //Storage location Description
				"EKGRP": this.getView().byId("EKGRP").getValue(), //purchasing group
				"EKGRPD": this.getView().byId("EKGRPD").getValue(), //purchasing group Description
				"LFDAT": dateFormat.format(this.getView().byId("LFDAT").getDateValue()), //Need to date
				"IMIOPRFileNavi": oAttachmentItem, //Attachment Item
				"IMIOPRVendorNavi": IMIOPRSupplierItem, //Vendor Item
				"IMIOPRItemNavi": IMIOPRMaterialItem //Material Item
			}],
			"IMApprLineNavi": ApprLineItem //Approval Line Item
		};
		//console.log(oEntry);

		sap.ui.core.BusyIndicator.show(10);

		/*OData Request SAVE Process*/
		OData.request({

				requestUri: sServiceUrl +
					"/IMApprHead(BGTDOC='0000000001')/?$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi",
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
						//      sap.m.MessageBox.alert("Creation Successfully.", {
						//    title: "Success",
						//    onClose: zhmmaim.util.Commons.onSubmitSuccess,
						//    styleClass: "sapThemePositiveText" ,
						//    initialFocus: null,
						//    textDirection: sap.ui.core.TextDirection.Inherit
						//});

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

	/*MM Item Table Qty*@Price = New Amount Auto Calculation Field*/
	onSum: function(oEvent) {
		var oContext = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oEvent.getParameter("liveValue")),
			oContextId = oEvent.getSource().getId(),
			oTOTCells = oEvent.getSource().getParent().getCells();

		oContext = zhmmaim.util.Formatter.CurrencyFormatter(oContext);

		var oTable = this.getView().byId("oItemTB"),
			oIndex = oEvent.getSource().getParent().getIndex(),
			nSum = 0;

		/*TextField Number Validation - MENGE*/
		oEvent.getSource().setValue(oContext);
		if (zhmmaim.util.Formatter.GetElementById(oContextId) === 'MENGE') {
			/*Calculate the New Amount*/
			oContextMENGE = oContext;
			oContextPREIS = oTable.getContextByIndex(oIndex).getProperty("PREIS");

			if (oContextMENGE === "") {
				oContextMENGE = "0";
			}
			if (oContextPREIS === "") {
				oContextPREIS = "0";
			}
			oContextMENGE = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextMENGE);
			oContextPREIS = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextPREIS);

			nSum = parseInt(oContextMENGE) * parseFloat(oContextPREIS);
			nSum = nSum.toFixed(2);
			nSum = zhmmaim.util.Formatter.CurrencyFormatter(nSum);
			oTOTCells[5].setValue(nSum);
		} else if (zhmmaim.util.Formatter.GetElementById(oContextId) === 'PREIS') {
			/*Calculate the New Amount*/
			oContextMENGE = oTable.getContextByIndex(oIndex).getProperty("MENGE");
			oContextPREIS = oContext;
			if (oContextMENGE === "") {
				oContextMENGE = "0";
			}
			if (oContextPREIS === "") {
				oContextPREIS = "0";
			}

			oContextMENGE = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextMENGE);
			oContextPREIS = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextPREIS);

			nSum = parseInt(oContextMENGE) * parseFloat(oContextPREIS);
			nSum = nSum.toFixed(2);
			nSum = zhmmaim.util.Formatter.CurrencyFormatter(nSum);
			oTOTCells[5].setValue(nSum);
		}
		var oTOTCellsLength = oTable.getModel().getProperty("/itemData").length,
			nTOTA = 0,
			C_Balance = this.getView().byId("AUFNRD").getValue();
		for (i = 0; i < oTOTCellsLength; i++) {
			var oTOTValue = oTable.getModel().getProperty('/itemData')[i].TOT;
			if (oTOTValue === "") {
				oTOTValue = "0";
			}
			nTOTA += parseFloat(oTOTValue);
		}
		this.getView().byId("TOTA").setText(nTOTA);
		//zhmmaim.util.Commons.onPRCheckAmount(nTOTA,C_Balance,oEvent.getSource(),oTOTCells);
	},

	/*Alreadry Approval function*/
	onAlreadyAP: function(oEvent) {
		var oAlreadyAP = this.getView().byId("APPROVED").getChecked();
		if (oAlreadyAP === true) { //Check
			//oData List
			var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl, true);
			var oJsonModel = new sap.ui.model.json.JSONModel();

			oModel.read("AutowayAPPR?", null, ["$filter=USER_ID eq '" + oUserInfo.PERNR + "' and DOC_TYPE eq 'IO'"], false,
				function(oData, response) {
					oJsonModel.setData(oData);
				});
			//console.log(oJsonModel.getProperty('/results')[0]);
			this.getView().byId("oIOCreateWF").setModel(oJsonModel);

			//Disable WORKFLOW TAB
			//console.log(this.getView().byId("oIOCreateWF").getParent());
			this.getView().byId("oIOCreateWF").getParent().setEnabled(false)
		} else { //Non Check
			this.getView().byId("oIOCreateWF").getParent().setEnabled(true)
		}
	},

	onDeletePRItem: function(oEvent) {
		var sPath = oEvent.getSource().getParent().getBindingContext().sPath,
			model = this.getView().byId("oItemTB").getModel(),
			data = model.getProperty("/itemData");
		sPath = sPath.substring(sPath.lastIndexOf('/') + 1);
		data.splice(parseInt(sPath), 1);

		// var oMeterialItemTB = this.getView().byId("oItemTB"),
		// oPath = oMeterialItemTB.getBinding().getPath(),
		// oModel = oMeterialItemTB.getModel().getProperty(oPath);
		// //console.log(oModel);
		// oModel.push({"MATNR":"","MAKTX":"","MENGE":"","MEINS":"","PREIS":"","TOT":""});
		// oMeterialItemTB.getModel().setProperty("/modelData",oModel);
		// oMeterialItemTB.bindRows("/modelData");

		//model.refresh();
		model.setProperty('/itemData', data);
	},

});