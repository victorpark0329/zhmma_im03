jQuery.sap.require("zhmmaim.util.Formatter");
jQuery.sap.require("zhmmaim.util.Commons");
jQuery.sap.require("zhmmaim.util.APP_CONTAINS");
jQuery.sap.require("sap.ui.table.TablePersoController");

(function() {
	var _View;

	sap.ui.controller("zhmmaim.controller.BudgetStatus", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zhmmaim.BudgetStatus
		 */
		onInit: function() {
			_View = this.getView();

			oStorage = [];
			oName = [];
			oImageAttachValue = "";

			var getPersDataCalls = 0;
			oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			window.oUserInfo = oJQueryStorage.get("UserInfo");

			//init and activate Table Personaliazation Controller
			this._oTPC = new sap.ui.table.TablePersoController({
				table: _View.byId("oABPTable"),
				persoService: {
					getPersData: function() {
						getPersDataCalls++;
						var oDeferred = jQuery.Deferred();
						oDeferred.resolve(this.oBundle);
						return oDeferred.promise();
					},
					setPersData: function(oBundle) {
						(oBundle, {
							_persoSchemaVersion: "1.0",
							aColumns: [{
								id: "table-Name",
								order: 0,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending",
								/*filtered: false, filterValue: "",*/ grouped: false
							}, {
								id: "table-Color",
								order: 1,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending",
								/*filtered: false, filterValue: "",*/ grouped: false
							}, {
								id: "table-Number",
								order: 2,
								visible: true,
								width: "",
								sorted: false,
								sortOrder: "Ascending",
								/*filtered: false, filterValue: "",*/ grouped: false
							}]
						}, "setPersData should receive the correct data");
						this.oBundle = oBundle;
						var oDeferred = jQuery.Deferred();
						oDeferred.resolve();
						return oDeferred.promise();
					},
					delPersData: function() {
						delete this.oBundle;
					}
				},
			});
		},

		onPersoButtonPressed: function(oEvent) {
			this._oTPC.openDialog();
		},

		handleSelect: function(oEvent) {
			var aContexts = oEvent.getParameters("selectedContexts");
			//console.log(aContexts);

			var aContextsName = aContexts.selectedItems.map(function(oContext) {
				return oContext;
			});
			for (i = 0; i < aContextsName.length; i++) {
				//change setVisible = true
				_View.byId(aContextsName[i].getInfo()).setVisible(true);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		handleChange: function(oEvent) {
			//sap/opu/odata/SAP/Z_IM_APPROVAL_SRV/IMABPStatus?$filter=GJAHR eq '2015' and PERNR eq '1234567890'
			var oItems = oEvent.getSource(),
				oSelectionDate = oItems.getValue();

			oJQueryStorage.put("abpStatus", oSelectionDate);

			//console.log(oSelectionDate);
			var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl, true);
			var oJsonModel = new sap.ui.model.json.JSONModel();

			oModel.read("IMABPStatus?", null, ["$filter= GJAHR eq '" + oSelectionDate + "' and PERNR eq '" + oUserInfo.PERNR + "'"],
				false,
				function(oData, response) {
					oJsonModel.setData(oData);
				});

			_View.setModel(oJsonModel);
			var oPRStatusTB = _View.byId("oABPTable");
			oPRStatusTB.bindRows("/results");
		},

		/*Filter Function - Global Define*/
		filterGlobally: function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			//console.log(sQuery);
			this._oGlobalFilter = null;

			if (sQuery) {
				this._oGlobalFilter = new sap.ui.model.Filter([
					new sap.ui.model.Filter("BGTDOC", sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("RDATE", sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("PERNR", sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("BTSTS", sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("ZPROJ", sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("VKOSTL", sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("WERKS", sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("POSNR", sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("AUFNR", sap.ui.model.FilterOperator.Contains, sQuery),
				], false)
			}
			this._filter();
		},

		_filter: function() {
			var oFilter = null;
			if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			}

			_View.byId("oABPTable").getBinding("rows").filter(oFilter, "Application");
		},

		//Export to Excel File using Table Data
		toExportCSV: function(oEvent) {
			var oSelectionDate = _View.byId("FISCAL").getValue();

			var sUrl = sServiceUrl + "/IMABPStatus?$filter=GJAHR eq '" + oSelectionDate + "' and PERNR eq '" + oUserInfo.PERNR +
				"'&$format=xlsx";
			var encodeUrl = encodeURI(sUrl);
			sap.m.URLHelper.redirect(encodeUrl, true);
		},

		onUpload: function() {
			var oData = sap.ui.getCore().byId("oUploadCollection").getItems();
			var name = [];
			var oAttachmentItem = [];
			for (i = 0; i < oData.length; i++) {
				var filename = oData[i].getFileName(), //FileName
					requestId = oData[i]._requestIdName, //Upload count
					fileIndex = oData[i]._internalFileIndexWithinFileUploader, //FileIndex
					documentId = oData[i].getDocumentId(); //documentId

				if (!documentId) { // if exists,
					var oAttachmentFile = oData[i].getParent()._aFileUploadersForPendingUpload[requestId - 1].oFileUpload.files;

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
					reader.readAsBinaryString(oAttachmentFile[fileIndex - 1]);
				}
			}
		},

		onUpdateDialog: function(oEvent) {
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
			for (i = 0; i < 12; i++) { //Monthly Plan Empty case 
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
							this.cancel(oEvent);
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

						var abpStatus = oJQueryStorage.get("abpStatus");
						var oModel = new sap.ui.model.odata.ODataModel(
							sServiceUrl, true);
						var oJsonModel = new sap.ui.model.json.JSONModel();

						oModel.read("IMABPStatus?", null, ["$filter= GJAHR eq '" + abpStatus + "' and PERNR eq '" + oUserInfo.PERNR + "'"],
							false,
							function(oData, response) {
								oJsonModel.setData(oData);
							});
						/*Add variable var _View = _View;*/

						var oPRStatusTB = _View.byId("oABPTable");
						oPRStatusTB.setModel(oJsonModel);

						oPRStatusTB.bindRows("/results");
					}
				});
				dialog.open();
			}
		},

		/*Update ABP Item Process*/
		onUpdateABPItem: function(oEvent) {
			/*Date Time Formatting - ARDAT , ARZET(ApprLineNavi)*/
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyyMMdd"
				}),
				timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
					pattern: "HHmmss"
				});

			ARDAT = dateFormat.format(new Date());
			ARZET = timeFormat.format(new Date());

			var oContext = sap.ui.getCore().byId("oABPCreateDialog").getModel(),
				oContextBGTSEQ = sap.ui.getCore().byId("oABPCreateDialog").getTitle().split("(")[1].split(")")[0];
			//oSEQ = oContextBGTSEQ-1,

			oContextDetailLength = oContext.getProperty('/IMABPDetaNavi/results').length;
			for (var i = 0; i < oContextDetailLength; i++) {
				if (oContextBGTSEQ == oContext.getProperty('/IMABPDetaNavi/results/' + i).BGTSEQ) {
					oSEQ = i;
				}
			}

			var oDetailItem = oContext.getProperty("/IMABPDetaNavi/results/" + oSEQ + "/");

			/*IMABPROINavi*/
			var oABPCreatePaybackLength = oContext.getProperty("/IMABPDetaNavi/results/" + oSEQ + "/IMABPROINavi/results/").length,
				oPayCells = sap.ui.getCore().byId("oABPPayTB").getRows()[0].getCells();

			var IMABPROIItem = [];
			for (i = 0; i < oABPCreatePaybackLength; i++) {
				IMABPROIItem.push({
					"BGTDOC": oContext.getProperty("/").BGTDOC,
					"BGTSEQ": oContextBGTSEQ,
					"GJAHR": sap.ui.getCore().byId("GJAHR" + [i + 1]).getText(),
					"RTNAMT": oPayCells[i].getValue()
				});
			}

			/*IMABPItemNavi*/
			var oABPItemLength = sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/').length;
			var IMABPItem = [];
			for (var i = 0; i < oABPItemLength; i++) {
				if (sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i + '').MATNR) {
					IMABPItem.push({
						"BGTDOC": oContext.getProperty("/").BGTDOC,
						"BGTSEQ": oContextBGTSEQ,
						"SEQ": (i + 1).toString(),
						"MATNR": sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i + '').MATNR,
						"MAKTX": sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i + '').MAKTX,
						"MENGE": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' +
							i + '').MENGE),
						"PREIS": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' +
							i + '').PREIS),
						//"MEINS":sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/'+i+'').MEINS,
						"TAX": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i +
							'').TAX),
						"SHIPPING": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty(
							'/' + i + '').SHIPPING),
						"TOT": zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/' + i +
							'').TOT)
					});
				}
			};

			/*IMABPFileNavi*/
			//oAttachmentItem = oContext.getProperty("/IMABPDetaNavi/results/"+oSEQ+"/IMABPFileNavi/results");
			var oAttachmentItem = [];
			var aItems = sap.ui.getCore().byId("oUploadCollection").getItems();
			var oItems = oContext.getProperty("/IMABPDetaNavi/results/" + oSEQ + "/IMABPFileNavi/results");

			console.log(oItems);

			var exists = true;
			for (var i = 0; i < oItems.length; i++) {
				if (oItems[i].FTYPE == "I") {
					exists = false;
					oAttachmentItem.push({
						"BGTDOC": oContext.getProperty("/").BGTDOC,
						"BGTSEQ": oContextBGTSEQ,
						"SEQ": (i + 1).toString(),
						"FTYPE": "I",
						"ID": sap.ui.getCore().byId("oImageUploader").getValue(),
						"VALUE": sap.ui.getCore().byId("oImage").getSrc().split('base64,')[1]
					});
				} else {
					//if not exists
				}
			}

			//1.Original File
			for (i = 0; i < aItems.length; i++) {
				if (aItems[i].getDocumentId()) {
					var dPath = aItems[i].getBindingContext().sPath;
					oAttachmentItem.push({
						"BGTDOC": oContext.getProperty("/").BGTDOC,
						"BGTSEQ": oContextBGTSEQ,
						"SEQ": oContext.getProperty(dPath).SEQ, //seq
						"FTYPE": oContext.getProperty(dPath).FTYPE, //general attachment
						"ID": oContext.getProperty(dPath).ID, //filename
						"VALUE": oContext.getProperty(dPath).VALUE, //xstring value of file
						"URI": oContext.getProperty(dPath).URI
					});
				}
			}

			//2.New File
			if (aItems.length.toString() !== "0") { //if upload files exist,
				if (oStorage[0]) {
					var oStorageAttachmentLength = oStorage[0].length;
					for (i = 0; i < oStorageAttachmentLength; i++) {
						oAttachmentItem.push({
							"BGTDOC": oContext.getProperty("/").BGTDOC,
							"BGTSEQ": oContextBGTSEQ,
							"SEQ": (oAttachmentItem.length + 1).toString(), //seq
							"FTYPE": "G", //general attachment
							"ID": oName[0][i], //filename
							"VALUE": oStorage[0][i] //xstring value of file
						});
					}
				}
			}

			//Image Attachment
			if (exists == true) {
				oAttachmentItem.push({
					"BGTDOC": oContext.getProperty("/").BGTDOC,
					"BGTSEQ": oContextBGTSEQ,
					"SEQ": (oAttachmentItem.length + 1).toString(),
					"FTYPE": "I",
					"ID": sap.ui.getCore().byId("oImageUploader").getValue(),
					"VALUE": oImageAttachValue
				});
			}

			console.log(oAttachmentItem)

			var oDetail = {
				"BGTDOC": oContext.getProperty("/").BGTDOC, //Document Number
				"BGTSEQ": oContextBGTSEQ, //Document Sequence increase
				"ZPROJ": oDetailItem.ZPROJ, //P.Code
				"ZPROJD": oDetailItem.ZPROJD, //P.Code Description
				"GJAHR": oDetailItem.GJAHR, // Fiscal Year
				"KTEXT": oDetailItem.KTEXT, // Header Description
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

			/*ApprLineItem*/
			var oIOCreateWFLength = oContext.getProperty("/IMApprLineNavi/results/").length;
			var ApprLineItem = [];
			for (i = 0; i < oIOCreateWFLength; i++) {
				ApprLineItem.push({
					"BGTDOC": oContext.getProperty("/").BGTDOC,
					"BGTSEQ": oContext.getProperty("/IMApprLineNavi/results/")[i].BGTSEQ,
					"ARESULT": oContext.getProperty("/IMApprLineNavi/results/")[i].ARESULT,
					"BGTTYPE": oContext.getProperty("/IMApprLineNavi/results/")[i].BGTTYPE,
					"RTEXT": oContext.getProperty("/IMApprLineNavi/results/")[i].RTEXT,
					"ARDAT": oContext.getProperty("/IMApprLineNavi/results/")[i].ARDAT,
					"ARZET": oContext.getProperty("/IMApprLineNavi/results/")[i].ARZET,
					"APERNR": oContext.getProperty("/IMApprLineNavi/results/")[i].APERNR,
					"DUTY_CODE": oContext.getProperty("/IMApprLineNavi/results/")[i].DUTY_CODE,
					"DUTY_NAME": oContext.getProperty("/IMApprLineNavi/results/")[i].DUTY_NAME,
					"ENGLISH_NAME": oContext.getProperty("/IMApprLineNavi/results/")[i].ENGLISH_NAME,
					"ORIREQ": oContext.getProperty("/IMApprLineNavi/results/")[i].ORIREQ,
					"CO_SEQ": oContext.getProperty("/IMApprLineNavi/results/")[i].CO_SEQ,
				});
			}

			/*Item Update*/
			var oABPDetaLength = oContext.getProperty("/IMABPDetaNavi/results/").length;
			var ABPDetailItem = [];

			for (i = 0; i < oABPDetaLength; i++) {
				//console.log(oContext.getProperty("/IMABPDetaNavi/results/"+i));
				var oBGTSEQ = oContext.getProperty("/IMABPDetaNavi/results/" + i + "/BGTSEQ");
				if (oBGTSEQ === oContextBGTSEQ) { //if BGTSEQ equals, update to oDetail
					ABPDetailItem.push(oDetail);
				} else { //if not, save the original data
					//ABPDetailItem.push(oContext.getProperty("/IMABPDetaNavi/results/"+i));
					IMABPItem = oContext.getProperty("/IMABPDetaNavi/results/" + i + "/IMABPItemNavi/results");
					IMABPROIItem = oContext.getProperty("/IMABPDetaNavi/results/" + i + "/IMABPROINavi/results");
					oAttachmentItem = oContext.getProperty("/IMABPDetaNavi/results/" + i + "/IMABPFileNavi/results");

					var orgDetail = {
						"BGTDOC": oContext.getProperty("/").BGTDOC, //Document Number
						"BGTSEQ": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").BGTSEQ, //Document Sequence increase
						"ZPROJ": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").ZPROJ, //P.Code
						"ZPROJD": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").ZPROJD, //P.Code Description
						"GJAHR": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").GJAHR, // Fiscal Year
						"KTEXT": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").KTEXT, // Header Description
						"TXT50": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").TXT50, // Description
						"IZWEK": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").IZWEK, //IM.Reason
						"IZWEKD": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").IZWEKD, //IM.Reason Description
						"VKOSTL": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").VKOSTL, //CC.Response
						"VKOSTLD": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").VKOSTLD, //CC.Response Description
						"WERKS": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WERKS, //Plant
						"WERKSD": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WERKSD, //Plant Description
						"PRIORI": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").PRIORI, //Priority
						"PRIORID": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").PRIORID, //Priority Description
						"USR02": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").USR02, //Category
						"USR02D": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").USR02D, //Category Description
						"USR03": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").USR03, //IM.Classification
						"USR03D": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").USR03D, //IM.Classification Description
						"USR00": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").USR00, //Asset Class
						"USR00D": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").USR00D, //Asset Class Description
						"SIZECL": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").SIZECL, //Scale
						"SIZECLD": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").SIZECLD, //Scale Description
						"GDATU": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").GDATU, //[Plan]Approval
						"WDATU": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WDATU, //[Plan]PR
						"PODATE": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").PODATE, //[Plan]PO
						"USR01": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").USR01, //[Plan]GR
						"USR08": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").USR08, //[Plan]Install
						"USR09": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").USR09, //[Plan]Finish
						"PURPO": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").PURPO, //Purpose
						"EFFTA": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").EFFTA, //Tangible
						"EFFIN": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").EFFIN, //Intangible
						"TPLNR": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").TPLNR, //Location
						"WTP01": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WTP01, //[Monthly Plan]1
						"WTP02": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WTP02, //[Monthly Plan]2
						"WTP03": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WTP03, //[Monthly Plan]3
						"WTP04": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WTP04, //[Monthly Plan]4
						"WTP05": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WTP05, //[Monthly Plan]5
						"WTP06": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WTP06, //[Monthly Plan]6
						"WTP07": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WTP07, //[Monthly Plan]7
						"WTP08": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WTP08, //[Monthly Plan]8
						"WTP09": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WTP09, //[Monthly Plan]9
						"WTP10": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WTP10, //[Monthly Plan]10
						"WTP11": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WTP11, //[Monthly Plan]11
						"WTP12": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").WTP12, //[Monthly Plan]12
						"TOTA": oContext.getProperty("/IMABPDetaNavi/results/" + i + "/").TOTA, //Total Item Value
						"IMABPFileNavi": oAttachmentItem,
						"IMABPROINavi": IMABPROIItem,
						"IMABPItemNavi": IMABPItem
					};

					ABPDetailItem.push(orgDetail);
				}
			}

			var oEntry = {
				"BGTDOC": oContext.getProperty("/").BGTDOC, //Document Number
				"RDATE": ARDAT, //Today
				"PERNR": oContext.getProperty("/").PERNR, //USER 
				"KOSTL": oContext.getProperty("/").KOSTL, //Cost Center
				"RTYPE": "AB", // Document Type
				"BTSTS": "S",
				"BTSUBJ": oDetailItem.KTEXT, //Document Title, Description
				"APPRV": "X", //BPM O
				"USER_ID": oContext.getProperty("/").PERNR, //USER_ID
				"ARESULT": "1", //Claim User Event Result Variable
				"IMABPDetaNavi": ABPDetailItem, // ABP Detail Item
				"IMApprLineNavi": ApprLineItem //Approval Line Item
			};

			oStorage = [];

			sap.ui.core.BusyIndicator.show(10);

			/*Budget Transfer OData Request Submit Process*/
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
							//     sap.m.MessageBox.alert("Update Successfully.", {
							// title: "Success",                                   
							// onClose: zhmmaim.util.Commons.onUpdateSuccess,                                      
							// styleClass: "sapThemePositiveText" ,                                   
							// initialFocus: null,                                 
							// textDirection: sap.ui.core.TextDirection.Inherit     
							// });

							sap.m.MessageToast.show("Updated Successfully.", {
								onClose: zhmmaim.util.Commons.onUpdateSuccess
							});

							sap.ui.getCore().byId("oABPCreateDialog").close();
							sap.ui.getCore().byId("oABPCreateDialog").destroy();

						},
						function(err) {
							var message = JSON.parse(err.response.body);
							var errorMessage = message.error.innererror.errordetails;
							var allMessage = "";
							for (var i = 0; i < errorMessage.length; i++) {
								allMessage += errorMessage[i].message + ".  ";
							}

							//     	sap.m.MessageBox.show(allMessage, {
							//     title: "Update Fail",                                   
							//     onClose: zhmmaim.util.Commons.onSubmitFail ,                                      
							//     styleClass: "sapThemeNegativeText" ,                                   
							//     initialFocus: null,                                 
							//     textDirection: sap.ui.core.TextDirection.Inherit     
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
			_View.byId("oABPTable").getModel().refresh();
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

		cancel: function(oEvent) {
			sap.ui.getCore().byId("oABPCreateDialog").close();
			sap.ui.getCore().byId("oABPCreateDialog").destroy();
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
}());