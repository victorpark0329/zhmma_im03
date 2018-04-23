jQuery.sap.require("jquery.sap.storage"); 
jQuery.sap.require("zhmmaim.util.Commons");
jQuery.sap.require("zhmmaim.util.Formatter");
jQuery.sap.require("zhmmaim.util.APP_CONTAINS");

sap.ui.controller("zhmmaim.controller.BudgetTransfer", {
	inputId:'',
	onInit: function() {
		oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
		oLocalStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
        window.oUserInfo = oJQueryStorage.get("UserInfo");
        
		var oSenderData = [
		                     {"S_POSID":"","S_POST1":"","S_B_WLGES":"","S_C_WLGES":"","S_T_WLGES":"","S_E_WLGES":"","S_VKOSTL":""}
		                   ];
		
		var oReceiverData = [
		                     {"R_POSID":"","R_POST1":"","R_B_WLGES":"","R_C_WLGES":"","R_T_WLGES":"","R_E_WLGES":"","R_VKOSTL":""}
		                   ];
		 
		var oSenderJSONModel = new sap.ui.model.json.JSONModel();
		var oReceiverJSONModel = new sap.ui.model.json.JSONModel();
		var ottt = new sap.ui.model.json.JSONModel();
		
		oSenderJSONModel.setData(oSenderData);
		oReceiverJSONModel.setData(oReceiverData);
		
		this.getView().byId("oSender").setModel(oSenderJSONModel);
		this.getView().byId("oReceiver").setModel(oReceiverJSONModel);
		
		//Default FISCAL Year (FISCAL)
		var THISYEAR = new Date().getFullYear();
		this.getView().byId("FISCAl").setValue(THISYEAR);

		//Table Navigation Tab Key
		zhmmaim.util.Commons.tableNavigation(this.getView().byId("oSender"),oSenderJSONModel);
		zhmmaim.util.Commons.tableNavigation(this.getView().byId("oReceiver"),oReceiverJSONModel);

		/*Edit Block - input Field*/
		this.getView().onAfterRendering=function(){
			jQuery('input[aria-autocomplete=list]').each(function(){
				jQuery('#'+this.id).attr('disabled', true);
			});
		};
	},

	/*Change the Table option by select action & select Reason Code*/
	/*BudgetTransferSelect: function(oEvent){
		var oBTSelectedItem = oEvent.getParameter("selectedItem");
			oKey = oBTSelectedItem.getKey();
				if(oKey === '2'){
					this.getView().byId("SenderPI").setEnabled(false);
					this.getView().byId("SenderDesc").setEnabled(false);
					this.getView().byId("SenderTrans").setEnabled(false);
					this.getView().byId("SenderCC").setEnabled(false);
					this.getView().byId("oSender").setWidth("100%");
					
					this.getView().byId("ReceiverPI").setEnabled(true);
					this.getView().byId("ReceiverDesc").setEnabled(true);
					this.getView().byId("ReceiverTrans").setEnabled(true);
					this.getView().byId("ReceiverCC").setEnabled(true);
					this.getView().byId("oReceiver").setWidth("100%");
					this.ReasonDefaultValue(oKey);
				}else if(oKey === '3'){
					this.getView().byId("SenderPI").setEnabled(true);
					this.getView().byId("SenderDesc").setEnabled(true);
					this.getView().byId("SenderTrans").setEnabled(true);
					this.getView().byId("SenderCC").setEnabled(true);
					this.getView().byId("oSender").setWidth("99%");
					
					this.getView().byId("ReceiverPI").setEnabled(false);
					this.getView().byId("ReceiverDesc").setEnabled(false);
					this.getView().byId("ReceiverTrans").setEnabled(false);
					this.getView().byId("ReceiverCC").setEnabled(false);
					this.getView().byId("oReceiver").setWidth("99%");
					this.ReasonDefaultValue(oKey);
				}else if(oKey === '4'){
					this.getView().byId("SenderPI").setEnabled(true);
					this.getView().byId("SenderDesc").setEnabled(true);
					this.getView().byId("SenderTrans").setEnabled(true);
					this.getView().byId("SenderCC").setEnabled(true);
					this.getView().byId("oSender").setWidth("98%");
					
					this.getView().byId("ReceiverPI").setEnabled(true);
					this.getView().byId("ReceiverDesc").setEnabled(true);
					this.getView().byId("ReceiverTrans").setEnabled(true);
					this.getView().byId("ReceiverCC").setEnabled(true);
					this.getView().byId("oReceiver").setWidth("98%");
					this.ReasonDefaultValue(oKey);
				}else{
					this.getView().byId("SenderPI").setEnabled(false);
					this.getView().byId("SenderDesc").setEnabled(false);
					this.getView().byId("SenderTrans").setEnabled(false);
					this.getView().byId("SenderCC").setEnabled(false);
					this.getView().byId("oSender").setWidth("97%");
					
					this.getView().byId("ReceiverPI").setEnabled(false);
					this.getView().byId("ReceiverDesc").setEnabled(false);
					this.getView().byId("ReceiverTrans").setEnabled(false);
					this.getView().byId("ReceiverCC").setEnabled(false);
					this.getView().byId("oReceiver").setWidth("97%");
				}
	},*/
	
	/*ReasonDefaultValue: function(oKey){
		//oData List
		var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl_Code,true);
		var oJsonModel = new sap.ui.model.json.JSONModel();
		
		oModel.read("IMCodeCommon?",null,["$filter=FIELD_NAME eq ('"+oKey+"')"],false,
				function(oData,response){
			oJsonModel.setData(oData);
		});

		this.inputId = this.getView().byId("REASON").getId();
		var oIOPossibleEntry = new sap.ui.xmlfragment("zhmmaim.fragment.PossibleEntryDialog", this);
		oIOPossibleEntry.open();
		oIOPossibleEntry.setModel(oJsonModel);
	},*/
	
	onUpload:function(){
		var oData = this.getView().byId("oUploadCollection").getItems();
		var name = [];
		var oAttachmentItem = [];
		for(var i=0;i<oData.length;i++){
			var filename = oData[i].getFileName(), //FileName
				requestId = oData[i]._requestIdName, //Upload count
				fileIndex = oData[i]._internalFileIndexWithinFileUploader; //FileIndex
			
			var oAttachmentFile = oData[i].getParent()._aFileUploadersForPendingUpload[requestId-1].oFileUpload.files;
			
			var value = [];
			//Convert to xstring
			var reader = new FileReader();
			reader.fileName = oAttachmentFile[fileIndex-1].name;
			
			reader.onload = function(readerEvt){
				if(!readerEvt){ //IE
				}else{ //Chrome
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
			var readAsBinary = reader.readAsBinaryString(oAttachmentFile[fileIndex-1]);
		}
	},
	
	onSubmitDialog: function(oEvent){
		var error = zhmmaim.util.Commons.oRequiredField(oEvent);
		if(error === false){
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
		if(!this.getView().byId("oIOCreateWF").getModel()){
			 //sap.m.MessageBox.alert("WorkFlow is empty", {
			 //   title: "Warning",                                   
			 //   onClose: null  ,                                      
			 //   styleClass: "sapThemeNegativeText" ,                                   
			 //   initialFocus: null,                                 
			 //   textDirection: sap.ui.core.TextDirection.Inherit     
			 //   });
			sap.m.MessageToast.show("WorkFlow is empty");			 
			return false;
			// error = false;
		}
		/*Sum Validation - if IOTypeSelect === Transfer*/
		if(this.getView().byId("IOTypeSelect").getSelectedKey() === "4"){
			var oSenderLength = this.getView().byId("oSender").getModel().getData().length,
				oReceiverLength = this.getView().byId("oReceiver").getModel().getData().length,
				oSenderSum = 0,
				oReceiverSum = 0;
			for(i=0;i<oSenderLength;i++){
				oContextTransfer = this.getView().byId("oSender").getModel().getProperty('/')[i].S_T_WLGES;
				if(oContextTransfer === ""){
					oContextTransfer = 0;
				}
				oSenderSum += parseFloat(oContextTransfer);
			}
			for(i=0;i<oReceiverLength;i++){
				oContextTransfer = this.getView().byId("oReceiver").getModel().getProperty('/')[i].R_T_WLGES;
				if(oContextTransfer === ""){
					oContextTransfer = 0;
				}
				oReceiverSum += parseFloat(oContextTransfer);
			}
			//console.log("oSenderSum:"+oSenderSum);
			//console.log("oReceiverSum:"+oReceiverSum);
			
			/*if(oSenderSum !== oReceiverSum){
				 
				 alert("Transfer Amount is not correct!", {
					    title: "Warning",                                   
					    onClose: null  ,                                      
					    styleClass: "sapThemeNegativeText" ,                                   
					    initialFocus: null,                                 
					    textDirection: sap.ui.core.TextDirection.Inherit     
					    });
				error = false;
			}*/
		}
		
		if(error === true){
			this.onUpload();
			var dialog = new sap.m.Dialog({
				title: 'Confirm',
				type: 'Message',
				content: new sap.m.Text({ text: 'Are you sure you want to submit?' }),
				beginButton: new sap.m.Button({
					text: 'Submit',
					press: [function(oEvent){
						this.onSubmit(oEvent);
						dialog.close();
					},this]
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function () {
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
	
	/*Budget Transfer Submit Process*/
	onSubmit: function(oEvent){
			/*Date Time Formatting - ARDAT , ARZET(ApprLineNavi)*/
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyyMMdd" }),
				timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern : "HHmmss" });
			
			ARDAT = dateFormat.format(new Date());
			ARZET = timeFormat.format(new Date());
			
			var ApprLineItem = [];
			
			/*Approval&Cooperation Line*/
			var oIOCreateWFLength = this.getView().byId("oIOCreateWF").getModel().getProperty('/0').length;
			//Approval Line Add
			for(var i=0; i<oIOCreateWFLength;i++){
				/*initial Requester's ATYPE = "A", Default ATYPE = "Q" 
	*/			//if(i===0){ATYPE="A";}else{ATYPE="";}
				if(i===0){ // if approver,
					ARESULT="1"; //ARESULT = Approved
					oContextARDAT = ARDAT; //save approval date 
					oContextARZET = ARZET; //save approval time
					}else{ // if another person,
						ARESULT=""; 
						oContextARDAT = ""; 
						oContextARZET = ""; 
						}
				ApprLineItem.push({"BGTDOC":"","BGTSEQ":(i+1).toString(),
					//"ATYPE":ATYPE,
					"ARESULT": ARESULT,
					"BGTTYPE": "A",
					"ARDAT": oContextARDAT,
					"ARZET": oContextARZET,
					"APERNR":this.getView().byId("oIOCreateWF").getModel().getProperty('/0/'+i+'').USER_ID,
					"DUTY_CODE":this.getView().byId("oIOCreateWF").getModel().getProperty('/0/'+i+'').DUTY_CODE,
					"DUTY_NAME":this.getView().byId("oIOCreateWF").getModel().getProperty('/0/'+i+'').DUTY_NAME,
					"ENGLISH_NAME":this.getView().byId("oIOCreateWF").getModel().getProperty('/0/'+i+'').ENGLISH_NAME
				});
			};
			
			//console.log(ApprLineItem.length);
			//console.log(oIOCreateCPLength);
			
			if(this.getView().byId("oIOCreateCP").getModel()){
				var oIOCreateCPLength = this.getView().byId("oIOCreateCP").getModel().getProperty('/').length;
				//Cooperation Line Add
				for(var i=0;i<oIOCreateCPLength;i++){
					ApprLineItem.push({"BGTDOC":"","BGTSEQ":(oIOCreateWFLength+i+1).toString(),
						"ARESULT": "",
						"BGTTYPE": "C",
						"ARDAT": "",
						"ARZET": "",
						"APERNR":this.getView().byId("oIOCreateCP").getModel().getProperty('/'+i+'').USER_ID,
						"DUTY_CODE":this.getView().byId("oIOCreateCP").getModel().getProperty('/'+i+'').DUTY_CODE,
						"DUTY_NAME":this.getView().byId("oIOCreateCP").getModel().getProperty('/'+i+'').DUTY_NAME,
						"ENGLISH_NAME":this.getView().byId("oIOCreateCP").getModel().getProperty('/'+i+'').ENGLISH_NAME,
						"ORIREQ":"",
						"BTDTYPE2":"",
						"CO_SEQ":"",
						});
				};
				//console.log(ApprLineItem);
			}
			
			/*Attachment*/
			var oAttachmentItem = [];
			if(this.getView().byId("oUploadCollection").getItems().length.toString() !== "0"){
				var oData = this.getView().byId("oUploadCollection").getItems();
				var oStorageAttachmentLength = oStorage[0].length;
				
				for(var i=0;i<oStorageAttachmentLength;i++){
					oAttachmentItem.push({
						"BGTDOC":"",
						"BGTSEQ":"1",
						"SEQ":(i+1).toString(),
						"FTYPE":"G",
						"ID":oName[0][i],
						"VALUE":oStorage[0][i]
					});
				}
			}
			
			/*Sender & Receiver Information*/
			var oSenderLength = this.getView().byId("oSender").getModel().getData().length,
				oReceiverLength = this.getView().byId("oReceiver").getModel().getData().length;
			var IMBudgetItem = [],
				oSenderSEQ = 1;
			
			for(i=0;i<oSenderLength;i++){
				//S_T_WLGES
				if(this.getView().byId("oSender").getModel().getProperty('/')[i].S_POSID !== ""
				|| this.getView().byId("oSender").getModel().getProperty('/')[i].S_POST1 !== ""){
				//oSender Item
					IMBudgetItem.push({"BGTDOC":"","BGTSEQ":oSenderSEQ.toString(),
						"RTYPE":"TR",
						"GUBUN":this.getView().byId("IOTypeSelect").getSelectedKey() ,//Transfer Type
						"RESON":this.getView().byId("REASON").getValue(), //Reason code
						"RESOND":this.getView().byId("REASOND").getValue(), //Reason Desciption
						"TEXT":this.getView().byId("KTEXT").getValue(),//Description
						"PURPO":this.getView().byId("PURPO").getValue(),//Purpose
						"ZMONTH":this.getView().byId("MONTH").getSelectedKey(), // Month
						"S_POSID":this.getView().byId("oSender").getModel().getProperty('/')[i].S_POSID, //PI(Sender)
						"S_POST1":this.getView().byId("oSender").getModel().getProperty('/')[i].S_POST1, //Description(Sender)
						"S_GJAHR":this.getView().byId("FISCAl").getValue(), //Approval Year(Sender)
						"S_ABJHR":this.getView().byId("FISCAl").getValue(), //Fiscal Year(Sender)
						"S_B_WLGES":this.getView().byId("oSender").getModel().getProperty('/'+i+'/S_B_WLGES/0').toString(), //Budget(Sender)
						"S_C_WLGES":this.getView().byId("oSender").getModel().getProperty('/'+i+'/S_C_WLGES/0').toString(), //Current Balance(Sender)
						"S_T_WLGES":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("oSender").getModel().getProperty('/')[i].S_T_WLGES), //Transfer(Sender)
						"S_E_WLGES":this.getView().byId("oSender").getModel().getProperty('/'+i+'/S_E_WLGES/0').toString(), //Ending Balance(Sender)
						"S_VKOSTL":this.getView().byId("oSender").getModel().getProperty('/')[i].S_VKOSTL, //Responsible Cost Center(Sender)
						"IMBudgetTransFileNavi":oAttachmentItem
					});
					oSenderSEQ++;
				}
				//console.log(IMBudgetItem)
			}
			for(i=0;i<oReceiverLength;i++){
				//R_T_WLGES
				if(this.getView().byId("oReceiver").getModel().getProperty('/')[i].R_POSID !== ""
					 ||this.getView().byId("oReceiver").getModel().getProperty('/')[i].R_POST1 !== ""){
					//oReceiver Item
					IMBudgetItem.push({
						"BGTDOC":"","BGTSEQ":(IMBudgetItem.length+1).toString(),
						"RTYPE":"TR",
						"GUBUN":this.getView().byId("IOTypeSelect").getSelectedKey() ,//Transfer Type
						"RESON":this.getView().byId("REASON").getValue(), //Reason code
						"RESOND":this.getView().byId("REASOND").getValue(), //Reason Desciption
						"TEXT":this.getView().byId("KTEXT").getValue(),//Description
						"PURPO":this.getView().byId("PURPO").getValue(),//Purpose
						"ZMONTH":this.getView().byId("MONTH").getSelectedKey(), // Month
						"R_POSID":this.getView().byId("oReceiver").getModel().getProperty('/')[i].R_POSID, //PI(Receiver)
						"R_POST1":this.getView().byId("oReceiver").getModel().getProperty('/')[i].R_POST1, //Description(Receiver)
						"R_GJAHR":this.getView().byId("FISCAl").getValue(), //Approval Year(Receiver)
						"R_ABJHR":this.getView().byId("FISCAl").getValue(), //Fiscal Year(Receiver)
						"R_B_WLGES":this.getView().byId("oReceiver").getModel().getProperty('/'+i+'/R_B_WLGES/0').toString(), //Budget(Receiver)
						"R_C_WLGES":this.getView().byId("oReceiver").getModel().getProperty('/'+i+'/R_C_WLGES/0').toString(), //Current Balance(Receiver)
						"R_T_WLGES":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("oReceiver").getModel().getProperty('/')[i].R_T_WLGES), //Transfer(Receiver)
						"R_E_WLGES":this.getView().byId("oReceiver").getModel().getProperty('/'+i+'/R_E_WLGES/0').toString(), //Ending Balance(Receiver)
						"R_VKOSTL":this.getView().byId("oReceiver").getModel().getProperty('/')[i].R_VKOSTL, //Responsible Cost Center(Receiver)
						"IMBudgetTransFileNavi":oAttachmentItem
					});
				}
				//console.log(IMBudgetItem);
			}
			
			var oEntry={"BGTDOC":"", //Document Number
					"RDATE":ARDAT, //Today
					"PERNR":oUserInfo.PERNR, //USER
					"KOSTL":oUserInfo.KOSTL, //Cost Center
					"RTYPE":"TR", // Document Type
					"BTSTS":"S", //
					"BTSUBJ":this.getView().byId("KTEXT").getValue(), //Document Title, Description
					"APPRV":"X", //BPM O
					"USER_ID":oUserInfo.PERNR, //USER_ID
					"ARESULT":"1",//Claim User Event Result Variable
					"IMApprBudNavi":IMBudgetItem, //Budget Item
					"IMApprLineNavi":ApprLineItem //Approval Line Item
		};
        //console.log(oEntry);
        
        sap.ui.core.BusyIndicator.show(10);
        
        /*OData Request SAVE Process*/
        OData.request({
        	
                    requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprTextNavi,IMApprBudNavi/IMBudgetTransFileNavi",
                    method : "GET",
                    headers : {
                                            "X-Requested-With" : 'X',
                                            }
                                },
                                function(data, response) {
                                            var oHeaders = {
                                            			"X-Requested-With" : 'X',
                                                        'Accept' : 'application/json',
                                };
                                            
                    OData.request({
                                            requestUri : sServiceUrl+"/IMApprHead",
                                            method : "POST",
                                            headers : oHeaders,
                                            data : oEntry
                                },
                                            function(data,request) {
                                       //     sap.m.MessageBox.show("Creation Successfully.", {
                                			    // title: "Success",                                   
                                			    // onClose: zhmmaim.util.Commons.onSubmitSuccess  ,                                      
                                			    // styleClass: "sapThemePositiveText" ,                                   
                                			    // initialFocus: null,                                 
                                			    // textDirection: sap.ui.core.TextDirection.Inherit     
                                			    // });
                                            sap.m.MessageToast.show("Created Successfully.", {onClose: zhmmaim.util.Commons.onSubmitSuccess});
                                            
                                },          function(err) {
		                                	var message = JSON.parse(err.response.body);
		                        	 		var errorMessage = message.error.innererror.errordetails;
		                        	 		var allMessage = "";
		                        	 		for(var i = 0; i<errorMessage.length;i++){
		                        	 			allMessage += errorMessage[i].message + ".  ";
		                        	 		}
		                        	 		
		                        			//sap.ui.core.BusyIndicator.hide();
		                           //     	sap.m.MessageBox.show(allMessage, {
		                        			//     title: "Creation Fail",                                   
		                        			//     onClose: zhmmaim.util.Commons.onSubmitFail ,                                      
		                        			//     styleClass: "sapThemeNegativeText" ,                                   
		                        			//     initialFocus: null,                                 
		                        			//     textDirection: sap.ui.core.TextDirection.Inherit     
		                    			    // });
		                    			    sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                }
                    
                    );
                    }, function(err) {
                                            var request = err.request;
                                            var response = err.response;
                                            alert("Error in Get -- Request " + request + " Response " + response);
                                });
        
	}
});