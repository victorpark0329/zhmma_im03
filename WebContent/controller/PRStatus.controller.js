jQuery.sap.require("zhmmaim.util.Formatter");
jQuery.sap.require("zhmmaim.util.Commons");
jQuery.sap.require("zhmmaim.util.APP_CONTAINS");
jQuery.sap.require("zhmmaim.util.AttachPrint");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.ui.table.TablePersoController");

sap.ui.controller("zhmmaim.controller.PRStatus", {
	onInit: function() {
		var getPersDataCalls = 0;
		oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
        window.oUserInfo = oJQueryStorage.get("UserInfo");

        var dateFormat = sap.ui.core.format.DateFormat
		.getDateInstance({
			pattern : "yyyyMMdd"
		});

        //Default From Date(the first day of This year)
        var DFromDate = new Date(new Date().getFullYear(),0,1);
        this.getView().byId("oBdStatusDR").setDateValue(DFromDate);
        //Default To Date(Today)
        var DToDate = new Date();
        this.getView().byId("oBdStatusDR").setSecondDateValue(DToDate);

		var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl, true);
		var oJsonModel = new sap.ui.model.json.JSONModel();

		oModel.read("IMPRStatus?", null,
				[ "$filter= FRDATE eq '" + dateFormat.format(DFromDate)
						+ "' and TODATE eq '" + dateFormat.format(DToDate)
						+ "' and PERNR eq '"+oUserInfo.PERNR+"'" ],
				false, function(oData, response) {
					oJsonModel.setData(oData);
				});

		this.getView().setModel(oJsonModel);
		var oPRStatusTB = this.getView()
				.byId("oPRTable");
		oPRStatusTB.bindRows("/results");
		/*oPRStatusTB.sort(this.getView().byId("BGTDOC"),sap.ui.table.SortOrder.Descending);*/
		
		// init and activate Table Personalization controller
		this._oTPC = new sap.ui.table.TablePersoController({
			table: this.getView().byId("oPRTable"),
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
						aColumns: [
							{ id: "table-Name", order: 0,  visible: true, width: "", sorted: false, sortOrder: "Ascending", /*filtered: false, filterValue: "",*/ grouped: false },
							{ id: "table-Color", order: 1,  visible: true, width: "", sorted: false, sortOrder: "Ascending", /*filtered: false, filterValue: "",*/ grouped: false },
							{ id: "table-Number", order: 2, visible: true, width: "", sorted: false, sortOrder: "Ascending", /*filtered: false, filterValue: "",*/ grouped: false }
						]
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

	onPersoButtonPressed: function(oEvent){
		this._oTPC.openDialog();
	},
	
	handleSelect:function(oEvent){
		var aContexts = oEvent.getParameters("selectedContexts");
		var aInitContexts = oEvent.getSource()._aInitiallySelectedContextPaths;
		//console.log(aInitContexts.length)
		
		if(oEvent.getId()==="cancel"){//cancel Event
			if(!aContexts.selectedItems){//non-select
				//select all
				var oTable = this.getView().byId("oPRTable"),
					oColumn = oTable.getColumns(),
					oColumnLength = oColumn.length;
				
				var oColumnItem = [];
				
				for(i=0;i<oColumnLength;i++){
					oColumnItem.push({"KEY":zhmmaim.util.Formatter.GetsId(oColumn[i].sId),"TEXT":oColumn[i].getLabel().getText()});
				}
				//console.log(oColumnItem);
				
				//Setting All columns Initial Visible option = false
				for(i=0;i<oColumnItem.length;i++){
					//console.log(this.getView().byId(oColumnItem[i].KEY).getVisible())
					this.getView().byId(oColumnItem[i].KEY).setVisible(true);
				}
			}else{//select
				var aContextsName = aContexts.selectedItems.map(function(oContext){
					return oContext;
				});
				
				for(i=0;i<aContextsName.length;i++){
					//change setVisible = true
					//console.log(this.getView().byId(aContextsName[i].getInfo()).getVisible())
					this.getView().byId(aContextsName[i].getInfo()).setVisible(true);
				}
				oEvent.getSource().getBinding("items").filter([]);
			}
		}else if(oEvent.getId() === "confirm"){//confirm Event
			var aContextsName = aContexts.selectedItems.map(function(oContext){
				return oContext;
			});
			
			for(i=0;i<aContextsName.length;i++){
				//change setVisible = true
				//console.log(this.getView().byId(aContextsName[i].getInfo()).getVisible())
				this.getView().byId(aContextsName[i].getInfo()).setVisible(true);
			}
			oEvent.getSource().getBinding("items").filter([]);
		}
	},
	
	handleChange : function(oEvent) {
		var oItems = oEvent.getSource(),
			oSelectionDate = oItems.getValue(),
			oDelimiter = oItems.getDelimiter();

		var dateFormat = sap.ui.core.format.DateFormat
				.getDateInstance({
					pattern : "yyyyMMdd"
				});
		var oFromDate = dateFormat.format(new Date(
				oSelectionDate.split(oDelimiter)[0])),
			oToDate = dateFormat.format(new Date(
					oSelectionDate.split(oDelimiter)[1]));

		var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl, true);
		var oJsonModel = new sap.ui.model.json.JSONModel();

		oModel.read("IMPRStatus?", null,
				[ "$filter= FRDATE eq '" + oFromDate
						+ "' and TODATE eq '" + oToDate
						+ "' and PERNR eq '"+oUserInfo.PERNR+"'" ],
				false, function(oData, response) {
					oJsonModel.setData(oData);
				});

		this.getView().setModel(oJsonModel);
		var oPRStatusTB = this.getView()
				.byId("oPRTable");
		oPRStatusTB.bindRows("/results");
	},
	
	showDetail : function(oEvent) {
			if(!this.oInquiryDetailDialog) {
				var oInquiryDetailDialog = new sap.ui.xmlfragment("zhmmaim.fragment.InquiryIODetailDialog",this);
				var oFragment = new sap.ui.xmlfragment("zhmmaim.fragment.PRCreationDetail",this);
				oInquiryDetailDialog.insertContent(oFragment);
			}	
			oInquiryDetailDialog.open();
			//columnIndex
			var oRow = oEvent.getParameter('rowContext'), oContextBGTDOC = oRow
					.getProperty("BGTDOC");

			var oModel = new sap.ui.model.odata.ODataModel(
					sServiceUrl, true);
			var oJsonModel = new sap.ui.model.json.JSONModel();

			oModel
					.read(
							"IMApprHead(BGTDOC='" + oContextBGTDOC
									+ "')/?",
							null,
							[ "$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRItemNavi,IMIOPRNavi/IMIOPRVendorNavi,IMIOPRNavi/IMIOPRFileNavi" ],
							false, function(oData, response) {
								oJsonModel.setData(oData);
							});
			sap.ui.getCore().setModel(oJsonModel);
			
			/*Invisible Footer*/
			sap.ui.getCore().byId("PRCreationDetail").destroyFooter();
			
			sap.ui.getCore().byId("oUploadCollection").setVisible(false);
			//pdf save button = true
			sap.ui.getCore().byId("oPDFSave").setVisible(true);
			
			/*Binding Odata*/
			var oContextIMIOPR = oJsonModel.getProperty("/IMIOPRNavi/results/0/");
			sap.ui.getCore().byId("AUFNR").setValue(oContextIMIOPR.AUFNR); //IO
			sap.ui.getCore().byId("WERKS").setValue(oContextIMIOPR.WERKS); //Ship to Loc
			sap.ui.getCore().byId("WERKSD").setValue(oContextIMIOPR.WERKSD); //Ship to Loc Description
			sap.ui.getCore().byId("LGORT").setValue(oContextIMIOPR.LGORT),//Storage location
			sap.ui.getCore().byId("LGORTD").setValue(oContextIMIOPR.LGORTD),//Storage location Description
			sap.ui.getCore().byId("EKGRP").setValue(oContextIMIOPR.EKGRP),//purchasing group
			sap.ui.getCore().byId("EKGRPD").setValue(oContextIMIOPR.EKGRPD),//purchasing group Description
			sap.ui.getCore().byId("LFDAT").setValue(oContextIMIOPR.LFDAT); //Need to Date
			sap.ui.getCore().byId("KTEXT").setValue(oContextIMIOPR.KTEXT); //KTEXT
			sap.ui.getCore().byId("PURPO").setValue(oContextIMIOPR.PURPO); //Purpose
			
			//Supplier(Vendor) Binding
			var oSupplierPath = "/IMIOPRNavi/results/0/IMIOPRVendorNavi/results";
			sap.ui.getCore().byId("oSupplierTB").bindRows(oSupplierPath);
			
			//Material Binding
			var oMaterialPath = "/IMIOPRNavi/results/0/IMIOPRItemNavi/results";
			sap.ui.getCore().byId("oItemTB").bindRows(oMaterialPath);

			//Supplier(Vendor) supplier1,2,3,4
			/*sap.ui.getCore().byId("oItemTB").onBeforeRendering=function(){
				sap.ui.getCore().byId("oSupplierTB").getRows()[0].getCells()[0].setValue("supplier1");
				sap.ui.getCore().byId("oSupplierTB").getRows()[1].getCells()[0].setValue("supplier2");
				sap.ui.getCore().byId("oSupplierTB").getRows()[2].getCells()[0].setValue("supplier3");
				sap.ui.getCore().byId("oSupplierTB").getRows()[3].getCells()[0].setValue("supplier4");
			}*/
			
			/*change Number Format(Currency -> Float)*/
			sap.ui.getCore().byId("NETWR").bindProperty("value", {path:'NETWR',type: new sap.ui.model.type.Float()});
			sap.ui.getCore().byId("PREIS").bindProperty("value", {path:'PREIS',type: new sap.ui.model.type.Float()});
			sap.ui.getCore().byId("TOT").bindProperty("value", {path:'TOT',type: new sap.ui.model.type.Float()});
			
			//Supplier(Vendor) supplier1,2,3,4
			sap.ui.getCore().byId("oItemTB").onBeforeRendering=function(){
				jQuery('#PRCreationCommons :input').attr('disabled', true);
				for(i=0; i<4; i++){
					sap.ui.getCore().byId("oSupplierTB").getRows()[i].getCells()[0].setValue("supplier"+(i+1));
					
					if(sap.ui.getCore().byId("oSupplierTB").getRows()[i].getCells()[1].getValue() === ""||
							sap.ui.getCore().byId("oSupplierTB").getRows()[i].getCells()[2].getValue() === ""){
						if(sap.ui.getCore().byId("oSupplierTB").getRows()[i].getCells()[3].getValue() === "0"){
							sap.ui.getCore().byId("oSupplierTB").getRows()[i].getCells()[3].setValue("");
						}
					}
				}
			}
		
		/*Common Binding Information*/
		//ApprLine RText (Comment) & Line Binding
		var oApprLinePath = "/IMApprLineNavi/results",
			oContextApprLine = oJsonModel.getProperty(oApprLinePath),
			oApprLineLength = oContextApprLine.length;

		var ApprLineText = [],
			ApprLine = [],
			CooperatorLine = [],
			oARDATCells = sap.ui.getCore().byId("oCreateWF").getItems()[1].getCells();
			
		for(var i=0; i<oApprLineLength; i++){
			if(oContextApprLine[i].BGTTYPE === "A"){ //Approval Line
				/*ApprLine ARDAT Convert Data*/
				/*if(oContextApprLine[i].ARDAT === '00000000'){
					oARDATCells[i].setText("");
				}else{
					oARDATCells[i].setText(oContextApprLine[i].ARDAT);
				}*/
				ApprLine.push(oContextApprLine[i]);
			}else if(oContextApprLine[i].BGTTYPE === "C"){ //Cooperation
				CooperatorLine.push(oContextApprLine[i]);
			}
			
			/*ApprLine Statue*/
			if(oContextApprLine[i].ARESULT === '1'){oContextARESULT = 'Approved';}
			else if(oContextApprLine[i].ARESULT === '2'){oContextARESULT = 'Rejected';}
			else if(oContextApprLine[i].ARESULT === '3'){oContextARESULT = 'Cooperation Request';}
			/*ApprLine TimeStamp*/
			if(!oContextApprLine[i].RTEXT){
			}else{
				//alert(oContextApprLine[i].RTEXT);
				ApprLineText.push({"ENGLISH_NAME":oContextApprLine[i].ENGLISH_NAME,
							"RTEXT":oContextApprLine[i].RTEXT,
							"STATUS":oContextARESULT,
							"TIMESTAMP":oContextApprLine[i].ARDAT
				});
			}
		}
		
		/*Binding Approval Text */
		var ApprTextmodel = new sap.ui.model.json.JSONModel();
		ApprTextmodel.setData(ApprLineText);
		sap.ui.getCore().byId("oApprTextList").setModel(ApprTextmodel);
		
		/*Binding Approval Line */
		var ApprLineModel = new sap.ui.model.json.JSONModel();
		ApprLineModel.setData(ApprLine);
		sap.ui.getCore().byId("oCreateWF").setModel(ApprLineModel);
		
		/*Binding Cooperation Line */
		var CoopLineModel = new sap.ui.model.json.JSONModel();
		CoopLineModel.setData(CooperatorLine);
		sap.ui.getCore().byId("oIOCreateCP").setModel(CoopLineModel);
		
		/*Attachment File Download*/
		var oAttachFilePath = "/IMIOPRNavi/results/0/IMIOPRFileNavi/results",
		oContextAttachFile = oJsonModel.getProperty(oAttachFilePath),
		oAttachFileLength = oContextAttachFile.length;
		
		//URI/XSTRING DOWLOAD (not using)
		/*for(i=0; i<oAttachFileLength; i++){
			if(!oContextAttachFile[i].URI){//If URI not EXIST
				//Convert Xstring to File
			}else{//URI EXIST
				sap.ui.getCore().byId("oUploadItems").setUrl(oContextAttachFile[i].URI);
			}
		}*/
	},
	
	filterGlobally:function(oEvent){
		var sQuery = oEvent.getParameter("query");
		//console.log(sQuery);
		this._oGlobalFilter = null;
		
		if(sQuery){
			this._oGlobalFilter = new sap.ui.model.Filter([
			                                  new sap.ui.model.Filter("BGTDOC",sap.ui.model.FilterOperator.Contains,sQuery),
			                                  new sap.ui.model.Filter("RDATE",sap.ui.model.FilterOperator.Contains,sQuery),
			                                  new sap.ui.model.Filter("PERNR",sap.ui.model.FilterOperator.Contains,sQuery),
			                                  new sap.ui.model.Filter("BTSTS",sap.ui.model.FilterOperator.Contains,sQuery),
			                                  new sap.ui.model.Filter("AKOSTL",sap.ui.model.FilterOperator.Contains,sQuery),
			                                  new sap.ui.model.Filter("WEKRS",sap.ui.model.FilterOperator.Contains,sQuery),
			                                  new sap.ui.model.Filter("POSNR",sap.ui.model.FilterOperator.Contains,sQuery),
			                                  new sap.ui.model.Filter("AUFNR",sap.ui.model.FilterOperator.Contains,sQuery),
			                                  new sap.ui.model.Filter("BANFN",sap.ui.model.FilterOperator.Contains,sQuery),
			                                  new sap.ui.model.Filter("EBELN",sap.ui.model.FilterOperator.Contains,sQuery),
			                                  ],false)
		}
		this._filter();
	},
	
	_filter: function(){
		var oFilter = null;
		if(this._oGlobalFilter){
			oFilter = this._oGlobalFilter;
		}
		
		this.getView().byId("oPRTable").getBinding("rows").filter(oFilter,"Application");
	},
	
	toExportCSV : function(oEvent) {
		var oItems = this.getView().byId("oBdStatusDR"),
			oSelectionDate = oItems.getValue(),
			oDelimiter = oItems.getDelimiter();
		
		var dateFormat = sap.ui.core.format.DateFormat
				.getDateInstance({
					pattern : "yyyyMMdd"
				});
		var oFromDate = dateFormat.format(new Date(
				oSelectionDate.split(oDelimiter)[0])), oToDate = dateFormat
				.format(new Date(oSelectionDate
						.split(oDelimiter)[1]));

		var sUrl = sServiceUrl+"/IMPRStatus?" +
				"$filter= FRDATE eq '" + oFromDate
					+ "' and TODATE eq '" + oToDate
					+ "' and PERNR eq '"+oUserInfo.PERNR+"'&$format=xlsx";

		var encodeUrl = encodeURI(sUrl);
		sap.m.URLHelper.redirect(encodeUrl,true);
},
});