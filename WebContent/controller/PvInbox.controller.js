jQuery.sap.require("zhmmaim.util.Formatter");
jQuery.sap.require("zhmmaim.util.Commons");
jQuery.sap.require("zhmmaim.util.AttachPrint");
jQuery.sap.require("zhmmaim.util.APP_CONTAINS");

sap.ui
    .controller(
        "zhmmaim.controller.PvInbox",
        {

          /**
           * Called when a controller is instantiated and its View
           * controls (if available) are already created. Can be used
           * to modify the View before it is displayed, to bind event
           * handlers and do other one-time initialization.
           *
           * @memberOf view.PvInbox
           */
          onInit : function() {
            oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
            oStorage = [];
            oName = [];

                        var tController = this;
                        var oRedirectInfo = oJQueryStorage.get("redirectionInfo");
                        oJQueryStorage.remove("redirectionInfo");

                window.oUserInfo = oJQueryStorage.get("UserInfo");
            // oData List
            var oModel = new sap.ui.model.odata.ODataModel(
                sServiceUrl, true);
            var oJsonModel = new sap.ui.model.json.JSONModel();

            oModel.read("IMInboxInfo?", null,
                [ "$filter=PERNR eq '"+oUserInfo.PERNR+"'"], false,
                function(oData, response) {
                  oJsonModel.setData(oData);

                  if (oRedirectInfo != null) {
                                        // results
                                        var jDat = oJsonModel.getProperty("/results");
                                        var redirectItem = null;
                                        jDat.forEach( function(pDat){
                                              if (oRedirectInfo.BGTC == pDat.BGTDOC) {
                                                     redirectItem = pDat;
                                              }
                                        } );
                                        if (redirectItem != null) {
                                               tController.gotoDetailReal(redirectItem);
                                        }
                  }
                });
            this.getView().byId("oPvInboxList")
                .setModel(oJsonModel);
            //console.log(oJsonModel);

          },

          onHideMenu : function(oEvent) {
            var oSplitApp = this.getView().byId("oSplitApp"), oMasterNav = oSplitApp
                .getAggregation("_navMaster");

            var sId = this.getView().byId("onHideInspect");

            oMasterNav.setVisible(!oMasterNav.getVisible());
            if(sId.getIcon() === "sap-icon://full-screen"){
              sId.setIcon("sap-icon://exit-full-screen");
            }else{
              sId.setIcon("sap-icon://full-screen");
            }
          },

                    gotoDetail : function(oEvent) {
                        this.gotoDetailReal( oEvent.getParameter("listItem").getBindingContext().getObject() );
                    },

                    gotoDetailReal: function(oList) {
                        var oPage = this.getView().byId("oPVInboxDetail");
                        //var oList = oEvent.getParameter("listItem").getBindingContext().getObject(),
                     var oDocType = oList.DOC_TYPE,
                           oContextBGTDOC = oList.BGTDOC,
                           oProcessStatus = oList.BGTTYPE,
                           oContextATYPE = oList.ATYPE; //Auto Cooperation Flag

            /* Destroy All Fragment Content to reset Detail View and Duplicate variable*/
            this.getView().byId("oPvInboxDetail").destroyContent();

            if (oDocType === "ABP Planning") {
              var oABPPlanningFragment = new sap.ui.xmlfragment(
                  "zhmmaim.fragment.ABPDetail", this);
              this.getView().byId("oPvInboxDetail").insertContent(
                  oABPPlanningFragment);

                 var idABPdelete = sap.ui.getCore().byId("idABPdelete");
                 if (idABPdelete) { idABPdelete.setVisible(false); }

              /*Edit Block - input Field*/
              oABPPlanningFragment.onAfterRendering=function(){
                jQuery('#ABPCommons :input').attr('disabled', true);
              };

              sap.ui.getCore().byId("ZPROJ").setShowValueHelp(false);

              /*Budget Planning Creation Rest Call*/
              var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
              var oJsonModel = new sap.ui.model.json.JSONModel();

              oModel
                  .read(
                      "IMApprHead(BGTDOC='" + oContextBGTDOC
                          + "')/?",
                      null,
                      [ "$expand=IMApprLineNavi,IMABPDetaNavi/IMABPItemNavi,IMABPDetaNavi/IMABPROINavi,IMApprTextNavi,IMABPDetaNavi/IMABPFileNavi" ],
                      false, function(oData, response) {
                        oJsonModel.setData(oData);
                      });
              this.getView().setModel(oJsonModel);
              /*Item Add Button Editable = False*/
              sap.ui.getCore().byId("oABPAdd").setEnabled(false);
              /*Binding Odata*/

              var oContextDetail = oJsonModel.getProperty('/IMABPDetaNavi/results/0/');

              sap.ui.getCore().byId("ZPROJ").setValue(oContextDetail.ZPROJ);
              sap.ui.getCore().byId("GJAHR").setValue(oContextDetail.GJAHR);
              sap.ui.getCore().byId("ZPROJD").setValue(oContextDetail.ZPROJD);
              sap.ui.getCore().byId("KTEXT").setValue(oContextDetail.KTEXT);

              //ABP Detail Item Binding
              var ItemPath = "/IMABPDetaNavi/results/";
              sap.ui.getCore().byId("oDetaTB").bindRows(ItemPath);

            } else if (oDocType === "Budget Transfer") {
              var oBudgetTransferFragment = new sap.ui.xmlfragment(
                  "zhmmaim.fragment.BudgetTransferDetail",
                  this);
              this.getView().byId("oPvInboxDetail").insertContent(
                  oBudgetTransferFragment);

              if(oProcessStatus === ""){//Confirm
                /*Edit Block - input Field*/
                oBudgetTransferFragment.onAfterRendering=function(){
                  jQuery('#BudgetTransferCommons :input').attr('disabled', false);
                  jQuery('#FISCAl-inner').attr('disabled', true);
                  jQuery('#REASON-inner').attr('disabled', true);
                };

                sap.ui.getCore().byId("IOTypeSelect").setEnabled(false);
                sap.ui.getCore().byId("MONTH").setEnabled(true);
                sap.ui.getCore().byId("REASON").setShowValueHelp(true);

                sap.ui.getCore().byId("oAddSender").setEnabled(true);
                sap.ui.getCore().byId("oAddReceiver").setEnabled(true);
              }else{
                /*Edit Block - input Field*/
                oBudgetTransferFragment.onAfterRendering=function(){
                  jQuery('#BudgetTransferCommons :input').attr('disabled', true);
                };

                sap.ui.getCore().byId("IOTypeSelect").setEnabled(false);
                sap.ui.getCore().byId("MONTH").setEnabled(false);
                sap.ui.getCore().byId("REASON").setShowValueHelp(false);

                sap.ui.getCore().byId("oAddSender").setEnabled(false);
                sap.ui.getCore().byId("oAddReceiver").setEnabled(false);
              }

              /*Budget Transfer Creation Rest Call*/
              var oModel = new sap.ui.model.odata.ODataModel(
                  sServiceUrl, true);
              var oJsonModel = new sap.ui.model.json.JSONModel();

              oModel
                  .read(
                      "IMApprHead(BGTDOC='" + oContextBGTDOC
                          + "')/?",
                      null,
                      [ "$expand=IMApprLineNavi,IMApprBudNavi/IMBudgetTransFileNavi,IMApprTextNavi" ],
                      false, function(oData, response) {
                        oJsonModel.setData(oData);
                      });
              this.getView().setModel(oJsonModel);

              /*Binding Odata*/
              // IOTypeSelect Select(2.Budget Transfer)
              var oContextIMBudget = oJsonModel.getProperty("/IMApprBudNavi/results/0/");
              sap.ui.getCore().byId("IOTypeSelect").setSelectedKey(oContextIMBudget.GUBUN); //Transfer Type
              if(oContextIMBudget.S_GJAHR != "0000"){
                sap.ui.getCore().byId("FISCAl").setValue(oContextIMBudget.S_GJAHR); // Fiscal Year (S_GJAHR)
              }else if(oContextIMBudget.R_GJAHR !="0000"){
                sap.ui.getCore().byId("FISCAl").setValue(oContextIMBudget.R_GJAHR); // Fiscal Year (R_GJAHR)
              }
              sap.ui.getCore().byId("MONTH").setSelectedKey(oContextIMBudget.ZMONTH); //Month
              sap.ui.getCore().byId("REASON").setValue(oContextIMBudget.RESON); //Reason
              sap.ui.getCore().byId("REASOND").setValue(oContextIMBudget.RESOND); //Reason Description
              sap.ui.getCore().byId("KTEXT").setValue(oContextIMBudget.TEXT); //Description
              sap.ui.getCore().byId("PURPO").setValue(oContextIMBudget.PURPO); //Purpose

              //Budget Transfer Table Binding(Sender/Receiver)
              var oContextIMBudgetTransferPath = "/IMApprBudNavi/results",
                oContextIMBudgetTransfer = oJsonModel.getProperty(oContextIMBudgetTransferPath),
                oContextIMBudgetTransferLength = oContextIMBudgetTransfer.length;

              var oSenderItem = [],
                oReceiverItem = [];

              var oSenderJSONModel = new sap.ui.model.json.JSONModel();
              var oReceiverJSONModel = new sap.ui.model.json.JSONModel();

              /*change Number Format(Currency -> Float)*/
              sap.ui.getCore().byId("SenderBudget").bindProperty("value", {path:'S_B_WLGES',type: new sap.ui.model.type.Float()});
              sap.ui.getCore().byId("SenderBalance").bindProperty("value", {path:'S_C_WLGES',type: new sap.ui.model.type.Float()});
              sap.ui.getCore().byId("SenderTrans").bindProperty("value", {path:'S_T_WLGES',type: new sap.ui.model.type.Float()});
              sap.ui.getCore().byId("SenderEnding").bindProperty("value", {path:'S_E_WLGES',type: new sap.ui.model.type.Float()});

              sap.ui.getCore().byId("ReceiverBudget").bindProperty("value", {path:'R_B_WLGES',type: new sap.ui.model.type.Float()});
              sap.ui.getCore().byId("ReceiverBalance").bindProperty("value", {path:'R_C_WLGES',type: new sap.ui.model.type.Float()});
              sap.ui.getCore().byId("ReceiverTrans").bindProperty("value", {path:'R_T_WLGES',type: new sap.ui.model.type.Float()});
              sap.ui.getCore().byId("ReceiverEnding").bindProperty("value", {path:'R_E_WLGES',type: new sap.ui.model.type.Float()});

              var oSenderData = [
                                   {"S_POSID":"","S_POST1":"","S_B_WLGES":"","S_C_WLGES":"","S_T_WLGES":"","S_E_WLGES":"","S_VKOSTL":""}
                                 ];

              var oReceiverData = [
                                   {"R_POSID":"","R_POST1":"","R_B_WLGES":"","R_C_WLGES":"","R_T_WLGES":"","R_E_WLGES":"","R_VKOSTL":""}
                                 ];

              for(i=0;i<oContextIMBudgetTransferLength;i++){
                /*if(oContextIMBudgetTransfer[i].S_POSID || oContextIMBudgetTransfer[i].S_POST1){//Sender
                  console.log("Sender exists");
                  oSenderItem.push(oContextIMBudgetTransfer[i]);
                  oSenderJSONModel.setData(oSenderItem);
                  sap.ui.getCore().byId("oSender").setModel(oSenderJSONModel);
                }else{
                  console.log("Sender exists2")
                  oSenderJSONModel.setData(oSenderData);
                  sap.ui.getCore().byId("oSender").setModel(oSenderJSONModel);

                  sap.ui.getCore().byId("SenderBudget").bindProperty("value", {path:'S_B_WLGES',type: new sap.ui.model.type.Currency()});
                  sap.ui.getCore().byId("SenderBalance").bindProperty("value", {path:'S_C_WLGES',type: new sap.ui.model.type.Currency()});
                  sap.ui.getCore().byId("SenderTrans").bindProperty("value", {path:'S_T_WLGES'});
                  sap.ui.getCore().byId("SenderEnding").bindProperty("value", {path:'S_E_WLGES',type: new sap.ui.model.type.Currency()});
                } */
                if(Number(oContextIMBudgetTransfer[i].S_T_WLGES) != 0){//Sender
                  oSenderItem.push(oContextIMBudgetTransfer[i]);
                  oSenderJSONModel.setData(oSenderItem);
                  sap.ui.getCore().byId("oSender").setModel(oSenderJSONModel);
                }else{
                }

                /*if(oContextIMBudgetTransfer[i].R_POSID || oContextIMBudgetTransfer[i].R_POST1){//Receiver
                  console.log("Receiver exists");
                  oReceiverItem.push(oContextIMBudgetTransfer[i]);
                  oReceiverJSONModel.setData(oReceiverItem);
                  sap.ui.getCore().byId("oReceiver").setModel(oReceiverJSONModel);
                }else{
                  oReceiverJSONModel.setData(oReceiverData);
                  sap.ui.getCore().byId("oReceiver").setModel(oReceiverJSONModel);

                  sap.ui.getCore().byId("ReceiverBudget").bindProperty("value", {path:'R_B_WLGES',type: new sap.ui.model.type.Currency()});
                  sap.ui.getCore().byId("ReceiverBalance").bindProperty("value", {path:'R_C_WLGES',type: new sap.ui.model.type.Currency()});
                  sap.ui.getCore().byId("ReceiverTrans").bindProperty("value", {path:'R_T_WLGES'});
                  sap.ui.getCore().byId("ReceiverEnding").bindProperty("value", {path:'R_E_WLGES',type: new sap.ui.model.type.Currency()});
                }*/
                if(Number(oContextIMBudgetTransfer[i].R_T_WLGES) != 0){//Receiver
                  oReceiverItem.push(oContextIMBudgetTransfer[i]);
                  oReceiverJSONModel.setData(oReceiverItem);
                  sap.ui.getCore().byId("oReceiver").setModel(oReceiverJSONModel);
                }else{
                }
              }
              /*
               * Doc Type = IO Creation
               *
               * */
            } else if (oDocType === "IO Creation") {
              var oIOCreationFragment = sap.ui.xmlfragment(
                  "zhmmaim.fragment.IOCreationDetail", this);
              this.getView().byId("oPvInboxDetail").insertContent(
                  oIOCreationFragment);
              /*Edit Block - input Field*/
              oIOCreationFragment.onAfterRendering=function(){
                jQuery('#IOCreationCommons :input').attr('disabled', true);
              };

              sap.ui.getCore().byId("IOTypeSelect").setEnabled(false);
              sap.ui.getCore().byId("APPROVED").setEnabled(false);

              sap.ui.getCore().byId("WERKS").setShowValueHelp(false);
              sap.ui.getCore().byId("KOSTV").setShowValueHelp(false);
              sap.ui.getCore().byId("AKSTL").setShowValueHelp(false);
              sap.ui.getCore().byId("IVPRO").setShowValueHelp(false);
              sap.ui.getCore().byId("IZWEK").setShowValueHelp(false);

              sap.ui.getCore().byId("USER5").setEnabled(false);
              sap.ui.getCore().byId("USER7").setEnabled(false);
              sap.ui.getCore().byId("PODATE").setEnabled(false);
              sap.ui.getCore().byId("GRDATE").setEnabled(false);
              sap.ui.getCore().byId("INSDATE").setEnabled(false);
              sap.ui.getCore().byId("USER8").setEnabled(false);
              sap.ui.getCore().byId("AKTIV").setEnabled(false);
              sap.ui.getCore().byId("ASSET_DIS").setEnabled(false);

              sap.ui.getCore().byId("C_BalanceD").setVisible(false);

              /*Number Formatting - USER4*/
              sap.ui.getCore().byId("USER4").bindProperty("value", {path:'/USER4',type: new sap.ui.model.type.Currency()});
              /*IO Creation Rest Call*/
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
              this.getView().setModel(oJsonModel);

              /*Attachment Bind*/
              var oAttachLength = oJsonModel.getProperty('/IMIOPRNavi/results/0/IMIOPRFileNavi/results/').length;
              if(oAttachLength>0){
                sap.ui.getCore().byId("oAlreadyUpload").setVisible(true);
                sap.ui.getCore().byId("oAlreadyUpload").setNumberOfAttachmentsText("Previous Attachments("+oAttachLength+")");
                //sap.ui.getCore().byId("oAlreadyUpload").setModel(oAttachModel);
              }else{
                sap.ui.getCore().byId("oAlreadyUpload").setVisible(false);
              }

              /*Binding Odata*/
              var oContextIMIOPR = oJsonModel.getProperty("/IMIOPRNavi/results/0/");

              sap.ui.getCore().byId("USER4").setValue(oContextIMIOPR.USER4); //Estimate Cost
              sap.ui.getCore().byId("POSID").setValue(oContextIMIOPR.POSID); //Project Code
              sap.ui.getCore().byId("Year").setValue(oContextIMIOPR.GJAHR); //Year(GJAHR)
              sap.ui.getCore().byId("KTEXT").setValue(oContextIMIOPR.KTEXT); //Project Code
              sap.ui.getCore().byId("PURPO").setValue(oContextIMIOPR.PURPO); //Year(GJAHR)
              sap.ui.getCore().byId("WERKS").setValue(oContextIMIOPR.WERKS); //Plant Code
              sap.ui.getCore().byId("WERKSD").setValue(oContextIMIOPR.WERKSD); //Plant Description
              sap.ui.getCore().byId("KOSTV").setValue(oContextIMIOPR.KOSTV); //CC.Request
              sap.ui.getCore().byId("KOSTVD").setValue(oContextIMIOPR.KOSTVD); //CC.Request Description
              sap.ui.getCore().byId("AKSTL").setValue(oContextIMIOPR.AKSTL); //CC.Response
              sap.ui.getCore().byId("AKSTLD").setValue(oContextIMIOPR.AKSTLD); //CC.Response Description
              sap.ui.getCore().byId("USER0").setValue(oContextIMIOPR.USER0); //Applicant
              sap.ui.getCore().byId("USER1").setValue(oContextIMIOPR.USER1); //Applicant Telephone
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

              // BGTYPE Select(3.IO Creation)
              var oThisModel = this.getView().getModel(), oPath = "/IMIOPRNavi/results/0/", oContextBGTYPE = oThisModel
                  .getProperty(oPath).BGTYPE;
              if (oContextBGTYPE === 'A') {
                sap.ui.getCore().byId("IOTypeSelect").setSelectedKey("A");
              } else if (oContextBGTYPE === 'B') {
                sap.ui.getCore().byId("IOTypeSelect").setSelectedKey("B");
              }

              //Image Attachment
              var oFileNavi = oThisModel.getProperty(oPath+"IMIOPRFileNavi/results/");

              for(i=0;i<oFileNavi.length;i++){
                if(oFileNavi[i].FTYPE === "I"){
                  var oContextImageValue = oFileNavi[i].URI;
                }
              }
              sap.ui.getCore().byId("oImage").setSrc(oContextImageValue);

              /*Already Approved*/
              var oContextAPPROVED = oThisModel.getProperty(oPath).APPROVED;
              if(oContextAPPROVED === "Y"){
                sap.ui.getCore().byId("APPROVED").setChecked(true);
              }else{
                sap.ui.getCore().byId("APPROVED").setChecked(false);
              }

              //Existing Asset Token(3.IO Creation)
              var oTokenPath = oThisModel.getProperty("/IMIOPRNavi/results/0/IMIOPRAssetNavi/results"),
                oTokensLength = oTokenPath.length;
              var IMIOPRAssetItem = [];

              for(i=0;i<oTokensLength;i++){
                var oTokens = new sap.m.Token({key:oTokenPath[i].SEQ,
                            text:oTokenPath[i].ANLN1});
                IMIOPRAssetItem.push(oTokens);
                            }
              sap.ui.getCore().byId("oExistAssestToken").setTokens(IMIOPRAssetItem);

              // Existing Asset Select(3.IO Creation)
              var oContextASSET_DIS = oThisModel.getProperty(oPath).ASSET_DIS;
              if (oContextASSET_DIS === 'Y'){
                sap.ui.getCore().byId("ASSET_DIS").setSelectedIndex(0);
              }else if (oContextASSET_DIS === 'N'){
                sap.ui.getCore().byId("ASSET_DIS").setSelectedIndex(1);
              };

              //Payback GJAHR RTNAMT DEFINE
              var oPaybackPath = "/IMIOPRNavi/results/0/IMIOPRROINavi/results",
                oContextPayback = this.getView().getModel().getProperty(oPaybackPath),
                oPaybackLength = oContextPayback.length,
                oContextUSER4 = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/USER4"); //Est.Cost 媛

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
                if(parseInt(oContextPayback[i].RTNAMT)){ //媛믪씠 議댁옱븯硫
                  oSum += parseInt(oContextPayback[i].RTNAMT);
                }else{ // 媛믪씠 0씠嫄곕굹 뾾쑝硫
                  oBlank++;
                }
              }
              var oGJAHRCount = (oPaybackLength)-oBlank; // 媛믪씠 엯젰맂 뿰룄 닔
              //oAverage = oSum / oGJAHRCount
              if(oSum !== 0){
                oAverage = oSum/oGJAHRCount;
              }else{

              }

              //oROI = USER4 / oAverage
              if(oAverage !== 0){
                oROI = Math.round(oContextUSER4/oAverage * 100) / 100;
              }else{
                oROI = "";
              }

              //Display on the Screen
              //sap.ui.getCore().byId("EvenRev").setValue(oAverage);
              sap.ui.getCore().byId("ROI").setValue(oROI);

              //console.log(oAverage);
              //console.log(oROI);

            } else if (oDocType === "PR Creation") {
              var oPRCreationFragment = new sap.ui.xmlfragment(
                  "zhmmaim.fragment.PRCreationDetail", this);
              this.getView().byId("oPvInboxDetail").insertContent(
                  oPRCreationFragment);

                var idPRdelete = sap.ui.getCore().byId("idPRdelete");
                 if (idPRdelete) { idPRdelete.setVisible(false); }
                 
              sap.ui.getCore().byId("LFDAT").setEnabled(false);
              sap.ui.getCore().byId("WERKS").setShowValueHelp(false);
              sap.ui.getCore().byId("LGORT").setShowValueHelp(false);
              sap.ui.getCore().byId("EKGRP").setShowValueHelp(false);
              sap.ui.getCore().byId("oAddPRItem").setEnabled(false);

              /*PR Creation Rest Call*/
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
              this.getView().setModel(oJsonModel);

              /*Attachment Bind*/
              var oAttachLength = oJsonModel.getProperty('/IMIOPRNavi/results/0/IMIOPRFileNavi/results/').length;
              if(oAttachLength>0){
                sap.ui.getCore().byId("oAlreadyUpload").setVisible(true);
                sap.ui.getCore().byId("oAlreadyUpload").setNumberOfAttachmentsText("Previous Attachments("+oAttachLength+")");
                //sap.ui.getCore().byId("oAlreadyUpload").setModel(oAttachModel);
              }else{
                sap.ui.getCore().byId("oAlreadyUpload").setVisible(false);
              }

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

              /*change Number Format(Currency -> Float)*/
              sap.ui.getCore().byId("NETWR").bindProperty("value", {path:'NETWR',type: new sap.ui.model.type.Float()});
              sap.ui.getCore().byId("PREIS").bindProperty("value", {path:'PREIS',type: new sap.ui.model.type.Float()});
              sap.ui.getCore().byId("TOT").bindProperty("value", {path:'TOT',type: new sap.ui.model.type.Float()});

              //Supplier(Vendor) supplier1,2,3,4
              oPRCreationFragment.onAfterRendering=function(){
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
            /*
             * DocType =  IO Complete
             *
             * */
            } else if (oDocType === "IO Complete") {
              var oCompleteIOFragment = new sap.ui.xmlfragment(
                  "zhmmaim.fragment.CompleteIODetail", this);
              this.getView().byId("oPvInboxDetail").insertContent(
                  oCompleteIOFragment);

              /*Edit Block - input Field*/
              oCompleteIOFragment.onAfterRendering=function(){
                jQuery('#CompleteIOCommons :input').attr('disabled', true);
              };

              sap.ui.getCore().byId("USER5").setEnabled(false);
              sap.ui.getCore().byId("USER7").setEnabled(false);
              sap.ui.getCore().byId("PODATE").setEnabled(false);
              sap.ui.getCore().byId("GRDATE").setEnabled(false);
              sap.ui.getCore().byId("INSDATE").setEnabled(false);
              sap.ui.getCore().byId("USER8").setEnabled(false);

              sap.ui.getCore().byId("A_APP_DATE").setEnabled(false);
              sap.ui.getCore().byId("A_PRDATE").setEnabled(false);
              sap.ui.getCore().byId("A_PODATE").setEnabled(false);
              sap.ui.getCore().byId("A_GRDATE").setEnabled(false);
              sap.ui.getCore().byId("A_INSDATE").setEnabled(false);
              sap.ui.getCore().byId("A_FINISH").setEnabled(false);

              /*IO Complete Rest Call*/
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
              this.getView().setModel(oJsonModel);

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

              //Image Attachment
              var oFileNavi = oJsonModel.getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/");
              for(i=0;i<oFileNavi.length;i++){
                if(oFileNavi[i].FTYPE === "I"){
                  oContextImageValue = oFileNavi[i].URI;
                }
              }
              sap.ui.getCore().byId("oImage").setSrc(oContextImageValue);

              //Payback GJAHR RTNAMT DEFINE
              var oPaybackPath = "/IMIOPRNavi/results/0/IMIOPRROINavi/results",
                oContextPayback = oJsonModel.getProperty(oPaybackPath),
                oPaybackLength = oContextPayback.length,
                oContextUSER4 = this.getView().getModel().getProperty("IMIOPRNavi/results/0/USER4"); //Est.Cost 媛

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
                if(parseInt(oContextPayback[i].RTNAMT)){ //媛믪씠 議댁옱븯硫
                  oSum += parseInt(oContextPayback[i].RTNAMT);
                }else{ // 媛믪씠 0씠嫄곕굹 뾾쑝硫
                  oBlank++;
                }
              }
              var oGJAHRCount = (oPaybackLength)-oBlank; // 媛믪씠 엯젰맂 뿰룄 닔

              //oAverage = oSum / oGJAHRCount
              if(oSum !== 0){
                oAverage = oSum/oGJAHRCount;
              }else{

              }

              //oROI = USER4 / oAverage
              if(oAverage !== 0){
                oROI = Math.round(oContextUSER4/oAverage * 100) / 100;
              }else{
                oROI = "";
              }


              //Display on the Screen
              sap.ui.getCore().byId("ROI").setValue(oROI);
              //console.log(oROI);

            } else {
              alert("You can not access this Document.");
            }

            //APPRVAL ARDAT FIELD DEFINE

            //ApprLine RText (Comment) & Line Binding
            var oApprLinePath = "/IMApprLineNavi/results",
              oContextApprLine = this.getView().getModel().getProperty(oApprLinePath),
              oApprLineLength = oContextApprLine.length;

            var ApprLineText = [],
              ApprLine = [],
              CooperatorLine = [],
              oARDATCells = sap.ui.getCore().byId("oCreateWF").getItems()[1].getCells();

            //Approval Line validation( BGTTYPE = C && ARESULT = 1 ) || (BGTTYPE = V ) -> AddCooperation => false
            var oAddCPTF = true;

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
                if(oContextApprLine[i].APERNR === oUserInfo.PERNR){
                  oAddCPTF = false;
                }
              }else if(oContextApprLine[i].BGTTYPE === "C" && oContextApprLine[i].ARESULT !== ""){
                oAddCPTF = false;
              }else if(oContextApprLine[i].BGTTYPE === "V"){
                oAddCPTF = false;
              }

              /*ApprLine Statue*/
              if(oContextApprLine[i].ARESULT == '1'){oContextARESULT = 'Approved';}
              else if(oContextApprLine[i].ARESULT == '2'){oContextARESULT = 'Rejected';}
              else if(oContextApprLine[i].ARESULT == '3'){oContextARESULT = 'Cooperation Request';}
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

            var oCooperationCheck = false;
            for(i=0;i<oApprLineLength;i++){
              if(oContextApprLine[i].BGTTYPE === "C" && oContextApprLine[i].ARESULT === ""){
                oCooperationCheck = true;
              }
            }
            /*Auto Cooperation Process Start*/
            if(oContextATYPE === "B" && oCooperationCheck === true){
              sap.ui.getCore().byId("oIconTab").setSelectedKey("commentInfo");
              sap.ui.getCore().byId("SwitchCP").setState(true);
              sap.ui.getCore().byId("SwitchCP").setEnabled(false);
            }else{
              sap.ui.getCore().byId("oIconTab").setSelectedKey("workflowInfo");
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

            //BGTTYPE - Change Detail Screen(Standard Approval, Cooperation, Review)
            if(oProcessStatus === "C"){ //Cooperation
              sap.ui.getCore().byId("SwitchText").setVisible(true);
              sap.ui.getCore().byId("SwitchCP").setVisible(true);
              sap.ui.getCore().byId("SwitchText").setText("Need to Review?");
              sap.ui.getCore().byId("oRVSearch").setVisible(true);
              sap.ui.getCore().byId("Approve").setVisible(true);
              sap.ui.getCore().byId("Reject").setVisible(true);
              sap.ui.getCore().byId("Consider").setVisible(true);

              sap.ui.getCore().byId("oConfirmD").setText("( Approval / Cooperation )");
            }else if(oProcessStatus === "V"){ //Review
              sap.ui.getCore().byId("SwitchText").setVisible(false);
              sap.ui.getCore().byId("SwitchCP").setVisible(false);
              sap.ui.getCore().byId("oRVSearch").setVisible(false);
              sap.ui.getCore().byId("Approve").setVisible(true);
              sap.ui.getCore().byId("Reject").setVisible(false);
              sap.ui.getCore().byId("Consider").setVisible(false);

              sap.ui.getCore().byId("oConfirmD").setText("( Approval / Cooperation )");
            }else if(oProcessStatus === "A"){ // Standard
              sap.ui.getCore().byId("SwitchText").setVisible(true);
              sap.ui.getCore().byId("SwitchCP").setVisible(true);
              sap.ui.getCore().byId("oRVSearch").setVisible(false);
              sap.ui.getCore().byId("Approve").setVisible(true);
              sap.ui.getCore().byId("Reject").setVisible(true);
              sap.ui.getCore().byId("Consider").setVisible(false);

              sap.ui.getCore().byId("oConfirmD").setText("( Approval / Cooperation )");
            }else if(oProcessStatus === ""){ // Confirm
              sap.ui.getCore().byId("SwitchText").setVisible(false);
              sap.ui.getCore().byId("SwitchCP").setVisible(false);
              sap.ui.getCore().byId("oRVSearch").setVisible(false);
              sap.ui.getCore().byId("Approve").setVisible(true);
              sap.ui.getCore().byId("Reject").setVisible(true);
              sap.ui.getCore().byId("Consider").setVisible(false);

              sap.ui.getCore().byId("oConfirmD").setText("( Finance Confirmation )");
            }else if(oProcessStatus === "R"){ //Resubmit
              sap.ui.getCore().byId("Approve").setVisible(false);
              sap.ui.getCore().byId("Reject").setVisible(false);
              sap.ui.getCore().byId("Consider").setVisible(false);

              sap.ui.getCore().byId("oConfirmD").setText("( Resubmit Request )");
            }

            sap.ui.getCore().byId("oAddCP").setVisible(oAddCPTF);
          },

          onUpload:function(oEvent){
            var oData = sap.ui.getCore().byId("oUploadCollection").getItems();
            var name = [];
            var oAttachmentItem = [];

            for(var i=0; i<oData.length;i++){
              var filename = oData[i].getFileName(), //FileName
                requestId = oData[i]._requestIdName, //Upload count
                fileIndex = oData[i]._internalFileIndexWithinFileUploader;

              var oAttachmentFile = oData[i].getParent()._aFileUploadersForPendingUpload[requestId-1].oFileUpload.files;
              //console.log(oData[i].getParent()._aFileUploadersForPendingUpload[requestId-1].oFileUpload.files[fileIndex-1]);

              var value = [];
              //Convert to xstring
              var reader = new FileReader();

              reader.fileName = oAttachmentFile[fileIndex-1].name;

              reader.onload = function(readerEvt){
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
              var readAsBinary = reader.readAsBinaryString(oAttachmentFile[fileIndex-1]);
            }
          },

          onApproveDialog: function(oEvent){
            var oDetailId = oEvent.getSource().getParent().getParent().getId();
            if(oDetailId == "IOCreationDetail" || oDetailId == "PRCreationDetail"){
              this.onUpload(); // call the commons file upload function
            }
            var dialog = new sap.m.Dialog({
              title: 'Confirm',
              type: 'Message',
              content: new sap.m.Text({ text: 'Are you sure you want to Approve?' }),
              beginButton: new sap.m.Button({
                text: 'Approve',
                press: [function(oEvent){
                  this.onApprove(oDetailId);
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
          },

          onApprove : function(oDetailId) {
            //console.log(oDetailId);
/*            var oDetailId = oEvent.getSource().getParent().getParent().getId();
*/            var oSwitchCP = sap.ui.getCore().byId("SwitchCP").getState(),
              oRVSearch = sap.ui.getCore().byId("oRVSearch").getVisible();
            /*
             * Common - Approve
             *
             * */

            /*Date Time Formatting - ARDAT , ARZET(ApprLineNavi)*/
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyyMMdd" }),
              timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern : "HHmmss" }),
            ARDAT = dateFormat.format(new Date());
            ARZET = timeFormat.format(new Date());

            /*Approval Line Item*/
            var oIOCreateWFLength = this.getView().getModel().getProperty("/IMApprLineNavi/results/").length;
            var ApprLineItem = [];

            /*
             *  Test User ID
             *  HMM101253
             *  HMM100312
             *  HMM100352
             *  HMM100241
             *  HMM104851
             *
             *  Cooperation User ID
             *  HMM104851
             *  HMM105115
             *
             *  Review User ID
             *  HMM100241
             *  HMM103781
             *
             *  Claim User ID
             *  HMM103874
             */

            for (i=0; i<oIOCreateWFLength;i++){
              var oContextBGTSEQ = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].BGTSEQ,
                oContextUSERID = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].APERNR,
                oContextARESULT = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ARESULT,
                oContextATYPE = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ATYPE,
                oContextBGTTYPE = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].BGTTYPE,
                oContextRTEXT = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].RTEXT,
                oContextARDAT = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ARDAT,
                oContextARZET = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ARZET,
                oContextBTDTYPE2 = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].BTDTYPE2,
                oContextORIREQ = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ORIREQ,
                oContextCOSEQ = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].CO_SEQ;

              //Add new Cooperation in this.getView().getModel().getProperty("/IMApprLineNavi/results/")

              if(oSwitchCP === false && oContextUSERID === oUserInfo.PERNR && oContextBGTTYPE === "A"){ //Approval Line (Standard Approval)
                oContextARESULT = '1';
                oContextRTEXT = sap.ui.getCore().byId("comment").getValue();
                oContextARDAT = ARDAT;
                oContextARZET = ARZET;
                var BGTSEQ = oContextBGTSEQ;
              }else if(oSwitchCP === true && oContextUSERID === oUserInfo.PERNR && oContextBGTTYPE === "A"){ //Approval Line(approval process + start Cooperation)
                oContextARESULT = '3';
                oContextRTEXT = sap.ui.getCore().byId("comment").getValue();
                oContextARDAT = ARDAT;
                oContextARZET = ARZET;
                var BGTSEQ = oContextBGTSEQ;
              }else if(oContextUSERID === oUserInfo.PERNR && oContextBGTSEQ === "999"){ //Confirm
                oContextARESULT = "1";
                oContextRTEXT = sap.ui.getCore().byId("comment").getValue();
                oContextBGTTYPE = "";
                oContextARDAT = ARDAT;
                oContextARZET = ARZET;
              }else if(oSwitchCP === true && oRVSearch === false && oContextUSERID !== oUserInfo.PERNR && oContextBGTTYPE === "C"){//Cooperation Line(Cooperator)
                oContextARESULT = "";
                oContextRTEXT = sap.ui.getCore().byId("comment").getValue();
                oContextORIREQ = BGTSEQ;
                oContextCOSEQ = "";
              }else if(oSwitchCP === true && oContextUSERID === oUserInfo.PERNR && oContextBGTTYPE === "C"){ //Approval Line(approval process + review)
                oContextARESULT = '3';
                oContextRTEXT = sap.ui.getCore().byId("comment").getValue();
                oContextARDAT = ARDAT;
                oContextARZET = ARZET;
                //console.log(oContextBGTSEQ)

                if(oContextUSERID === oUserInfo.PERNR && oRVSearch === true){
                  ApprLineItem.push({"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC,"BGTSEQ":oContextBGTSEQ,
                    "ARESULT": "",
                    "BGTTYPE": "V",
                    "ARDAT": "",
                    "ARZET": "",
                    "APERNR":sap.ui.getCore().byId("oRVSearch").getModel().getProperty('/results/0/').USER_ID,
                    "DUTY_CODE":sap.ui.getCore().byId("oRVSearch").getModel().getProperty('/results/0/').DUTY_CODE,
                    "DUTY_NAME":sap.ui.getCore().byId("oRVSearch").getModel().getProperty('/results/0/').DUTY_NAME,
                    "ENGLISH_NAME":sap.ui.getCore().byId("oRVSearch").getModel().getProperty('/results/0/').ENGLISH_NAME,
                    "CO_SEQ":"1",
                    });
                  }
                //console.log(ApprLineItem);
              }else if(oSwitchCP === false && oContextUSERID === oUserInfo.PERNR && oContextBGTTYPE === "C"){ //Approval Line(approval Line + not review)
                //console.log(oContextARESULT)
                oContextARESULT = '1';
                oContextRTEXT = sap.ui.getCore().byId("comment").getValue();
                oContextARDAT = ARDAT;
                oContextARZET = ARZET;
                var BGTSEQ = oContextBGTSEQ;
              }
              else if(oContextUSERID === oUserInfo.PERNR && oContextBGTTYPE === "V"){ //Reviewer Line(review)
                oContextARESULT = '1';
                oContextRTEXT = sap.ui.getCore().byId("comment").getValue();
                oContextARDAT = ARDAT;
                oContextARZET = ARZET;
              }

              ApprLineItem.push({"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC,
                "BGTSEQ":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].BGTSEQ,
                "ARESULT":oContextARESULT,
                "ATYPE":oContextATYPE,
                "BGTTYPE": oContextBGTTYPE,
                "BTDTYPE2":oContextBTDTYPE2,
                "RTEXT" : oContextRTEXT,
                "ARDAT": oContextARDAT,
                "ARZET": oContextARZET,
                "APERNR":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].APERNR,
                "DUTY_CODE":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].DUTY_CODE,
                "DUTY_NAME":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].DUTY_NAME,
                "ENGLISH_NAME":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ENGLISH_NAME,
                "ORIREQ":oContextORIREQ,
                "CO_SEQ":oContextCOSEQ,
              });
            }

            var oCount = 0,
              oInit  = 0;

            //only using Approval Line(delete Cooperation Line)
            var oContextApprLine = this.getView().getModel().getProperty("/IMApprLineNavi/results/");
            for(i=0;i<oIOCreateWFLength;i++){
              var oBGTTYPE = oContextApprLine[i].BGTTYPE;
              if(oBGTTYPE === "A"){
                oInit++;
              }else if(oBGTTYPE === "C"){
                oCount++;
              }
            }

            ApprLineItem.splice(oInit,oCount);

            if(oSwitchCP === true && oContextUSERID === oUserInfo.PERNR && oContextBGTTYPE === "A"){ //Approval Line(approval line + cooperation)
              oContextORIREQ = oContextBGTSEQ;
            }else{
              oContextORIREQ = "";
            }

            /*New Cooperation Line*/
            if(sap.ui.getCore().byId("oIOCreateCP").getModel()){
              var oWFLength = sap.ui.getCore().byId("oCreateWF").getModel().getProperty('/').length,
                oCPLength = sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/').length;
              //Cooperation Line Add
              for(var i=0; i<oCPLength; i++){
                if(sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/'+i+'').APERNR){
                  APERNR = sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/'+i+'').APERNR;
                }else if(sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/'+i+'').HOD_ID){
                  APERNR = sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/'+i+'').HOD_ID;
                }

                if(APERNR === oUserInfo.PERNR){
                  oContextARDAT = ARDAT;
                  oContextARZET = ARZET;
                  oContextARESULT = "1";
                  oContextRTEXT = sap.ui.getCore().byId("comment").getValue();
                }else{
                  oContextARDAT = sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/'+i+'').ARDAT;
                  oContextARZET = sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/'+i+'').ARZET;
                  oContextARESULT = sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/'+i+'').ARESULT;
                  oContextRTEXT = sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/'+i+'').RTEXT;
                }

                ApprLineItem.push({"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC,
                  "BGTSEQ":(oWFLength+i+1).toString(),
                  "ARESULT": oContextARESULT,
                  "BGTTYPE": "C",
                  "ARDAT": oContextARDAT,
                  "ARZET": oContextARZET,
                  "RTEXT": oContextRTEXT,
                  "APERNR":APERNR,
                  "DUTY_CODE":sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/'+i+'').DUTY_CODE,
                  "DUTY_NAME":sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/'+i+'').DUTY_NAME,
                  "ENGLISH_NAME":sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/'+i+'').ENGLISH_NAME,
                  "ORIREQ":oContextORIREQ
                  });
              }
            }
            //console.log(ApprLineItem)

          /*
           *
           * IOCreationDetail - Approve
           *
           * */
          if(oDetailId === 'IOCreationDetail'){

            var IOController = this;
            var IOCreationoEntry = function() {
            /*Payback Item*/
            var oIOCreatePaybackLength = IOController.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/").length;
            var IMIOPRROIItem = [];

            for(var i=0; i<oIOCreatePaybackLength;i++){
              IMIOPRROIItem.push({"BGTDOC":IOController.getView().getModel().getProperty("/").BGTDOC,
                "BGTSEQ":"001",
                "GJAHR":IOController.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/")[i].GJAHR,
                "RTNAMT":IOController.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/")[i].RTNAMT});
            };

            //console.log(IMIOPRROIItem);

            /*ExistAsset Item*/
            var TokensLength = IOController.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRAssetNavi/results/").length;
            var IMIOPRAssetItem = [];
            for(var i=0; i<TokensLength; i++){
              IMIOPRAssetItem.push({"BGTDOC":IOController.getView().getModel().getProperty("/").BGTDOC,
                "BGTSEQ":"001",
                "SEQ":(i+1).toString(),
                "ANLN1":IOController.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRAssetNavi/results/")[i].ANLN1});
            };

            //console.log(IMIOPRAssetItem);
            //alert(sap.ui.getCore().byId("WERKS").getValue());

            var oEntry={"BGTDOC":IOController.getView().getModel().getProperty("/").BGTDOC, //Document Number
                  "RDATE":ARDAT, //Today
                  "PERNR":IOController.getView().getModel().getProperty('/').PERNR, //USER
                  "KOSTL":IOController.getView().getModel().getProperty('/').KOSTL,//CostCenter
                  "RTYPE":IOController.getView().getModel().getProperty('/').RTYPE, // Document Type
                  "BTSTS":"S", //
                  "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                  "APPRV":"X", //BPM O
                  "USER_ID":oUserInfo.PERNR, //USER_ID
                  "ARESULT": "1",//Claim User Event Result Variable
                  "IMIOPRNavi":[{"BGTDOC": IOController.getView().getModel().getProperty("/").BGTDOC, //Document Number
                    "BGTSEQ":"001", //Document Sequence
                    "APPROVED":IOController.getView().getModel().getProperty("/IMIOPRNavi/results/0/").APPROVED, //Already Approved
                    "RTYPE":IOController.getView().getModel().getProperty("/").RTYPE, //Document Type
                    "AUFNR":IOController.getView().getModel().getProperty('/IMIOPRNavi/results/0/').AUFNR, //IO Number
                    "BGTYPE":sap.ui.getCore().byId("IOTypeSelect").getSelectedKey(), //IO Type
                    "USER4":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("USER4").getValue()), // Estimate Cost
                    "POSID":sap.ui.getCore().byId("POSID").getValue(), // Project ID
                    "GJAHR":sap.ui.getCore().byId("Year").getValue(), // Project Year
                    "WERKS":sap.ui.getCore().byId("WERKS").getValue(), // Plant code
                    "WERKSD":sap.ui.getCore().byId("WERKSD").getValue(), // Plant Description
                    "KOSTV":sap.ui.getCore().byId("KOSTV").getValue(), // CC.Request
                    "KOSTVD":sap.ui.getCore().byId("KOSTVD").getValue(), // CC.Request Description
                    "AKSTL":sap.ui.getCore().byId("AKSTL").getValue(), // CC.Response
                    "AKSTLD":sap.ui.getCore().byId("AKSTLD").getValue(), // CC.Response Description
                    "USER0":sap.ui.getCore().byId("USER0").getValue(), //Applicant
                    "USER1":sap.ui.getCore().byId("USER1").getValue(), //Applicant Telephone
                    "USER2":sap.ui.getCore().byId("USER2").getValue(), // Person.Responsible
                    "KTEXT":sap.ui.getCore().byId("KTEXT").getValue(), // Description
                    "PURPO":sap.ui.getCore().byId("PURPO").getValue(), // Purpose
                    "USER5":dateFormat.format(sap.ui.getCore().byId("USER5").getDateValue()), //[Plan]Approval
                    "USER7":dateFormat.format(sap.ui.getCore().byId("USER7").getDateValue()), //[Plan]PR
                    "PODATE":dateFormat.format(sap.ui.getCore().byId("PODATE").getDateValue()), //[Plan]PO
                    "GRDATE":dateFormat.format(sap.ui.getCore().byId("GRDATE").getDateValue()), //[Plan]GR
                    "INSDATE":dateFormat.format(sap.ui.getCore().byId("INSDATE").getDateValue()), //[Plan]Install
                    "USER8":dateFormat.format(sap.ui.getCore().byId("USER8").getDateValue()), //[Plan]Finish
                    "IVPRO":sap.ui.getCore().byId("IVPRO").getValue(), //IM.Profile
                    "IVPROD":sap.ui.getCore().byId("IVPROD").getValue(), //IM.Profile Description
                    "IZWEK":sap.ui.getCore().byId("IZWEK").getValue(), //IM.Reason
                    "IZWEKD":sap.ui.getCore().byId("IZWEKD").getValue(), //IM.Reason Description
                    "ANLKL":sap.ui.getCore().byId("ANLKL").getValue(), //Asset Class
                    "ANLKLD":sap.ui.getCore().byId("ANLKLD").getValue(), //Asset Class Description
                    "AKTIV":dateFormat.format(sap.ui.getCore().byId("AKTIV").getDateValue()), //Capital.Date
                    "TXT50":sap.ui.getCore().byId("TXT50").getValue(), //Asset Name
                    "EFFTA":sap.ui.getCore().byId("EFFTA").getValue(), //Tangible
                    "EFFIN":sap.ui.getCore().byId("EFFIN").getValue(), //Intangible
                    "TPLNR":sap.ui.getCore().byId("TPLNR").getValue(), //Location
                    "ASSET_DIS":IOController.getView().getModel().getProperty("/IMIOPRNavi/results/0/").ASSET_DIS, //Disposal of existing asset
                    "IMIOPRROINavi":IMIOPRROIItem, //ROI Item
                    "IMIOPRFileNavi":oAttachmentItem, //Attachment Item
                    "IMIOPRAssetNavi":IMIOPRAssetItem //Asset Item
                    }],
                    "IMApprLineNavi":ApprLineItem //Approval Line Item
            };
                //console.log(oEntry);

                /*IO Creation OData Request Submit Process*/
                OData.request({

                            requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi",
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
                                                  //  sap.m.MessageBox.alert("Approved", {
                                                  //title: "Success",
                                                  //onClose: zhmmaim.util.Commons.onSubmitSuccess  ,
                                                  //styleClass: "sapThemePositiveText" ,
                                                  //initialFocus: null,
                                                  //textDirection: sap.ui.core.TextDirection.Inherit
                                                  //});
                                                  sap.m.MessageToast.show("Approved", {onClose: zhmmaim.util.Commons.onSubmitSuccess});
                                                    //sap.ui.core.BusyIndicator.hide();
                                                    //location.reload(true);
                                        },          function(err) {
                                              var message = JSON.parse(err.response.body);
                                          var errorMessage = message.error.innererror.errordetails;
                                          var allMessage = "";
                                          for(var i = 0; i<errorMessage.length;i++){
                                            allMessage += errorMessage[i].message + ".  ";
                                          }

                                          //sap.ui.core.BusyIndicator.hide();
                                            //   sap.m.MessageBox.show(allMessage, {
                                            //   title: "Approve Fail",
                                            //   onClose: zhmmaim.util.Commons.onSubmitFail ,
                                            //   styleClass: "sapThemeNegativeText" ,
                                            //   initialFocus: null,
                                            //   textDirection: sap.ui.core.TextDirection.Inherit
                                            // });
											sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
											return false;
                                        }

                            );
                            }, function(err) {
                                                    var request = err.request;
                                                    var response = err.response;
                                                    alert("Error in Get -- Request " + request + " Response " + response);
                                        });
            }

            /*Attachment*/
            var oAttachmentItem = [];
            var ogItems = sap.ui.getCore().byId("oAlreadyUpload").getItems();

            for(var i=0;i<ogItems.length;i++){ // add original uploaded files
              var dPath = ogItems[i].getBindingContext().sPath;
              oAttachmentItem.push({
                "BGTDOC":this.getView().getModel().getProperty(dPath).BGTDOC,
                "BGTSEQ":"1",
                "SEQ":this.getView().getModel().getProperty(dPath).SEQ, //seq
                "FTYPE":this.getView().getModel().getProperty(dPath).FTYPE,//origin ftype
                "ID":this.getView().getModel().getProperty(dPath).ID,//origin filename
                "VALUE":this.getView().getModel().getProperty(dPath).VALUE,//origin xstring value of file
                "URI":this.getView().getModel().getProperty(dPath).URI //origin uri
              });
            }

            var aItems = sap.ui.getCore().byId("oUploadCollection").getItems();

            if(aItems.length.toString() !== "0"){ // if uploaded files exist
              if(oStorage[0]){ //add new uploaded files
                var oStorageAttachmentLength = oStorage[0].length;
                for(var i=0;i<oStorageAttachmentLength;i++){
                  oAttachmentItem.push({
                    "BGTDOC":this.getView().getModel().getProperty("/BGTDOC"),
                    "BGTSEQ":"1",
                    "SEQ":(oAttachmentItem.length+1).toString(), // seq
                    "FTYPE":"G", // general attachment
                    "ID":oName[0][i], // filename
                    "VALUE":oStorage[0][i] //xstring value of file
                  });
                }
              }
            }

            //console.log(oAttachmentItem);

            /*Last Approval member auto Attach Approval document*/
            //ApprLine[IMApprLine.length-1].PERNR === oUserInfo.USER_ID -> generatePDF and then Add-on Attachment
            var oIOCreateWF = this.getView().getModel().getProperty("/IMApprLineNavi/results/"),
              oIOCreateWFLength = oIOCreateWF.length;
              /*Final Approved Point*/
              //oContextAPERNR = oIOCreateWF[oIOCreateWFLength-1].APERNR;

            /*Confirmation Point*/
            for(i=0;i<oIOCreateWFLength;i++){
              if(oIOCreateWF[i].BGTSEQ === "999"){
                var oContextAPERNR = oIOCreateWF[i].APERNR;
                if(oContextAPERNR === oUserInfo.PERNR){
                  oContextPERNR = oContextAPERNR;
                }
              }
            }

            if(oContextPERNR === oUserInfo.PERNR){
              sap.ui.core.BusyIndicator.show(10);
              var oDocAttachment = zhmmaim.util.AttachPrint.attachPDF(oDetailId, function(oPDFBinary){
                oAttachmentItem.push({
                  "BGTDOC":IOController.getView().getModel().getProperty("/IMIOPRNavi/results/")[0].BGTDOC,
                  "BGTSEQ":"001",
                  "SEQ":(oAttachmentItem.length+1).toString(),
                  "FTYPE":"A",
                  "ID":"Approved Document_"+
                             sap.ui.getCore().byId("BGTDOC").getText()+".pdf",
                  "VALUE":oPDFBinary,
                });
                IOCreationoEntry();
              });
            } else {
              sap.ui.core.BusyIndicator.show(10);
              IOCreationoEntry();
            }
                /*
             *
             * PR Creation - Approve
             *
             * */
            }else if(oDetailId === 'PRCreationDetail'){

            var PRController = this;
            var PRCreationoEntry = function() {
              /*Supplier Item*/
              var oPRSupplierPath = "/IMIOPRNavi/results/0/IMIOPRVendorNavi/results/",
                oPRSupplierLength = PRController.getView().getModel().getProperty(oPRSupplierPath).length;

              var IMIOPRSupplierItem = [];

              for(var i=0; i<oPRSupplierLength;i++){
                IMIOPRSupplierItem.push({"BGTDOC":PRController.getView().getModel().getProperty(oPRSupplierPath)[i].BGTDOC,
                          "BGTSEQ":PRController.getView().getModel().getProperty(oPRSupplierPath)[i].BGTSEQ,
                          "SEQ":PRController.getView().getModel().getProperty(oPRSupplierPath)[i].SEQ,
                          "LIFNR":PRController.getView().getModel().getProperty(oPRSupplierPath)[i].LIFNR,
                          "NAME1":PRController.getView().getModel().getProperty(oPRSupplierPath)[i].NAME1,
                          "NETWR":PRController.getView().getModel().getProperty(oPRSupplierPath)[i].NETWR,
                          "ZSABE":PRController.getView().getModel().getProperty(oPRSupplierPath)[i].ZSABE,
                          "TEL_NUMBER":PRController.getView().getModel().getProperty(oPRSupplierPath)[i].TEL_NUMBER,
                          "ACCEPT":PRController.getView().getModel().getProperty(oPRSupplierPath)[i].ACCEPT,
                          "KVERM":PRController.getView().getModel().getProperty(oPRSupplierPath)[i].KVERM
                });
              };
              //console.log(IMIOPRSupplierItem);

              /*Material Item*/
              var oPRMaterialPath = "/IMIOPRNavi/results/0/IMIOPRItemNavi/results/",
                oPRMaterialLength = PRController.getView().getModel().getProperty(oPRMaterialPath).length;

              var IMIOPRMaterialItem = [];

              for(var i=0; i<oPRMaterialLength;i++){
                IMIOPRMaterialItem.push({"BGTDOC":PRController.getView().getModel().getProperty(oPRMaterialPath)[i].BGTDOC,
                          "BGTSEQ":PRController.getView().getModel().getProperty(oPRMaterialPath)[i].BGTSEQ,
                          "SEQ":PRController.getView().getModel().getProperty(oPRMaterialPath)[i].SEQ,
                          "MATNR":PRController.getView().getModel().getProperty(oPRMaterialPath)[i].MATNR,
                          "MAKTX":PRController.getView().getModel().getProperty(oPRMaterialPath)[i].MAKTX,
                          "MENGE":PRController.getView().getModel().getProperty(oPRMaterialPath)[i].MENGE,
                          "MEINS":PRController.getView().getModel().getProperty(oPRMaterialPath)[i].MEINS,
                          "PREIS":PRController.getView().getModel().getProperty(oPRMaterialPath)[i].PREIS,
                          "TOT":PRController.getView().getModel().getProperty(oPRMaterialPath)[i].TOT,
                });
              };
              //console.log(IMIOPRMaterialItem);

              /*
               *  Test User ID
               *  HMM101253
               *  HMM100312
               *  HMM100352
               *  HMM100241
               *  HMM104851
               */
              var oEntry={"BGTDOC":PRController.getView().getModel().getProperty("/").BGTDOC, //Document Number
                    "RDATE":ARDAT, //Today
                    "PERNR":PRController.getView().getModel().getProperty('/').PERNR, //USER
                    "KOSTL":PRController.getView().getModel().getProperty('/').KOSTL,//CostCenter
                    "RTYPE":PRController.getView().getModel().getProperty('/').RTYPE, // Document Type
                    "BTSTS":"S", //
                    "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                    "APPRV":"X", //BPM O
                    "USER_ID":oUserInfo.PERNR, //USER_ID
                    "ARESULT":"1",//Claim User Event Result Variable
                    "IMIOPRNavi":[{"BGTDOC": PRController.getView().getModel().getProperty("/").BGTDOC, //Document Number
                      "BGTSEQ":"001", //Document Sequence
                      "RTYPE":PRController.getView().getModel().getProperty("/").RTYPE, //Document Type
                      "AUFNR":sap.ui.getCore().byId("AUFNR").getValue(), //IO
                      "BANFN":PRController.getView().getModel().getProperty("/IMIOPRNavi/results/0/").BANFN,//PR Number
                      "KTEXT":sap.ui.getCore().byId("KTEXT").getValue(), //Description
                      "PURPO":sap.ui.getCore().byId("PURPO").getValue(), //Purpose
                      "WERKS":sap.ui.getCore().byId("WERKS").getValue(), //Ship to Loc
                      "LGORT":sap.ui.getCore().byId("LGORT").getValue(),//Storage location
                      "LGORTD":sap.ui.getCore().byId("LGORTD").getValue(),//Storage location Description
                      "EKGRP":sap.ui.getCore().byId("EKGRP").getValue(),//purchasing group
                      "EKGRPD":sap.ui.getCore().byId("EKGRPD").getValue(),//purchasing group Description
                      "WERKSD":sap.ui.getCore().byId("WERKSD").getValue(), //Ship to Loc Description
                      "LFDAT":dateFormat.format(sap.ui.getCore().byId("LFDAT").getDateValue()), //Need to date
                      "IMIOPRFileNavi":oAttachmentItem, //Attachment Item
                      "IMIOPRVendorNavi":IMIOPRSupplierItem, //Vendor Item
                      "IMIOPRItemNavi":IMIOPRMaterialItem //Material Item
                      }],
                      "IMApprLineNavi":ApprLineItem //Approval Line Item
              };
                  sap.ui.core.BusyIndicator.show(10);

                  /*PR Creation OData Request Submit Process*/
                  OData.request({
                              requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi",
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
                                                    //   sap.m.MessageBox.alert("Approved", {
                                                    // title: "Success",
                                                    // onClose: zhmmaim.util.Commons.onSubmitSuccess,
                                                    // styleClass: "sapThemePositiveText" ,
                                                    // initialFocus: null,
                                                    // textDirection: sap.ui.core.TextDirection.Inherit
                                                    // });
                                                      sap.m.MessageToast.show("Approved", {onClose: zhmmaim.util.Commons.onSubmitSuccess});
                                          },          function(err) {
                                                var message = JSON.parse(err.response.body);
                                            var errorMessage = message.error.innererror.errordetails;
                                            var allMessage = "";
                                            for(var i = 0; i<errorMessage.length;i++){
                                              allMessage += errorMessage[i].message + ".  ";
                                            }

                                              //  sap.m.MessageBox.show(allMessage, {
                                              //  title: "Approve Fail",
                                              //  onClose: zhmmaim.util.Commons.onSubmitFail ,
                                              //  styleClass: "sapThemeNegativeText" ,
                                              //  initialFocus: null,
                                              //  textDirection: sap.ui.core.TextDirection.Inherit
                                              //});
                                               sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                          }

                              );
                              }, function(err) {
                                                      var request = err.request;
                                                      var response = err.response;
                                                      alert("Error in Get -- Request " + request + " Response " + response);
                                          });
            };

            var oAttachmentItem = [];
            var ogItems = sap.ui.getCore().byId("oAlreadyUpload").getItems();

            for(var i=0;i<ogItems.length;i++){ // add original uploaded files
              var dPath = ogItems[i].getBindingContext().sPath;
              oAttachmentItem.push({
                "BGTDOC":this.getView().getModel().getProperty(dPath).BGTDOC,
                "BGTSEQ":"1",
                "SEQ":this.getView().getModel().getProperty(dPath).SEQ, //seq
                "FTYPE":this.getView().getModel().getProperty(dPath).FTYPE,//origin ftype
                "ID":this.getView().getModel().getProperty(dPath).ID,//origin filename
                "VALUE":this.getView().getModel().getProperty(dPath).VALUE,//origin xstring value of file
                "URI":this.getView().getModel().getProperty(dPath).URI //origin uri
              });
            }

            var aItems = sap.ui.getCore().byId("oUploadCollection").getItems();

            if(aItems.length.toString() !== "0"){ // if uploaded files exist
              if(oStorage[0]){ //add new uploaded files
                var oStorageAttachmentLength = oStorage[0].length;
                for(var i=0;i<oStorageAttachmentLength;i++){
                  oAttachmentItem.push({
                    "BGTDOC":this.getView().getModel().getProperty("/BGTDOC"),
                    "BGTSEQ":"1",
                    "SEQ":(oAttachmentItem.length+1).toString(), // seq
                    "FTYPE":"G", // general attachment
                    "ID":oName[0][i], // filename
                    "VALUE":oStorage[0][i] //xstring value of file
                  });
                }
              }
            }

            //console.log(oAttachmentItem);

            /*Last Approval member auto Attach Approval document*/
            //ApprLine[IMApprLine.length-1].PERNR === oUserInfo.USER_ID -> generatePDF and then Add-on Attachment
            var oIOCreateWF = this.getView().getModel().getProperty("/IMApprLineNavi/results/"),
              oIOCreateWFLength = oIOCreateWF.length;
              /*Final Approved Point*/
              //oContextAPERNR = oIOCreateWF[oIOCreateWFLength-1].APERNR;

            /*Confirmation Point*/
            for(i=0;i<oIOCreateWFLength;i++){
              if(oIOCreateWF[i].BGTSEQ === "999"){
                var oContextAPERNR = oIOCreateWF[i].APERNR;
                if(oContextAPERNR === oUserInfo.PERNR){
                  var oContextPERNR = oContextAPERNR;
                }
              }
            }

            if(oContextPERNR === oUserInfo.PERNR){
              sap.ui.core.BusyIndicator.show(10);
              var oDocAttachment = zhmmaim.util.AttachPrint.attachPDF(oDetailId, function(oPDFBinary){
                oAttachmentItem.push({
                  "BGTDOC":PRController.getView().getModel().getProperty("/IMIOPRNavi/results/")[0].BGTDOC,
                  "BGTSEQ":"001",
                  "SEQ":(oAttachmentItem.length+1).toString(),
                  "FTYPE":"A",
                  "ID":"Approved Document_"+
                             sap.ui.getCore().byId("BGTDOC").getText()+".pdf",
                  "VALUE":oPDFBinary,
                });
                //console.log(oAttachmentItem)
                PRCreationoEntry();
              });
            } else {
              PRCreationoEntry();
            }

                /*
             *
             * IO Complete - Approve
             *
             * */
            }else if(oDetailId === 'CompleteIODetail'){

            /*Attachment*/
            var oAttachmentLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/").length;
            var oAttachmentItem = [];

            for(var i=0; i<oAttachmentLength; i++){
              oAttachmentItem.push({"BGTDOC":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTDOC,
                "BGTSEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTSEQ,
                "SEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].SEQ,
                "FTYPE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].FTYPE,
                "ID":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].ID,
                "VALUE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].VALUE,
                "URI":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].URI
              });
            }

            /*Payback Item*/
            var oIOCreatePaybackLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/").length;
            var IMIOPRROIItem = [];

            for(var i=0; i<oIOCreatePaybackLength;i++){
              IMIOPRROIItem.push({"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC,
                "BGTSEQ":"001",
                "GJAHR":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/")[i].GJAHR,
                "RTNAMT":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/")[i].RTNAMT});
            };

            //console.log(IMIOPRROIItem);

            var oEntry={"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                  "RDATE":ARDAT, //Today
                  "PERNR":this.getView().getModel().getProperty('/').PERNR, //USER
                  "KOSTL":this.getView().getModel().getProperty('/').KOSTL,//CostCenter
                  "RTYPE":this.getView().getModel().getProperty('/').RTYPE, // Document Type
                  "BTSTS":"S", //
                  "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                  "APPRV":"X", //BPM O
                  "USER_ID":oUserInfo.PERNR, //USER_ID
                  "ARESULT":"1",//Claim User Event Result Variable
                  "IMIOPRNavi":[{"BGTDOC": this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                    "BGTSEQ":"001", //Document Sequence
                    "RTYPE":this.getView().getModel().getProperty("/").RTYPE, //Document Type
                    "AUFNR":sap.ui.getCore().byId("AUFNR").getValue(), //IO
                    "KTEXT":sap.ui.getCore().byId("KTEXT").getValue(), //Description
                    "PURPO":sap.ui.getCore().byId("PURPO").getValue(), //Purpose
                    "USER5":dateFormat.format(sap.ui.getCore().byId("USER5").getDateValue()), //[Plan]Approval
                    "USER7":dateFormat.format(sap.ui.getCore().byId("USER7").getDateValue()), //[Plan]PR
                    "PODATE":dateFormat.format(sap.ui.getCore().byId("PODATE").getDateValue()), //[Plan]PO
                    "GRDATE":dateFormat.format(sap.ui.getCore().byId("GRDATE").getDateValue()), //[Plan]GR
                    "INSDATE":dateFormat.format(sap.ui.getCore().byId("INSDATE").getDateValue()), //[Plan]Install
                    "USER8":dateFormat.format(sap.ui.getCore().byId("USER8").getDateValue()), //[Plan]Finish
                    "A_APP_DATE":dateFormat.format(sap.ui.getCore().byId("A_APP_DATE").getDateValue()), //[Actual]Approval
                    "A_PRDATE":dateFormat.format(sap.ui.getCore().byId("A_PRDATE").getDateValue()), //[Actual]PR
                    "A_PODATE":dateFormat.format(sap.ui.getCore().byId("A_PODATE").getDateValue()), //[Actual]PO
                    "A_GRDATE":dateFormat.format(sap.ui.getCore().byId("A_GRDATE").getDateValue()), //[Actual]GR
                    "A_INSDATE":dateFormat.format(sap.ui.getCore().byId("A_INSDATE").getDateValue()), //[Actual]Install
                    "A_FINISH":dateFormat.format(sap.ui.getCore().byId("A_FINISH").getDateValue()), //[Actual]Finish
                    "EFFTA":sap.ui.getCore().byId("EFFTA").getValue(), //Tangible
                    "EFFIN":sap.ui.getCore().byId("EFFIN").getValue(), //Intangible
                    "TPLNR":sap.ui.getCore().byId("TPLNR").getValue(), //Location
                    "IMIOPRROINavi":IMIOPRROIItem, //ROI Item
                    "IMIOPRFileNavi":oAttachmentItem //Attachment Item
                    }],
                    "IMApprLineNavi":ApprLineItem //Approval Line Item
            };

            sap.ui.core.BusyIndicator.show(10);
                /*Complete IO OData Request Submit Process*/
                OData.request({

                            requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi",
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
                                                  //  sap.m.MessageBox.alert("Approved", {
                                                  //title: "Success",
                                                  //onClose: zhmmaim.util.Commons.onSubmitSuccess,
                                                  //styleClass: "sapThemePositiveText" ,
                                                  //initialFocus: null,
                                                  //textDirection: sap.ui.core.TextDirection.Inherit
                                                  //});
                                                    sap.m.MessageToast.show("Approved", {onClose: zhmmaim.util.Commons.onSubmitSuccess});
                                                  
                                        },          function(err) {
                                              var message = JSON.parse(err.response.body);
                                          var errorMessage = message.error.innererror.errordetails;
                                          var allMessage = "";
                                          for(var i = 0; i<errorMessage.length;i++){
                                            allMessage += errorMessage[i].message + ".  ";
                                          }

                                          //sap.ui.core.BusyIndicator.hide();
                                            //   sap.m.MessageBox.show(allMessage, {
                                            //   title: "Approve Fail",
                                            //   onClose: zhmmaim.util.Commons.onSubmitFail ,
                                            //   styleClass: "sapThemeNegativeText" ,
                                            //   initialFocus: null,
                                            //   textDirection: sap.ui.core.TextDirection.Inherit
                                            // });
                                            sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                        }

                            );
                            }, function(err) {
                                                    var request = err.request;
                                                    var response = err.response;
                                                    alert("Error in Get -- Request " + request + " Response " + response);
                                        });
                /*
             *
             * Budget Transfer - Approve
             *
             * */
            }else if(oDetailId === 'BudgetTransferDetail'){
              /*Edit impossible*/
              /*var IMBudgetItem = [];
              var oSenderLength = sap.ui.getCore().byId("oSender").getModel().getProperty('/').length,
                oReceiverLength = sap.ui.getCore().byId("oReceiver").getModel().getProperty('/').length;

              for(i=0;i<oSenderLength;i++){
                IMBudgetItem.push(sap.ui.getCore().byId("oSender").getModel().getProperty('/')[i]);
              }
              //console.log(IMBudgetItem)

              for(i=0;i<oReceiverLength;i++){
                IMBudgetItem.push(sap.ui.getCore().byId("oReceiver").getModel().getProperty('/')[i]);
              }
              console.log(IMBudgetItem)*/

              /*Edit Possible*/
              var TRController = this;
              var TRCreationoEntry = function() {
              /*Sender & Receiver Information*/
              var oSenderLength = sap.ui.getCore().byId("oSender").getModel().getData().length,
                oReceiverLength = sap.ui.getCore().byId("oReceiver").getModel().getData().length;
              var IMBudgetItem = [],
                oSenderSEQ = 1;
              console.log(sap.ui.getCore().byId("oSender").getModel())
              console.log( sap.ui.getCore().byId("oReceiver").getModel())
              for(i=0;i<oSenderLength;i++){
                if(sap.ui.getCore().byId("oSender").getModel().getProperty('/')[i].S_POSID !== ""
                  || sap.ui.getCore().byId("oSender").getModel().getProperty('/')[i].S_POST1 !== ""){
                //oSender Item
                  IMBudgetItem.push({"BGTDOC":TRController.getView().getModel().getProperty("/").BGTDOC,
                    "BGTSEQ":oSenderSEQ.toString(),
                    "RTYPE":"TR",
                    "GUBUN":sap.ui.getCore().byId("IOTypeSelect").getSelectedKey() ,//Transfer Type
                    "RESON":sap.ui.getCore().byId("REASON").getValue(), //Reason code
                    "RESOND":sap.ui.getCore().byId("REASOND").getValue(), //Reason Desciption
                    "TEXT":sap.ui.getCore().byId("KTEXT").getValue(),//Description
                    "PURPO":sap.ui.getCore().byId("PURPO").getValue(),//Purpose
                    "ZMONTH":sap.ui.getCore().byId("MONTH").getSelectedKey(), // Month
                    "S_POSID":sap.ui.getCore().byId("oSender").getModel().getProperty('/')[i].S_POSID, //PI(Sender)
                    "S_POST1":sap.ui.getCore().byId("oSender").getModel().getProperty('/')[i].S_POST1, //Description(Sender)
                    "S_GJAHR":sap.ui.getCore().byId("FISCAl").getValue(), //Approval Year(Sender)
                    "S_ABJHR":sap.ui.getCore().byId("FISCAl").getValue(), //Fiscal Year(Sender)
                    "S_B_WLGES":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oSender").getModel().getProperty('/'+i+'/S_B_WLGES/')), //Budget(Sender)
                    "S_C_WLGES":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oSender").getModel().getProperty('/'+i+'/S_C_WLGES/')), //Current Balance(Sender)
                    "S_T_WLGES":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oSender").getModel().getProperty('/')[i].S_T_WLGES), //Transfer(Sender)
                    "S_E_WLGES":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oSender").getModel().getProperty('/'+i+'/S_E_WLGES/')), //Ending Balance(Sender)
                    "S_VKOSTL":sap.ui.getCore().byId("oSender").getModel().getProperty('/')[i].S_VKOSTL, //Responsible Cost Center(Sender)
                    "IMBudgetTransFileNavi":oAttachmentItem
                  });
                  oSenderSEQ++;
                }
                //console.log(IMBudgetItem);
              }
              for(i=0;i<oReceiverLength;i++){
                if(sap.ui.getCore().byId("oReceiver").getModel().getProperty('/')[i].R_POSID !== ""
                  || sap.ui.getCore().byId("oReceiver").getModel().getProperty('/')[i].R_POST1 !== ""){
                //oReceiver Item
                  IMBudgetItem.push({
                    "BGTDOC":TRController.getView().getModel().getProperty("/").BGTDOC,
                    "BGTSEQ":(IMBudgetItem.length+1).toString(),
                    "RTYPE":"TR",
                    "GUBUN":sap.ui.getCore().byId("IOTypeSelect").getSelectedKey() ,//Transfer Type
                    "RESON":sap.ui.getCore().byId("REASON").getValue(), //Reason code
                    "RESOND":sap.ui.getCore().byId("REASOND").getValue(), //Reason Desciption
                    "TEXT":sap.ui.getCore().byId("KTEXT").getValue(),//Description
                    "PURPO":sap.ui.getCore().byId("PURPO").getValue(),//Purpose
                    "ZMONTH":sap.ui.getCore().byId("MONTH").getSelectedKey(), // Month
                    "R_POSID":sap.ui.getCore().byId("oReceiver").getModel().getProperty('/')[i].R_POSID, //PI(Receiver)
                    "R_POST1":sap.ui.getCore().byId("oReceiver").getModel().getProperty('/')[i].R_POST1, //Description(Receiver)
                    "R_GJAHR":sap.ui.getCore().byId("FISCAl").getValue(), //Approval Year(Receiver)
                    "R_ABJHR":sap.ui.getCore().byId("FISCAl").getValue(), //Fiscal Year(Receiver)
                    "R_B_WLGES":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oReceiver").getModel().getProperty('/'+i+'/R_B_WLGES/')), //Budget(Receiver)
                    "R_C_WLGES":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oReceiver").getModel().getProperty('/'+i+'/R_C_WLGES/')), //Current Balance(Receiver)
                    "R_T_WLGES":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oReceiver").getModel().getProperty('/')[i].R_T_WLGES), //Transfer(Receiver)
                    "R_E_WLGES":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("oReceiver").getModel().getProperty('/'+i+'/R_E_WLGES/')), //Ending Balance(Receiver)
                    "R_VKOSTL":sap.ui.getCore().byId("oReceiver").getModel().getProperty('/')[i].R_VKOSTL, //Responsible Cost Center(Receiver)
                    "IMBudgetTransFileNavi":oAttachmentItem
                  });
                }
                //console.log(IMBudgetItem);
              }
              var oEntry={"BGTDOC":TRController.getView().getModel().getProperty("/").BGTDOC, //Document Number
                  "RDATE":ARDAT, //Today
                  "PERNR":TRController.getView().getModel().getProperty('/').PERNR, //USER
                  "KOSTL":TRController.getView().getModel().getProperty('/').KOSTL,//CostCenter
                  "RTYPE":TRController.getView().getModel().getProperty('/').RTYPE, // Document Type
                  "BTSTS":"S", //
                  "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                  "APPRV":"X", //BPM O
                  "USER_ID":oUserInfo.PERNR, //USER_ID
                  "ARESULT": "1",//Claim User Event Result Variable
                  "IMApprBudNavi":IMBudgetItem, //Budget Item
                  "IMApprLineNavi":ApprLineItem //Approval Line Item
            };
                 console.log(oEntry);
                /*  Budget Transfer OData Request Submit Process*/
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
                                                    //   sap.m.MessageBox.alert("Approved", {
                                                    // title: "Success",
                                                    // onClose: zhmmaim.util.Commons.onSubmitSuccess,
                                                    // styleClass: "sapThemePositiveText" ,
                                                    // initialFocus: null,
                                                    // textDirection: sap.ui.core.TextDirection.Inherit
                                                    // });
                                                    sap.m.MessageToast.show("Approved", {onClose: zhmmaim.util.Commons.onSubmitSuccess});
                                                    
                                          },          function(err) {
                                                var message = JSON.parse(err.response.body);
                                            var errorMessage = message.error.innererror.errordetails;
                                            var allMessage = "";
                                            for(var i = 0; i<errorMessage.length;i++){
                                              allMessage += errorMessage[i].message + ".  ";
                                            }

                                            //sap.ui.core.BusyIndicator.hide();
                                              //  sap.m.MessageBox.show(allMessage, {
                                              //  title: "Approve Fail",
                                              //  onClose: zhmmaim.util.Commons.onSubmitFail ,
                                              //  styleClass: "sapThemeNegativeText" ,
                                              //  initialFocus: null,
                                              //  textDirection: sap.ui.core.TextDirection.Inherit
                                              //});
                                               sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});;
                                          }

                              );
                              }, function(err) {
                                                      var request = err.request;
                                                      var response = err.response;
                                                      alert("Error in Get -- Request " + request + " Response " + response);
                                          });
              }

              /*general Attachment*/

              var oAttachmentLength = this.getView().getModel().getProperty("/IMApprBudNavi/results/0/IMBudgetTransFileNavi/results/").length;
              var oAttachmentItem = [];

              for(var i=0; i<oAttachmentLength; i++){
                oAttachmentItem.push({"BGTDOC":this.getView().getModel().getProperty("/IMApprBudNavi/results/0/IMBudgetTransFileNavi/results/")[i].BGTDOC,
                  "BGTSEQ":this.getView().getModel().getProperty("/IMApprBudNavi/results/0/IMBudgetTransFileNavi/results/")[i].BGTSEQ,
                  "SEQ":this.getView().getModel().getProperty("/IMApprBudNavi/results/0/IMBudgetTransFileNavi/results/")[i].SEQ,
                  "FTYPE":this.getView().getModel().getProperty("/IMApprBudNavi/results/0/IMBudgetTransFileNavi/results/")[i].FTYPE,
                  "ID":this.getView().getModel().getProperty("/IMApprBudNavi/results/0/IMBudgetTransFileNavi/results/")[i].ID,
                  "VALUE":this.getView().getModel().getProperty("/IMApprBudNavi/results/0/IMBudgetTransFileNavi/results/")[i].VALUE,
                  "URI":this.getView().getModel().getProperty("/IMApprBudNavi/results/0/IMBudgetTransFileNavi/results/")[i].URI
                });
              }

              /*Claim member auto Attach Approval document*/
              //ApprLine[IMApprLine.length-1].PERNR === oUserInfo.USER_ID -> generatePDF and then Add-on Attachment
              var oIOCreateWF = this.getView().getModel().getProperty("/IMApprLineNavi/results/"),
                oIOCreateWFLength = oIOCreateWF.length;

              for(i=0;i<oIOCreateWFLength;i++){
                if(oIOCreateWF[i].BGTSEQ === "999"){
                  var oContextAPERNR = oIOCreateWF[i].APERNR;
                  if(oContextAPERNR === oUserInfo.PERNR){
                    var oContextPERNR = oContextAPERNR;
                  }
                }
              }

              if(oContextPERNR === oUserInfo.PERNR){
                //console.log(oContextPERNR);
                //console.log(oUserInfo.PERNR);
                sap.ui.core.BusyIndicator.show(10);
                var oDocAttachment = zhmmaim.util.AttachPrint.attachPDF(oDetailId, function(oPDFBinary){
                  oAttachmentItem.push({
                    "BGTDOC":TRController.getView().getModel().getProperty("/IMApprBudNavi/results/")[0].BGTDOC,
                    "BGTSEQ":"001",
                    "SEQ":(oAttachmentItem.length+1).toString(),
                    "FTYPE":"A",
                    "ID":"Approved Document_"+
                               sap.ui.getCore().byId("BGTDOC").getText()+".pdf",
                    "VALUE":oPDFBinary,
                  });
                  //console.log(oAttachmentItem);
                  TRCreationoEntry();
                });
              } else {
                sap.ui.core.BusyIndicator.show(10);
                TRCreationoEntry();
              }
                  /*
               *
               * Budget Planning - Approve
               *
               * */
            }else if(oDetailId === 'ABPDetail'){
                var oContextABPDetail = sap.ui.getCore().byId("oDetaTB").getModel(),
                  oABPDetaLength = oContextABPDetail.getProperty("/IMABPDetaNavi/results/").length;
                var ABPDetailItem = [];

                for(var i=0;i<oABPDetaLength;i++){
                  if(sap.ui.getCore().byId("oDetaTB").getModel().getProperty('/IMABPDetaNavi/results/'+i)){
                    IMABPItem = oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/IMABPItemNavi/results");
                    IMABPROIItem = oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/IMABPROINavi/results");
                    oAttachmentItem = oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/IMABPFileNavi/results");

                    var oDetail = {"BGTDOC":oContextABPDetail.getProperty("/").BGTDOC, //Document Number
                        "BGTSEQ":oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").BGTSEQ, //Document Sequence increase
                        "ZPROJ": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").ZPROJ,//P.Code
                        "ZPROJD":oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").ZPROJD, //P.Code Description
                        "GJAHR": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").GJAHR, // Fiscal Year
                        "KTEXT": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").KTEXT, // Header Description
                        "TXT50": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").TXT50, // Description
                        "IZWEK": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").IZWEK,//IM.Reason
                        "IZWEKD": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").IZWEKD,//IM.Reason Description
                        "VKOSTL": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").VKOSTL,//CC.Response
                        "VKOSTLD": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").VKOSTLD,//CC.Response Description
                        "WERKS": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WERKS, //Plant
                        "WERKSD": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WERKSD, //Plant Description
                        "PRIORI": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").PRIORI, //Priority
                        "PRIORID": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").PRIORID, //Priority Description
                        "USR02": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR02, //Category
                        "USR02D": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR02D, //Category Description
                        "USR03": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR03, //IM.Classification
                        "USR03D": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR03D, //IM.Classification Description
                        "USR00": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR00, //Asset Class
                        "USR00D": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR00D, //Asset Class Description
                        "SIZECL": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").SIZECL,//Scale
                        "SIZECLD": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").SIZECLD,//Scale Description
                        "GDATU": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").GDATU, //[Plan]Approval
                        "WDATU": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WDATU, //[Plan]PR
                        "PODATE": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").PODATE, //[Plan]PO
                        "USR01": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR01, //[Plan]GR
                        "USR08": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR08, //[Plan]Install
                        "USR09": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR09, //[Plan]Finish
                        "PURPO": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").PURPO, //Purpose
                        "EFFTA": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").EFFTA, //Tangible
                        "EFFIN": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").EFFIN, //Intangible
                        "TPLNR": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").TPLNR, //Location
                        "WTP01": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP01, //[Monthly Plan]1
                        "WTP02": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP02, //[Monthly Plan]2
                        "WTP03": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP03, //[Monthly Plan]3
                        "WTP04": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP04, //[Monthly Plan]4
                        "WTP05": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP05, //[Monthly Plan]5
                        "WTP06": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP06, //[Monthly Plan]6
                        "WTP07": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP07, //[Monthly Plan]7
                        "WTP08": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP08, //[Monthly Plan]8
                        "WTP09": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP09, //[Monthly Plan]9
                        "WTP10": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP10, //[Monthly Plan]10
                        "WTP11": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP11, //[Monthly Plan]11
                        "WTP12": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP12, //[Monthly Plan]12
                        "TOTA": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").TOTA, //Total Item Value
                        "IMABPFileNavi":oAttachmentItem,
                        "IMABPROINavi":IMABPROIItem,
                        "IMABPItemNavi":IMABPItem};

                    ABPDetailItem.push(oDetail);
                  }
                }
                //console.log(ABPDetailItem);

                var oEntry={"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                      "RDATE":ARDAT, //Today
                      "PERNR":this.getView().getModel().getProperty("/").PERNR, //USER
                      "KOSTL":this.getView().getModel().getProperty("/").KOSTL, //Cost Center
                      "RTYPE":this.getView().getModel().getProperty("/").RTYPE, // Document Type
                      "BTSTS":"S", //
                      "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                      "APPRV":"X", //BPM O
                      "USER_ID":oUserInfo.PERNR, //USER_ID
                      "ARESULT":"1",//Claim User Event Result Variable
                      "IMABPDetaNavi":ABPDetailItem, // ABP Detail Item
                      "IMApprLineNavi":ApprLineItem //Approval Line Item
                };
                    //console.log(oEntry);
                    sap.ui.core.BusyIndicator.show(10);
                    /*ABP Planning OData Request Submit Process*/
                    OData.request({

                                requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMABPDetaNavi/IMABPItemNavi,IMABPDetaNavi/IMABPROINavi,IMApprTextNavi,IMIOPRNavi/IMIOPRFileNavi",
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
                                                      //  sap.m.MessageBox.alert("Approved", {
                                                      //title: "Success",
                                                      //onClose: zhmmaim.util.Commons.onSubmitSuccess ,
                                                      //styleClass: "sapThemePositiveText" ,
                                                      //initialFocus: null,
                                                      //textDirection: sap.ui.core.TextDirection.Inherit
                                                      //});
                                                      sap.m.MessageToast.show("Approved", {onClose: zhmmaim.util.Commons.onSubmitSuccess});
                                                      
                                            },          function(err) {
                                                  var message = JSON.parse(err.response.body);
                                              var errorMessage = message.error.innererror.errordetails;
                                              var allMessage = "";
                                              for(var i = 0; i<errorMessage.length;i++){
                                                allMessage += errorMessage[i].message + ".  ";
                                              }

                                              //sap.ui.core.BusyIndicator.hide();
                                                //   sap.m.MessageBox.show(allMessage, {
                                                //   title: "Approve Fail",
                                                //   onClose: zhmmaim.util.Commons.onSubmitFail ,
                                                //   styleClass: "sapThemeNegativeText" ,
                                                //   initialFocus: null,
                                                //   textDirection: sap.ui.core.TextDirection.Inherit
                                                // });
												sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                            }

                                );
                                }, function(err) {
                                                        var request = err.request;
                                                        var response = err.response;
                                                        alert("Error in Get -- Request " + request + " Response " + response);
                                            });
					sap.ui.core.BusyIndicator.hide();                                             
                }
          },

          onRejectDialog: function(oEvent){
            var oDetailId = oEvent.getSource().getParent().getParent().getId();
            /*Comment Check Logic*/
            var oComment = sap.ui.getCore().byId("comment").getValue();
            if(oComment){
              var dialog = new sap.m.Dialog({
                title: 'Confirm',
                type: 'Message',
                content: new sap.m.Text({ text: 'Are you sure you want to Reject?' }),
                beginButton: new sap.m.Button({
                  text: 'Reject',
                  press: [function(oEvent){
                    this.onReject(oDetailId);
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
            }else{
              //sap.m.MessageBox.show("You have to input the comment field to reject.", {
              //            title: "Comment",
              //            styleClass: "sapThemeNegativeText" ,
              //            initialFocus: null,
              //            textDirection: sap.ui.core.TextDirection.Inherit
              //        });
			sap.m.MessageToast.show("You have to input the comment field to reject.");
            sap.ui.getCore().byId("oIconTab").setSelectedKey("commentInfo");
            }
          },

          onReject : function(oDetailId) {
            //console.log(oDetailId)
            //var oDetailId = oEvent.getSource().getParent().getParent().getId();
            var oSwitchCP = sap.ui.getCore().byId("SwitchCP").getState(),
              oRVSearch = sap.ui.getCore().byId("oRVSearch").getVisible();

            /*
             * Common - Reject
             *
             * */

            /*Date Time Formatting - ARDAT , ARZET(ApprLineNavi)*/
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyyMMdd" }),
              timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern : "HHmmss" }),
            ARDAT = dateFormat.format(new Date());
            ARZET = timeFormat.format(new Date());

            /*Approval Line Item*/
            var oIOCreateWFLength = this.getView().getModel().getProperty("/IMApprLineNavi/results/").length;
            var ApprLineItem = [];

            /*
             *  Test User ID
             *  HMM101253
             *  HMM100312
             *  HMM100352
             *  HMM100241
             *  HMM104851
             *
             *  Cooperation User ID
             *  HMM104851
             *  HMM105115
             *
             *  Review User ID
             *  HMM100241
             *  HMM103781
             *
             *  Claim User ID
             *  HMM103874
             */

            for (i=0; i<oIOCreateWFLength;i++){
              var oContextBGTSEQ = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].BGTSEQ,
                oContextUSERID = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].APERNR,
                oContextARESULT = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ARESULT,
                oContextATYPE = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ATYPE,
                oContextBGTTYPE = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].BGTTYPE,
                oContextRTEXT = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].RTEXT,
                oContextARDAT = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ARDAT,
                oContextARZET = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ARZET,
                oContextORIREQ = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ORIREQ,
                oContextCOSEQ = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].CO_SEQ;

              if(oContextUSERID === oUserInfo.PERNR){
                oContextARESULT = '2';
                oContextRTEXT = sap.ui.getCore().byId("comment").getValue();
                oContextARDAT = ARDAT;
                oContextARZET = ARZET;
                var BGTSEQ = oContextBGTSEQ;
              }
              ApprLineItem.push({"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC,
                "BGTSEQ":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].BGTSEQ,
                "ARESULT":oContextARESULT,
                "BGTTYPE": oContextBGTTYPE,
                "RTEXT" : oContextRTEXT,
                "ARDAT": oContextARDAT,
                "ARZET": oContextARZET,
                "APERNR":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].APERNR,
                "DUTY_CODE":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].DUTY_CODE,
                "DUTY_NAME":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].DUTY_NAME,
                "ENGLISH_NAME":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ENGLISH_NAME,
                "ORIREQ":oContextORIREQ,
                "CO_SEQ":oContextCOSEQ,
              });
            }

            //console.log(ApprLineItem);

            /*IOCreationDetail - Reject*/
            if(oDetailId === 'IOCreationDetail'){
            /*Attachment*/
            var oAttachmentLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/").length;
            var oAttachmentItem = [];

            for(var i=0; i<oAttachmentLength; i++){
              oAttachmentItem.push({"BGTDOC":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTDOC,
                "BGTSEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTSEQ,
                "SEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].SEQ,
                "FTYPE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].FTYPE,
                "ID":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].ID,
                "VALUE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].VALUE,
                "URI":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].URI
              });
            }

            /*Payback Item*/
            var oIOCreatePaybackLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/").length;
            var IMIOPRROIItem = [];

            for(var i=0; i<oIOCreatePaybackLength;i++){
              IMIOPRROIItem.push({"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC,
                "BGTSEQ":"001",
                "GJAHR":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/")[i].GJAHR,
                "RTNAMT":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/")[i].RTNAMT});
            };

            //console.log(IMIOPRROIItem);
            /*ExistAsset Item*/
            var TokensLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRAssetNavi/results/").length;
            var IMIOPRAssetItem = [];
            for(var i=0; i<TokensLength; i++){
              IMIOPRAssetItem.push({"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC,
                "BGTSEQ":"001",
                "SEQ":(i+1).toString(),
                "ANLN1":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRAssetNavi/results/")[i].ANLN1});
            };

            //console.log(IMIOPRAssetItem);
            //alert(sap.ui.getCore().byId("WERKS").getValue());

            var oEntry={"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                "RDATE":ARDAT, //Today
                "PERNR":this.getView().getModel().getProperty('/').PERNR, //USER
                "KOSTL":this.getView().getModel().getProperty('/').KOSTL,//CostCenter
                "RTYPE":this.getView().getModel().getProperty('/').RTYPE, // Document Type
                "BTSTS":"S", //
                "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                "APPRV":"X", //BPM O
                "USER_ID":oUserInfo.PERNR, //USER_ID
                "ARESULT":"2",//Claim User Event Result Variable
                "IMIOPRNavi":[{"BGTDOC": this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                  "BGTSEQ":"001", //Document Sequence
                  "APPROVED":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/").APPROVED, //Already Approved
                  "RTYPE":this.getView().getModel().getProperty("/").RTYPE, //Document Type
                  "BGTYPE":sap.ui.getCore().byId("IOTypeSelect").getSelectedKey(), //IO Type
                  "USER4":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("USER4").getValue()), // Estimate Cost
                  "POSID":sap.ui.getCore().byId("POSID").getValue(), // Project ID
                  "GJAHR":sap.ui.getCore().byId("Year").getValue(), // Project Year
                  "WERKS":sap.ui.getCore().byId("WERKS").getValue(), // Plant code
                  "WERKSD":sap.ui.getCore().byId("WERKSD").getValue(), // Plant Description
                  "KOSTV":sap.ui.getCore().byId("KOSTV").getValue(), // CC.Request
                  "KOSTVD":sap.ui.getCore().byId("KOSTVD").getValue(), // CC.Request Description
                  "AKSTL":sap.ui.getCore().byId("AKSTL").getValue(), // CC.Response
                  "AKSTLD":sap.ui.getCore().byId("AKSTLD").getValue(), // CC.Response Description
                  "USER0":sap.ui.getCore().byId("USER0").getValue(), //Applicant
                  "USER1":sap.ui.getCore().byId("USER1").getValue(), //Applicant Telephone
                  "USER2":sap.ui.getCore().byId("USER2").getValue(), // Person.Responsible
                  "KTEXT":sap.ui.getCore().byId("KTEXT").getValue(), // Description
                  "PURPO":sap.ui.getCore().byId("PURPO").getValue(), // Purpose
                  "USER5":dateFormat.format(sap.ui.getCore().byId("USER5").getDateValue()), //[Plan]Approval
                  "USER7":dateFormat.format(sap.ui.getCore().byId("USER7").getDateValue()), //[Plan]PR
                  "PODATE":dateFormat.format(sap.ui.getCore().byId("PODATE").getDateValue()), //[Plan]PO
                  "GRDATE":dateFormat.format(sap.ui.getCore().byId("GRDATE").getDateValue()), //[Plan]GR
                  "INSDATE":dateFormat.format(sap.ui.getCore().byId("INSDATE").getDateValue()), //[Plan]Install
                  "USER8":dateFormat.format(sap.ui.getCore().byId("USER8").getDateValue()), //[Plan]Finish
                  "IVPRO":sap.ui.getCore().byId("IVPRO").getValue(), //IM.Profile
                  "IVPROD":sap.ui.getCore().byId("IVPROD").getValue(), //IM.Profile Description
                  "IZWEK":sap.ui.getCore().byId("IZWEK").getValue(), //IM.Reason
                  "IZWEKD":sap.ui.getCore().byId("IZWEKD").getValue(), //IM.Reason Description
                  "ANLKL":sap.ui.getCore().byId("ANLKL").getValue(), //Asset Class
                  "ANLKLD":sap.ui.getCore().byId("ANLKLD").getValue(), //Asset Class Description
                  "AKTIV":dateFormat.format(sap.ui.getCore().byId("AKTIV").getDateValue()), //Capital.Date
                  "TXT50":sap.ui.getCore().byId("TXT50").getValue(), //Asset Name
                  "EFFTA":sap.ui.getCore().byId("EFFTA").getValue(), //Tangible
                  "EFFIN":sap.ui.getCore().byId("EFFIN").getValue(), //Intangible
                  "TPLNR":sap.ui.getCore().byId("TPLNR").getValue(), //Location
                  "ASSET_DIS":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/").ASSET_DIS, //Disposal of existing asset
                  "IMIOPRROINavi":IMIOPRROIItem, //ROI Item
                  "IMIOPRFileNavi":oAttachmentItem, //Attachment Item
                  "IMIOPRAssetNavi":IMIOPRAssetItem //Asset Item
                  }],
                  "IMApprLineNavi":ApprLineItem //Approval Line Item
          };
              //console.log(oEntry);
              sap.ui.core.BusyIndicator.show(10);
                /*IO Creation OData Request Reject Process*/
                OData.request({

                            requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi",
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
                                                  //  sap.m.MessageBox.alert("Rejected", {
                                                  //title: "Success",
                                                  //onClose: zhmmaim.util.Commons.onSubmitSuccess,
                                                  //styleClass: "sapThemePositiveText" ,
                                                  //initialFocus: null,
                                                  //textDirection: sap.ui.core.TextDirection.Inherit
                                                  //});
                                                  sap.m.MessageToast.show("Rejected", {onClose: zhmmaim.util.Commons.onSubmitSuccess});
                                                  
                                        },          function(err) {
                                              var message = JSON.parse(err.response.body);
                                          var errorMessage = message.error.innererror.errordetails;
                                          var allMessage = "";
                                          for(var i = 0; i<errorMessage.length;i++){
                                            allMessage += errorMessage[i].message + ".  ";
                                          }

                                            //   sap.m.MessageBox.show(allMessage, {
                                            //   title: "Reject Fail",
                                            //   onClose: zhmmaim.util.Commons.onSubmitFail ,
                                            //   styleClass: "sapThemeNegativeText" ,
                                            //   initialFocus: null,
                                            //   textDirection: sap.ui.core.TextDirection.Inherit
                                            // });
                                            sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                        }

                            );
                            }, function(err) {
                                                    var request = err.request;
                                                    var response = err.response;
                                                    alert("Error in Get -- Request " + request + " Response " + response);
                                        });
                /*
             *
             * PR Creation - Reject
             *
             * */
             	sap.ui.core.BusyIndicator.hide(); 
            }else if(oDetailId === 'PRCreationDetail'){

            /*Attachment*/
            var oAttachmentLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/").length;
            var oAttachmentItem = [];

            for(var i=0; i<oAttachmentLength; i++){
              oAttachmentItem.push({"BGTDOC":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTDOC,
                "BGTSEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTSEQ,
                "SEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].SEQ,
                "FTYPE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].FTYPE,
                "ID":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].ID,
                "VALUE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].VALUE,
                "URI":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].URI
              });
            }

            /*Supplier Item*/
            var oPRSupplierPath = "/IMIOPRNavi/results/0/IMIOPRVendorNavi/results/",
              oPRSupplierLength = this.getView().getModel().getProperty(oPRSupplierPath).length;

            var IMIOPRSupplierItem = [];

            for(var i=0; i<oPRSupplierLength;i++){
              IMIOPRSupplierItem.push({"BGTDOC":this.getView().getModel().getProperty(oPRSupplierPath)[i].BGTDOC,
                        "BGTSEQ":this.getView().getModel().getProperty(oPRSupplierPath)[i].BGTSEQ,
                        "SEQ":this.getView().getModel().getProperty(oPRSupplierPath)[i].SEQ,
                        "LIFNR":this.getView().getModel().getProperty(oPRSupplierPath)[i].LIFNR,
                        "NAME1":this.getView().getModel().getProperty(oPRSupplierPath)[i].NAME1,
                        "NETWR":this.getView().getModel().getProperty(oPRSupplierPath)[i].NETWR,
                        "ZSABE":this.getView().getModel().getProperty(oPRSupplierPath)[i].ZSABE,
                        "TEL_NUMBER":this.getView().getModel().getProperty(oPRSupplierPath)[i].TEL_NUMBER,
                        "ACCEPT":this.getView().getModel().getProperty(oPRSupplierPath)[i].ACCEPT,
                        "KVERM":this.getView().getModel().getProperty(oPRSupplierPath)[i].KVERM
              });
            };
            //console.log(IMIOPRSupplierItem);

            /*Material Item*/
            var oPRMaterialPath = "/IMIOPRNavi/results/0/IMIOPRItemNavi/results/",
              oPRMaterialLength = this.getView().getModel().getProperty(oPRMaterialPath).length;

            var IMIOPRMaterialItem = [];

            for(var i=0; i<oPRMaterialLength;i++){
              IMIOPRMaterialItem.push({"BGTDOC":this.getView().getModel().getProperty(oPRMaterialPath)[i].BGTDOC,
                        "BGTSEQ":this.getView().getModel().getProperty(oPRMaterialPath)[i].BGTSEQ,
                        "SEQ":this.getView().getModel().getProperty(oPRMaterialPath)[i].SEQ,
                        "MATNR":this.getView().getModel().getProperty(oPRMaterialPath)[i].MATNR,
                        "MAKTX":this.getView().getModel().getProperty(oPRMaterialPath)[i].MAKTX,
                        "MENGE":this.getView().getModel().getProperty(oPRMaterialPath)[i].MENGE,
                        "MEINS":this.getView().getModel().getProperty(oPRMaterialPath)[i].MEINS,
                        "PREIS":this.getView().getModel().getProperty(oPRMaterialPath)[i].PREIS,
                        "TOT":this.getView().getModel().getProperty(oPRMaterialPath)[i].TOT,
              });
            };
            //console.log(IMIOPRMaterialItem);

            /*
             *  Test User ID
             *  HMM101253
             *  HMM100312
             *  HMM100352
             *  HMM100241
             *  HMM104851
             */
            var oEntry={"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                  "RDATE":ARDAT, //Today
                  "PERNR":this.getView().getModel().getProperty('/').PERNR, //USER
                  "KOSTL":this.getView().getModel().getProperty('/').KOSTL,//CostCenter
                  "RTYPE":this.getView().getModel().getProperty('/').RTYPE, // Document Type
                  "BTSTS":"S", //
                  "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                  "APPRV":"X", //BPM O
                  "USER_ID":oUserInfo.PERNR, //USER_ID
                  "ARESULT":"2",//Claim User Event Result Variable
                  "IMIOPRNavi":[{"BGTDOC": this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                    "BGTSEQ":"001", //Document Sequence
                    "RTYPE":this.getView().getModel().getProperty("/").RTYPE, //Document Type
                    "AUFNR":sap.ui.getCore().byId("AUFNR").getValue(), //IO
                    "BANFN":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/").BANFN,//PR Number
                    "KTEXT":sap.ui.getCore().byId("KTEXT").getValue(), //Description
                    "PURPO":sap.ui.getCore().byId("PURPO").getValue(), //Purpose
                    "WERKS":sap.ui.getCore().byId("WERKS").getValue(), //Ship to Loc
                    "WERKSD":sap.ui.getCore().byId("WERKSD").getValue(), //Ship to Loc Description
                    "LGORT":sap.ui.getCore().byId("LGORT").getValue(),//Storage location
                    "LGORTD":sap.ui.getCore().byId("LGORTD").getValue(),//Storage location Description
                    "EKGRP":sap.ui.getCore().byId("EKGRP").getValue(),//purchasing group
                    "EKGRPD":sap.ui.getCore().byId("EKGRPD").getValue(),//purchasing group Description
                    "LFDAT":dateFormat.format(sap.ui.getCore().byId("LFDAT").getDateValue()), //Need to date
                    "IMIOPRFileNavi":oAttachmentItem, //Attachment Item
                    "IMIOPRVendorNavi":IMIOPRSupplierItem, //Vendor Item
                    "IMIOPRItemNavi":IMIOPRMaterialItem //Material Item
                    }],
                    "IMApprLineNavi":ApprLineItem //Approval Line Item
            };
                //console.log(oEntry);
                sap.ui.core.BusyIndicator.show(10);
                /*PR Creation OData Request Submit Process*/
                OData.request({

                            requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi",
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
                                                  //  sap.m.MessageBox.alert("Rejected", {
                                                  //title: "Success",
                                                  //onClose: zhmmaim.util.Commons.onSubmitSuccess,
                                                  //styleClass: "sapThemePositiveText" ,
                                                  //initialFocus: null,
                                                  //textDirection: sap.ui.core.TextDirection.Inherit
                                                  //});
                                                  sap.m.MessageToast.show("Rejected", {onClose: zhmmaim.util.Commons.onSubmitSuccess});
                                                  
                                        },          function(err) {
                                              var message = JSON.parse(err.response.body);
                                          var errorMessage = message.error.innererror.errordetails;
                                          var allMessage = "";
                                          for(var i = 0; i<errorMessage.length;i++){
                                            allMessage += errorMessage[i].message + ".  ";
                                          }

                                            //   sap.m.MessageBox.show(allMessage, {
                                            //   title: "Reject Fail",
                                            //   onClose: zhmmaim.util.Commons.onSubmitFail ,
                                            //   styleClass: "sapThemeNegativeText" ,
                                            //   initialFocus: null,
                                            //   textDirection: sap.ui.core.TextDirection.Inherit
                                            // });
                                            sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                        }

                            );
                            }, function(err) {
                                                    var request = err.request;
                                                    var response = err.response;
                                                    alert("Error in Get -- Request " + request + " Response " + response);
                                        });
                /*
             *
             * IO Complete - Reject
             *
             * */
             	sap.ui.core.BusyIndicator.hide(); 
            }else if(oDetailId === 'CompleteIODetail'){
            /*Attachment*/
            var oAttachmentLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/").length;
            var oAttachmentItem = [];

            for(var i=0; i<oAttachmentLength; i++){
              oAttachmentItem.push({"BGTDOC":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTDOC,
                "BGTSEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTSEQ,
                "SEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].SEQ,
                "FTYPE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].FTYPE,
                "ID":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].ID,
                "VALUE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].VALUE,
                "URI":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].URI
              });
            }

            /*Payback Item*/
            var oIOCreatePaybackLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/").length;
            var IMIOPRROIItem = [];

            for(var i=0; i<oIOCreatePaybackLength;i++){
              IMIOPRROIItem.push({"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC,
                "BGTSEQ":"001",
                "GJAHR":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/")[i].GJAHR,
                "RTNAMT":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/")[i].RTNAMT});
            };

            //console.log(IMIOPRROIItem);

            /*
             *  Test User ID
             *  HMM101253
             *  HMM100312
             *  HMM100352
             *  HMM100241
             *  HMM104851
             */
            var oEntry={"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                  "RDATE":ARDAT, //Today
                  "PERNR":this.getView().getModel().getProperty('/').PERNR, //USER
                  "KOSTL":this.getView().getModel().getProperty('/').KOSTL,//CostCenter
                  "RTYPE":this.getView().getModel().getProperty('/').RTYPE, // Document Type
                  "BTSTS":"S", //
                  "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                  "APPRV":"X", //BPM O
                  "USER_ID":oUserInfo.PERNR, //USER_ID
                  "ARESULT":"2",//Claim User Event Result Variable
                  "IMIOPRNavi":[{"BGTDOC": this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                    "BGTSEQ":"001", //Document Sequence
                    "RTYPE":this.getView().getModel().getProperty("/").RTYPE, //Document Type
                    "AUFNR":sap.ui.getCore().byId("AUFNR").getValue(), //IO
                    "KTEXT":sap.ui.getCore().byId("KTEXT").getValue(), //Description
                    "PURPO":sap.ui.getCore().byId("PURPO").getValue(), //Purpose
                    "USER5":dateFormat.format(sap.ui.getCore().byId("USER5").getDateValue()), //[Plan]Approval
                    "USER7":dateFormat.format(sap.ui.getCore().byId("USER7").getDateValue()), //[Plan]PR
                    "PODATE":dateFormat.format(sap.ui.getCore().byId("PODATE").getDateValue()), //[Plan]PO
                    "GRDATE":dateFormat.format(sap.ui.getCore().byId("GRDATE").getDateValue()), //[Plan]GR
                    "INSDATE":dateFormat.format(sap.ui.getCore().byId("INSDATE").getDateValue()), //[Plan]Install
                    "USER8":dateFormat.format(sap.ui.getCore().byId("USER8").getDateValue()), //[Plan]Finish
                    "A_APP_DATE":dateFormat.format(sap.ui.getCore().byId("A_APP_DATE").getDateValue()), //[Actual]Approval
                    "A_PRDATE":dateFormat.format(sap.ui.getCore().byId("A_PRDATE").getDateValue()), //[Actual]PR
                    "A_PODATE":dateFormat.format(sap.ui.getCore().byId("A_PODATE").getDateValue()), //[Actual]PO
                    "A_GRDATE":dateFormat.format(sap.ui.getCore().byId("A_GRDATE").getDateValue()), //[Actual]GR
                    "A_INSDATE":dateFormat.format(sap.ui.getCore().byId("A_INSDATE").getDateValue()), //[Actual]Install
                    "A_FINISH":dateFormat.format(sap.ui.getCore().byId("A_FINISH").getDateValue()), //[Actual]Finish
                    "EFFTA":sap.ui.getCore().byId("EFFTA").getValue(), //Tangible
                    "EFFIN":sap.ui.getCore().byId("EFFIN").getValue(), //Intangible
                    "TPLNR":sap.ui.getCore().byId("TPLNR").getValue(), // Location
                    "IMIOPRROINavi":IMIOPRROIItem, //ROI Item
                    "IMIOPRFileNavi":oAttachmentItem //Attachment Item
                    }],
                    "IMApprLineNavi":ApprLineItem //Approval Line Item
            };
                //console.log(oEntry);
                sap.ui.core.BusyIndicator.show(10);
                /*Complete IO OData Request Submit Process*/
                OData.request({

                            requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi",
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
                                                  //  sap.m.MessageBox.alert("Rejected", {
                                                  //title: "Success",
                                                  //onClose: zhmmaim.util.Commons.onSubmitSuccess ,
                                                  //styleClass: "sapThemePositiveText" ,
                                                  //initialFocus: null,
                                                  //textDirection: sap.ui.core.TextDirection.Inherit
                                                  //});
                                                  sap.m.MessageToast.show("Rejected", {onClose: zhmmaim.util.Commons.onSubmitSuccess});
                                                  
                                        },          function(err) {
                                              var message = JSON.parse(err.response.body);
                                          var errorMessage = message.error.innererror.errordetails;
                                          var allMessage = "";
                                          for(var i = 0; i<errorMessage.length;i++){
                                            allMessage += errorMessage[i].message + ".  ";
                                          }

                                            //   sap.m.MessageBox.show(allMessage, {
                                            //   title: "Reject Fail",
                                            //   onClose: zhmmaim.util.Commons.onSubmitFail ,
                                            //   styleClass: "sapThemeNegativeText" ,
                                            //   initialFocus: null,
                                            //   textDirection: sap.ui.core.TextDirection.Inherit
                                            // });
											sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});                                           
                                        }

                            );
                            }, function(err) {
                                                    var request = err.request;
                                                    var response = err.response;
                                                    alert("Error in Get -- Request " + request + " Response " + response);
                                        });
                /*
             *
             * Budget Transfer - Reject
             *
             * */
             	sap.ui.core.BusyIndicator.hide(); 
            }else if(oDetailId === 'BudgetTransferDetail'){

              var IMBudgetItem = [];
              var oSenderLength = sap.ui.getCore().byId("oSender").getModel().getProperty('/').length,
                oReceiverLength = sap.ui.getCore().byId("oReceiver").getModel().getProperty('/').length;

              for(i=0;i<oSenderLength;i++){
                IMBudgetItem.push(sap.ui.getCore().byId("oSender").getModel().getProperty('/')[i]);
              }
              //console.log(IMBudgetItem)

              for(i=0;i<oReceiverLength;i++){
                IMBudgetItem.push(sap.ui.getCore().byId("oReceiver").getModel().getProperty('/')[i]);
              }
              //console.log(IMBudgetItem)

              var oEntry={"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                  "RDATE":ARDAT, //Today
                  "PERNR":this.getView().getModel().getProperty('/').PERNR, //USER
                  "KOSTL":this.getView().getModel().getProperty('/').KOSTL,//CostCenter
                  "RTYPE":this.getView().getModel().getProperty('/').RTYPE, // Document Type
                  "BTSTS":"S", //
                  "BTSUBJ":this.getView().getModel().getProperty('/').BTSUBJ, //Document Title, Description
                  "APPRV":"X", //BPM O
                  "USER_ID":oUserInfo.PERNR, //USER_ID
                  "ARESULT": "1",//Claim User Event Result Variable
                  "IMApprBudNavi":IMBudgetItem, //Budget Item
                  "IMApprLineNavi":ApprLineItem //Approval Line Item
            };
                  //console.log(oEntry);
                  sap.ui.core.BusyIndicator.show(10);
                  /*Budget Transfer OData Request Submit Process*/
                  OData.request({

                              requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprBudNavi,IMApprTextNavi",
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
                                                    //   sap.m.MessageBox.alert("Rejected", {
                                                    // title: "Success",
                                                    // onClose: zhmmaim.util.Commons.onSubmitSuccess ,
                                                    // styleClass: "sapThemePositiveText" ,
                                                    // initialFocus: null,
                                                    // textDirection: sap.ui.core.TextDirection.Inherit
                                                    // });
													sap.m.MessageToast.show("Rejected", {onClose: zhmmaim.util.Commons.onSubmitSuccess});;                                                    
													
                                          },          function(err) {
                                                var message = JSON.parse(err.response.body);
                                            var errorMessage = message.error.innererror.errordetails;
                                            var allMessage = "";
                                            for(var i = 0; i<errorMessage.length;i++){
                                              allMessage += errorMessage[i].message + ".  ";
                                            }

                                              //  sap.m.MessageBox.show(allMessage, {
                                              //  title: "Reject Fail",
                                              //  onClose: zhmmaim.util.Commons.onSubmitFail ,
                                              //  styleClass: "sapThemeNegativeText" ,
                                              //  initialFocus: null,
                                              //  textDirection: sap.ui.core.TextDirection.Inherit
                                              //});
                                               sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                          }

                              );
                              }, function(err) {
                                                      var request = err.request;
                                                      var response = err.response;
                                                      alert("Error in Get -- Request " + request + " Response " + response);
                                          });
            /*
             *
             * Budget Planning - Reject
             *
             * */
             	sap.ui.core.BusyIndicator.hide(); 
            }else if(oDetailId === 'ABPDetail'){

              var oContextABPDetail = sap.ui.getCore().byId("oDetaTB").getModel(),
                oABPDetaLength = oContextABPDetail.getProperty("/IMABPDetaNavi/results/").length;
              var ABPDetailItem = [];

              for(var i=0;i<oABPDetaLength;i++){
                if(sap.ui.getCore().byId("oDetaTB").getModel().getProperty('/IMABPDetaNavi/results/'+i)){
                  IMABPItem = oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/IMABPItemNavi/results");
                  IMABPROIItem = oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/IMABPROINavi/results");
                  oAttachmentItem = oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/IMABPFileNavi/results");

                  var oDetail = {"BGTDOC":oContextABPDetail.getProperty("/").BGTDOC, //Document Number
                      "BGTSEQ":oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").BGTSEQ, //Document Sequence increase
                      "ZPROJ": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").ZPROJ,//P.Code
                      "ZPROJD":oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").ZPROJD, //P.Code Description
                      "GJAHR": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").GJAHR, // Fiscal Year
                      "KTEXT": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").KTEXT, // Header Description
                      "TXT50": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").TXT50, // Description
                      "IZWEK": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").IZWEK,//IM.Reason
                      "IZWEKD": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").IZWEKD,//IM.Reason Description
                      "VKOSTL": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").VKOSTL,//CC.Response
                      "VKOSTLD": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").VKOSTLD,//CC.Response Description
                      "WERKS": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WERKS, //Plant
                      "WERKSD": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WERKSD, //Plant Description
                      "PRIORI": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").PRIORI, //Priority
                      "PRIORID": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").PRIORID, //Priority Description
                      "USR02": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR02, //Category
                      "USR02D": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR02D, //Category Description
                      "USR03": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR03, //IM.Classification
                      "USR03D": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR03D, //IM.Classification Description
                      "USR00": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR00, //Asset Class
                      "USR00D": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR00D, //Asset Class Description
                      "SIZECL": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").SIZECL,//Scale
                      "SIZECLD": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").SIZECLD,//Scale Description
                      "GDATU": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").GDATU, //[Plan]Approval
                      "WDATU": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WDATU, //[Plan]PR
                      "PODATE": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").PODATE, //[Plan]PO
                      "USR01": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR01, //[Plan]GR
                      "USR08": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR08, //[Plan]Install
                      "USR09": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR09, //[Plan]Finish
                      "PURPO": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").PURPO, //Purpose
                      "EFFTA": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").EFFTA, //Tangible
                      "EFFIN": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").EFFIN, //Intangible
                      "TPLNR": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").TPLNR, //Location
                      "WTP01": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP01, //[Monthly Plan]1
                      "WTP02": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP02, //[Monthly Plan]2
                      "WTP03": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP03, //[Monthly Plan]3
                      "WTP04": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP04, //[Monthly Plan]4
                      "WTP05": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP05, //[Monthly Plan]5
                      "WTP06": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP06, //[Monthly Plan]6
                      "WTP07": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP07, //[Monthly Plan]7
                      "WTP08": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP08, //[Monthly Plan]8
                      "WTP09": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP09, //[Monthly Plan]9
                      "WTP10": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP10, //[Monthly Plan]10
                      "WTP11": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP11, //[Monthly Plan]11
                      "WTP12": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP12, //[Monthly Plan]12
                      "TOTA": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").TOTA, //Total Item Value
                      "IMABPROINavi":IMABPROIItem,
                      "IMABPFileNavi":oAttachmentItem,
                      "IMABPItemNavi":IMABPItem};

                  ABPDetailItem.push(oDetail);
                }
              }
              //console.log(ABPDetailItem);

              var oEntry={"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                    "RDATE":ARDAT, //Today
                    "PERNR":this.getView().getModel().getProperty("/").PERNR, //USER
                    "KOSTL":this.getView().getModel().getProperty("/").KOSTL, //Cost Center
                    "RTYPE":this.getView().getModel().getProperty("/").RTYPE, // Document Type
                    "BTSTS":"S", //
                    "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                    "APPRV":"X", //BPM O
                    "USER_ID":oUserInfo.PERNR, //USER_ID
                    "ARESULT":"1",//Claim User Event Result Variable
                    "IMABPDetaNavi":ABPDetailItem, // ABP Detail Item
                    "IMApprLineNavi":ApprLineItem //Approval Line Item
              };
                  //console.log(oEntry);
                  sap.ui.core.BusyIndicator.show(10);
                  /*Budget Transfer OData Request Submit Process*/
                  OData.request({

                              requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMABPDetaNavi/IMABPItemNavi,IMABPDetaNavi/IMABPROINavi,IMApprTextNavi,IMIOPRNavi/IMIOPRFileNavi",
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
                                                    //   sap.m.MessageBox.alert("Rejected", {
                                                    // title: "Success",
                                                    // onClose: zhmmaim.util.Commons.onSubmitSuccess,
                                                    // styleClass: "sapThemePositiveText" ,
                                                    // initialFocus: null,
                                                    // textDirection: sap.ui.core.TextDirection.Inherit
                                                    // });
													sap.m.MessageToast.show("Rejected", {onClose: zhmmaim.util.Commons.onSubmitSuccess});                                                  
													
                                          },          function(err) {
                                                var message = JSON.parse(err.response.body);
                                            var errorMessage = message.error.innererror.errordetails;
                                            var allMessage = "";
                                            for(var i = 0; i<errorMessage.length;i++){
                                              allMessage += errorMessage[i].message + ".  ";
                                            }
                                              //  sap.m.MessageBox.show(allMessage, {
                                              //  title: "Reject Fail",
                                              //  onClose: zhmmaim.util.Commons.onSubmitFail ,
                                              //  styleClass: "sapThemeNegativeText" ,
                                              //  initialFocus: null,
                                              //  textDirection: sap.ui.core.TextDirection.Inherit
                                              //});
                                               sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                          }

                              );
                              }, function(err) {
                                                      var request = err.request;
                                                      var response = err.response;
                                                      alert("Error in Get -- Request " + request + " Response " + response);
                                          });
					sap.ui.core.BusyIndicator.hide();                                           
              }
          },

          onConsiderDialog: function(oEvent){
            var oDetailId = oEvent.getSource().getParent().getParent().getId();
            var dialog = new sap.m.Dialog({
              title: 'Confirm',
              type: 'Message',
              content: new sap.m.Text({ text: 'Are you sure you want to Consideration?' }),
              beginButton: new sap.m.Button({
                text: 'Consideration',
                press: [function(oEvent){
                  this.onConsider(oDetailId);
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
        },


          /*Cooperation 긽깭뿉꽌留 뿀슜릺뒗 寃곌낵媛(Consideration)*/
          onConsider:function(oDetailId){
            //console.log(oDetailId)
            //var oDetailId = oEvent.getSource().getParent().getParent().getId();
            var oSwitchCP = sap.ui.getCore().byId("SwitchCP").getState(),
              oRVSearch = sap.ui.getCore().byId("oRVSearch").getVisible();

            /*
             * Common - Consideration
             *
             * */

            /*Date Time Formatting - ARDAT , ARZET(ApprLineNavi)*/
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyyMMdd" }),
              timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern : "HHmmss" }),
            ARDAT = dateFormat.format(new Date());
            ARZET = timeFormat.format(new Date());

            /*Approval Line Item*/
            var oIOCreateWFLength = this.getView().getModel().getProperty("/IMApprLineNavi/results/").length;
            var ApprLineItem = [];

            /*
             *  Test User ID
             *  HMM101253
             *  HMM100312
             *  HMM100352
             *  HMM100241
             *  HMM104851
             *
             *  Cooperation User ID
             *  HMM104851
             *  HMM105115
             *
             *  Review User ID
             *  HMM100241
             *  HMM103781
             *
             *  Claim User ID
             *  HMM103874
             */

            for (i=0; i<oIOCreateWFLength;i++){
              var oContextBGTSEQ = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].BGTSEQ,
                oContextUSERID = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].APERNR,
                oContextARESULT = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ARESULT,
                oContextATYPE = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ATYPE,
                oContextBGTTYPE = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].BGTTYPE,
                oContextRTEXT = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].RTEXT,
                oContextARDAT = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ARDAT,
                oContextARZET = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ARZET,
                oContextORIREQ = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ORIREQ,
                oContextCOSEQ = this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].CO_SEQ;

              if(oContextUSERID === oUserInfo.PERNR){
                oContextARESULT = '4';
                oContextRTEXT = sap.ui.getCore().byId("comment").getValue();
                oContextARDAT = ARDAT;
                oContextARZET = ARZET;
                var BGTSEQ = oContextBGTSEQ;
              }
              ApprLineItem.push({"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC,
                "BGTSEQ":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].BGTSEQ,
                "ARESULT":oContextARESULT,
                "BGTTYPE": oContextBGTTYPE,
                "RTEXT" : oContextRTEXT,
                "ARDAT": oContextARDAT,
                "ARZET": oContextARZET,
                "APERNR":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].APERNR,
                "DUTY_CODE":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].DUTY_CODE,
                "DUTY_NAME":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].DUTY_NAME,
                "ENGLISH_NAME":this.getView().getModel().getProperty("/IMApprLineNavi/results/")[i].ENGLISH_NAME,
                "ORIREQ":oContextORIREQ,
                "CO_SEQ":oContextCOSEQ,
              });
            }

            //console.log(ApprLineItem);

            /*IOCreationDetail - Consideration*/
            if(oDetailId === 'IOCreationDetail'){

            /*Attachment*/
            var oAttachmentLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/").length;
            var oAttachmentItem = [];

            for(var i=0; i<oAttachmentLength; i++){
              oAttachmentItem.push({"BGTDOC":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTDOC,
                "BGTSEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTSEQ,
                "SEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].SEQ,
                "FTYPE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].FTYPE,
                "ID":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].ID,
                "VALUE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].VALUE,
                "URI":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].URI
              });
            }

            /*Payback Item*/
            var oIOCreatePaybackLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/").length;
            var IMIOPRROIItem = [];

            for(var i=0; i<oIOCreatePaybackLength;i++){
              IMIOPRROIItem.push({"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC,
                "BGTSEQ":"001",
                "GJAHR":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/")[i].GJAHR,
                "RTNAMT":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/")[i].RTNAMT});
            };

            //console.log(IMIOPRROIItem);
            /*ExistAsset Item*/
            var TokensLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRAssetNavi/results/").length;
            var IMIOPRAssetItem = [];
            for(var i=0; i<TokensLength; i++){
              IMIOPRAssetItem.push({"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC,
                "BGTSEQ":"001",
                "SEQ":(i+1).toString(),
                "ANLN1":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRAssetNavi/results/")[i].ANLN1});
            };

            //console.log(IMIOPRAssetItem);
            //alert(sap.ui.getCore().byId("WERKS").getValue());

            var oEntry={"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                "RDATE":ARDAT, //Today
                "PERNR":this.getView().getModel().getProperty('/').PERNR, //USER
                "KOSTL":this.getView().getModel().getProperty('/').KOSTL,//CostCenter
                "RTYPE":this.getView().getModel().getProperty('/').RTYPE, // Document Type
                "BTSTS":"S", //
                "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                "APPRV":"X", //BPM O
                "USER_ID":oUserInfo.PERNR, //USER_ID
                "ARESULT":"2",//Claim User Event Result Variable
                "IMIOPRNavi":[{"BGTDOC": this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                  "BGTSEQ":"001", //Document Sequence
                  "APPROVED":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/").APPROVED, //Already Approved
                  "RTYPE":this.getView().getModel().getProperty("/").RTYPE, //Document Type
                  "BGTYPE":sap.ui.getCore().byId("IOTypeSelect").getSelectedKey(), //IO Type
                  "USER4":zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("USER4").getValue()), // Estimate Cost
                  "POSID":sap.ui.getCore().byId("POSID").getValue(), // Project ID
                  "GJAHR":sap.ui.getCore().byId("Year").getValue(), // Project Year
                  "WERKS":sap.ui.getCore().byId("WERKS").getValue(), // Plant code
                  "WERKSD":sap.ui.getCore().byId("WERKSD").getValue(), // Plant Description
                  "KOSTV":sap.ui.getCore().byId("KOSTV").getValue(), // CC.Request
                  "KOSTVD":sap.ui.getCore().byId("KOSTVD").getValue(), // CC.Request Description
                  "AKSTL":sap.ui.getCore().byId("AKSTL").getValue(), // CC.Response
                  "AKSTLD":sap.ui.getCore().byId("AKSTLD").getValue(), // CC.Response Description
                  "USER0":sap.ui.getCore().byId("USER0").getValue(), // Applicant
                  "USER1":sap.ui.getCore().byId("USER1").getValue(), // Applicant Telephone
                  "USER2":sap.ui.getCore().byId("USER2").getValue(), // Person.Responsible
                  "KTEXT":sap.ui.getCore().byId("KTEXT").getValue(), // Description
                  "PURPO":sap.ui.getCore().byId("PURPO").getValue(), // Purpose
                  "USER5":dateFormat.format(sap.ui.getCore().byId("USER5").getDateValue()), //[Plan]Approval
                  "USER7":dateFormat.format(sap.ui.getCore().byId("USER7").getDateValue()), //[Plan]PR
                  "PODATE":dateFormat.format(sap.ui.getCore().byId("PODATE").getDateValue()), //[Plan]PO
                  "GRDATE":dateFormat.format(sap.ui.getCore().byId("GRDATE").getDateValue()), //[Plan]GR
                  "INSDATE":dateFormat.format(sap.ui.getCore().byId("INSDATE").getDateValue()), //[Plan]Install
                  "USER8":dateFormat.format(sap.ui.getCore().byId("USER8").getDateValue()), //[Plan]Finish
                  "IVPRO":sap.ui.getCore().byId("IVPRO").getValue(), //IM.Profile
                  "IVPROD":sap.ui.getCore().byId("IVPROD").getValue(), //IM.Profile Description
                  "IZWEK":sap.ui.getCore().byId("IZWEK").getValue(), //IM.Reason
                  "IZWEKD":sap.ui.getCore().byId("IZWEKD").getValue(), //IM.Reason Description
                  "ANLKL":sap.ui.getCore().byId("ANLKL").getValue(), //Asset Class
                  "ANLKLD":sap.ui.getCore().byId("ANLKLD").getValue(), //Asset Class Description
                  "AKTIV":dateFormat.format(sap.ui.getCore().byId("AKTIV").getDateValue()), //Capital.Date
                  "TXT50":sap.ui.getCore().byId("TXT50").getValue(), //Asset Name
                  "EFFTA":sap.ui.getCore().byId("EFFTA").getValue(), //Tangible
                  "EFFIN":sap.ui.getCore().byId("EFFIN").getValue(), //Intangible
                  "TPLNR":sap.ui.getCore().byId("TPLNR").getValue(), //Location
                  "ASSET_DIS":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/").ASSET_DIS, //Disposal of existing asset
                  "IMIOPRROINavi":IMIOPRROIItem, //ROI Item
                  "IMIOPRFileNavi":oAttachmentItem, //Attachment Item
                  "IMIOPRAssetNavi":IMIOPRAssetItem //Asset Item
                  }],
                  "IMApprLineNavi":ApprLineItem //Approval Line Item
          };
              //console.log(oEntry);
              sap.ui.core.BusyIndicator.show(10);
                /*IO Creation OData Request Consider Process*/
                OData.request({

                            requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi",
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
                                              //location.reload(true);
                                                  //  sap.m.MessageBox.alert("Consideration", {
                                                  //title: "Success",
                                                  //onClose: zhmmaim.util.Commons.onSubmitSuccess,
                                                  //styleClass: "sapThemePositiveText" ,
                                                  //initialFocus: null,
                                                  //textDirection: sap.ui.core.TextDirection.Inherit
                                                  //});
                                                  sap.m.MessageToast.show("Consideration", {onClose: zhmmaim.util.Commons.onSubmitSuccess});
                                                  
                                        },          function(err) {
                                              var message = JSON.parse(err.response.body);
                                          var errorMessage = message.error.innererror.errordetails;
                                          var allMessage = "";
                                          for(var i = 0; i<errorMessage.length;i++){
                                            allMessage += errorMessage[i].message + ".  ";
                                          }

                                            //   sap.m.MessageBox.show(allMessage, {
                                            //   title: "Consider Fail",
                                            //   onClose: zhmmaim.util.Commons.onSubmitFail ,
                                            //   styleClass: "sapThemeNegativeText" ,
                                            //   initialFocus: null,
                                            //   textDirection: sap.ui.core.TextDirection.Inherit
                                            // });
                                            sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                        }

                            );
                            }, function(err) {
                                                    var request = err.request;
                                                    var response = err.response;
                                                    alert("Error in Get -- Request " + request + " Response " + response);
                                        });
                /*
             *
             * PR Creation - Consideration
             *
             * */
             	sap.ui.core.BusyIndicator.hide(); 
            }else if(oDetailId === 'PRCreationDetail'){
            /*Attachment*/
            var oAttachmentLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/").length;
            var oAttachmentItem = [];

            for(var i=0; i<oAttachmentLength; i++){
              oAttachmentItem.push({"BGTDOC":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTDOC,
                "BGTSEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTSEQ,
                "SEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].SEQ,
                "FTYPE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].FTYPE,
                "ID":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].ID,
                "VALUE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].VALUE,
                "URI":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].URI
              });
            }

            /*Supplier Item*/
            var oPRSupplierPath = "/IMIOPRNavi/results/0/IMIOPRVendorNavi/results/",
              oPRSupplierLength = this.getView().getModel().getProperty(oPRSupplierPath).length;

            var IMIOPRSupplierItem = [];

            for(var i=0; i<oPRSupplierLength;i++){
              IMIOPRSupplierItem.push({"BGTDOC":this.getView().getModel().getProperty(oPRSupplierPath)[i].BGTDOC,
                        "BGTSEQ":this.getView().getModel().getProperty(oPRSupplierPath)[i].BGTSEQ,
                        "SEQ":this.getView().getModel().getProperty(oPRSupplierPath)[i].SEQ,
                        "LIFNR":this.getView().getModel().getProperty(oPRSupplierPath)[i].LIFNR,
                        "NAME1":this.getView().getModel().getProperty(oPRSupplierPath)[i].NAME1,
                        "NETWR":this.getView().getModel().getProperty(oPRSupplierPath)[i].NETWR,
                        "ZSABE":this.getView().getModel().getProperty(oPRSupplierPath)[i].ZSABE,
                        "TEL_NUMBER":this.getView().getModel().getProperty(oPRSupplierPath)[i].TEL_NUMBER,
                        "ACCEPT":this.getView().getModel().getProperty(oPRSupplierPath)[i].ACCEPT,
                        "KVERM":this.getView().getModel().getProperty(oPRSupplierPath)[i].KVERM
              });
            };
            //console.log(IMIOPRSupplierItem);

            /*Material Item*/
            var oPRMaterialPath = "/IMIOPRNavi/results/0/IMIOPRItemNavi/results/",
              oPRMaterialLength = this.getView().getModel().getProperty(oPRMaterialPath).length;

            var IMIOPRMaterialItem = [];

            for(var i=0; i<oPRMaterialLength;i++){
              IMIOPRMaterialItem.push({"BGTDOC":this.getView().getModel().getProperty(oPRMaterialPath)[i].BGTDOC,
                        "BGTSEQ":this.getView().getModel().getProperty(oPRMaterialPath)[i].BGTSEQ,
                        "SEQ":this.getView().getModel().getProperty(oPRMaterialPath)[i].SEQ,
                        "MATNR":this.getView().getModel().getProperty(oPRMaterialPath)[i].MATNR,
                        "MAKTX":this.getView().getModel().getProperty(oPRMaterialPath)[i].MAKTX,
                        "MENGE":this.getView().getModel().getProperty(oPRMaterialPath)[i].MENGE,
                        "MEINS":this.getView().getModel().getProperty(oPRMaterialPath)[i].MEINS,
                        "PREIS":this.getView().getModel().getProperty(oPRMaterialPath)[i].PREIS,
                        "TOT":this.getView().getModel().getProperty(oPRMaterialPath)[i].TOT,
              });
            };
            //console.log(IMIOPRMaterialItem);

            /*
             *  Test User ID
             *  HMM101253
             *  HMM100312
             *  HMM100352
             *  HMM100241
             *  HMM104851
             */
            var oEntry={"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                  "RDATE":ARDAT, //Today
                  "PERNR":this.getView().getModel().getProperty('/').PERNR, //USER
                  "KOSTL":this.getView().getModel().getProperty('/').KOSTL,//CostCenter
                  "RTYPE":this.getView().getModel().getProperty('/').RTYPE, // Document Type
                  "BTSTS":"S", //
                  "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                  "APPRV":"X", //BPM O
                  "USER_ID":oUserInfo.PERNR, //USER_ID
                  "ARESULT":"2",//Claim User Event Result Variable
                  "IMIOPRNavi":[{"BGTDOC": this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                    "BGTSEQ":"001", //Document Sequence
                    "RTYPE":this.getView().getModel().getProperty("/").RTYPE, //Document Type
                    "AUFNR":sap.ui.getCore().byId("AUFNR").getValue(), //IO
                    "BANFN":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/").BANFN,//PR Number
                    "KTEXT":sap.ui.getCore().byId("KTEXT").getValue(), //Description
                    "PURPO":sap.ui.getCore().byId("PURPO").getValue(), //Purpose
                    "WERKS":sap.ui.getCore().byId("WERKS").getValue(), //Ship to Loc
                    "WERKSD":sap.ui.getCore().byId("WERKSD").getValue(), //Ship to Loc Description
                    "LGORT":sap.ui.getCore().byId("LGORT").getValue(),//Storage location
                    "LGORTD":sap.ui.getCore().byId("LGORTD").getValue(),//Storage location Description
                    "EKGRP":sap.ui.getCore().byId("EKGRP").getValue(),//purchasing group
                    "EKGRPD":sap.ui.getCore().byId("EKGRPD").getValue(),//purchasing group Description
                    "LFDAT":dateFormat.format(sap.ui.getCore().byId("LFDAT").getDateValue()), //Need to date
                    "IMIOPRFileNavi":oAttachmentItem, //Attachment Item
                    "IMIOPRVendorNavi":IMIOPRSupplierItem, //Vendor Item
                    "IMIOPRItemNavi":IMIOPRMaterialItem //Material Item
                    }],
                    "IMApprLineNavi":ApprLineItem //Approval Line Item
            };
                //console.log(oEntry);
                sap.ui.core.BusyIndicator.show(10);
                /*PR Creation OData Request Submit Process*/
                OData.request({

                            requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi",
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
                                                  //  sap.m.MessageBox.alert("Consideration", {
                                                  //title: "Success",
                                                  //onClose: zhmmaim.util.Commons.onSubmitSuccess ,
                                                  //styleClass: "sapThemePositiveText" ,
                                                  //initialFocus: null,
                                                  //textDirection: sap.ui.core.TextDirection.Inherit
                                                  //});
                                                  sap.m.MessageToast.show("Consideration", {onClose: zhmmaim.util.Commons.onSubmitFail});
                                                 /*   sap.ui.core.BusyIndicator.hide();
                                                    location.reload(true);*/
                                        },          function(err) {
                                              var message = JSON.parse(err.response.body);
                                          var errorMessage = message.error.innererror.errordetails;
                                          var allMessage = "";
                                          for(var i = 0; i<errorMessage.length;i++){
                                            allMessage += errorMessage[i].message + ".  ";
                                          }

                                          //sap.ui.core.BusyIndicator.hide();
                                            //   sap.m.MessageBox.show(allMessage, {
                                            //   title: "Consider Fail",
                                            //   onClose: zhmmaim.util.Commons.onSubmitFail ,
                                            //   styleClass: "sapThemeNegativeText" ,
                                            //   initialFocus: null,
                                            //   textDirection: sap.ui.core.TextDirection.Inherit
                                            // });
                                            sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                        }

                            );
                            }, function(err) {
                                                    var request = err.request;
                                                    var response = err.response;
                                                    alert("Error in Get -- Request " + request + " Response " + response);
                                        });
                /*
             *
             * IO Complete - Consideration
             *
             * */
             	sap.ui.core.BusyIndicator.hide(); 
            }else if(oDetailId === 'CompleteIODetail'){
            /*Attachment*/
            var oAttachmentLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/").length;
            var oAttachmentItem = [];

            for(var i=0; i<oAttachmentLength; i++){
              oAttachmentItem.push({"BGTDOC":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTDOC,
                "BGTSEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].BGTSEQ,
                "SEQ":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].SEQ,
                "FTYPE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].FTYPE,
                "ID":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].ID,
                "VALUE":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].VALUE,
                "URI":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRFileNavi/results/")[i].URI
              });
            }
            /*Payback Item*/
            var oIOCreatePaybackLength = this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/").length;
            var IMIOPRROIItem = [];

            for(var i=0; i<oIOCreatePaybackLength;i++){
              IMIOPRROIItem.push({"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC,
                "BGTSEQ":"001",
                "GJAHR":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/")[i].GJAHR,
                "RTNAMT":this.getView().getModel().getProperty("/IMIOPRNavi/results/0/IMIOPRROINavi/results/")[i].RTNAMT});
            };

            //console.log(IMIOPRROIItem);

            /*
             *  Test User ID
             *  HMM101253
             *  HMM100312
             *  HMM100352
             *  HMM100241
             *  HMM104851
             */
            var oEntry={"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                  "RDATE":ARDAT, //Today
                  "PERNR":this.getView().getModel().getProperty('/').PERNR, //USER
                  "KOSTL":this.getView().getModel().getProperty('/').KOSTL,//CostCenter
                  "RTYPE":this.getView().getModel().getProperty('/').RTYPE, // Document Type
                  "BTSTS":"S", //
                  "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                  "APPRV":"X", //BPM O
                  "USER_ID":oUserInfo.PERNR, //USER_ID
                  "ARESULT":"2",//Claim User Event Result Variable
                  "IMIOPRNavi":[{"BGTDOC": this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                    "BGTSEQ":"001", //Document Sequence
                    "RTYPE":this.getView().getModel().getProperty("/").RTYPE, //Document Type
                    "AUFNR":sap.ui.getCore().byId("AUFNR").getValue(), //IO
                    "KTEXT":sap.ui.getCore().byId("KTEXT").getValue(), //Description
                    "PURPO":sap.ui.getCore().byId("PURPO").getValue(), //Purpose
                    "USER5":dateFormat.format(sap.ui.getCore().byId("USER5").getDateValue()), //[Plan]Approval
                    "USER7":dateFormat.format(sap.ui.getCore().byId("USER7").getDateValue()), //[Plan]PR
                    "PODATE":dateFormat.format(sap.ui.getCore().byId("PODATE").getDateValue()), //[Plan]PO
                    "GRDATE":dateFormat.format(sap.ui.getCore().byId("GRDATE").getDateValue()), //[Plan]GR
                    "INSDATE":dateFormat.format(sap.ui.getCore().byId("INSDATE").getDateValue()), //[Plan]Install
                    "USER8":dateFormat.format(sap.ui.getCore().byId("USER8").getDateValue()), //[Plan]Finish
                    "A_APP_DATE":dateFormat.format(sap.ui.getCore().byId("A_APP_DATE").getDateValue()), //[Actual]Approval
                    "A_PRDATE":dateFormat.format(sap.ui.getCore().byId("A_PRDATE").getDateValue()), //[Actual]PR
                    "A_PODATE":dateFormat.format(sap.ui.getCore().byId("A_PODATE").getDateValue()), //[Actual]PO
                    "A_GRDATE":dateFormat.format(sap.ui.getCore().byId("A_GRDATE").getDateValue()), //[Actual]GR
                    "A_INSDATE":dateFormat.format(sap.ui.getCore().byId("A_INSDATE").getDateValue()), //[Actual]Install
                    "A_FINISH":dateFormat.format(sap.ui.getCore().byId("A_FINISH").getDateValue()), //[Actual]Finish
                    "EFFTA":sap.ui.getCore().byId("EFFTA").getValue(), //Tangible
                    "EFFIN":sap.ui.getCore().byId("EFFIN").getValue(), //Intangible
                    "TPLNR":sap.ui.getCore().byId("TPLNR").getValue(), // Location
                    "IMIOPRROINavi":IMIOPRROIItem, //ROI Item
                    "IMIOPRFileNavi":oAttachmentItem //Attachment Item
                    }],
                    "IMApprLineNavi":ApprLineItem //Approval Line Item
            };
                //console.log(oEntry);
                sap.ui.core.BusyIndicator.show(10);

                /*Complete IO OData Request Submit Process*/
                OData.request({
                            requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprTextNavi,IMIOPRNavi/IMIOPRAssetNavi,IMIOPRNavi/IMIOPRROINavi",
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
                                                  //  sap.m.MessageBox.alert("Consideration", {
                                                  //title: "Success",
                                                  //onClose: zhmmaim.util.Commons.onSubmitSuccess,
                                                  //styleClass: "sapThemePositiveText" ,
                                                  //initialFocus: null,
                                                  //textDirection: sap.ui.core.TextDirection.Inherit
                                                  //});
                                                  sap.m.MessageToast.show("Consideration", {onClose: zhmmaim.util.Commons.onSubmitFail});
                                        },          function(err) {
                                              var message = JSON.parse(err.response.body);
                                          var errorMessage = message.error.innererror.errordetails;
                                          var allMessage = "";
                                          for(var i = 0; i<errorMessage.length;i++){
                                            allMessage += errorMessage[i].message + ".  ";
                                          }

                                            //   sap.m.MessageBox.show(allMessage, {
                                            //   title: "Consider Fail",
                                            //   onClose: zhmmaim.util.Commons.onSubmitFail ,
                                            //   styleClass: "sapThemeNegativeText" ,
                                            //   initialFocus: null,
                                            //   textDirection: sap.ui.core.TextDirection.Inherit
                                            // });
                                             sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                        }

                            );
                            }, function(err) {
                                                    var request = err.request;
                                                    var response = err.response;
                                                    alert("Error in Get -- Request " + request + " Response " + response);
                                        });
                  /*
               *
               * Budget Transfer - Consideration
               *
               * */
               	sap.ui.core.BusyIndicator.hide(); 
              }else if(oDetailId === 'BudgetTransferDetail'){

              var IMBudgetItem = [];
              var oSenderLength = sap.ui.getCore().byId("oSender").getModel().getProperty('/').length,
                oReceiverLength = sap.ui.getCore().byId("oReceiver").getModel().getProperty('/').length;

              for(i=0;i<oSenderLength;i++){
                IMBudgetItem.push(sap.ui.getCore().byId("oSender").getModel().getProperty('/')[i]);
              }
              //console.log(IMBudgetItem)

              for(i=0;i<oReceiverLength;i++){
                IMBudgetItem.push(sap.ui.getCore().byId("oReceiver").getModel().getProperty('/')[i]);
              }
              //console.log(IMBudgetItem)

              var oEntry={"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                  "RDATE":ARDAT, //Today
                  "PERNR":this.getView().getModel().getProperty('/').PERNR, //USER
                  "KOSTL":this.getView().getModel().getProperty('/').KOSTL,//CostCenter
                  "RTYPE":this.getView().getModel().getProperty('/').RTYPE, // Document Type
                  "BTSTS":"S", //status
                  "BTSUBJ":this.getView().getModel().getProperty('/').BTSUBJ, //Document Title, Description
                  "APPRV":"X", //BPM O
                  "USER_ID":oUserInfo.PERNR, //USER_ID
                  "ARESULT": "1",//Claim User Event Result Variable
                  "IMApprBudNavi":IMBudgetItem, //Budget Item
                  "IMApprLineNavi":ApprLineItem //Approval Line Item
            };
                  //console.log(oEntry);
                  sap.ui.core.BusyIndicator.show(10);
                  /*Budget Transfer OData Request Submit Process*/
                  OData.request({

                              requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMApprBudNavi,IMApprTextNavi",
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
                                                    //   sap.m.MessageBox.alert("Consideration", {
                                                    // title: "Success",
                                                    // onClose: zhmmaim.util.Commons.onSubmitSuccess ,
                                                    // styleClass: "sapThemePositiveText" ,
                                                    // initialFocus: null,
                                                    // textDirection: sap.ui.core.TextDirection.Inherit
                                                    // });
                                                    sap.m.MessageToast.show("Consideration", {onClose: zhmmaim.util.Commons.onSubmitFail});
                                          },          function(err) {
                                                var message = JSON.parse(err.response.body);
                                            var errorMessage = message.error.innererror.errordetails;
                                            var allMessage = "";
                                            for(var i = 0; i<errorMessage.length;i++){
                                              allMessage += errorMessage[i].message + ".  ";
                                            }

                                              //  sap.m.MessageBox.show(allMessage, {
                                              //  title: "Consider Fail",
                                              //  onClose: zhmmaim.util.Commons.onSubmitFail ,
                                              //  styleClass: "sapThemeNegativeText" ,
                                              //  initialFocus: null,
                                              //  textDirection: sap.ui.core.TextDirection.Inherit
                                              //});
                                               sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                          }

                              );
                              }, function(err) {
                                                      var request = err.request;
                                                      var response = err.response;
                                                      alert("Error in Get -- Request " + request + " Response " + response);
                                          });
                  /*
               *
               * Budget Planning - Consider
               *
               * */
               	sap.ui.core.BusyIndicator.hide(); 
              }else if(oDetailId === 'ABPDetail'){

                var oContextABPDetail = sap.ui.getCore().byId("oDetaTB").getModel(),
                  oABPDetaLength = oContextABPDetail.getProperty("/IMABPDetaNavi/results/").length;
                var ABPDetailItem = [];

                for(var i=0;i<oABPDetaLength;i++){
                  if(sap.ui.getCore().byId("oDetaTB").getModel().getProperty('/IMABPDetaNavi/results/'+i)){
                    IMABPItem = oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/IMABPItemNavi/results");
                    IMABPROIItem = oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/IMABPROINavi/results");
                    oAttachmentItem = oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/IMABPFileNavi/results");

                    var oDetail = {"BGTDOC":oContextABPDetail.getProperty("/").BGTDOC, //Document Number
                        "BGTSEQ":oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").BGTSEQ, //Document Sequence increase
                        "ZPROJ": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").ZPROJ,//P.Code
                        "ZPROJD":oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").ZPROJD, //P.Code Description
                        "GJAHR": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").GJAHR, // Fiscal Year
                        "KTEXT": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").KTEXT, // Header Description
                        "TXT50": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").TXT50, // Description
                        "IZWEK": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").IZWEK,//IM.Reason
                        "IZWEKD": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").IZWEKD,//IM.Reason Description
                        "VKOSTL": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").VKOSTL,//CC.Response
                        "VKOSTLD": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").VKOSTLD,//CC.Response Description
                        "WERKS": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WERKS, //Plant
                        "WERKSD": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WERKSD, //Plant Description
                        "PRIORI": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").PRIORI, //Priority
                        "PRIORID": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").PRIORID, //Priority Description
                        "USR02": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR02, //Category
                        "USR02D": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR02D, //Category Description
                        "USR03": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR03, //IM.Classification
                        "USR03D": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR03D, //IM.Classification Description
                        "USR00": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR00, //Asset Class
                        "USR00D": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR00D, //Asset Class Description
                        "SIZECL": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").SIZECL,//Scale
                        "SIZECLD": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").SIZECLD,//Scale Description
                        "GDATU": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").GDATU, //[Plan]Approval
                        "WDATU": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WDATU, //[Plan]PR
                        "PODATE": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").PODATE, //[Plan]PO
                        "USR01": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR01, //[Plan]GR
                        "USR08": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR08, //[Plan]Install
                        "USR09": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").USR09, //[Plan]Finish
                        "PURPO": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").PURPO, //Purpose
                        "EFFTA": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").EFFTA, //Tangible
                        "EFFIN": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").EFFIN, //Intangible
                        "TPLNR": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").TPLNR, //Location
                        "WTP01": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP01, //[Monthly Plan]1
                        "WTP02": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP02, //[Monthly Plan]2
                        "WTP03": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP03, //[Monthly Plan]3
                        "WTP04": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP04, //[Monthly Plan]4
                        "WTP05": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP05, //[Monthly Plan]5
                        "WTP06": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP06, //[Monthly Plan]6
                        "WTP07": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP07, //[Monthly Plan]7
                        "WTP08": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP08, //[Monthly Plan]8
                        "WTP09": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP09, //[Monthly Plan]9
                        "WTP10": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP10, //[Monthly Plan]10
                        "WTP11": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP11, //[Monthly Plan]11
                        "WTP12": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").WTP12, //[Monthly Plan]12
                        "TOTA": oContextABPDetail.getProperty("/IMABPDetaNavi/results/"+i+"/").TOTA, //Total Item Value
                        "IMABPROINavi":IMABPROIItem,
                        "IMABPFileNavi":oAttachmentItem,
                        "IMABPItemNavi":IMABPItem};

                    ABPDetailItem.push(oDetail);
                  }
                }
                //console.log(ABPDetailItem);

                var oEntry={"BGTDOC":this.getView().getModel().getProperty("/").BGTDOC, //Document Number
                      "RDATE":ARDAT, //Today
                      "PERNR":this.getView().getModel().getProperty("/").PERNR, //USER
                      "KOSTL":this.getView().getModel().getProperty("/").KOSTL, //Cost Center
                      "RTYPE":this.getView().getModel().getProperty("/").RTYPE, // Document Type
                      "BTSTS":"S", //
                      "BTSUBJ":sap.ui.getCore().byId("KTEXT").getValue(), //Document Title, Description
                      "APPRV":"X", //BPM O
                      "USER_ID":oUserInfo.PERNR, //USER_ID
                      "ARESULT":"1",//Claim User Event Result Variable
                      "IMABPDetaNavi":ABPDetailItem, // ABP Detail Item
                      "IMApprLineNavi":ApprLineItem //Approval Line Item
                };
                    //console.log(oEntry);
                    sap.ui.core.BusyIndicator.show(10);
                    /*Budget Transfer OData Request Submit Process*/
                    OData.request({

                                requestUri : sServiceUrl+"/IMApprHead(BGTDOC='')/?$expand=IMApprLineNavi,IMABPDetaNavi/IMABPItemNavi,IMABPDetaNavi/IMABPROINavi,IMApprTextNavi,IMIOPRNavi/IMIOPRFileNavi",
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
                                                      //  sap.m.MessageBox.alert("Consideration", {
                                                      //title: "Success",
                                                      //onClose: zhmmaim.util.Commons.onSubmitSuccess ,
                                                      //styleClass: "sapThemePositiveText" ,
                                                      //initialFocus: null,
                                                      //textDirection: sap.ui.core.TextDirection.Inherit
                                                      //});
                                                      sap.m.MessageToast.show("Consideration", {onClose: zhmmaim.util.Commons.onSubmitFail});
                                            },          function(err) {
                                                  var message = JSON.parse(err.response.body);
                                              var errorMessage = message.error.innererror.errordetails;
                                              var allMessage = "";
                                              for(var i = 0; i<errorMessage.length;i++){
                                                allMessage += errorMessage[i].message + ".  ";
                                              }

                                                //   sap.m.MessageBox.show(allMessage, {
                                                //   title: "Consider Fail",
                                                //   onClose: zhmmaim.util.Commons.onSubmitFail ,
                                                //   styleClass: "sapThemeNegativeText" ,
                                                //   initialFocus: null,
                                                //   textDirection: sap.ui.core.TextDirection.Inherit
                                                // });
                                                sap.m.MessageToast.show(allMessage, {onClose: zhmmaim.util.Commons.onSubmitFail});
                                            }

                                );
                                }, function(err) {
                                                        var request = err.request;
                                                        var response = err.response;
                                                        alert("Error in Get -- Request " + request + " Response " + response);
                                            });
					sap.ui.core.BusyIndicator.hide();                                             
                }
          },

          /*Edit Page*/
          onEditPress:function(oEvent){
            /*Get this View Model and Data*/
            this._oInboxData = jQuery.extend({},
                this.getView().getModel().getData());
            //console.log(this.getView().getModel().getData());
            this._toggleButtonsAndView(true);
          },

          /*Edit Cancel*/
          onEditCancelPress: function(){
            //Restore the Data
            var oModel = this.getView().getModel();
            var oData = oModel.getData();
            oData = this._oInboxData;
            oModel.setData(oData);
            this._toggleButtonsAndView(false);
          },

          /*Edit SAVE*/
          onEditSavePress: function(){
            this._toggleButtonsAndView(false);
          },

          _formFragments:{},

          _toggleButtonsAndView:function(bEdit){
            /*var oView = this.getView();
            var oView = sap.ui.getCore().byId("oIOCreationDetail");

            //show the appropriate action buttons
            sap.ui.getCore().byId("edit").setVisible(!bEdit);
            sap.ui.getCore().byId("editsave").setVisible(bEdit);
            sap.ui.getCore().byId("editcancel").setVisible(bEdit);*/

            /*Destroy Content*/
            this.getView().byId("oPvInboxDetail").destroyContent();
            //set the right form type
            this._showFormFragment(bEdit ? "IOCreationDetailEdit" : "IOCreationDetail");
          },

          _getFormFragment:function(sFragmentName){
            var oFormFragment = this._formFragments[sFragmentName];
            /*if(oFormFragment){
              return oFormFragment;
            }*/
            //FormFragment = sap.ui.xmlfragment("zhmmaim.fragment."+sap.ui.getCore().byId("IOCreationDetail").getId()+"Edit",this);
            oFormFragment = sap.ui.xmlfragment(this.getView().getId(), "zhmmaim.fragment." + sFragmentName,this);
            return this._formFragments[sFragmentName] = oFormFragment;
          },

          _showFormFragment:function(sFragmentName){
            var oPage = this.getView().byId("oPvInboxDetail");

            //oPage.removeAllContent();
            oPage.insertContent(this._getFormFragment(sFragmentName));
          },

          /*Comment*/
          handleLiveChange:function(oEvent){
            var sValue = oEvent.getParameter("value");
            sap.ui.getCore().byId("getValue").setText(sValue);
          },

          /*Function(onNavBack)-To go back to Dashboard*/
          onNavBack : function(oEvent) {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("_dashboard");
          },

          /*ABP Planning Detail View Cancel Event*/
          onCancelDialog:function(oEvent){
            sap.ui.getCore().byId("oABPCreateDialog").close();
            sap.ui.getCore().byId("oABPCreateDialog").destroy();
          },

          /*Need to Cooperation ? : Need to Review? Option*/
          onSwitchCP: function(oEvent){
            var oSwitchTF = sap.ui.getCore().byId("SwitchCP").getState();
            //console.log(oSwitchTF);
            if(oSwitchTF === true){
              sap.ui.getCore().byId("Reject").setVisible(false);
              sap.ui.getCore().byId("Consider").setVisible(false);
              sap.ui.getCore().byId("oRVSearch").setEnabled(true);
            }else{
              sap.ui.getCore().byId("Reject").setVisible(true);
              sap.ui.getCore().byId("Consider").setVisible(false);
              sap.ui.getCore().byId("oRVSearch").setEnabled(false);
            }


            var oDetailId = oEvent.getSource().getParent().getParent().getId();
            var oSwitchCP = sap.ui.getCore().byId("SwitchCP").getState(),
              oRVSearch = sap.ui.getCore().byId("oRVSearch").getVisible();

          },

          /*Reviewer Search possible Entry*/
          onCallRVPossible: function(oEvent){
            var oValue = oEvent.getParameter("value");
            if(oValue.length>=3){
            //oData List
            var ENGLISH_NAME = oEvent.getParameter("value");
            var oModel = new sap.ui.model.odata.ODataModel(
                sServiceUrl,true);
            var oJsonModel = new sap.ui.model.json.JSONModel();

            oModel.read("AutowayTMInfo?",null,["$filter= ENGLISH_NAME eq '"+ENGLISH_NAME+"*'"],false,
                function(oData,response){
              oJsonModel.setData(oData);
            });

            //console.log(oJsonModel);
            sap.ui.getCore().byId("oRVSearch").setModel(oJsonModel);
            }
          },

          InboxhandleSearch: function(oEvent){
            var sQuery = oEvent.getParameter("query");
            //console.log(sQuery);
            this._oGlobalFilter = null;

            if(sQuery){
              this._oGlobalFilter = new sap.ui.model.Filter([
                                                new sap.ui.model.Filter("BGTDOC",sap.ui.model.FilterOperator.Contains,sQuery),
                                                new sap.ui.model.Filter("BTSUBJ",sap.ui.model.FilterOperator.Contains,sQuery),
                                                new sap.ui.model.Filter("CREATOR",sap.ui.model.FilterOperator.Contains,sQuery),
                                                new sap.ui.model.Filter("DATE",sap.ui.model.FilterOperator.Contains,sQuery),
                                                new sap.ui.model.Filter("DOC_TYPE",sap.ui.model.FilterOperator.Contains,sQuery),
                                                new sap.ui.model.Filter("TITLE",sap.ui.model.FilterOperator.Contains,sQuery),
                                                new sap.ui.model.Filter("PERNR",sap.ui.model.FilterOperator.Contains,sQuery),
                                                new sap.ui.model.Filter("USER_NAME",sap.ui.model.FilterOperator.Contains,sQuery),
                                                ],false)
            }
            this._filter();
          },

          _filter: function(){
            var oFilter = null;
            if(this._oGlobalFilter){
              oFilter = this._oGlobalFilter;
            }

            this.getView().byId("oPvInboxList").getBinding("items").filter(oFilter,"Application");
          },
        });