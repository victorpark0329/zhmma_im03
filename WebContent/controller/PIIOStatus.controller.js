jQuery.sap.require("jquery.sap.storage"); 
jQuery.sap.require("zhmmaim.util.Formatter");
jQuery.sap.require("zhmmaim.util.Commons");
jQuery.sap.require("zhmmaim.util.APP_CONTAINS");
jQuery.sap.require("zhmmaim.util.AttachPrint");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.ui.table.TablePersoController");
sap.ui
		.controller(
				"zhmmaim.controller.PIIOStatus",
				{
					onInit : function() {
						var getPersDataCalls = 0;
						oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
				        window.oUserInfo = oJQueryStorage.get("UserInfo");
				        
				      //Default From Date(the first day of This year)
				        var DFromDate = new Date(new Date().getFullYear(),0,1);
				        this.getView().byId("oBdStatusDR").setDateValue(DFromDate);
				        //Default To Date(Today)
				        var DToDate = new Date();
				        this.getView().byId("oBdStatusDR").setSecondDateValue(DToDate);
		 		        
				        //init and activate Table Personalization controller
						this._oTPC = new sap.ui.table.TablePersoController({
							table: this.getView().byId("oPIIOTable"),
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
						var aContextsName = aContexts.selectedItems.map(function(oContext){
							return oContext;
						});
						for(i=0;i<aContextsName.length;i++){
							//change setVisible = true
							this.getView().byId(aContextsName[i].getInfo()).setVisible(true);
						}
						oEvent.getSource().getBinding("items").filter([]);
					},

					handleChange : function(oEvent) {
						oEventId = oEvent.getSource().sId.split('--')[1];
						//console.log(oEventId)
						if(oEventId === "oIOType"){
							var oItems = this.getView().byId("oBdStatusDR"), 
								oSelectionDate = oItems.getValue(), 
								oDelimiter = oItems.getDelimiter();
						
							var oContextIOType = oEvent.getSource().getSelectedKey();
							//console.log(oContextIOType);
						}else if(oEventId === "oBdStatusDR"){
							var oItems = oEvent.getSource(), oSelectionDate = oItems
								.getValue(), oDelimiter = oItems.getDelimiter();
					
							var oContextIOType = this.getView().byId("oIOType").getSelectedKey();
							//console.log(oContextIOType);
						}
						var dateFormat = sap.ui.core.format.DateFormat
								.getDateInstance({
									pattern : "yyyyMMdd"
								});
						var oFromDate = dateFormat.format(new Date(
								oSelectionDate.split(oDelimiter)[0])), oToDate = dateFormat
								.format(new Date(oSelectionDate
										.split(oDelimiter)[1]));

						var oModel = new sap.ui.model.odata.ODataModel(
								sServiceUrl, true);
						var oJsonModel = new sap.ui.model.json.JSONModel();

						oModel.read("IMIOStatus?", null,
								[ "$filter=RTYPE eq '"+oContextIOType+"' and FRDATE eq '" + oFromDate
										+ "' and TODATE eq '" + oToDate
										+ "' and PERNR eq '"+oUserInfo.PERNR+"'" ],
								false, function(oData, response) {
									oJsonModel.setData(oData);
								});

						this.getView().setModel(oJsonModel);
						var oPIIOStatusTB = this.getView()
								.byId("oPIIOTable");
						oPIIOStatusTB.bindRows("/results");
						/*oPIIOStatusTB.sort(this.getView().byId("BGTDOC"),sap.ui.table.SortOrder.Descending);*/
					},
					
					showDetail : function(oEvent) {
						//check the oIOType
						var oIOTypeKey =  this.getView().byId("oIOType").getSelectedKey();
						if(oIOTypeKey === "IO"){ //IO Creation Detail
							if(!this.oInquiryDetailDialog) {
								var oInquiryDetailDialog = new sap.ui.xmlfragment("zhmmaim.fragment.InquiryIODetailDialog",this);
								var oFragment = new sap.ui.xmlfragment("zhmmaim.fragment.IOCreationDetail",this);
								oInquiryDetailDialog.insertContent(oFragment);
							}	
							oInquiryDetailDialog.open();
							
							/*Edit Block - input Field*/
							oFragment.onAfterRendering=function(){
								jQuery('#IOCreationCommons :input').attr('disabled', true);
							};
							
							
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
											[ "$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi,IMIOPRNavi/IMIOPRFileNavi" ],
											false, function(oData, response) {
												oJsonModel.setData(oData);
											});
							sap.ui.getCore().setModel(oJsonModel);
							
							/*Invisible Footer*/
							sap.ui.getCore().byId("IOCreationDetail").destroyFooter();
							
							/*Binding Odata*/
							var oContextIMIOPR = oJsonModel.getProperty("/IMIOPRNavi/results/0/");
							
							sap.ui.getCore().byId("oUploadCollection").setVisible(false);
							
							//pdf save button = true
							sap.ui.getCore().byId("oPDFSave").setVisible(true);
							
							sap.ui.getCore().byId("USER4").setValue(oContextIMIOPR.USER4); //Estimate Cost
							sap.ui.getCore().byId("POSID").setValue(oContextIMIOPR.POSID); //Project Code
							sap.ui.getCore().byId("Year").setValue(oContextIMIOPR.GJAHR); //Year(GJAHR)
							sap.ui.getCore().byId("KTEXT").setValue(oContextIMIOPR.KTEXT); //Project Code
							sap.ui.getCore().byId("PURPO").setValue(oContextIMIOPR.PURPO); //Year(GJAHR)
							sap.ui.getCore().byId("USER0").setValue(oContextIMIOPR.USER0); //Applicant
							sap.ui.getCore().byId("USER1").setValue(oContextIMIOPR.USER1); //Telephone
							sap.ui.getCore().byId("WERKS").setValue(oContextIMIOPR.WERKS); //Plant Code
							sap.ui.getCore().byId("WERKSD").setValue(oContextIMIOPR.WERKSD); //Plant Description
							sap.ui.getCore().byId("KOSTV").setValue(oContextIMIOPR.KOSTV); //CC.Request
							sap.ui.getCore().byId("KOSTVD").setValue(oContextIMIOPR.KOSTVD); //CC.Request Description
							sap.ui.getCore().byId("AKSTL").setValue(oContextIMIOPR.AKSTL); //CC.Response
							sap.ui.getCore().byId("AKSTLD").setValue(oContextIMIOPR.AKSTLD); //CC.Response Description
							sap.ui.getCore().byId("USER2").setValue(oContextIMIOPR.USER2); //Person.Responsible
							sap.ui.getCore().byId("USER5").setValue(oContextIMIOPR.USER5); //[Plan]Approval
							sap.ui.getCore().byId("USER7").setValue(oContextIMIOPR.USER7); //[Plan]PR
							sap.ui.getCore().byId("PODATE").setValue(oContextIMIOPR.PODATE); //[Plan]PO
							sap.ui.getCore().byId("GRDATE").setValue(oContextIMIOPR.GRDATE); //[Plan]GR
							sap.ui.getCore().byId("INSDATE").setValue(oContextIMIOPR.INSDATE); //[Plan]Install
							sap.ui.getCore().byId("USER8").setValue(oContextIMIOPR.USER8); //[Plan]Finish
							sap.ui.getCore().byId("IVPRO").setValue(oContextIMIOPR.IVPRO); //IM.Profile
							sap.ui.getCore().byId("IVPROD").setValue(oContextIMIOPR.IVPROD); //IM.Profile Description
							sap.ui.getCore().byId("IZWEK").setValue(oContextIMIOPR.IZWEK); //IM.Reason
							sap.ui.getCore().byId("IZWEKD").setValue(oContextIMIOPR.IZWEKD); //IM.Reason Description
							sap.ui.getCore().byId("ANLKL").setValue(oContextIMIOPR.ANLKL); //Asset Class
							sap.ui.getCore().byId("ANLKLD").setValue(oContextIMIOPR.ANLKLD); //Asset Class Description
							sap.ui.getCore().byId("AKTIV").setValue(oContextIMIOPR.AKTIV); //Capital Date
							sap.ui.getCore().byId("TXT50").setValue(oContextIMIOPR.TXT50); //Asset Name
							sap.ui.getCore().byId("EFFTA").setValue(oContextIMIOPR.EFFTA); //Tangible
							sap.ui.getCore().byId("EFFIN").setValue(oContextIMIOPR.EFFIN); //Intangible
							sap.ui.getCore().byId("TPLNR").setValue(oContextIMIOPR.TPLNR); //Location
							
							// BGTYPE Select
							var oPath = "/IMIOPRNavi/results/0/", oContextBGTYPE = oJsonModel.getProperty(oPath).BGTYPE;
							if (oContextBGTYPE === 'A') {
								sap.ui.getCore().byId("IOTypeSelect").setSelectedKey("A");
							} else if (oContextBGTYPE === 'B') {
								sap.ui.getCore().byId("IOTypeSelect").setSelectedKey("B");
							}
							
							/*Already Approved*/
							var oContextAPPROVED = oJsonModel.getProperty(oPath).APPROVED;
							if(oContextAPPROVED === "Y"){
								sap.ui.getCore().byId("APPROVED").setChecked(true);
							}else{
								sap.ui.getCore().byId("APPROVED").setChecked(false);
							}
							
							//Image Attachment
							var oFileNavi = oJsonModel.getProperty(oPath+"IMIOPRFileNavi/results/");
							if(oFileNavi){
								for(i=0;i<oFileNavi.length;i++){
									if(oFileNavi[i].FTYPE === "I"){
										var oContextImageValue = oFileNavi[i].URI;
									}
								}
								sap.ui.getCore().byId("oImage").setSrc(oContextImageValue);
							}
							
							//Existing Asset Token(3.IO Creation)
							var oTokenPath = oJsonModel.getProperty("/IMIOPRNavi/results/0/IMIOPRAssetNavi/results"),
								oTokensLength = oTokenPath.length;
							var IMIOPRAssetItem = [];
							
							for(i=0;i<oTokensLength;i++){
								var oTokens = new sap.m.Token({key:oTokenPath[i].SEQ,
														text:oTokenPath[i].ANLN1});
								IMIOPRAssetItem.push(oTokens);
                            }
							sap.ui.getCore().byId("oExistAssestToken").setTokens(IMIOPRAssetItem);
							
							// Existing Asset Select(3.IO Creation)
							var oContextASSET_DIS = oJsonModel.getProperty(oPath).ASSET_DIS;
							if (oContextASSET_DIS === 'Y'){
								sap.ui.getCore().byId("ASSET_DIS").setSelectedIndex(0);
							}else if (oContextASSET_DIS === 'N'){
								sap.ui.getCore().byId("ASSET_DIS").setSelectedIndex(1);
							};
							
							//Payback GJAHR RTNAMT DEFINE
							var oPaybackPath = "/IMIOPRNavi/results/0/IMIOPRROINavi/results",
								oContextPayback = oJsonModel.getProperty(oPaybackPath),
								oPaybackLength = oContextPayback.length,
								oContextUSER4 = oJsonModel.getProperty("/IMIOPRNavi/results/0/USER4"); //Est.Cost 媛
							
							for(var i=0; i<oPaybackLength;i++){
								sap.ui.getCore().byId("GJAHR"+[i+1]).setText(oContextPayback[i].GJAHR);
								sap.ui.getCore().byId("RTNAMT"+[i]).setValue(oContextPayback[i].RTNAMT);
							};
							
							//Default Even Revenue & ROI Calculate value
							var oSum = 0,
								oAverage = 0,
								oROI = 0,
								oBlank = 0;
							
							for(i=0;i<oPaybackLength;i++){
								if(parseInt(oContextPayback[i].RTNAMT)){ //if value exists
									oSum += parseInt(oContextPayback[i].RTNAMT);
								}else{ // if value is empty or "0"
									oBlank++;
								}
							}
							var oGJAHRCount = (oPaybackLength)-oBlank; // the year count which has value
							
							//oAverage = oSum / oGJAHRCount
							if(oSum !== 0){
								oAverage = oSum/oGJAHRCount;
							}else{
								
							}
							
							//oROI = USER4 / oAverage
							if(oAverage !== 0){
								oROI = oContextUSER4/oAverage;
							}else{
								oROI = "";
							}
							
							//Display on the Screen
							//sap.ui.getCore().byId("EvenRev").setValue(oAverage);
							sap.ui.getCore().byId("ROI").setValue(oROI);
							
							//console.log(oAverage);
							//console.log(oROI);
							
						}else if(oIOTypeKey === "CL"){ // Complete IO Detail
							if(!this.oInquiryDetailDialog) {
								var oInquiryDetailDialog = new sap.ui.xmlfragment("zhmmaim.fragment.InquiryIODetailDialog",this);
								var oFragment = new sap.ui.xmlfragment("zhmmaim.fragment.CompleteIODetail",this);
								oInquiryDetailDialog.insertContent(oFragment);
							}	
							oInquiryDetailDialog.open();
							
							/*Edit Block - input Field*/
							oFragment.onAfterRendering=function(){
								jQuery('#CompleteIOCommons :input').attr('disabled', true);
							};
							
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
											[ "$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi" ],
											false, function(oData, response) {
												oJsonModel.setData(oData);
											});
							sap.ui.getCore().setModel(oJsonModel);
							
							/*Invisible Footer*/
							sap.ui.getCore().byId("CompleteIODetail").destroyFooter();
							
							/*Binding Odata*/
							var oContextIMIOPR = oJsonModel.getProperty("/IMIOPRNavi/results/0/");
							
							sap.ui.getCore().byId("AUFNR").setValue(oContextIMIOPR.AUFNR); //IO
							sap.ui.getCore().byId("KTEXT").setValue(oContextIMIOPR.KTEXT); //Description
							sap.ui.getCore().byId("PURPO").setValue(oContextIMIOPR.PURPO); //Purpose
							sap.ui.getCore().byId("USER5").setValue(oContextIMIOPR.USER5); //[Plan]Approval
							sap.ui.getCore().byId("USER7").setValue(oContextIMIOPR.USER7); //[Plan]PR
							sap.ui.getCore().byId("PODATE").setValue(oContextIMIOPR.PODATE); //[Plan]PO
							sap.ui.getCore().byId("GRDATE").setValue(oContextIMIOPR.GRDATE); //[Plan]GR
							sap.ui.getCore().byId("INSDATE").setValue(oContextIMIOPR.INSDATE); //[Plan]Install
							sap.ui.getCore().byId("USER8").setValue(oContextIMIOPR.USER8); //[Plan]Finish
							sap.ui.getCore().byId("A_APP_DATE").setValue(oContextIMIOPR.A_APP_DATE); //[Actual]Approval
							sap.ui.getCore().byId("A_PRDATE").setValue(oContextIMIOPR.A_PRDATE); //[Actual]PR
							sap.ui.getCore().byId("A_PODATE").setValue(oContextIMIOPR.A_PODATE); //[Actual]PO
							sap.ui.getCore().byId("A_GRDATE").setValue(oContextIMIOPR.A_GRDATE); //[Actual]GR
							sap.ui.getCore().byId("A_INSDATE").setValue(oContextIMIOPR.A_INSDATE); //[Actual]Install
							sap.ui.getCore().byId("A_FINISH").setValue(oContextIMIOPR.A_FINISH); //[Actual]Finish
							sap.ui.getCore().byId("EFFTA").setValue(oContextIMIOPR.EFFTA); //Tangible
							sap.ui.getCore().byId("EFFIN").setValue(oContextIMIOPR.EFFIN); //Intangible
							sap.ui.getCore().byId("TPLNR").setValue(oContextIMIOPR.TPLNR); //Location
							
							//Payback GJAHR RTNAMT DEFINE
							var oPaybackPath = "/IMIOPRNavi/results/0/IMIOPRROINavi/results",
								oContextPayback = oJsonModel.getProperty(oPaybackPath),
								oPaybackLength = oContextPayback.length,
								oContextUSER4 = oJsonModel.getProperty("IMIOPRNavi/results/0/USER4"); //Est.Cost value
							
							for(var i=0; i<oPaybackLength;i++){
								sap.ui.getCore().byId("GJAHR"+[i+1]).setText(oContextPayback[i].GJAHR);
								sap.ui.getCore().byId("RTNAMT"+[i]).setValue(oContextPayback[i].RTNAMT);
							};
							
							//Default Even Revenue & ROI Calculate value
							var oSum = 0,
								oAverage = 0,
								oROI = 0,
								oBlank = 0;
							
							for(i=0;i<oPaybackLength;i++){
								if(parseInt(oContextPayback[i].RTNAMT)){ //if value exists
									oSum += parseInt(oContextPayback[i].RTNAMT);
								}else{ // if value is empty or "0"
									oBlank++;
								}
							}
							var oGJAHRCount = (oPaybackLength)-oBlank; // the year count which has value
							
							//oAverage = oSum / oGJAHRCount
							if(oSum !== 0){
								oAverage = oSum/oGJAHRCount;
							}else{
								
							}
							
							//oROI = USER4 / oAverage
							if(oAverage !== 0){
								oROI = oContextUSER4/oAverage;
							}else{
								oROI = "";
							}
							
							//Display on the Screen
							//sap.ui.getCore().byId("EvenRev").setValue(oAverage);
							sap.ui.getCore().byId("ROI").setValue(oROI);
							
							//console.log(oAverage);
							//console.log(oROI);
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
						/*var oAttachFilePath = "/IMIOPRNavi/results/0/IMIOPRFileNavi/results",
							oContextAttachFile = oJsonModel.getProperty(oAttachFilePath),
							oAttachFileLength = oContextAttachFile.length;*/
						
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
							                                  new sap.ui.model.Filter("VKOSTL",sap.ui.model.FilterOperator.Contains,sQuery),
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
						
						this.getView().byId("oPIIOTable").getBinding("rows").filter(oFilter,"Application");
					},
					
					/*Export to Excel with Table data*/
					toExportCSV : function(oEvent) {
						var oItems = this.getView().byId("oBdStatusDR"),
							oSelectionDate = oItems.getValue(),
							oDelimiter = oItems.getDelimiter();
						
						var oContextIOType = this.getView().byId("oIOType").getSelectedKey();
						
						var dateFormat = sap.ui.core.format.DateFormat
								.getDateInstance({
									pattern : "yyyyMMdd"
								});
						var oFromDate = dateFormat.format(new Date(
								oSelectionDate.split(oDelimiter)[0])), oToDate = dateFormat
								.format(new Date(oSelectionDate
										.split(oDelimiter)[1]));
		
						var sUrl = sServiceUrl+"/IMIOStatus?" +
								"$filter=RTYPE eq '"+oContextIOType+"' and FRDATE eq '" + oFromDate
										+ "' and TODATE eq '" + oToDate
										+ "' and PERNR eq '"+oUserInfo.PERNR+"'&$format=xlsx";

						var encodeUrl = encodeURI(sUrl);
						sap.m.URLHelper.redirect(encodeUrl,true);
				},
				});