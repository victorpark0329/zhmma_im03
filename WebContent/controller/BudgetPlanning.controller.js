jQuery.sap.require("jquery.sap.storage");
jQuery.sap.require("zhmmaim.util.Formatter");
jQuery.sap.require("zhmmaim.util.Commons");
jQuery.sap.require("zhmmaim.util.APP_CONTAINS");

sap.ui.controller("zhmmaim.controller.BudgetPlanning", {
	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf zhmmaim.BudgetPlanning
	 */
	onInit: function() {
		oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
		oStorage = [];
		oName = [];
		oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		window.oUserInfo = oJQueryStorage.get("UserInfo");

		//Default Project Year (GJAHR)
		var GJAHR = new Date().getFullYear();
		this.getView().byId("GJAHR").setValue(GJAHR);

		//BGTSEQ Flag 
		window.BGTSEQ = 001;

		oImageAttachValue = "";

		//Detail Item Table Binding
		var oJSONModel = new sap.ui.model.json.JSONModel([]);
		this.getView().byId("oDetaTB").setModel(oJSONModel);

		/*Edit Block - input Field*/
		this.getView().onAfterRendering = function() {
			jQuery('input[aria-autocomplete=list]').each(function() {
				jQuery('#' + this.id).attr('disabled', true);
			});
		};
	},

	/* Function - Open ABP Create Dialog*/
	onABPCreate: function(oEvent) {
		/*Input Field Required*/
		var error = zhmmaim.util.Commons.oRequiredField(oEvent);
		if (error === false) { // Required Field does not input
			// sap.m.MessageBox.alert("You Should Input Project Code.", {
			// 	    title: "Warning",                                   
			// 	    onClose: null  ,                                      
			// 	    styleClass: "sapThemeNegativeText" ,                                   
			// 	    initialFocus: null,                                 
			// 	    textDirection: sap.ui.core.TextDirection.Inherit     
			// 	    });

			sap.m.MessageToast.show("You Should Input Project Code.");
			return false;

		} else { //if Required Field is not empty
			/*Using ABP Create Dialog Fragment*/
			var oABPCreateDialog = new sap.ui.xmlfragment("zhmmaim.fragment.ABPCreateDialog", this);
			oABPCreateDialog.open();

			/*Edit Block - Possible Entry Field*/
			jQuery('input[aria-autocomplete=list]').each(function() {
				jQuery('#' + this.id).attr('disabled', true);
			});

			var oContextZPROJ = this.getView().byId("ZPROJ").getValue(); //Main Screen ZPROJ
			sap.ui.getCore().byId("ZPROJ01").setValue(oContextZPROJ); //Create Screen ZPROJ

			/*ABP Detail Item Initial Data*/
			var oABPDetailData = [{
				MATNR: "",
				MAKTX: "",
				PREIS: "",
				MENGE: "",
				TAX: "",
				SHIPPING: "",
				TOT: ""
			}, {
				MATNR: "",
				MAKTX: "",
				PREIS: "",
				MENGE: "",
				TAX: "",
				SHIPPING: "",
				TOT: ""
			}, {
				MATNR: "",
				MAKTX: "",
				PREIS: "",
				MENGE: "",
				TAX: "",
				SHIPPING: "",
				TOT: ""
			}];

			/*ABP Detail Payback Initial Data*/
			var oABPPaybackData = [{
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
			/*ABP Detail Monthly Plan Data*/
			var oABPMonthlyData = [{
				"WTP01": "",
				"WTP02": "",
				"WTP03": "",
				"WTP04": "",
				"WTP05": "",
				"WTP06": "",
				"WTP07": "",
				"WTP08": "",
				"WTP09": "",
				"WTP10": "",
				"WTP11": "",
				"WTP12": ""
			}];

			/*ABP Detail Item Initial Data Binding*/

			var oABPDetailItemJSONModel = new sap.ui.model.json.JSONModel();
			oABPDetailItemJSONModel.setData(oABPDetailData);
			sap.ui.getCore().byId("oABPCreateItemTB").setModel(oABPDetailItemJSONModel);

			/*ABP Detail Payback Initial Data Binding*/

			var oABPPaybackJSONModel = new sap.ui.model.json.JSONModel();
			oABPPaybackJSONModel.setData(oABPPaybackData);
			sap.ui.getCore().byId("oABPPayTB").setModel(oABPPaybackJSONModel);

			/*ABP Detail Monthly Plan Data Binding*/
			var oABPMonthlyJSONModel = new sap.ui.model.json.JSONModel();
			oABPMonthlyJSONModel.setData(oABPMonthlyData);
			sap.ui.getCore().byId("oABPMonthTB").setModel(oABPMonthlyJSONModel);

			/*Default Payback Period Year(this year ~ this year+10)*/
			var GJAHR = new Date().getFullYear(),
				oPayTBLength = sap.ui.getCore().byId("oABPPayTB").getModel().getProperty('/').length;
			for (var i = 0; i < oPayTBLength; i++) {
				sap.ui.getCore().byId("GJAHR" + [i + 1]).setText(parseInt(GJAHR) + parseInt([i]));
			}

			/*Call Table Navigation Function*/
			zhmmaim.util.Commons.tableNavigationDialog(sap.ui.getCore().byId("oABPCreateItemTB"), oABPDetailItemJSONModel);
			zhmmaim.util.Commons.tableNavigationDialog(sap.ui.getCore().byId("oABPPayTB"), oABPPaybackJSONModel);
			zhmmaim.util.Commons.tableNavigationDialog(sap.ui.getCore().byId("oABPMonthTB"), oABPMonthlyJSONModel);

			//oData List(Default Value using PERNR)
			var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl_Code, true);
			var oJsonModel = new sap.ui.model.json.JSONModel();

			oModel.read("IMDefault?", null, ["$filter=PERNR eq '" + oUserInfo.PERNR + "'"], false,
				function(oData, response) {
					oJsonModel.setData(oData);
				});

			sap.ui.getCore().byId("oABPCreateDialog").setModel(oJsonModel);

			/*Binding Odata*/
			var oContextDefault = oJsonModel.getProperty("/results/0");

			sap.ui.getCore().byId("IZWEK").setValue(oContextDefault.IZWEK); //IM.Reason
			sap.ui.getCore().byId("IZWEKD").setValue(oContextDefault.IZWEKD); //IM.Reason Description
			sap.ui.getCore().byId("VKOSTL").setValue(oContextDefault.VKOSTL); //CC.Response
			sap.ui.getCore().byId("VKOSTLD").setValue(oContextDefault.VKOSTLD); //CC.Response Description
			sap.ui.getCore().byId("USR03").setValue(oContextDefault.USR03); //USR03
			sap.ui.getCore().byId("USR03D").setValue(oContextDefault.USR03D); //USR03D Description
			sap.ui.getCore().byId("SIZECL").setValue(oContextDefault.SIZECL); //Scale
			sap.ui.getCore().byId("SIZECLD").setValue(oContextDefault.SIZECLD); //Scale Description
			sap.ui.getCore().byId("PRIORI").setValue(oContextDefault.PRIORI); //Priority
			sap.ui.getCore().byId("PRIORID").setValue(oContextDefault.PRIORID); //Priority Description
			sap.ui.getCore().byId("USR02").setValue(oContextDefault.USR02); //Category
			sap.ui.getCore().byId("USR02D").setValue(oContextDefault.USR02D); //Category Description
			sap.ui.getCore().byId("USR00").setValue(oContextDefault.USR00); //Asset Class
			sap.ui.getCore().byId("USR00D").setValue(oContextDefault.USR00D); //Asset Class Description
			sap.ui.getCore().byId("WERKS").setValue(oContextDefault.WERKS); //Plant
			sap.ui.getCore().byId("WERKSD").setValue(oContextDefault.WERKSD); //Plant Description
		}
	},

	/* 
	 * 
	 * Budget Planning(Items) Save Process
	 * 
	 * */

	/*Upload File Items*/
	onUpload: function() {
		var oData = sap.ui.getCore().byId("oUploadCollection").getItems();
		var name = [];
		var oAttachmentItem = [];
		for (i = 0; i < oData.length; i++) {
			var filename = oData[i].getFileName(), //FileName
				requestId = oData[i]._requestIdName, //Upload count
				fileIndex = oData[i]._internalFileIndexWithinFileUploader, // FileIndex
				documentId = oData[i].getDocumentId(); //documentId(FTYPE)

			if (!documentId) { //if exists,
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
		}
	},

	/*Before send to sapui5 user can modify the document*/
	onUpdateDialog: function(oEvent) {
		var error = zhmmaim.util.Commons.oRequiredFieldDialog(oEvent);
		if (error == false) {
			// sap.m.MessageBox.alert("Required Field is empty",{
			// 	title:"Warning",
			// 	onClose:null,
			// 	styleClass:"sapThemeNegativeText",
			// 	initialFocus:null,
			// 	textDirection:sap.ui.core.TextDirection.Inherit
			// });

			sap.m.MessageToast.show("Required Field is empty");
			return false;

		}
		if (!sap.ui.getCore().byId("GDATU").getValue() || !sap.ui.getCore().byId("WDATU").getValue() || !sap.ui.getCore().byId("USR09").getValue()) {
			// sap.m.MessageBox.alert("Schedule Date is empty",{
			// 	title:"Warning",
			// 	onClose:null,
			// 	styleClass:"sapThemeNegativeText",
			// 	initialFocus:null,
			// 	textDirection:sap.ui.core.TextDirection.Inherit
			// });

			sap.m.MessageToast.show("Schedule Date is empty");
			return false;

			// error=false;

		}
		if (sap.ui.getCore().byId("TOTA").getValue() == "" || sap.ui.getCore().byId("TOTA").getValue() == "0") {
			// sap.m.MessageBox.alert("ABP Planning Item is empty",{
			// 	title:"Warning",
			// 	onClose:null,
			// 	styleClass:"sapThemeNegativeText",
			// 	initialFocus:null,
			// 	textDirection:sap.ui.core.TextDirection.Inherit
			// });

			sap.m.MessageToast.show("ABP Planning Item is empty");
			return false;

			// error=false;
		}

		var monthly = false;
		for (i = 0; i < 12; i++) { //if Monthly Plan Empty
			if (sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[i].getValue() !== "") {
				monthly = true;
				break;
			}
		}
		if (monthly == false) {
			// sap.m.MessageBox.alert("Montly Plan is empty",{
			// 	title:"Warning",
			// 	onClose:null,
			// 	styleClass:"sapThemeNegativeText",
			// 	initialFocus:null,
			// 	textDirection:sap.ui.core.TextDirection.Inherit
			// });

			sap.m.MessageToast.show("Montly Plan is empty");
			return false;
		}

		var oMonthlyTOT = 0;
		for (i = 0; i < 12; i++) {
			if (sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[i].getValue() !== "") {
				var oContextMonthlyEach = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[
					i].getValue());
				oMonthlyTOT = parseFloat(oMonthlyTOT) + parseFloat(oContextMonthlyEach);
			}
		}

		if (oMonthlyTOT !== Number(zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("TOTA").getValue()))) { //Monthly Amount !== TOTA
			// sap.m.MessageBox.alert("Monthly Amount and Total Amount are different.", {
			// 	    title: "Warning",                                   
			// 	    onClose: null  ,                                      
			// 	    styleClass: "sapThemeNegativeText" ,                                   
			// 	    initialFocus: null,                                 
			// 	    textDirection: sap.ui.core.TextDirection.Inherit     
			// 	    });

			sap.m.MessageToast.show("Monthly Amount and Total Amount are different.");
			return false;

			// error = false;
		}

		if (error === true) {
			this.onUpload();
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new sap.m.Text({
					text: 'Are you sure you want to update?'
				}),
				beginButton: new sap.m.Button({
					text: 'Save',
					press: [function(oEvent) {
						this.onUpdateABPItem(oEvent);
						dialog.close();
					}, this]
				}),

				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		}
	},

	onUpdateABPItem: function(oEvent) {
		var oModRow = oJQueryStorage.get("abpMod");

		/*IMABPDetaNavi*/
		var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyyMMdd"
			}),
			timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: "HHmmss"
			});
		/*IMABPROINavi*/
		var oPayCells = sap.ui.getCore().byId("oABPPayTB").getRows()[0].getCells(),
			oABPCreatePaybackLength = oPayCells.length;
		var IMABPROIItem = [];

		for (var i = 0; i < oABPCreatePaybackLength; i++) {
			IMABPROIItem.push({
				"BGTDOC": "",
				"BGTSEQ": BGTSEQ.toString(),
				"GJAHR": sap.ui.getCore().byId("GJAHR" + [i + 1]).getText(),
				"RTNAMT": oPayCells[i].getValue()
			});
		};

		/*IMABPItemNavi*/
		var oABPItemLength = sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/').length;
		var IMABPItem = [];
		for (var i = 0; i < oABPItemLength; i++) {
			//console.log(sap.ui.getCore().byId("oABPCreateItemTB").getModel())
			if (sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i + '').MATNR) {
				IMABPItem.push({
					"BGTDOC": "",
					"BGTSEQ": BGTSEQ.toString(),
					"SEQ": (i + 1).toString(),
					"MATNR": sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i + '').MATNR,
					"MAKTX": sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i + '').MAKTX,
					"MENGE": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i +
						'').MENGE),
					"PREIS": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i +
						'').PREIS),
					//"MEINS":sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/'+i+'').MEINS,
					"TAX": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i +
						'').TAX),
					"SHIPPING": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' +
						i + '').SHIPPING),
					"TOT": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i +
						'').TOT)
				});
			}
		};

		/*IMABPFileNavi*/
		//1.New File
		var oAttachmentItem = [];
		var aItems = sap.ui.getCore().byId("oUploadCollection").getItems();
		if (aItems.length.toString() !== "0") {
			if (oStorage[0]) {
				var oStorageAttachmentLength = oStorage[0].length;
				for (var i = 0; i < oStorageAttachmentLength; i++) {
					oAttachmentItem.push({
						"BGTDOC": "",
						"BGTSEQ": BGTSEQ.toString(),
						"SEQ": (i + 1).toString(),
						"FTYPE": "G",
						"ID": oName[0][i],
						"VALUE": oStorage[0][i]
					});
				}
			}
		}

		//2.Original File
		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].getDocumentId()) {
				var dPath = aItems[i].getBindingContext().sPath;
				oAttachmentItem.push({
					"BGTDOC": "",
					"BGTSEQ": BGTSEQ.toString(),
					"SEQ": (oAttachmentItem.length + 1).toString(), //seq
					"FTYPE": "G",
					"ID": sap.ui.getCore().byId("oABPCreateDialog").getModel().getProperty(dPath).ID,
					"VALUE": sap.ui.getCore().byId("oABPCreateDialog").getModel().getProperty(dPath).VALUE
				});
			}
		}

		var exists = true;
		//Image Attachment
		for (var i = 0; i < oAttachmentItem.length; i++) {
			if (oAttachmentItem[i].FTYPE == "I") { //if already exists,
				oAttachmentItem[i].ID = sap.ui.getCore().byId("oImageUploader").getValue();
				oAttachmentItem[i].VALUE = oImageAttachValue;
				exists = false;
			} else { // if not exists
			}
		}

		if (exists == true) {
			oAttachmentItem.push({
				"BGTDOC": "",
				"BGTSEQ": "1",
				"SEQ": (i + 1).toString(),
				"FTYPE": "I",
				"ID": sap.ui.getCore().byId("oImageUploader").getValue(),
				"VALUE": oImageAttachValue
			});
		}
		//console.log(oAttachmentItem)

		var oEntry = {
			"BGTDOC": "", //Document Number
			"BGTSEQ": (BGTSEQ++).toString(), //Document Sequence increase
			"ZPROJ": sap.ui.getCore().byId("ZPROJ01").getValue(), //P.Code
			"ZPROJD": this.getView().byId("ZPROJD").getValue(), //P.Code Description
			"GJAHR": this.getView().byId("GJAHR").getValue(), // Fiscal Year
			"KTEXT": this.getView().byId("KTEXT").getValue(), // Header Description
			"TXT50": sap.ui.getCore().byId("TXT50").getValue(), // Description
			"IZWEK": sap.ui.getCore().byId("IZWEK").getValue(), //IM.Reason
			"IZWEKD": sap.ui.getCore().byId("IZWEKD").getValue(), //IM.Reason Description
			"VKOSTL": sap.ui.getCore().byId("VKOSTL").getValue(), //CC.Response
			"VKOSTLD": sap.ui.getCore().byId("VKOSTLD").getValue(), //CC.Response Description
			"WERKS": sap.ui.getCore().byId("WERKS").getValue(), //Plant
			"WERKSD": sap.ui.getCore().byId("WERKSD").getValue(), //Plant Description
			"PRIORI": sap.ui.getCore().byId("PRIORI").getValue(), //Priority
			"PRIORID": sap.ui.getCore().byId("PRIORID").getValue(), //Priority Description
			"USR02": sap.ui.getCore().byId("USR02").getValue(), //Category
			"USR02D": sap.ui.getCore().byId("USR02D").getValue(), //Category Description
			"USR03": sap.ui.getCore().byId("USR03").getValue(), //IM.Classification
			"USR03D": sap.ui.getCore().byId("USR03D").getValue(), //IM.Classification Description
			"USR00": sap.ui.getCore().byId("USR00").getValue(), //Asset Class
			"USR00D": sap.ui.getCore().byId("USR00D").getValue(), //Asset Class Description
			"SIZECL": sap.ui.getCore().byId("SIZECL").getValue(), //Scale
			"SIZECLD": sap.ui.getCore().byId("SIZECLD").getValue(), //Scale Description
			"GDATU": dateFormat.format(sap.ui.getCore().byId("GDATU").getDateValue()), //[Plan]Approval
			"WDATU": dateFormat.format(sap.ui.getCore().byId("WDATU").getDateValue()), //[Plan]PR
			"PODATE": dateFormat.format(sap.ui.getCore().byId("PODATE").getDateValue()), //[Plan]PO
			"USR01": dateFormat.format(sap.ui.getCore().byId("USR01").getDateValue()), //[Plan]GR
			"USR08": dateFormat.format(sap.ui.getCore().byId("USR08").getDateValue()), //[Plan]Install
			"USR09": dateFormat.format(sap.ui.getCore().byId("USR09").getDateValue()), //[Plan]Finish
			"PURPO": sap.ui.getCore().byId("PURPO").getValue(), //Purpose
			"EFFTA": sap.ui.getCore().byId("EFFTA").getValue(), //Tangible
			"EFFIN": sap.ui.getCore().byId("EFFIN").getValue(), //Intangible
			"TPLNR": sap.ui.getCore().byId("TPLNR").getValue(), //Location
			"WTP01": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[0].getValue()), //[Monthly Plan]1
			"WTP02": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[1].getValue()), //[Monthly Plan]2
			"WTP03": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[2].getValue()), //[Monthly Plan]3
			"WTP04": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[3].getValue()), //[Monthly Plan]4
			"WTP05": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[4].getValue()), //[Monthly Plan]5
			"WTP06": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[5].getValue()), //[Monthly Plan]6
			"WTP07": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[6].getValue()), //[Monthly Plan]7
			"WTP08": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[7].getValue()), //[Monthly Plan]8
			"WTP09": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[8].getValue()), //[Monthly Plan]9
			"WTP10": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[9].getValue()), //[Monthly Plan]10
			"WTP11": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[10].getValue()), //[Monthly Plan]11
			"WTP12": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[11].getValue()), //[Monthly Plan]12
			"TOTA": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("TOTA").getValue()), //Total Item Value
			"IMABPFileNavi": oAttachmentItem,
			"IMABPROINavi": IMABPROIItem,
			"IMABPItemNavi": IMABPItem
		};

		this.getView().byId("oDetaTB").getModel().setProperty(oModRow, oEntry);
		/*Close/Destroy the CreateDialog*/
		sap.ui.getCore().byId("oABPCreateDialog").close();
		sap.ui.getCore().byId("oABPCreateDialog").destroy();
		/*Refresh Detil Table*/
		this.getView().byId("oDetaTB").getModel().refresh();
		oStorage = [];
	},

	/*Call Save/Cancel Dialog */
	onSaveDialog: function(oEvent) {
		var error = zhmmaim.util.Commons.oRequiredFieldDialog(oEvent);
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
		if (!sap.ui.getCore().byId("GDATU").getValue() || !sap.ui.getCore().byId("WDATU").getValue() || !sap.ui.getCore().byId("USR09").getValue()) {
			// sap.m.MessageBox.alert("Schedule Date is empty", {
			// 	    title: "Warning",                                   
			// 	    onClose: null  ,                                      
			// 	    styleClass: "sapThemeNegativeText" ,                                   
			// 	    initialFocus: null,                                 
			// 	    textDirection: sap.ui.core.TextDirection.Inherit     
			// 	    });

			sap.m.MessageToast.show("Schedule Date is empty");
			return false;

			// error = false;
		}
		if (sap.ui.getCore().byId("TOTA").getValue() === "" || sap.ui.getCore().byId("TOTA").getValue() === "0") { //Item
			// sap.m.MessageBox.alert("ABP Planning Item is empty", {
			// 	    title: "Warning",                                   
			// 	    onClose: null  ,                                      
			// 	    styleClass: "sapThemeNegativeText" ,                                   
			// 	    initialFocus: null,                                 
			// 	    textDirection: sap.ui.core.TextDirection.Inherit     
			// 	    });

			sap.m.MessageToast.show("ABP Planning Item is empty");
			return false;

			// error = false;
		}

		var monthly = false;
		for (var i = 0; i < 12; i++) {
			//Monthly Plan Empty case 
			if (sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[i].getValue() !== "") {
				monthly = true;
				break;
			}
		}
		if (monthly === false) {
			// sap.m.MessageBox.alert("Monthly Plan is empty", {
			// 	    title: "Warning",                                   
			// 	    onClose: null  ,                                      
			// 	    styleClass: "sapThemeNegativeText" ,                                   
			// 	    initialFocus: null,                                 
			// 	    textDirection: sap.ui.core.TextDirection.Inherit     
			// 	    });

			sap.m.MessageToast.show("Monthly Plan is empty");
			return false;
		}

		var oMonthlyTOT = 0;
		for (var i = 0; i < 12; i++) {
			if (sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[i].getValue() !== "") {
				var oContextMonthlyEach = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[
					i].getValue());
				oMonthlyTOT = parseFloat(oMonthlyTOT) + parseFloat(oContextMonthlyEach);
			}
		}
		if (oMonthlyTOT.toString() !== zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("TOTA").getValue())) { //Monthly Amount !== TOTA
			// sap.m.MessageBox.alert("Monthly Amount and Total Amount are different.", {
			// 	    title: "Warning",                                   
			// 	    onClose: null  ,                                      
			// 	    styleClass: "sapThemeNegativeText" ,                                   
			// 	    initialFocus: null,                                 
			// 	    textDirection: sap.ui.core.TextDirection.Inherit     
			// 	    });
			sap.m.MessageToast.show("Monthly Amount and Total Amount are different.");
			return false;
			// error = false;
		}

		if (error === true) {
			this.onUpload();
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new sap.m.Text({
					text: 'Are you sure you want to Save?'
				}),
				beginButton: new sap.m.Button({
					text: 'Save',
					press: [function(oEvent) {
						this.onSaveABPItem(oEvent);
						dialog.close();
						oLocalStorage.remove("Attachment");
						oLocalStorage.remove("AttachName");
					}, this]
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function() {
						this.oLocalStorage.remove("Attachment");
						this.oLocalStorage.remove("AttachName");
						dialog.close();
					}
				}),
				afterClose: function() {
					this.oLocalStorage.remove("Attachment");
					this.oLocalStorage.remove("AttachName");
					dialog.destroy();
				}
			});
			dialog.open();
		}
	},

	onCancelDialog: function(oEvent) {
		var dialog = new sap.m.Dialog({
			title: 'Cancel',
			type: 'Message',
			content: new sap.m.Text({
				text: 'Are you sure you want to Cancel?'
			}),
			beginButton: new sap.m.Button({
				text: 'Yes',
				press: [function(oEvent) {
					this.cancel(oEvent);
					dialog.close();
				}, this]
			}),
			endButton: new sap.m.Button({
				text: 'No',
				press: function() {
					dialog.close();
				}
			}),
			afterClose: function() {
				dialog.destroy();
			}
		});
		dialog.open();
	},

	/*Destroy and Cancel the CreateDialog*/
	cancel: function(oEvent) {

		sap.ui.getCore().byId("oABPCreateDialog").close();
		sap.ui.getCore().byId("oABPCreateDialog").destroy();

	},

	/*Detail Save(Except Header)*/
	onSaveABPItem: function(oEvent) {
		/*IMABPDetaNavi*/
		var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyyMMdd"
			}),
			timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: "HHmmss"
			});
		/*IMABPROINavi*/
		var oABPCreatePaybackLength = sap.ui.getCore().byId("oABPPayTB").getModel().getProperty('/').length,
			oPayCells = sap.ui.getCore().byId("oABPPayTB").getRows()[0].getCells();
		var IMABPROIItem = [];

		for (var i = 0; i < oABPCreatePaybackLength; i++) {
			IMABPROIItem.push({
				"BGTDOC": "",
				"BGTSEQ": BGTSEQ.toString(),
				"GJAHR": sap.ui.getCore().byId("GJAHR" + [i + 1]).getText(),
				"RTNAMT": oPayCells[i].getValue()
			});
		};

		/*IMABPItemNavi*/
		var oABPItemLength = sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/').length;
		var IMABPItem = [];
		for (var i = 0; i < oABPItemLength; i++) {
			if (sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i + '').MATNR) {
				IMABPItem.push({
					"BGTDOC": "",
					"BGTSEQ": BGTSEQ.toString(),
					"SEQ": (i + 1).toString(),
					"MATNR": sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i + '').MATNR,
					"MAKTX": sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i + '').MAKTX,
					"MENGE": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i +
						'').MENGE),
					"PREIS": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i +
						'').PREIS),
					//"MEINS":sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/'+i+'').MEINS,
					"TAX": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i +
						'').TAX),
					"SHIPPING": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' +
						i + '').SHIPPING),
					"TOT": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i +
						'').TOT)
				});
			}
		};

		/*Attachment*/
		var oAttachmentItem = [];

		if (sap.ui.getCore().byId("oUploadCollection").getItems().length.toString() !== "0") {
			var oData = sap.ui.getCore().byId("oUploadCollection").getItems();
			//var oStorageAttachmentLength = oLocalStorage.get("Attachment").length;
			var oStorageAttachmentLength = oStorage[0].length;

			for (i = 0; i < oStorageAttachmentLength; i++) {
				oAttachmentItem.push({
					"BGTDOC": "",
					"BGTSEQ": BGTSEQ.toString(),
					"SEQ": (i + 1).toString(),
					"FTYPE": "G",
					"ID": oName[0][i],
					"VALUE": oStorage[0][i]
				});
			}
		}

		/*Image Attachment*/
		if (sap.ui.getCore().byId("oImage").getSrc()) {
			oAttachmentItem.push({
				"BGTDOC": "",
				"BGTSEQ": "1",
				"SEQ": (i + 1).toString(),
				"FTYPE": "I",
				"ID": sap.ui.getCore().byId("oImageUploader").getValue(),
				"VALUE": oImageAttachValue
			});
		}
		//console.log(oAttachmentItem)

		var oEntry = {
			"BGTDOC": "", //Document Number
			"BGTSEQ": (BGTSEQ++).toString(), //Document Sequence increase
			"ZPROJ": sap.ui.getCore().byId("ZPROJ01").getValue(), //P.Code
			"ZPROJD": this.getView().byId("ZPROJD").getValue(), //P.Code Description
			"GJAHR": this.getView().byId("GJAHR").getValue(), // Fiscal Year
			"KTEXT": this.getView().byId("KTEXT").getValue(), // Header Description
			"TXT50": sap.ui.getCore().byId("TXT50").getValue(), // Description
			"IZWEK": sap.ui.getCore().byId("IZWEK").getValue(), //IM.Reason
			"IZWEKD": sap.ui.getCore().byId("IZWEKD").getValue(), //IM.Reason Description
			"VKOSTL": sap.ui.getCore().byId("VKOSTL").getValue(), //CC.Response
			"VKOSTLD": sap.ui.getCore().byId("VKOSTLD").getValue(), //CC.Response Description
			"WERKS": sap.ui.getCore().byId("WERKS").getValue(), //Plant
			"WERKSD": sap.ui.getCore().byId("WERKSD").getValue(), //Plant Description
			"PRIORI": sap.ui.getCore().byId("PRIORI").getValue(), //Priority
			"PRIORID": sap.ui.getCore().byId("PRIORID").getValue(), //Priority Description
			"USR02": sap.ui.getCore().byId("USR02").getValue(), //Category
			"USR02D": sap.ui.getCore().byId("USR02D").getValue(), //Category Description
			"USR03": sap.ui.getCore().byId("USR03").getValue(), //IM.Classification
			"USR03D": sap.ui.getCore().byId("USR03D").getValue(), //IM.Classification Description
			"USR00": sap.ui.getCore().byId("USR00").getValue(), //Asset Class
			"USR00D": sap.ui.getCore().byId("USR00D").getValue(), //Asset Class Description
			"SIZECL": sap.ui.getCore().byId("SIZECL").getValue(), //Scale
			"SIZECLD": sap.ui.getCore().byId("SIZECLD").getValue(), //Scale Description
			"GDATU": dateFormat.format(sap.ui.getCore().byId("GDATU").getDateValue()), //[Plan]Approval
			"WDATU": dateFormat.format(sap.ui.getCore().byId("WDATU").getDateValue()), //[Plan]PR
			"PODATE": dateFormat.format(sap.ui.getCore().byId("PODATE").getDateValue()), //[Plan]PO
			"USR01": dateFormat.format(sap.ui.getCore().byId("USR01").getDateValue()), //[Plan]GR
			"USR08": dateFormat.format(sap.ui.getCore().byId("USR08").getDateValue()), //[Plan]Install
			"USR09": dateFormat.format(sap.ui.getCore().byId("USR09").getDateValue()), //[Plan]Finish
			"PURPO": sap.ui.getCore().byId("PURPO").getValue(), //Purpose
			"EFFTA": sap.ui.getCore().byId("EFFTA").getValue(), //Tangible
			"EFFIN": sap.ui.getCore().byId("EFFIN").getValue(), //Intangible
			"TPLNR": sap.ui.getCore().byId("TPLNR").getValue(), //Location
			"WTP01": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[0].getValue()), //[Monthly Plan]1
			"WTP02": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[1].getValue()), //[Monthly Plan]2
			"WTP03": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[2].getValue()), //[Monthly Plan]3
			"WTP04": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[3].getValue()), //[Monthly Plan]4
			"WTP05": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[4].getValue()), //[Monthly Plan]5
			"WTP06": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[5].getValue()), //[Monthly Plan]6
			"WTP07": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[6].getValue()), //[Monthly Plan]7
			"WTP08": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[7].getValue()), //[Monthly Plan]8
			"WTP09": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[8].getValue()), //[Monthly Plan]9
			"WTP10": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[9].getValue()), //[Monthly Plan]10
			"WTP11": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[10].getValue()), //[Monthly Plan]11
			"WTP12": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[11].getValue()), //[Monthly Plan]12
			"TOTA": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("TOTA").getValue()), //Total Item Value
			"IMABPFileNavi": oAttachmentItem,
			"IMABPROINavi": IMABPROIItem,
			"IMABPItemNavi": IMABPItem
		};

		this.getView().byId("oDetaTB").getModel().getProperty('/').push(oEntry);

		/*Close/Destroy the CreateDialog*/
		sap.ui.getCore().byId("oABPCreateDialog").close();
		sap.ui.getCore().byId("oABPCreateDialog").destroy();

		/*Refresh Detil Table*/
		this.getView().byId("oDetaTB").getModel().refresh();
		//console.log(this.getView().byId("oDetaTB").getModel());

		oStorage = [];
	},

	/* 
	 * 
	 * Budget Planning Approve Process
	 * 
	 * */

	onSubmitDialog: function(oEvent) {
		var error = zhmmaim.util.Commons.oRequiredField(oEvent);

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

		//		console.log(this.getView().byId("oIOCreateWF").getModel());
		if (this.getView().byId("oIOCreateWF").getModel() === undefined) {

			//sap.m.MessageBox.alert("Missing Approval path. Please select it", {
			//     title: "Warning",                                   
			//     onClose: null  ,                                      
			//     styleClass: "sapThemeNegativeText" ,                                   
			//     initialFocus: null,                                 
			//     textDirection: sap.ui.core.TextDirection.Inherit     
			// });

			sap.m.MessageToast.show("Missing Approval path. Please select it");
			return false;
			// error = false;
		}
		/*if(this.getView().byId("oDetaTB").getModel().length === 0){ // ABP Detail Item Validation
					sap.m.MessageBox.alert("ABP Detail Item is empty", {
		 			    title: "Warning",                                   
		 			    onClose: null  ,                                      
		 			    styleClass: "sapThemeNegativeText" ,                                   
		 			    initialFocus: null,                                 
		 			    textDirection: sap.ui.core.TextDirection.Inherit     
		 			    });
					error = false;
				}*/

		if (error === true) {
			//this.onUpload();
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new sap.m.Text({
					text: 'Are you sure you want to Submit?'
				}),
				beginButton: new sap.m.Button({
					text: 'Submit',
					press: [function(oEvent) {
						this.onSubmit(oEvent);
						dialog.close();
					}, this]
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
			dialog.open();
		}
	},

	/*ABP Planning Submit*/
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
		var oABPCreateWFLength = this.getView().byId("oIOCreateWF").getModel().getProperty('/0').length;

		//Approval Line Add
		for (var i = 0; i < oABPCreateWFLength; i++) {
			/*initial Requester's ATYPE = "A", Default ATYPE = "Q" */
			//if(i===0){ATYPE="A";}else{ATYPE="";}
			if (i === 0) { // if Approver,
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
		};

		if (this.getView().byId("oIOCreateCP").getModel()) {
			var oABPCreateCPLength = this.getView().byId("oIOCreateCP").getModel().getProperty('/').length;
			//Cooperation Line Add
			for (var i = 0; i < oABPCreateCPLength; i++) {
				ApprLineItem.push({
					"BGTDOC": "",
					"BGTSEQ": (oABPCreateWFLength + i + 1).toString(),
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
					"CO_SEQ": ""
				});
			};
			//console.log(ApprLineItem);
		}

		var ABPDetailItem = [];

		for (var i = 0; i < 5; i++) {
			if (this.getView().byId("oDetaTB").getModel().getProperty('/' + i)) {
				ABPDetailItem.push(this.getView().byId("oDetaTB").getModel().getProperty('/' + i));
				//console.log(this.getView().byId("oDetaTB").getModel().getProperty('/'+i));
			}
		}

		//console.log(ABPDetailItem);

		var oEntry = {
			"BGTDOC": "", //Document Number
			"RDATE": ARDAT, //Today
			"PERNR": oUserInfo.PERNR, //USER 
			"KOSTL": oUserInfo.KOSTL, //Cost Center
			"RTYPE": "AB", // Document Type
			"BTSTS": "S", //
			"BTSUBJ": this.getView().byId("KTEXT").getValue(), //Document Title, Description
			"APPRV": "X", //BPM O
			"USER_ID": oUserInfo.PERNR, //USER_ID
			"ARESULT": "1", //Claim User Event Result Variable
			"IMABPDetaNavi": ABPDetailItem, // ABP Detail Item
			"IMApprLineNavi": ApprLineItem //Approval Line Item
		};

		//console.log(oEntry);

		sap.ui.core.BusyIndicator.show(10);
		/*OData Request SAVE Process*/
		OData.request({

				requestUri: sServiceUrl +
					"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMABPDetaNavi/IMABPItemNavi,IMABPDetaNavi/IMABPROINavi,IMApprTextNavi,IMIOPRNavi/IMIOPRFileNavi",
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
						//     sap.m.MessageBox.show("Created Successfully.", {
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
						//  	sap.m.MessageBox.show(allMessage, {
						// title: "Created Fail",                                   
						// onClose: zhmmaim.util.Commons.onSubmitFail ,                                      
						// styleClass: "sapThemeNegativeText" ,                                   
						// initialFocus: null,                                 
						// textDirection: sap.ui.core.TextDirection.Inherit     
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

	/*Delete ABP Item List(oDetaTB)*/
	onDeleteABPItem: function(oEvent) {
		var sPath = oEvent.getSource().getParent().getBindingContext().sPath,
			model = this.getView().byId("oDetaTB").getModel(),
			data = model.getProperty("/");

		sPath = sPath.substring(sPath.lastIndexOf('/') + 1);
		data.splice(parseInt(sPath), 1);
		//model.refresh();
		model.setProperty('/', data);
	},

	handleImageChange: function(oEvent) { //Image Attachment -Preview
		var oImageDiv = sap.ui.getCore().byId("oImage");
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
	}
});