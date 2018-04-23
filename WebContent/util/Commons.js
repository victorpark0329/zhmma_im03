jQuery.sap.declare("zhmmaim.util.Commons");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageStrip");
jQuery.sap.require("zhmmaim.util.Commons");
jQuery.sap.require("zhmmaim.util.Formatter");
jQuery.sap.require("zhmmaim.util.APP_CONTAINS");

zhmmaim.util.Commons = {
	inputId: '',
	/*
	 *
	 * Table Tab Key Navigation
	 *
	 * */
	/*Table Navigation on Standard Screen*/
	tableNavigation: function(val, oJsonModel) {
		//Table Tab Key Navigation(jQuery)
		val.addEventDelegate({
			onAfterRendering: function() {
				var oTableID = val.getId();
				$('#' + oTableID).click(function() {
					//Get the Text Field that is selected in table
					jQuery.sap.delayedCall(100, null, function() {
						var oBody = $('#' + oTableID).find('tbody');
						//Find the Text field that is focused
						var oField = oBody.find('.sapUiTfFoc')[0];
						if (oField) {
							var oFieldId = oField.id;
							//Store the Text Field control which is focused
							oJsonModel.setProperty("/FieldID", oFieldId);
						}

					});
				});
				$('#' + oTableID).on('keyup', function(e) {
					//On TAB Press
					if (e.which == 9) {
						var oFieldID = oJsonModel.getProperty("/FieldID");
						var oSelectedField = sap.ui.getCore().byId(oFieldID);
						var oRow = oSelectedField.getParent();
						var oTable = oRow.getParent();
						var oCells = oRow.getCells();
						var oSelectedIndex;
						//Find the text field that is focused
						for (var i = 0; i < oCells.length; i++) {
							var oID = oCells[i].getId();
							if (oID == oFieldID) {
								oSelectedIndex = i;
							}
						}

						var oCellsLength = oCells.length - 1;
						if (oCellsLength === oSelectedIndex) {
							var oRows = oTable.getRows();
							var oSelectedRow;
							for (var i = 0; i < oRows.length; i++) {
								var oID = oRows[i].getId();
								if (oID == oRow.getId()) {
									oSelectedRow = i;
								}
							}
							var oRowLength = oTable.getRows().length - 1;
							if (oSelectedRow === oRowLength) {
								//If It is last Row of table, scroll Next Logic
								oTable._scrollNext();
								jQuery.sap.delayedCall(100, null, function() {
									var oTargetCell = oRows[oSelectedRow].getCells()[0];
									//Get the next row first cell
									oJsonModel.setProperty("/FieldID", oTargetCell.getId());
									//Get Focus of Next Text Field
									var oFocusInfo = oTargetCell.getFocusInfo();
									//Apply Focus of Next Text Field
									oTargetCell.applyFocusInfo(oFocusInfo);
								});
							} else {
								//If it is last Cell of the Row
								var oTargetCell = oRows[oSelectedRow + 1].getCells()[0];
								oJsonModel.setProperty("/FieldID", oTargetCell.getId());
								var oFocusInfo = oTargetCell.getFocusInfo();
								oTargetCell.applyFocusInfo(oFocusInfo);
							}
						} else {
							var oTargetCell = oRow.getCells()[oSelectedIndex + 1];
							oJsonModel.setProperty("/FieldID", oTargetCell.getId());
							var oFocusInfo = oTargetCell.getFocusInfo();
							oTargetCell.applyFocusInfo(oFocusInfo);
						}
					}
				});
			}
		}, val);
	},

	/*Table Navigation on Dialog*/
	tableNavigationDialog: function(val, oJsonModel) {
		//Table Tab Key Navigation(jQuery)
		var oTableID = val.getId();
		$('#' + oTableID).click(function() {
			//Get the Text Field that is selected in table
			jQuery.sap.delayedCall(100, null, function() {
				var oBody = $('#' + oTableID).find('tbody');
				//Find the Text field that is focused
				var oField = oBody.find('.sapUiTfFoc')[0];
				if (oField) {
					var oFieldId = oField.id;
					//Store the Text Field control which is focused
					oJsonModel.setProperty("/FieldID", oFieldId);
				}

			});
		});
		$('#' + oTableID).on('keyup', function(e) {
			//On TAB Press
			if (e.which == 9) {
				var oFieldID = oJsonModel.getProperty("/FieldID");
				var oSelectedField = sap.ui.getCore().byId(oFieldID);
				var oRow = oSelectedField.getParent();
				var oTable = oRow.getParent();
				var oCells = oRow.getCells();
				var oSelectedIndex;
				//Find the text field that is focused
				for (var i = 0; i < oCells.length; i++) {
					var oID = oCells[i].getId();
					if (oID == oFieldID) {
						oSelectedIndex = i;
					}
				}

				var oCellsLength = oCells.length - 1;
				if (oCellsLength === oSelectedIndex) {
					var oRows = oTable.getRows();
					var oSelectedRow;
					for (var i = 0; i < oRows.length; i++) {
						var oID = oRows[i].getId();
						if (oID == oRow.getId()) {
							oSelectedRow = i;
						}
					}
					var oRowLength = oTable.getRows().length - 1;
					if (oSelectedRow === oRowLength) {
						//If It is last Row of table, scroll Next Logic
						oTable._scrollNext();
						jQuery.sap.delayedCall(100, null, function() {
							var oTargetCell = oRows[oSelectedRow].getCells()[0];
							//Get the next row first cell
							oJsonModel.setProperty("/FieldID", oTargetCell.getId());
							//Get Focus of Next Text Field
							var oFocusInfo = oTargetCell.getFocusInfo();
							//Apply Focus of Next Text Field
							oTargetCell.applyFocusInfo(oFocusInfo);
						});
					} else {
						//If it is last Cell of the Row
						var oTargetCell = oRows[oSelectedRow + 1].getCells()[0];
						oJsonModel.setProperty("/FieldID", oTargetCell.getId());
						var oFocusInfo = oTargetCell.getFocusInfo();
						oTargetCell.applyFocusInfo(oFocusInfo);
					}
				} else {
					var oTargetCell = oRow.getCells()[oSelectedIndex + 1];
					oJsonModel.setProperty("/FieldID", oTargetCell.getId());
					var oFocusInfo = oTargetCell.getFocusInfo();
					oTargetCell.applyFocusInfo(oFocusInfo);
				}
			}
		});
	},
	/*
	 *
	 * Validation
	 *
	 *
	 * */
	/*DatePicker Validation - Not use yet( Need Submit Validation Function also )*/
	/*dateValidation:function(oEvent){
	  if(!oEvent.getParameter("valid")){ // Invalid Value
	    oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
	  }else{ // Valid Value
	    oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
	  }
	},*/
	/*PR Creation Check Amount*/
	onPRCheckAmount: function(val1, val2, view, cells) {
		var nTOTA = val1,
			C_Balance = val2;
		if (parseFloat(nTOTA) > parseFloat(C_Balance)) {
			view.setValue("");
			cells[5].setValue("");

			// sap.m.MessageBox.alert("Budget Balance is " + C_Balance + " , Try Again.", {
			//     title: "Warning",
			//     onClose: null  ,
			//     styleClass: "sapThemeNegativeText" ,
			//     initialFocus: null,
			//     textDirection: sap.ui.core.TextDirection.Inherit
			//     });
			sap.m.MessageToast.show("Budget Balance is " + C_Balance + " , Try Again.");

		} else {}
	},

	/*IO Creation Check Amount*/
	onCheckAmount: function(oEvent) {
		zhmmaim.util.Commons.onlyInputNumber(oEvent);

		var oContextUSER4 = this.getView().byId("USER4").getValue(),
			C_Balance = this.getView().byId("C_Balance").getText(),
			RP_oContextUSER4 = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextUSER4),
			F_C_Balance = zhmmaim.util.Formatter.CurrencyFormatter(C_Balance),
			ErrorState = sap.ui.core.ValueState.Error,
			SuccessState = sap.ui.core.ValueState.Success;

		if (parseFloat(RP_oContextUSER4) > parseFloat(C_Balance)) {
			//Message
			this.getView().byId("USER4").setValueState(ErrorState);
			this.getView().byId("USER4").setValue("");

			// sap.m.MessageBox.alert("Budget Balance is " + F_C_Balance + " , Try Again.", {
			//     title: "Warning",
			//     onClose: null  ,
			//     styleClass: "sapThemeNegativeText" ,
			//     initialFocus: null,
			//     textDirection: sap.ui.core.TextDirection.Inherit
			//     });
			sap.m.MessageToast.show("Budget Balance is " + F_C_Balance + " , Try Again.");
			return false;
		} else {
			this.getView().byId("USER4").setValueState(SuccessState);
			this.getView().byId("USER4").setValue(oContextUSER4);
		}

		/*Fire Approval& Cooperation Function - USER4 Field*/
		this.getView().byId("USER4").$().find('INPUT').keypress(function(oEvent) {
			//reset approval and cooperation line
			if (this.getView().byId("oIOCreateWF").getModel()) {
				this.getView().byId("oIOCreateWF").getModel().setData("");
			}
			if (this.getView().byId("oIOCreateCP").getModel()) {
				this.getView().byId("oIOCreateCP").getModel().setData("");
			}
		}.bind(this));
	},

	/*Input Currency Validation - No Special Character, Auto Currency Formatter*/
	onlyInputNumber: function(oEvent) {
		if (oEvent.getParameter("value")) {
			var val = oEvent.getParameter("value");
		} else if (oEvent.getParameter("liveValue")) {
			var val = oEvent.getParameter("liveValue");
		}
		var val = val.replace(/[^\d\.]+/g, '');

		var floatValue = zhmmaim.util.Formatter.CurrencyFormatter(val);
		oEvent.getSource().setValue(floatValue);
	},

	/*Input Currency Validation - No Special Character, Auto Currency Formatter*/
	onlyInputNumber2: function(value) {
		var value = value.replace(/[^\d\.]+/g, '');

		var floatValue = zhmmaim.util.Formatter.CurrencyFormatter(value);
		return floatValue;
	},

	/*TextArea Auto Expand*/
	oAutoExpand: function(oEvent) {
		var text = oEvent.getSource(),
			lines = text.getValue().split("\n");

		if (lines.length >= 2) {
			text.setRows(lines.length);
		}
	},

	onQuote: function(oEvent) {
		var oContext = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oEvent.getParameter("liveValue"));

		oContext = zhmmaim.util.Formatter.CurrencyFormatter(oContext);
		/*TextField Number Validation - MENGE*/
		oEvent.getSource().setValue(oContext);
	},

	/*Check Required Field - Standard View*/
	oRequiredField: function(oEvent) {
		var oElement = oEvent.getSource().getParent().getParent().getParent().sId.split('--')[0];
		var error = true;
		/*Required Field Data Validation -INPUT Field*/
		jQuery('input[aria-required=true]').each(function() {
			var sId = this.id.split('-inner')[0],
				oInput = sap.ui.getCore().byId(sId),
				ErrorState = sap.ui.core.ValueState.Error,
				SuccessState = sap.ui.core.ValueState.Success;
			var val = oInput.getValue();
			var sElementId = sId.split('--')[0];
			if (oElement === sElementId) {
				if (!val) {
					oInput.setValueState(ErrorState);
					error = false;
				} else {
					oInput.setValueState(SuccessState);
				}
			}
		});
		return error;
	},

	/*Check Required Field - WorkFlow View*/
	oRequiredFieldWF: function(oEvent) {

		//console.log(oEvent.getSource())
		var oElement = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().sId.split('--')[0];
		var error = true;
		/*Required Field Data Validation -INPUT Field*/
		jQuery('input[aria-required=true]').each(function() {
			var sId = this.id.split('-inner')[0],
				oInput = sap.ui.getCore().byId(sId),
				ErrorState = sap.ui.core.ValueState.Error,
				SuccessState = sap.ui.core.ValueState.Success;
			var val = oInput.getValue();
			var sElementId = sId.split('--')[0];

			if (oElement === sElementId) {
				if (!val) {
					oInput.setValueState(ErrorState);
					error = false;
				} else {
					oInput.setValueState(SuccessState);
				}
			}
		});
		return error;
	},

	/*Check Required Field - ABP Dialog*/
	oRequiredFieldDialog: function(oEvent) {
		//console.log(oEvent.getSource())
		var error = true;
		/*Required Field Data Validation -INPUT Field*/
		jQuery('input[aria-required=true]').each(function() {
			var sId = this.id.split('-inner')[0],
				oInput = sap.ui.getCore().byId(sId),
				ErrorState = sap.ui.core.ValueState.Error,
				SuccessState = sap.ui.core.ValueState.Success;
			var val = oInput.getValue();
			var sElementId = sId.split('--')[0];
			if (sId === sElementId) {
				if (!val) {
					oInput.setValueState(ErrorState);
					error = false;
				} else {
					oInput.setValueState(SuccessState);
				}
			}
		});
		return error;
	},

	/*
	 *
	 * Default,Favorite,Possible Entry
	 *
	 * */

	handleSearch: function(oEvent) {
		//console.log(oEvent.getSource().getParent())
		//add filter for search
		var sValue = oEvent.getParameter("value");
		//console.log(sValue)
		var oFilter = new sap.ui.model.Filter([ //Standard
			new sap.ui.model.Filter("INPUT", sap.ui.model.FilterOperator.Contains, sValue), //Standard(Id)
			new sap.ui.model.Filter("TEXT", sap.ui.model.FilterOperator.Contains, sValue), //Standard(Name)
			new sap.ui.model.Filter("LIFNR", sap.ui.model.FilterOperator.Contains, sValue), //Creation PR(Vendor Code)
			new sap.ui.model.Filter("NAME1", sap.ui.model.FilterOperator.Contains, sValue), //Creation PR(Vendor Name)
		], false);

		oEvent.getSource().getBinding("items").filter([oFilter]);
	},

	/*Show the Description about Code*/
	onDescription: function(oEvent) {
		inputId = oEvent.getSource().sId;
		//console.log(oEvent.getSource())
		var EventId = inputId.split('--')[1],
			EventIdDes = EventId + "D";

		if (this.getView().byId(EventId)) {
			var INPUT = this.getView().byId(EventId).getValue();
			INPUT = INPUT.toUpperCase();
			this.getView().byId(EventId).setValue(INPUT);
			var oDescriptrionModel = this.getView().byId(EventId).getModel(),
				oDescriptionData = oDescriptrionModel.getProperty("/results/"),
				oDescriptionDataLength = oDescriptionData.length;

			for (var i = 0; i < oDescriptionDataLength; i++) {
				if (oDescriptionData[i].INPUT === INPUT) {
					this.getView().byId(EventIdDes).setValue(oDescriptionData[i].TEXT);
					break;
				} else {
					this.getView().byId(EventIdDes).setValue("");
				}
			}
		} else {
			var INPUT = sap.ui.getCore().byId(inputId).getValue();
			INPUT = INPUT.toUpperCase();
			this.getView().byId(inputId).setValue(INPUT);
			var oDescriptrionModel = sap.ui.getCore().byId(inputId).getModel(),
				oDescriptionData = oDescriptrionModel.getProperty("/results/"),
				oDescriptionDataLength = oDescriptionData.length;

			for (var i = 0; i < oDescriptionDataLength; i++) {
				if (oDescriptionData[i].INPUT === INPUT) {
					sap.ui.getCore().byId(inputId + "D").setValue(oDescriptionData[i].TEXT);
					break;
				} else {
					sap.ui.getCore().byId(inputId + "D").setValue("");
				}
			}
		}
	},

	/*Possible Entry Test*/
	onCallPossible: function(oEvent) {
		inputId = oEvent.getSource().sId;
		var EventId = inputId.split('--')[1];
		//oData List
		var oModel = new sap.ui.model.odata.ODataModel(
			sServiceUrl_Code, true);
		var oJsonModel = new sap.ui.model.json.JSONModel();

		if (this.getView().byId(EventId)) {
			oModel.read("IMCodeCommon?", null, ["$filter=FIELD_NAME eq ('" + EventId + "')"], false,
				function(oData, response) {
					oJsonModel.setData(oData);
				});

			this.getView().byId(EventId).setModel(oJsonModel);
		} else {
			oModel.read("IMCodeCommon?", null, ["$filter=FIELD_NAME eq ('" + inputId + "')"], false,
				function(oData, response) {
					oJsonModel.setData(oData);
				});

			sap.ui.getCore().byId(inputId).setModel(oJsonModel);
		}
	},

	/*Show all Entry List*/
	showAllList: function(oEvent) {
		inputId = oEvent.getSource().sId;
		var AggregationName = oEvent.getSource().sParentAggregationName;
		var EventId = inputId.split('--')[1];
		var oIOPossibleEntry = new sap.ui.xmlfragment("zhmmaim.fragment.PossibleEntryDialog", this);
		oIOPossibleEntry.open();

		//oData List
		var oModel = new sap.ui.model.odata.ODataModel(
			sServiceUrl_Code, true);
		var oJsonModel = new sap.ui.model.json.JSONModel();
		//console.log(AggregationName)
		if (AggregationName === "fields") { //Standard Field
			if (this.getView().byId(EventId)) {
				/*if(EventId == "ZPROJ"){
				  if(this.getView().byId("GJAHR").getValue()){
				    this.getView().byId("GJAHR").setValueState(sap.ui.core.ValueState.Success);
				    oModel.read("IMCodeCommon?",null,["$filter=FIELD_NAME eq ('"+EventId+"')"],false,
				        function(oData,response){
				      oJsonModel.setData(oData);
				    });
				  }else{
				    this.getView().byId("GJAHR").setValueState(sap.ui.core.ValueState.Error);
				    sap.m.MessageBox.alert("Project plan year is empty.", {
				            title: "Warning",
				            onClose: null  ,
				            styleClass: "sapThemeNegativeText" ,
				            initialFocus: null,
				            textDirection: sap.ui.core.TextDirection.Inherit
				            });

				  }
				}else{
				  oModel.read("IMCodeCommon?",null,["$filter=FIELD_NAME eq ('"+EventId+"')"],false,
				      function(oData,response){
				    oJsonModel.setData(oData);
				  });
				}*/
				oModel.read("IMCodeCommon?", null, ["$filter=FIELD_NAME eq ('" + EventId + "')"], false,
					function(oData, response) {
						oJsonModel.setData(oData);
					});
			} else {
				oModel.read("IMCodeCommon?", null, ["$filter=FIELD_NAME eq ('" + inputId + "')"], false,
					function(oData, response) {
						oJsonModel.setData(oData);
					});
			}
		} else if (AggregationName === "cells") { //Standard Cell
			var CellId = EventId.split('-')[0];
			oModel.read("IMCodeCommon?", null, ["$filter=FIELD_NAME eq ('" + CellId + "')"], false,
				function(oData, response) {
					oJsonModel.setData(oData);
				});
		}
		oIOPossibleEntry.setModel(oJsonModel);
	},

	handleClose: function(oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem"),
			oSelectedItemTitle = oSelectedItem.getTitle(),
			oSelectedItemDescription = oSelectedItem.getDescription(),
			handleID = inputId.split('--')[1];
		if (oSelectedItem) {
			var productDInput = this.getView().byId(this.inputId + "D");
			if (this.getView().byId(this.inputId)) {
				var productInput = this.getView().byId(this.inputId);
				productInput.setValue(oSelectedItemTitle);
				productDInput.setValue(oSelectedItemDescription)
			} else {
				//var CellId = inputId.split('--')[1].split('-')[0];
				if (inputId.indexOf('LIFNR') >= 0) { //Creation PR (vender Code Input)
					var productInput = sap.ui.getCore().byId(inputId);
					productInput.setValue(oSelectedItemTitle);

					//Binding IMVendor JsonModel
					var oModel = new sap.ui.model.odata.ODataModel(
						sServiceUrl_Code, true);
					var oJsonModel = new sap.ui.model.json.JSONModel();
					oModel.read("IMVendor(LIFNR='" + oSelectedItemTitle + "')", null, null, false,
						function(oData, response) {
							oJsonModel.setData(oData);
						});

					this.getView().byId("PRSupplierDisplay").setModel(oJsonModel);

					var NAME1 = this.getView().byId("PRSupplierDisplay").getModel().getData().NAME1,
						TEL_NUMBER = this.getView().byId("PRSupplierDisplay").getModel().getData().TEL_NUMBER,
						ZSABE = this.getView().byId("PRSupplierDisplay").getModel().getData().ZSABE;

					var SubstringId = inputId.substring(0, 12) + "NAME1-col2" + inputId.substring(22, inputId.length);
					sap.ui.getCore().byId(SubstringId).setValue(NAME1);
					//col2-rowi ->NAME
					SubstringId = inputId.substring(0, 12) + "ZSABE-col4" + inputId.substring(22, inputId.length);
					sap.ui.getCore().byId(SubstringId).setValue(ZSABE);
					//col4-rowi ->ZSABE
					SubstringId = inputId.substring(0, 12) + "TEL_NUMBER-col5" + inputId.substring(22, inputId.length);
					sap.ui.getCore().byId(SubstringId).setValue(TEL_NUMBER);
					//col5-rowi ->TEL_NUMBER
				} else {
					var productDInput = sap.ui.getCore().byId(inputId + "D");
					var productInput = sap.ui.getCore().byId(inputId);
					productInput.setValue(oSelectedItemTitle);
					productDInput.setValue(oSelectedItemDescription)
				}
			}
		}
		oEvent.getSource().getBinding("items").filter([]);

		if (handleID === 'POSID') {
			this.POSNRDefaultValue();
			//console.log(oEvent)
		} else if (handleID === "REASON") {
			//var productDInput = this.getView().byId(this.inputId+"D");
			productDInput.setValue(oSelectedItemDescription);

			/*Sender Table Refresh*/
			/*var oSenderData = this.getView().byId("oSender").getModel().getData(),
			  oSenderDataLength = this.getView().byId("oSender").getModel().getProperty('/').length;
			for(i=0;i<oSenderDataLength;i++){
			  oSenderData[i].S_POSID = "";
			  oSenderData[i].S_POST1 = "";
			  oSenderData[i].S_B_WLGES = "";
			  oSenderData[i].S_C_WLGES = "";
			  oSenderData[i].S_E_WLGES = "";
			  oSenderData[i].S_VKOSTL = "";
			}
			this.getView().byId("oSender").getModel().refresh();

			//Receiver Table Refresh
			var oReceiverData = this.getView().byId("oReceiver").getModel().getData(),
			  oReceiverDataLength = this.getView().byId("oReceiver").getModel().getProperty('/').length;
			for(i=0;i<oReceiverDataLength;i++){
			  oReceiverData[i].R_POSID = "";
			  oReceiverData[i].R_POST1 = "";
			  oReceiverData[i].R_B_WLGES = "";
			  oReceiverData[i].R_C_WLGES = "";
			  oReceiverData[i].R_E_WLGES = "";
			  oReceiverData[i].R_VKOSTL = "";
			}
			this.getView().byId("oReceiver").getModel().refresh();*/
		}
	},

	IODefaultValue: function(oEvent) {
		var oContextAUFNR = oEvent.getSource().getValue();
		var oModel = new sap.ui.model.odata.ODataModel(
			sServiceUrl, true);
		var oJsonModel = new sap.ui.model.json.JSONModel();
		var oAttachModel = new sap.ui.model.json.JSONModel();

		oModel.read("IMIODisplay(AUFNR='" + oContextAUFNR + "',BGTDOC='')/?", null, ["$expand=IMIOROINavi,ZIM_ATTACH_FILE2Set"], false,
			function(oData, response) {
				oJsonModel.setData(oData);
				oAttachModel.setData(oData);
			});

		if (oJsonModel.getProperty("/TYPE") === "E") {
			var Message = oJsonModel.getProperty("/MESSAGE");
			this.getView().byId("AUFNRD").setValue(Message);
			this.getView().byId("AUFNR").setValueState(sap.ui.core.ValueState.Error);
		} else {
			this.getView().byId("AUFNRD").setValue("");
			this.getView().byId("AUFNR").setValueState(sap.ui.core.ValueState.Success);
		}

		if (this.getView().byId("CompleteIOCommons")) { //IO Complete
			this.getView().byId("CompleteIOCommons").setModel(oJsonModel);

			//Show Payback Item(IO Complete)
			//console.log(this.getView().byId("CompleteIOCommons").getModel());
			var oPaybackPath = "/IMIOROINavi/results/",
				oContextPayback = this.getView().byId("CompleteIOCommons").getModel().getProperty(oPaybackPath),
				oPaybackLength = oContextPayback.length,
				oContextUSER4 = this.getView().byId("CompleteIOCommons").getModel().getProperty("/USER4"); //Est.Cost 媛

			//console.log(oContextPayback.length)
			if (oContextPayback.length > 0) {
				var oRevenueCells = this.getView().byId("oIOPayTB").getRows()[0].getCells();

				for (var i = 0; i < oPaybackLength; i++) {
					this.getView().byId("GJAHR" + [i + 1]).setText(oContextPayback[i].GJAHR);
					oRevenueCells[i].setValue(oContextPayback[i].RTNAMT);
				};
			} else {
				//Default Payback Period Year (this year~ this year+10)
				var GJAHR = new Date().getFullYear();
				for (var i = 0; i < 10; i++) {
					this.getView().byId("GJAHR" + [i + 1]).setText(parseInt(GJAHR) + parseInt([i]));
				}
			}

			//Default Even Revenue & ROI Calculate value(IO Complete)
			var oSum = 0,
				oAverage = 0,
				oROI = 0,
				oBlank = 0;

			for (i = 0; i < oPaybackLength; i++) {
				if (parseInt(oContextPayback[i].RTNAMT)) {
					oSum += parseInt(oContextPayback[i].RTNAMT);
				} else {
					oBlank++;
				}
			}
			var oGJAHRCount = (oPaybackLength) - oBlank;

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
			this.getView().byId("ROI").setValue(oROI);

			//Table Navigation Tab Key
			zhmmaim.util.Commons.tableNavigation(this.getView().byId("oIOPayTB"), oJsonModel);
		} else { // !IO Complete , PR Creation
			this.getView().byId("WERKS").setValue(oJsonModel.getProperty("/WERKS"));
			this.getView().byId("WERKSD").setValue(oJsonModel.getProperty("/WERKSD"));

			this.getView().byId("KTEXT").setValue(oJsonModel.getProperty("/KTEXT"));
			this.getView().byId("PURPO").setValue(oJsonModel.getProperty("/PURPO"));

			//Attachment SetModel
			var oAttachLength = oAttachModel.getProperty('/ZIM_ATTACH_FILE2Set/results/').length;
			if (oAttachLength > 0) {
				this.getView().byId("oAlreadyUpload").setVisible(true);
				this.getView().byId("oAlreadyUpload").setNumberOfAttachmentsText("IO Attachments(" + oAttachLength + ")");
				this.getView().byId("oAlreadyUpload").setModel(oAttachModel);
			} else {
				this.getView().byId("oAlreadyUpload").setVisible(false);
			}
		}
	},

	/*
	 *
	 * WorkFlow(Approval Line,Cooperation)
	 *
	 *
	 * */

	onSelectWorkFlow: function(oEvent) {
		oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
		window.oUserInfo = oJQueryStorage.get("UserInfo");

		/* IG Moon 9/29/2016 */
		if (sap.ui.getCore().byId("oWorkFlowDialog")) {
			sap.ui.getCore().byId("oWorkFlowDialog").destroy();
		}

		/*Doc Type Setting*/
		var DOC_TYPE = this.getView().sViewName.split("view.")[1];
		if (DOC_TYPE === "BudgetTransfer") {
			DOC_TYPE = "TR";
		} else if (DOC_TYPE === "CreatePR") {
			DOC_TYPE = "PR";
		} else if (DOC_TYPE === "IOCreateRelease") {
			DOC_TYPE = "IO";
		} else if (DOC_TYPE === "CompleteIO") {
			DOC_TYPE = "CL";
		} else if (DOC_TYPE === "BudgetPlanning") {
			DOC_TYPE = "AB";
		}
		if (this.getView().byId("oIOCreateWF").getModel()) {
			console.log(this.getView().byId("oIOCreateWF").getModel());
			console.log(this.getView().byId("oIOCreateWF").getModel().getData())
		}
		if (this.getView().byId("oIOCreateWF").getModel() && this.getView().byId("oIOCreateWF").getModel().getData().length) { //if WF already exists,
			//console.log(this.getView().byId("oIOCreateWF").getModel().length);
			var oIOWorkFlow = new sap.ui.xmlfragment("zhmmaim.fragment.WorkFlow", this);
			// IG Moon 9/27/2016
			// oIOWorkFlow.open();

			//console.log(this.getView().byId("oIOCreateWF").getModel().getProperty('/0'));
			sap.ui.getCore().byId("oWorkFlowDialog").setModel(this.getView().byId("oIOCreateWF").getModel());
			sap.ui.getCore().byId("oList").bindAggregation('items',
				'/0',
				new sap.m.ColumnListItem({
					cells: [
						new sap.m.Text({
							text: "{ENGLISH_NAME}"
						}),
						new sap.m.Text({
							text: "{DUTY_NAME}"
						}),
						new sap.m.Text({
							text: "{DEPT_NAME}"
						}),
						new sap.m.Text({
							text: "{TELEPHONE}"
						})
					]
				})
			);
		} else if (!this.getView().byId("oIOCreateWF").getModel() || !this.getView().byId("oIOCreateWF").getModel().length) { //if WF not exists,
			if (DOC_TYPE === "IO") {
				var error = zhmmaim.util.Commons.oRequiredFieldWF(oEvent);
				if (error === false) {
					// sap.m.MessageBox.alert("Required Field is empty", {
					//     title: "Warning",
					//     onClose: null  ,
					//     styleClass: "sapThemeNegativeText" ,
					//     initialFocus: null,
					//     textDirection: sap.ui.core.TextDirection.Inherit
					//     });
					sap.m.MessageToast.show("Required Field is empty");
					return false;
				}
				//console.log(error);
				if (error === true) {
					var oIOWorkFlow = new sap.ui.xmlfragment("zhmmaim.fragment.WorkFlow", this);
					// IG Moon 9/27/2016
					// oIOWorkFlow.open();

					var oContextUSER4 = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("USER4").getValue()),
						oContextANLKL = this.getView().byId("ANLKL").getValue(),
						oContextZPROJ = (this.getView().byId("POSID").getValue()).substring(0, 1);

					/*Already Approved Case*/
					var oContextAPPROVED = this.getView().byId("APPROVED").getChecked();
					if (oContextAPPROVED === true) {
						APPROVED = "Y";
					} else {
						APPROVED = "";
					}

					//oData List
					var oModel = new sap.ui.model.odata.ODataModel(
						sServiceUrl, true);
					var oJsonModel = new sap.ui.model.json.JSONModel();

					oModel.read("AutowayAPPR?", null, ["$filter=USER_ID eq '" + oUserInfo.PERNR + "' and DOC_TYPE eq '" + DOC_TYPE + "'" +
							"and KOSTL eq '" + oUserInfo.KOSTL + "' and USER4 eq '" + oContextUSER4 + "' and ANLKL eq '" + oContextANLKL + "' and ZPROJ eq '" +
							oContextZPROJ + "' and APPROVED eq '" + APPROVED + "'"
						], false,
						function(oData, response) {
							oJsonModel.setData(oData);
						});
				}
			} else if (DOC_TYPE === "TR") {
				var error = zhmmaim.util.Commons.oRequiredFieldWF(oEvent);
				if (error === false) {
					// sap.m.MessageBox.alert("Required Field is empty", {
					//     title: "Warning",
					//     onClose: null  ,
					//     styleClass: "sapThemeNegativeText" ,
					//     initialFocus: null,
					//     textDirection: sap.ui.core.TextDirection.Inherit
					//     });
					sap.m.MessageToast.show("Required Field is empty");
					return false;
				}
				if (this.getView().byId("IOTypeSelect").getSelectedKey() === "4") {
					var oSenderLength = this.getView().byId("oSender").getModel().getData().length,
						oReceiverLength = this.getView().byId("oReceiver").getModel().getData().length,
						oSenderSum = 0,
						oReceiverSum = 0;
					for (i = 0; i < oSenderLength; i++) {
						oContextTransfer = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("oSender").getModel().getProperty('/')[i].S_T_WLGES);
						if (oContextTransfer === "") {
							oContextTransfer = 0;
						}
						oSenderSum += parseFloat(zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextTransfer));
					}
					for (i = 0; i < oReceiverLength; i++) {
						oContextTransfer = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("oReceiver").getModel().getProperty('/')[i].R_T_WLGES);
						if (oContextTransfer === "") {
							oContextTransfer = 0;
						}
						oReceiverSum += parseFloat(zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextTransfer));
					}
					/*if(oSenderSum !== oReceiverSum){
					   sap.m.MessageBox.alert("Transfer Amount is not correct!", {
					        title: "Warning",
					        onClose: null  ,
					        styleClass: "sapThemeNegativeText" ,
					        initialFocus: null,
					        textDirection: sap.ui.core.TextDirection.Inherit
					        });
					  error = false;
					}*/
				}
				if (error === true) {
					var oIOWorkFlow = new sap.ui.xmlfragment("zhmmaim.fragment.WorkFlow", this);
					// IG Moon 9/27/2016
					// oIOWorkFlow.open();

					var oContextUSER4 = oSenderSum,
						oContextZPROJ = (this.getView().byId("oSender").getModel().getProperty('/')[0].S_POSID).substring(0, 1);

					//oData List
					var oModel = new sap.ui.model.odata.ODataModel(
						sServiceUrl, true);
					var oJsonModel = new sap.ui.model.json.JSONModel();

					oModel.read("AutowayAPPR?", null, ["$filter=USER_ID eq '" + oUserInfo.PERNR + "' and DOC_TYPE eq '" + DOC_TYPE + "'" +
							"and KOSTL eq '" + oUserInfo.KOSTL + "' and USER4 eq '" + oContextUSER4 + "' and ANLKL eq 'BT' and ZPROJ eq '" + oContextZPROJ +
							"'"
						], false,
						function(oData, response) {
							oJsonModel.setData(oData);
						});
				}
			} else if (DOC_TYPE === "PR") {
				var oIOWorkFlow = new sap.ui.xmlfragment("zhmmaim.fragment.WorkFlow", this);
				// IG Moon 9/27/2016
				// oIOWorkFlow.open();
				//console.log(DOC_TYPE);
				//oData List
				var oModel = new sap.ui.model.odata.ODataModel(
					sServiceUrl, true);
				var oJsonModel = new sap.ui.model.json.JSONModel();

				oModel.read("AutowayAPPR?", null, ["$filter=USER_ID eq '" + oUserInfo.PERNR + "' and DOC_TYPE eq '" + DOC_TYPE + "'" +
						"and KOSTL eq '" + oUserInfo.KOSTL + "'"
					], false,
					function(oData, response) {
						oJsonModel.setData(oData);
					});
			} else if (DOC_TYPE === "CL" || DOC_TYPE === "AB") {
				var oIOWorkFlow = new sap.ui.xmlfragment("zhmmaim.fragment.WorkFlow", this);
				// IG Moon 9/27/2016
				// oIOWorkFlow.open();
				//oData List
				var oModel = new sap.ui.model.odata.ODataModel(
					sServiceUrl, true);
				var oJsonModel = new sap.ui.model.json.JSONModel();

				oModel.read("AutowayAPPR?", null, ["$filter=USER_ID eq '" + oUserInfo.PERNR + "' and DOC_TYPE eq '" + DOC_TYPE + "'"], false,
					function(oData, response) {
						oJsonModel.setData(oData);
					});
			}
			if (DOC_TYPE === "PR" && oJsonModel.getProperty("/results/0/DEPT_NAME") === "999") {
				//sap.m.MessageBox.alert("Error.Finance confirmation user couldn셳 create PR. ", {
				//    title: "Warning",
				//    onClose: null  ,
				//    styleClass: "sapThemeNegativeText" ,
				//    initialFocus: null,
				//    textDirection: sap.ui.core.TextDirection.Inherit
				//    });
				sap.m.MessageToast.show("Error.Finance confirmation user couldn셳 create PR. ");
				sap.ui.getCore().byId("oWorkFlowDialog").destroy();
				sap.ui.getCore().byId("oWorkFlowDialog").close();
			} else {
				sap.ui.getCore().byId("oWorkFlowDialog").setModel(oJsonModel);
			}
			//console.log(sap.ui.getCore().byId("oWorkFlowDialog").getModel());
		}
		/*onInit() for workflow.fragment.js file*/
		var oSortableList = sap.ui.getCore().byId("oList");

		// IG Moon 9/27/2016
		////////////////////////////////
		oIOWorkFlow.open();
		////////////////////////////////

		/*WorkFlow Drag & Drop*/
		oSortableList.onAfterRendering = function() {
			if (sap.m.Table.prototype.onAfterRendering) {
				sap.m.Table.prototype.onAfterRendering.apply(this);
			}

			$("#oList-tblBody").addClass('ui-sortable');
			$("#oList-tblBody").sortable({
				items: 'tr:not(:first)', //except requester
				start: function(event, ui) {
					ui.item.startPos = ui.item.index();
				},
				stop: function(event, ui) {
					if (sap.ui.getCore().byId("oList").getModel().getProperty("/results")) {
						var data = sap.ui.getCore().byId("oList").getModel().getProperty("/results");
						var oPos = data.splice(ui.item.startPos, 1)[0];
						data.splice(ui.item.index(), 0, oPos);
					} else if (sap.ui.getCore().byId("oList").getModel().getProperty("/0")) {
						var data = sap.ui.getCore().byId("oList").getModel().getProperty("/0");
						var oPos = data.splice(ui.item.startPos, 1)[0];
						data.splice(ui.item.index(), 0, oPos);
					}
				}.bind(this),
				connectWith: ".ui-sortable"
			}).disableSelection();
		};
	},

	/*Select Cooperation Event - show Cooperation fragment dialog*/
	onSelectCooperation: function(oEvent) {

		/* IG Moon 9/29/2016 */
		if (sap.ui.getCore().byId("oCooperationDialog")) {
			sap.ui.getCore().byId("oCooperationDialog").destroy();
		}

		if (sap.ui.getCore().byId("oIOCreateCP")) { //call from Detail View(Inbox)
			if (sap.ui.getCore().byId("oIOCreateCP").getModel()) { //if WF already exists
				var oIOWorkFlow = new sap.ui.xmlfragment("zhmmaim.fragment.Cooperation", this);
				oIOWorkFlow.open();

				//console.log(sap.ui.getCore().byId("oIOCreateCP").getModel().getProperty('/'));
				sap.ui.getCore().byId("oCooperationDialog").setModel(sap.ui.getCore().byId("oIOCreateCP").getModel());
			} else { //not exists
				//oData List
				var oJsonModel = new sap.ui.model.json.JSONModel([]);
				sap.ui.getCore().byId("oCooperationDialog").setModel(oJsonModel);
			}
		} else if (this.getView().byId("oIOCreateCP")) { // call from Create View
			if (this.getView().byId("oIOCreateCP").getModel() && this.getView().byId("oIOCreateCP").getModel().getData().length) {
				var oIOWorkFlow = new sap.ui.xmlfragment("zhmmaim.fragment.Cooperation", this);
				oIOWorkFlow.open();

				//console.log(this.getView().byId("oIOCreateCP").getModel().getProperty('/'));
				sap.ui.getCore().byId("oCooperationDialog").setModel(this.getView().byId("oIOCreateCP").getModel());
			} else if (!this.getView().byId("oIOCreateCP").getModel() || !this.getView().byId("oIOCreateCP").getModel().length) {
				/*Doc Type Setting*/
				var DOC_TYPE = this.getView().sViewName.split("view.")[1];
				if (DOC_TYPE === "BudgetTransfer") {
					DOC_TYPE = "TR";
				} else if (DOC_TYPE === "CreatePR") {
					DOC_TYPE = "PR";
				} else if (DOC_TYPE === "IOCreateRelease") {
					DOC_TYPE = "IO";
				} else if (DOC_TYPE === "CompleteIO") {
					DOC_TYPE = "CL";
				} else if (DOC_TYPE === "BudgetPlanning") {
					DOC_TYPE = "AB";
				}

				if (DOC_TYPE === "IO") {
					var error = zhmmaim.util.Commons.oRequiredFieldWF(oEvent);
					if (error === false) {
						// sap.m.MessageBox.alert("Required Field is empty", {
						//     title: "Warning",
						//     onClose: null  ,
						//     styleClass: "sapThemeNegativeText" ,
						//     initialFocus: null,
						//     textDirection: sap.ui.core.TextDirection.Inherit
						//     });
						sap.m.MessageToast.show("Required Field is empty");
						return false;
					}
					//console.log(error);
					if (error === true) {
						var oIOWorkFlow = new sap.ui.xmlfragment("zhmmaim.fragment.Cooperation", this);
						oIOWorkFlow.open();

						var oContextUSER4 = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("USER4").getValue()),
							oContextANLKL = this.getView().byId("ANLKL").getValue(),
							oContextZPROJ = (this.getView().byId("POSID").getValue()).substring(0, 1);
						//oData List
						var oModel = new sap.ui.model.odata.ODataModel(
							sServiceUrl, true);
						var oJsonModel = new sap.ui.model.json.JSONModel();

						oModel.read("AutowayTMInfo?", null, ["$filter=USER_ID eq '" + oUserInfo.PERNR + "' and DOC_TYPE eq '" + DOC_TYPE + "'" +
								"and KOSTL eq '" + oUserInfo.KOSTL + "' and USER4 eq '" + oContextUSER4 + "' and ANLKL eq '" + oContextANLKL +
								"' and ZPROJ eq '" + oContextZPROJ + "'"
							], false,
							function(oData, response) {
								oJsonModel.setData(oData);
							});
						if (oJsonModel.getProperty("/results").length !== 0) {
							sap.ui.getCore().byId("oCooperationDialog").setModel(oJsonModel);
							sap.ui.getCore().byId("oCPList").bindAggregation('items',
								'/results/',
								new sap.m.ColumnListItem({
									cells: [
										new sap.m.Text({
											text: "{ENGLISH_NAME}"
										}),
										new sap.m.Text({
											text: "{DUTY_NAME}"
										}),
										new sap.m.Text({
											text: "{DEPT_NAME}"
										}),
										new sap.m.Text({
											text: "{TELEPHONE}"
										})
									]
								})
							);
							//console.log(sap.ui.getCore().byId("oCooperationDialog").getModel())
						} else {
							var oJsonModel = new sap.ui.model.json.JSONModel([]);
							sap.ui.getCore().byId("oCooperationDialog").setModel(oJsonModel);
						}
					}
				} else if (DOC_TYPE === "TR") {
					var error = zhmmaim.util.Commons.oRequiredFieldWF(oEvent);
					if (error === false) {
						// sap.m.MessageBox.alert("Required Field is empty", {
						//     title: "Warning",
						//     onClose: null  ,
						//     styleClass: "sapThemeNegativeText" ,
						//     initialFocus: null,
						//     textDirection: sap.ui.core.TextDirection.Inherit
						//     });
						sap.m.MessageToast.show("Required Field is empty");
						return false;
					}
					if (this.getView().byId("IOTypeSelect").getSelectedKey() === "4") {
						var oSenderLength = this.getView().byId("oSender").getModel().getData().length,
							oReceiverLength = this.getView().byId("oReceiver").getModel().getData().length,
							oSenderSum = 0,
							oReceiverSum = 0;
						for (i = 0; i < oSenderLength; i++) {
							if (oContextTransfer === "") {
								oContextTransfer = 0;
							}

							oContextTransfer = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("oSender").getModel().getProperty('/')[i].S_T_WLGES);
							oSenderSum += parseFloat(oContextTransfer);
						}
						for (i = 0; i < oReceiverLength; i++) {
							if (oContextTransfer === "") {
								oContextTransfer = 0;
							}

							oContextTransfer = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(this.getView().byId("oReceiver").getModel().getProperty('/')[i]
								.R_T_WLGES);
							oReceiverSum += parseFloat(oContextTransfer);
						}
						//console.log("oSenderSum:"+oSenderSum);
						//console.log("oReceiverSum:"+oReceiverSum);

						/*if(oSenderSum !== oReceiverSum){
						   sap.m.MessageBox.alert("Transfer Amount is not correct!", {
						        title: "Warning",
						        onClose: null  ,
						        styleClass: "sapThemeNegativeText" ,
						        initialFocus: null,
						        textDirection: sap.ui.core.TextDirection.Inherit
						        });
						  error = false;
						}*/
					}
					//console.log(error);

					if (error === true) {
						var oIOWorkFlow = new sap.ui.xmlfragment("zhmmaim.fragment.Cooperation", this);
						oIOWorkFlow.open();

						var oContextUSER4 = oSenderSum,
							oContextZPROJ = (this.getView().byId("oSender").getModel().getProperty('/')[0].S_POSID).substring(0, 1);

						//oData List
						var oModel = new sap.ui.model.odata.ODataModel(
							sServiceUrl, true);
						var oJsonModel = new sap.ui.model.json.JSONModel();

						oModel.read("AutowayTMInfo?", null, ["$filter=USER_ID eq '" + oUserInfo.PERNR + "' and DOC_TYPE eq '" + DOC_TYPE + "'" +
								"and KOSTL eq '" + oUserInfo.KOSTL + "' and USER4 eq '" + oContextUSER4 + "' and ANLKL eq 'BT' and ZPROJ eq '" + oContextZPROJ +
								"'"
							], false,
							function(oData, response) {
								oJsonModel.setData(oData);
							});

						if (oJsonModel.getProperty("/results").length !== 0) {
							sap.ui.getCore().byId("oCooperationDialog").setModel(oJsonModel);
							sap.ui.getCore().byId("oCPList").bindAggregation('items',
								'/results/',
								new sap.m.ColumnListItem({
									cells: [
										new sap.m.Text({
											text: "{ENGLISH_NAME}"
										}),
										new sap.m.Text({
											text: "{DUTY_NAME}"
										}),
										new sap.m.Text({
											text: "{DEPT_NAME}"
										}),
										new sap.m.Text({
											text: "{TELEPHONE}"
										})
									]
								})
							);
						} else {
							var oJsonModel = new sap.ui.model.json.JSONModel([]);
							sap.ui.getCore().byId("oCooperationDialog").setModel(oJsonModel);
						}
					}
				} else if (DOC_TYPE === "PR") {
					var oIOWorkFlow = new sap.ui.xmlfragment("zhmmaim.fragment.Cooperation", this);
					oIOWorkFlow.open();
					//console.log(DOC_TYPE);
					//oData List
					var oModel = new sap.ui.model.odata.ODataModel(
						sServiceUrl, true);
					var oJsonModel = new sap.ui.model.json.JSONModel();

					oModel.read("AutowayTMInfo?", null, ["$filter=USER_ID eq '" + oUserInfo.PERNR + "' and DOC_TYPE eq '" + DOC_TYPE + "'" +
							"and KOSTL eq '" + oUserInfo.KOSTL + "'"
						], false,
						function(oData, response) {
							oJsonModel.setData(oData);
						});
					if (oJsonModel.getProperty("/results").length !== 0) {
						sap.ui.getCore().byId("oCooperationDialog").setModel(oJsonModel);
						sap.ui.getCore().byId("oCPList").bindAggregation('items',
							'/results/',
							new sap.m.ColumnListItem({
								cells: [
									new sap.m.Text({
										text: "{ENGLISH_NAME}"
									}),
									new sap.m.Text({
										text: "{DUTY_NAME}"
									}),
									new sap.m.Text({
										text: "{DEPT_NAME}"
									}),
									new sap.m.Text({
										text: "{TELEPHONE}"
									})
								]
							})
						);
					} else {
						var oJsonModel = new sap.ui.model.json.JSONModel([]);
						sap.ui.getCore().byId("oCooperationDialog").setModel(oJsonModel);
					}
				} else if (DOC_TYPE === "CL" || DOC_TYPE === "AB") {
					var oIOWorkFlow = new sap.ui.xmlfragment("zhmmaim.fragment.Cooperation", this);
					oIOWorkFlow.open();
					//oData List
					var oJsonModel = new sap.ui.model.json.JSONModel([]);
					sap.ui.getCore().byId("oCooperationDialog").setModel(oJsonModel);
				}
			}
		}
	},

	/*WorkFlow Search Odata */
	onCallWFPossible: function(oEvent) {
		var oValue = oEvent.getParameter("value");
		if (oValue.length >= 3) {
			//oData List
			var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl, true);
			var oJsonModel = new sap.ui.model.json.JSONModel();

			/*        oModel.read("AutowayAPPR?",null,["$filter=USER_ID eq '"+oUserInfo.PERNR+"' and DOC_TYPE eq '"+DOC_TYPE+"'"],false,
			            function(oData,response){
			          oJsonModel.setData(oData);
			        });*/

			oModel.read("AutowayTMInfo?", null, ["$filter= ENGLISH_NAME eq '" + oValue + "*'"], false,
				function(oData, response) {
					oJsonModel.setData(oData);
				});

			//console.log(oJsonModel);
			sap.ui.getCore().byId("oWFsearch").setModel(oJsonModel);
		}
	},

	onAddApprover: function(oEvent) {
		var oAddApproverModel = sap.ui.getCore().byId("oWFsearch").getModel(),
			oAddApprover = sap.ui.getCore().byId("oWFsearch").getValue(),
			oAddApproverLength = oAddApproverModel.getProperty('/results').length;

		/*WILL ADD validation check*/
		if (sap.ui.getCore().byId("oWorkFlowDialog").getModel().getProperty("/results")) {
			if (oAddApprover === sap.ui.getCore().byId("oWorkFlowDialog").getModel().getProperty("/results/0/ENGLISH_NAME")) {
				//sap.m.MessageBox.alert("This Person is initial REQUESTER. You cannot ADD.", {
				//    title: "Warning",
				//    onClose: null  ,
				//    styleClass: "sapThemeCriticalText" ,
				//    initialFocus: null,
				//    textDirection: sap.ui.core.TextDirection.Inherit
				//    });
				sap.m.MessageToast.show("This Person is initial REQUESTER. You cannot ADD.");
				return false;
			} else {
				for (var i = 0; i < oAddApproverLength; i++) {
					var oComApprover = oAddApproverModel.getProperty('/results/' + i).ENGLISH_NAME;
					if (oComApprover === oAddApprover) {
						var oNewApprover = oAddApproverModel.getProperty('/results/' + i),
							onewApproverItem = sap.ui.getCore().byId("oWorkFlowDialog").getModel().getProperty('/results'),
							oClone = $.extend({}, onewApproverItem[0]);
						//console.log(onewApproverItem)
						//console.log(onewApproverItem[0])
						for (var sKey in oClone) {
							if (oClone.hasOwnProperty(sKey)) {
								oClone[sKey] = oNewApprover[sKey];
							}
						}
						//console.log(oNewApprover)
						onewApproverItem.push(oClone);
						sap.ui.getCore().byId("oWorkFlowDialog").getModel().refresh();
						//console.log(onewApproverItem)
						//console.log(sap.ui.getCore().getModel().getData());
					}
				}
			}
		} else if (sap.ui.getCore().byId("oWorkFlowDialog").getModel().getProperty("/0")) {
			if (oAddApprover === sap.ui.getCore().byId("oWorkFlowDialog").getModel().getProperty("/0/0/ENGLISH_NAME")) {
				//sap.m.MessageBox.alert("This Person is initial REQUESTER. You cannot ADD.", {
				//    title: "Warning",
				//    onClose: null  ,
				//    styleClass: "sapThemeCriticalText" ,
				//    initialFocus: null,
				//    textDirection: sap.ui.core.TextDirection.Inherit
				//    });
				sap.m.MessageToast.show("This Person is initial REQUESTER. You cannot ADD.");
				return false;
			} else {
				for (var i = 0; i < oAddApproverLength; i++) {
					var oComApprover = oAddApproverModel.getProperty('/results/' + i).ENGLISH_NAME;
					if (oComApprover === oAddApprover) {
						var oNewApprover = oAddApproverModel.getProperty('/results/' + i),
							onewApproverItem = sap.ui.getCore().byId("oWorkFlowDialog").getModel().getProperty('/0'),
							oClone = $.extend({}, onewApproverItem[0]);
						//console.log(onewApproverItem)
						//console.log(onewApproverItem[0])
						for (var sKey in oClone) {
							if (oClone.hasOwnProperty(sKey)) {
								oClone[sKey] = oNewApprover[sKey];
							}
						}
						//console.log(oNewApprover)
						onewApproverItem.push(oClone);
						sap.ui.getCore().byId("oWorkFlowDialog").getModel().refresh();
						//console.log(onewApproverItem)
						////console.log(sap.ui.getCore().getModel().getData());
					}
				}
			}
		}
		sap.ui.getCore().byId("oWFsearch").setValue("");
	},

	/*Function : handle to delete the WorkFlow List*/
	handleDelete: function(oEvent) {
		var oList = oEvent.getSource(),
			oItem = oEvent.getParameter("listItem"),
			sPath = oItem.getBindingContext().getPath(),
			oPath = sPath.split('/')[1].split('/')[0];
		if (oItem.sId === $("#oList-tblBody tr").first().attr('id')) {
			// sap.m.MessageBox.alert("This Person is initial REQUESTER. You cannot DELETE.", {
			//     title: "Warning",
			//     onClose: null  ,
			//     styleClass: "sapThemeCriticalText" ,
			//     initialFocus: null,
			//     textDirection: sap.ui.core.TextDirection.Inherit
			//     });
			sap.m.MessageToast.show("This Person is initial REQUESTER. You cannot DELETE.");
			return false;
		}
		/*if(oList.getModel().getProperty(sPath).USER_ID === sap.ui.getCore().byId("oWorkFlowDialog").getModel().getProperty('/'+oPath+'/0/').USER_ID){
		  sap.m.MessageBox.alert("This Person is initial REQUESTER. You cannot DELETE.", {
		      title: "Warning",
		      onClose: null  ,
		      styleClass: "sapThemeCriticalText" ,
		      initialFocus: null,
		      textDirection: sap.ui.core.TextDirection.Inherit
		      });
		}*/
		else {
			sPath = sPath.substring(sPath.lastIndexOf('/') + 1);
			var model = oList.getModel();
			var data = model.getProperty('/' + oPath + '');
			data.splice(parseInt(sPath), 1);
			model.setProperty('/results', data);
		}
	},

	/*Select Cooperation Search Type - oData Change*/
	onCallCPPossible: function(oEvent) {
		var oValue = oEvent.getParameter("value");
		if (oValue.length >= 3) {
			var oSelectedKey = sap.ui.getCore().byId("CPTypeSelect").getSelectedKey();

			var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl, true);
			var oJsonModel = new sap.ui.model.json.JSONModel();

			oModel.read("AutowayTMInfo?", null, ["$filter=DUTY_CODE eq '15:20:60:65:70:73'"], false,
				function(oData, response) {
					oJsonModel.setData(oData);
				});
			//console.log(oJsonModel);
			sap.ui.getCore().byId("oCPsearch").setModel(oJsonModel);

			if (oSelectedKey === "A") { //Name
				sap.ui.getCore().byId("Name").setText("Name");
				sap.ui.getCore().byId("Title").setText("Title");
				sap.ui.getCore().byId("DeptName").setText("Dept Name");

				sap.ui.getCore().byId("oCPsearch").bindAggregation('suggestionRows',
					'/results',
					new sap.m.ColumnListItem({
						cells: [
							new sap.m.Label({
								text: "{ENGLISH_NAME}"
							}),
							new sap.m.Label({
								text: "{DUTY_NAME}"
							}),
							new sap.m.Label({
								text: "{DEPT_NAME}"
							}),
							new sap.m.Label({
								text: "{TELEPHONE}"
							})
						]
					})
				);
			} else if (oSelectedKey === "B") { //Department
				sap.ui.getCore().byId("Name").setText("Dept Name");
				sap.ui.getCore().byId("Title").setText("Name");
				sap.ui.getCore().byId("DeptName").setText("Title");

				sap.ui.getCore().byId("oCPsearch").bindAggregation('suggestionRows',
					'/results',
					new sap.m.ColumnListItem({
						cells: [
							new sap.m.Label({
								text: "{DEPT_NAME}"
							}),
							new sap.m.Label({
								text: "{ENGLISH_NAME}"
							}),
							new sap.m.Label({
								text: "{DUTY_NAME}"
							}),
							new sap.m.Label({
								text: "{TELEPHONE}"
							})
						]
					})
				);

			}
		}
	},

	onAddCooperation: function(oEvent) {
		var oAddCooperatorModel = sap.ui.getCore().byId("oCPsearch").getModel(),
			oAddCooperator = sap.ui.getCore().byId("oCPsearch").getValue(),
			oAddCooperatorLength = oAddCooperatorModel.getProperty('/results').length;
		//console.log(sap.ui.getCore().byId("oCooperationDialog"))
		//WILL ADD validation check
		if (sap.ui.getCore().byId("oCooperationDialog").getModel().getProperty("/results")) { //default cooperation
			for (var i = 0; i < oAddCooperatorLength; i++) {
				var oComCooperator = oAddCooperatorModel.getProperty('/results/' + i).ENGLISH_NAME, //Name
					oComCooperatorDept = oAddCooperatorModel.getProperty('/results/' + i).DEPT_NAME; //Department
				if (oComCooperator === oAddCooperator || oComCooperatorDept === oAddCooperator) {
					var oNewCooperator = oAddCooperatorModel.getProperty('/results/' + i),
						onewCooperatorItem = sap.ui.getCore().byId("oCooperationDialog").getModel().getProperty("/results"),
						oClone = $.extend({}, onewCooperatorItem[0]);
					for (var sKey in oClone) {
						if (oClone.hasOwnProperty(sKey)) {
							oClone[sKey] = oNewCooperator[sKey];
						}
					}
					onewCooperatorItem.push(oNewCooperator);
					//onewCooperatorItem.push(oClone);
					sap.ui.getCore().byId("oCooperationDialog").getModel().refresh();
				}
			}
		} else if (sap.ui.getCore().byId("oCooperationDialog").getModel().getProperty("/")) {
			for (var i = 0; i < oAddCooperatorLength; i++) {
				var oComCooperator = oAddCooperatorModel.getProperty('/results/' + i).ENGLISH_NAME, //Name search
					oComCooperatorDept = oAddCooperatorModel.getProperty('/results/' + i).DEPT_NAME; //Department search

				if (oComCooperator === oAddCooperator || oComCooperatorDept === oAddCooperator) {
					//console.log("i:"+i);
					var oNewCooperator = oAddCooperatorModel.getProperty('/results/' + i),
						onewCooperatorItem = sap.ui.getCore().byId("oCooperationDialog").getModel();
					var onewCooperatorItemLength = sap.ui.getCore().byId("oCPList").getBinding("items").getLength();

					//console.log(onewCooperatorItem);
					onewCooperatorItem.setProperty('/' + onewCooperatorItemLength, oNewCooperator)
					sap.ui.getCore().byId("oCooperationDialog").getModel().refresh();
				}
			}
		}
		sap.ui.getCore().byId("oCPsearch").setValue("");
	},

	CPhandleDelete: function(oEvent) {
		var oList = oEvent.getSource(),
			oItem = oEvent.getParameter("listItem"),
			sPath = oItem.getBindingContext().getPath();

		//sPath = sPath.substring(sPath.lastIndexOf('/')+1);
		if (oList.getModel().getProperty("/results")) {
			var model = oList.getModel(),
				data = model.getProperty('/results');

			sPath = sPath.substring(sPath.lastIndexOf('/') + 1);

			data.splice(parseInt(sPath), 1);
			model.setProperty('/results', data);
			//console.log(sap.ui.getCore().byId("oCPList").getModel().getData());
			console.log(model)
		} else {
			var model = oList.getModel(),
				data = model.getProperty('/');
			sPath = sPath.substring(sPath.lastIndexOf('/') + 1);
			//console.log(sPath);
			//console.log(data);

			data.splice(parseInt(sPath), 1);
			model.setProperty('/', data);
			//console.log(sap.ui.getCore().byId("oCPList").getModel().getData());
		}
	},

	handleSelectButton: function(oEvent) {
		var oDialogId = oEvent.getSource().getParent().sId.split('-')[0],
			oWorkFlow = oEvent.getSource().getParent().getContent()[1],
			WorkFlowModel = new sap.ui.model.json.JSONModel([]);

		WorkFlowModel.WORKFLOW = oWorkFlow.getModel().getData();
		//console.log(oDialogId);

		sap.ui.getCore().byId(oEvent.getSource().getParent().sId).close();
		sap.ui.getCore().byId(oEvent.getSource().getParent().sId).destroy();

		oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		oJQueryStorage.put("WORKFLOW", WorkFlowModel.WORKFLOW);

		var oWorkFlowJQueryData = oJQueryStorage.get("WORKFLOW");
		var items = [];

		for (var key in oWorkFlowJQueryData) {
			items.push(oWorkFlowJQueryData[key]);
		}

		var oJSONModel = new sap.ui.model.json.JSONModel();
		oJSONModel.setData(items);
		if (oDialogId === "oWorkFlowDialog") {
			this.getView().byId("oIOCreateWF").setModel(oJSONModel);
			//console.log(this.getView().byId("oIOCreateWF").getModel());
		} else if (oDialogId === "oCooperationDialog") {
			if (this.getView().byId("oIOCreateCP")) { //Create
				if (oJSONModel.getProperty("/0/0/")) { //if default Cooperation value exists
					var model = new sap.ui.model.json.JSONModel(oJSONModel.getProperty("/0"));
					this.getView().byId("oIOCreateCP").setModel(model);
					//console.log(this.getView().byId("oIOCreateCP").getModel())
				} else {
					this.getView().byId("oIOCreateCP").setModel(oJSONModel);
					//console.log(this.getView().byId("oIOCreateCP").getModel());
				}
			} else if (sap.ui.getCore().byId("oIOCreateCP")) { //Detail
				sap.ui.getCore().byId("oIOCreateCP").setModel(oJSONModel);
				//console.log(sap.ui.getCore().byId("oIOCreateCP").getModel());
				//console.log(this.getView().getModel().getProperty("/IMApprLineNavi/results/"));
			}
		}
		//console.log(oJSONModel);
		if (this.getView().byId("oApprovalDes")) {
			this.getView().byId("oApprovalDes").setVisible(false);
		}
	},

	handleCloseDialog: function(oEvent) {
		//console.log("Destroy");
		sap.ui.getCore().byId("oInquiryIODetailDialog").close();
		sap.ui.getCore().byId("oInquiryIODetailDialog").destroy();
		//sap.ui.getCore().byId(oEvent.getSource().sId).destroy();
	},

	handleCloseButton: function(oEvent) {
		sap.ui.getCore().byId(oEvent.getSource().getParent().sId).destroy();
	},

	onSubmitSuccess: function() {
		sap.ui.core.BusyIndicator.hide();
		location.reload(true);
	},

	onUpdateSuccess: function() {
		sap.ui.core.BusyIndicator.hide();
	},

	onSubmitFail: function() {
		sap.ui.core.BusyIndicator.hide();
	},

	/*
	 *
	 * ABP Planning Function
	 *
	 *
	 * */

	/*Add Item Table Row*/
	addTabRow: function(oEvent) {
		var oABPCreateTB = sap.ui.getCore().byId("oABPCreateItemTB"),
			oPath = oABPCreateTB.getBinding().getPath(),
			oModel = oABPCreateTB.getModel().getProperty(oPath);
		//console.log(oModel);

		oModel.push({
			MATNR: "",
			MAKTX: "",
			PREIS: "",
			MENGE: "",
			TAX: "",
			SHIPPING: "",
			TOT: ""
		});
		oABPCreateTB.getModel().setProperty("/modelData", oModel);
		oABPCreateTB.bindRows("/modelData");

	},

	//Item table Calculation
	onSum: function(oEvent) {
		var oContext = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oEvent.getParameter("liveValue")),
			oContextId = oEvent.getSource().getId(),
			oTOTCells = oEvent.getSource().getParent().getCells();

		oContext = zhmmaim.util.Formatter.CurrencyFormatter(oContext);

		var oTable = sap.ui.getCore().byId("oABPCreateItemTB"),
			oIndex = oEvent.getSource().getParent().getIndex(),
			nTax = 0;
		nSum = 0,
			nTOTA = 0;

		/*TextField Number Validation - MENGE*/
		oEvent.getSource().setValue(oContext);

		//Input Qty -> PREIS * MENGE *0.1 = TAX / PREIS*Qty + TAX + SHIPPING = TOT
		if (oContextId.split('-')[0] === 'MENGE') {
			/*Calculate the New Amount*/
			oContextMENGE = oContext;
			oContextPREIS = oTable.getContextByIndex(oIndex).getProperty("PREIS");
			oContextTAX = oTable.getContextByIndex(oIndex).getProperty("TAX");
			oContextSHIPPING = oTable.getContextByIndex(oIndex).getProperty("SHIPPING");

			if (oContextMENGE === "") {
				oContextMENGE = "0";
			}
			if (oContextPREIS === "") {
				oContextPREIS = "0";
			}
			if (oContextTAX === "") {
				oContextTAX = "0";
			}
			if (oContextSHIPPING === "") {
				oContextSHIPPING = "0";
			}

			oContextMENGE = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextMENGE);
			oContextPREIS = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextPREIS);

			nTax = parseInt(oContextMENGE) * parseFloat(oContextPREIS) * 0.1;
			nTax = nTax.toFixed(2);
			nTax = zhmmaim.util.Formatter.CurrencyFormatter(nTax);
			oTOTCells[4].setValue(nTax);

			nTax = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(nTax);
			oContextSHIPPING = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextSHIPPING);
			oContextTAX = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextTAX);

			nSum = parseInt(oContextMENGE) * parseFloat(oContextPREIS) + parseFloat(nTax) + parseFloat(oContextSHIPPING);
			nSum = nSum.toFixed(2);
			nSum = zhmmaim.util.Formatter.CurrencyFormatter(nSum);
			oTOTCells[6].setValue(nSum);
			//Input Price ->PREIS * MENGE *0.1 = TAX / PREIS*Qty + TAX + SHIPPING = TOT
		} else if (oContextId.split('-')[0] === 'PREIS') {
			/*Calculate the New Amount*/
			oContextMENGE = oTable.getContextByIndex(oIndex).getProperty("MENGE");
			oContextPREIS = oContext;
			oContextTAX = oTable.getContextByIndex(oIndex).getProperty("TAX");
			oContextSHIPPING = oTable.getContextByIndex(oIndex).getProperty("SHIPPING");

			if (oContextMENGE === "") {
				oContextMENGE = "0";
			}
			if (oContextPREIS === "") {
				oContextPREIS = "0";
			}
			if (oContextTAX === "") {
				oContextTAX = "0";
			}
			if (oContextSHIPPING === "") {
				oContextSHIPPING = "0";
			}

			oContextMENGE = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextMENGE);
			oContextPREIS = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextPREIS);

			nTax = parseInt(oContextMENGE) * parseFloat(oContextPREIS) * 0.1;
			nTax = nTax.toFixed(2);
			nTax = zhmmaim.util.Formatter.CurrencyFormatter(nTax);
			oTOTCells[4].setValue(nTax);

			nTax = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(nTax);
			oContextSHIPPING = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextSHIPPING);
			oContextTAX = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextTAX);

			nSum = parseInt(oContextMENGE) * parseFloat(oContextPREIS) + parseFloat(nTax) + parseFloat(oContextSHIPPING);
			nSum = nSum.toFixed(2);
			nSum = zhmmaim.util.Formatter.CurrencyFormatter(nSum);

			oTOTCells[6].setValue(nSum);
			//Input Shipping -> PREIS*MENGE + TAX + SHIPPING = TOT
		} else if (oContextId.split('-')[0] === 'SHIPPING') {
			/*Calculate the New Amount*/
			oContextMENGE = oTable.getContextByIndex(oIndex).getProperty("MENGE");
			oContextPREIS = oTable.getContextByIndex(oIndex).getProperty("PREIS");
			oContextTAX = oTable.getContextByIndex(oIndex).getProperty("TAX");
			oContextSHIPPING = oContext;

			if (oContextMENGE === "") {
				oContextMENGE = "0";
			}
			if (oContextPREIS === "") {
				oContextPREIS = "0";
			}
			if (oContextTAX === "") {
				oContextTAX = "0";
			}
			if (oContextSHIPPING === "") {
				oContextSHIPPING = "0";
			}
			oContextMENGE = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextMENGE);
			oContextPREIS = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextPREIS);

			nTax = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(nTax);

			oContextSHIPPING = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextSHIPPING);
			oContextTAX = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextTAX);

			nSum = parseInt(oContextMENGE) * parseFloat(oContextPREIS) + parseFloat(oContextTAX) + parseFloat(oContextSHIPPING);
			nSum = nSum.toFixed(2);
			nSum = zhmmaim.util.Formatter.CurrencyFormatter(nSum);

			oTOTCells[6].setValue(nSum);
		}

		/*Actual TOTAL(TOTA) calculate*/
		var oContextTOTA = sap.ui.getCore().byId("oABPCreateItemTB").getModel().getProperty('/');
		for (i = 0; i < oContextTOTA.length; i++) {
			if (oContextTOTA[i].TOT === "" || oContextTOTA[i].TOT === "NaN") {
				oContextTOTA[i].TOT = 0;
			} else if (oContextTOTA[i].TAX === "" || oContextTOTA[i].TAX === "NaN") {
				oContextTOTA[i].TAX = 0;
			}
			var oContextTOTEach = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oContextTOTA[i].TOT);
			nTOTA = parseFloat(nTOTA) + parseFloat(oContextTOTEach);
		}
		nTOTA = zhmmaim.util.Formatter.CurrencyFormatter(nTOTA);
		sap.ui.getCore().byId("TOTA").setValue(nTOTA);
	},

	//Revenue payback period Calculation
	onAverage: function(oEvent) {
		var oContext = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oEvent.getParameter("liveValue")),
			oContextCells = oEvent.getSource().getParent().getCells(),
			oContextLength = oContextCells.length,
			oContextTOTA = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(sap.ui.getCore().byId("TOTA").getValue()); //ITEM TOTAL 媛

		var oSum = 0,
			oAverage = 0,
			oROI = 0, //ROI
			oBlank = 0;

		/*TextField Number Validation - RTNAMT*/
		oEvent.getSource().setValue(oContext);

		for (i = 0; i < oContextLength; i++) {
			var oContextRTNAMT = oContextCells[i].getValue();
			if (parseFloat(oContextRTNAMT)) {
				oSum += parseFloat(oContextRTNAMT);
			} else {
				oBlank++;
			}
		}

		var oGJAHRCount = (oContextLength) - oBlank;

		//oAverage = oSum / oGJAHRCount
		if (oSum !== 0) {
			oAverage = oSum / oGJAHRCount;
		} else {

		}
		//oROI = USER4 / oAverage
		if (oAverage !== 0) {
			oROI = oContextTOTA / oAverage;
			oROI = oROI.toFixed(2);
		} else {
			oROI = "";
		}

		//Display on the Screen
		sap.ui.getCore().byId("ROI").setValue(oROI);
	},

	/* Function - Show the Dialog of ABP Detail*/
	toABPDetail: function(oEvent) {
		/*Get the Item Parameter and Print the Screen*/
		if (!this.oABPDetailDialog) {
			var oABPDetailDialog = new sap.ui.xmlfragment("zhmmaim.fragment.ABPCreateDialog", this);
		}
		oABPDetailDialog.open();

		// IG Moon 10/25/2016
		oABPDetailDialog.onkeydown = function(evt) {
				evt = evt || window.event;
				var isEscape = false;
				if ("key" in evt) {
					isEscape = (evt.key === "Escape" || evt.key == "Esc");
				} else {
					isEscape = (evt.keyCode === 27);
				}
				if (isEscape) {
					this.destroy();
				}
			},

			/*SAVE / DELETE Button Invisible*/
			sap.ui.getCore().byId("oABPSAVE").setVisible(false);
		sap.ui.getCore().byId("oABPUPDATE").setVisible(false);

		var oRowPath = oEvent.getParameter("rowContext").sPath;

		/*Binding Odata - header*/
		if (this.getView().byId("oDetaTB")) { //Create View
			/*ABP Detail Item Initial Data - For Update*/
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

			/*ABP Detail Item Initial Data Binding - For Update*/

			var oABPDetailItemJSONModel = new sap.ui.model.json.JSONModel();
			oABPDetailItemJSONModel.setData(oABPDetailData);
			sap.ui.getCore().byId("oABPCreateItemTB").setModel(oABPDetailItemJSONModel);

			sap.ui.getCore().byId("oABPUPDATE").setVisible(true);

			sap.ui.getCore().byId("oABPCreateDialog").setModel(this.getView().byId("oDetaTB").getModel());
			oContext = sap.ui.getCore().byId("oABPCreateDialog").getModel();
			oContextDetail = oContext.getProperty(oRowPath);
			var oRow = oEvent.getParameter("rowContext"),
				oContextBGTSEQ = oRow.getProperty("BGTSEQ");

			oJQueryStorage.put("abpMod", oRow.sPath);

			sap.ui.getCore().byId("oABPCreateDialog").setTitle(oContextBGTSEQ);
			sap.ui.getCore().byId("oABPCreateDialog-title").setVisible(false);

			/*Item*/
			var oItemPath = oRowPath + "/IMABPItemNavi/";
			//sap.ui.getCore().byId("oABPCreateItemTB").bindRows(oItemPath);
			oABPDetailItemJSONModel.setData(oContext.getProperty(oItemPath));

			/*ROI*/
			var oPaybackPath = oRowPath + "/IMABPROINavi/",
				oContextPayback = oContext.getProperty(oPaybackPath),
				oPaybackLength = oContextPayback.length,
				oContextTOTA = oContextDetail.TOTA; //Total 媛

			for (var i = 0; i < oPaybackLength; i++) {
				sap.ui.getCore().byId("GJAHR" + [i + 1]).setText(oContextPayback[i].GJAHR);
				sap.ui.getCore().byId("oABPPayTB").getRows()[0].getCells()[i].setValue(oContextPayback[i].RTNAMT);
			};

			/*Attachment*/
			sap.ui.getCore().byId("oUploadCollection").bindAggregation("items",
				oRowPath + '/IMABPFileNavi/', new sap.m.UploadCollectionItem({
					fileName: "{ID}",
					documentId: "{FTYPE}",
					enableEdit: false,
					enableDelete: true,
					visibleEdit: false,
					visibleDelete: true
				})
			);

			var filter = new sap.ui.model.Filter("FTYPE", sap.ui.model.FilterOperator.EQ, "G");
			sap.ui.getCore().byId("oUploadCollection").getBinding("items").filter(filter, "Application");

			/*Image Attachment*/
			var fileNavi = oContext.getProperty(oRowPath + "/IMABPFileNavi/");
			for (i = 0; i < fileNavi.length; i++) {
				if (fileNavi[i].FTYPE == "I") {
					var oContextImageName = fileNavi[i].ID;
					var oContextImageValue = fileNavi[i].VALUE;
				}
			}
			sap.ui.getCore().byId("oImageUploader").setValue(oContextImageName);
			if (oContextImageValue != undefined) {
				// IG Moon 10/20/2016
				if (document.documentMode == '11') {
					var vImgType = oContextImageName.split('.')[1];
					sap.ui.getCore().byId("oImage").setSrc("data:image/" + vImgType + ";base64," + oContextImageValue);
				} else {
					sap.ui.getCore().byId("oImage").setSrc("data:image/;base64," + oContextImageValue);
				}

			}
		} else if (sap.ui.getCore().byId("oDetaTB")) { //Detail View
			/*Edit Block - FileAttach Field*/
			jQuery('#oUploadCollection-2-uploader-fu').attr("disabled", true);

			sap.ui.getCore().byId("oABPCreateDialog").setModel(sap.ui.getCore().byId("oDetaTB").getModel());
			oContext = sap.ui.getCore().byId("oABPCreateDialog").getModel();
			oContextDetail = oContext.getProperty(oRowPath);

			/*Item*/
			var oItemPath = oRowPath + "/IMABPItemNavi/results/";
			sap.ui.getCore().byId("oABPCreateItemTB").bindRows(oItemPath);

			/*ROI*/
			var oPaybackPath = oRowPath + "/IMABPROINavi/results/",
				oContextPayback = oContext.getProperty(oPaybackPath),
				oPaybackLength = oContextPayback.length,
				oContextTOTA = oContextDetail.TOTA; //Total 媛

			for (var i = 0; i < oPaybackLength; i++) {
				sap.ui.getCore().byId("GJAHR" + [i + 1]).setText(oContextPayback[i].GJAHR);
				sap.ui.getCore().byId("oABPPayTB").getRows()[0].getCells()[i].setValue(oContextPayback[i].RTNAMT);
			};

			/*Attachment*/
			//console.log(oRowPath+"/IMABPFileNavi/results/")
			sap.ui.getCore().byId("oUploadCollection").bindAggregation("items",
				oRowPath + '/IMABPFileNavi/results/', new sap.m.UploadCollectionItem({
					fileName: "{ID}",
					url: "{URI}",
					enableEdit: false,
					enableDelete: true,
					visibleEdit: false,
					visibleDelete: true
				})
			);

			var filter = new sap.ui.model.Filter("FTYPE", sap.ui.model.FilterOperator.EQ, "G");
			sap.ui.getCore().byId("oUploadCollection").getBinding("items").filter(filter, "Application");

			sap.ui.getCore().byId("oUploadCollection").addStyleClass("sapUiFileDisable");

			/*Image Attachment*/
			var fileNavi = oContext.getProperty(oRowPath + "/IMABPFileNavi/results/");
			for (i = 0; i < fileNavi.length; i++) {
				if (fileNavi[i].FTYPE == "I") {
					var oContextImageName = fileNavi[i].ID;
					var oContextImageValue = fileNavi[i].VALUE;
				}
			}
			sap.ui.getCore().byId("oImageUploader").setValue(oContextImageName);

			if (oContextImageValue != undefined) {

				// IG Moon 10/20/2016
				if (document.documentMode == '11') {
					var vImgType = oContextImageName.split('.')[1];
					sap.ui.getCore().byId("oImage").setSrc("data:image/" + vImgType + ";base64," + oContextImageValue);
				} else {
					sap.ui.getCore().byId("oImage").setSrc("data:image/;base64," + oContextImageValue);
				}
			}
			sap.ui.getCore().byId("oImageUploader").setVisible(false);
		} else if (this.getView().byId("oABPTable")) { //ABP Status
			/*ABP Detail Item Initial Data - For Update*/
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

			/*ABP Detail Item Initial Data Binding - For Update*/

			var oABPDetailItemJSONModel = new sap.ui.model.json.JSONModel();
			oABPDetailItemJSONModel.setData(oABPDetailData);
			sap.ui.getCore().byId("oABPCreateItemTB").setModel(oABPDetailItemJSONModel);

			sap.ui.getCore().byId("oABPUPDATE").setVisible(true);

			var oRow = oEvent.getParameter("rowContext"),
				oContextBGTDOC = oRow.getProperty("BGTDOC"),
				oContextBGTSEQ = oRow.getProperty("BGTSEQ");
			//oSEQ = oContextBGTSEQ -1 ;

			sap.ui.getCore().byId("oABPCreateDialog").setTitle(oContextBGTDOC + "(" + oContextBGTSEQ + ")");

			/*Budget Planning Creation Rest Call*/
			var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl, true);
			var oJsonModel = new sap.ui.model.json.JSONModel();

			oModel
				.read(
					"IMApprHead(BGTDOC='" + oContextBGTDOC + "')/?",
					null, ["$expand=IMApprLineNavi,IMABPDetaNavi/IMABPItemNavi,IMABPDetaNavi/IMABPROINavi,IMApprTextNavi,IMABPDetaNavi/IMABPFileNavi"],
					false,
					function(oData, response) {
						oJsonModel.setData(oData);
					});
			sap.ui.getCore().byId("oABPCreateDialog").setModel(oJsonModel);

			oContext = sap.ui.getCore().byId("oABPCreateDialog").getModel();

			oContextDetailLength = oContext.getProperty('/IMABPDetaNavi/results').length;
			for (var i = 0; i < oContextDetailLength; i++) {
				if (oContextBGTSEQ == oContext.getProperty('/IMABPDetaNavi/results/' + i).BGTSEQ) {
					oSEQ = i;
				}
			}
			oContextDetail = oContext.getProperty("/IMABPDetaNavi/results/" + oSEQ);

			//Item
			var oItemPath = "/IMABPDetaNavi/results/" + oSEQ + "/IMABPItemNavi/results/";
			//sap.ui.getCore().byId("oABPCreateItemTB").bindRows(oItemPath);
			oABPDetailItemJSONModel.setData(oContext.getProperty(oItemPath));

			//ROI
			var oPaybackPath = "/IMABPDetaNavi/results/" + oSEQ + "/IMABPROINavi/results/",
				oContextPayback = oContext.getProperty(oPaybackPath),
				oPaybackLength = oContextPayback.length,
				oContextTOTA = oContextDetail.TOTA;
			for (var i = 0; i < oPaybackLength; i++) {
				sap.ui.getCore().byId("GJAHR" + [i + 1]).setText(oContextPayback[i].GJAHR);
				sap.ui.getCore().byId("oABPPayTB").getRows()[0].getCells()[i].setValue(oContextPayback[i].RTNAMT);
			};
			//attachment
			var oAttachPath = "/IMABPDetaNavi/results/" + oSEQ + "/IMABPFileNavi/results/";

			/*Attachment*/
			sap.ui.getCore().byId("oUploadCollection").bindAggregation("items",
				oAttachPath, new sap.m.UploadCollectionItem({
					fileName: "{ID}",
					url: "{URI}",
					documentId: "{FTYPE}",
					enableEdit: false,
					enableDelete: false,
					visibleEdit: false,
					visibleDelete: false
				})
			);

			sap.ui.getCore().byId("oUploadCollection").addStyleClass("sapUiFileDisable");

			var filter = new sap.ui.model.Filter("FTYPE", sap.ui.model.FilterOperator.EQ, "G");
			sap.ui.getCore().byId("oUploadCollection").getBinding("items").filter(filter, "Application");

			/*Image Attachment*/
			var fileNavi = oContext.getProperty(oAttachPath);
			for (i = 0; i < fileNavi.length; i++) {
				if (fileNavi[i].FTYPE == "I") {
					var oContextImageName = fileNavi[i].ID;
					var oContextImageValue = fileNavi[i].VALUE;
				}
			}
			sap.ui.getCore().byId("oImageUploader").setValue(oContextImageName);

			if (oContextImageValue != undefined) {
				// IG Moon 10/20/2016
				if (document.documentMode == '11') {
					var vImgType = oContextImageName.split('.')[1];
					sap.ui.getCore().byId("oImage").setSrc("data:image/" + vImgType + ";base64," + oContextImageValue);
				} else {
					sap.ui.getCore().byId("oImage").setSrc("data:image/;base64," + oContextImageValue);
				}
			}
			sap.ui.getCore().byId("oImageUploader").setVisible(false);
		}

		sap.ui.getCore().byId("TXT50").setValue(oContextDetail.TXT50); //Description
		sap.ui.getCore().byId("PURPO").setValue(oContextDetail.PURPO); //Purpose
		sap.ui.getCore().byId("ZPROJ01").setValue(oContextDetail.ZPROJ); //P.code

		sap.ui.getCore().byId("IZWEK").setValue(oContextDetail.IZWEK); //IM.Reason
		sap.ui.getCore().byId("IZWEKD").setValue(oContextDetail.IZWEKD); //IM.Reason Description
		sap.ui.getCore().byId("VKOSTL").setValue(oContextDetail.VKOSTL); //CC.Response
		sap.ui.getCore().byId("VKOSTLD").setValue(oContextDetail.VKOSTLD); //CC.Response Description
		sap.ui.getCore().byId("USR03").setValue(oContextDetail.USR03); //USR03
		sap.ui.getCore().byId("USR03D").setValue(oContextDetail.USR03D); //USR03D Description
		sap.ui.getCore().byId("SIZECL").setValue(oContextDetail.SIZECL); //Scale
		sap.ui.getCore().byId("SIZECLD").setValue(oContextDetail.SIZECLD); //Scale Description
		sap.ui.getCore().byId("PRIORI").setValue(oContextDetail.PRIORI); //Priority
		sap.ui.getCore().byId("PRIORID").setValue(oContextDetail.PRIORID); //Priority Description
		sap.ui.getCore().byId("USR02").setValue(oContextDetail.USR02); //Category
		sap.ui.getCore().byId("USR02D").setValue(oContextDetail.USR02D); //Category Description
		sap.ui.getCore().byId("USR00").setValue(oContextDetail.USR00); //Asset Class
		sap.ui.getCore().byId("USR00D").setValue(oContextDetail.USR00D); //Asset Class Description
		sap.ui.getCore().byId("WERKS").setValue(oContextDetail.WERKS); //Plant
		sap.ui.getCore().byId("WERKSD").setValue(oContextDetail.WERKSD); //Plant Description

		sap.ui.getCore().byId("TOTA").setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.TOTA)); //Total

		sap.ui.getCore().byId("GDATU").setValue(oContextDetail.GDATU); //[Plan]Approval
		sap.ui.getCore().byId("WDATU").setValue(oContextDetail.WDATU); //[Plan]PR
		sap.ui.getCore().byId("PODATE").setValue(oContextDetail.PODATE); //[Plan]PO
		sap.ui.getCore().byId("USR01").setValue(oContextDetail.USR01); //[Plan]GR
		sap.ui.getCore().byId("USR08").setValue(oContextDetail.USR08); //[Plan]Install
		sap.ui.getCore().byId("USR09").setValue(oContextDetail.USR09); //[Plan]Finish

		sap.ui.getCore().byId("EFFTA").setValue(oContextDetail.EFFTA); // Tangible
		sap.ui.getCore().byId("EFFIN").setValue(oContextDetail.EFFIN); // Intangible
		sap.ui.getCore().byId("TPLNR").setValue(oContextDetail.TPLNR); // Location

		//Default Even Revenue & ROI Calculate value
		var oSum = 0,
			oAverage = 0,
			oROI = 0,
			oBlank = 0;

		for (i = 0; i < oPaybackLength; i++) {
			if (parseInt(oContextPayback[i].RTNAMT)) {
				oSum += parseInt(oContextPayback[i].RTNAMT);
			} else {
				oBlank++;
			}
		}
		var oGJAHRCount = (oPaybackLength) - oBlank;

		//oAverage = oSum / oGJAHRCount
		if (oSum !== 0) {
			oAverage = oSum / oGJAHRCount;
		} else {

		}
		//oROI = USER4 / oAverage
		if (oAverage !== 0) {
			oROI = oContextTOTA / oAverage;
			oROI = oROI.toFixed(2);
		} else {
			oROI = "";
		}

		//Display on the Screen
		sap.ui.getCore().byId("ROI").setValue(oROI);
		//console.log(oROI);

		/*Monthly plan*/
		sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[0].setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.WTP01));
		sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[1].setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.WTP02));
		sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[2].setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.WTP03));
		sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[3].setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.WTP04));
		sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[4].setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.WTP05));
		sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[5].setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.WTP06));
		sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[6].setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.WTP07));
		sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[7].setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.WTP08));
		sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[8].setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.WTP09));
		sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[9].setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.WTP10));
		sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[10].setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.WTP11));
		sap.ui.getCore().byId("oABPMonthTB").getRows()[0].getCells()[11].setValue(zhmmaim.util.Formatter.CurrencyFormatter(oContextDetail.WTP12));
	},

	/*
	 *
	 * Budget Transfer Commons Functions
	 * */

	/*Add Sender Table Row*/
	addSenderRow: function(oEvent) {
		if (this.getView().byId("oSender")) { //Create
			var oSenderTB = this.getView().byId("oSender");
		} else if (sap.ui.getCore().byId("oSender")) { //Inbox
			var oSenderTB = sap.ui.getCore().byId("oSender");
		}
		var oPath = oSenderTB.getBinding().getPath(),
			oModel = oSenderTB.getModel().getProperty(oPath);

		oModel.push({
			"S_POSID": "",
			"S_POST1": "",
			"S_B_WLGES": "",
			"S_C_WLGES": "",
			"S_T_WLGES": "",
			"S_E_WLGES": "",
			"S_VKOSTL": ""
		});

		oSenderTB.getModel().setProperty("/modelData", oModel);
		oSenderTB.bindRows("/modelData");
	},

	/*Add Receiver Table Row - will merge with the function which add sender table row */
	addReceiverRow: function(oEvent) {
		if (this.getView().byId("oReceiver")) {
			var oReceiverTB = this.getView().byId("oReceiver");
		} else if (sap.ui.getCore().byId("oReceiver")) {
			var oReceiverTB = sap.ui.getCore().byId("oReceiver");
		}
		var oPath = oReceiverTB.getBinding().getPath(),
			oModel = oReceiverTB.getModel().getProperty(oPath);

		oModel.push({
			"R_POSID": "",
			"R_POST1": "",
			"R_B_WLGES": "",
			"R_C_WLGES": "",
			"R_T_WLGES": "",
			"R_E_WLGES": "",
			"R_VKOSTL": ""
		});
		oReceiverTB.getModel().setProperty("/modelData", oModel);
		oReceiverTB.bindRows("/modelData");
	},

	PIDefaultValue: function(oEvent) {
		var today = new Date(),
			oContextId = oEvent.getSource().getId();
		if (oContextId.split('--')[1] === 'FISCAl') {
			/*Sender Table Refresh*/
			var oSenderData = this.getView().byId("oSender").getModel().getData(),
				oSenderDataLength = this.getView().byId("oSender").getModel().getProperty('/').length;
			for (i = 0; i < oSenderDataLength; i++) {
				oSenderData[i].S_POSID = "";
				oSenderData[i].S_POST1 = "";
				oSenderData[i].S_B_WLGES = "";
				oSenderData[i].S_C_WLGES = "";
				oSenderData[i].S_E_WLGES = "";
				oSenderData[i].S_VKOSTL = "";
			}
			this.getView().byId("oSender").getModel().refresh();

			/*Receiver Table Refresh*/
			var oReceiverData = this.getView().byId("oReceiver").getModel().getData(),
				oReceiverDataLength = this.getView().byId("oReceiver").getModel().getProperty('/').length;
			for (i = 0; i < oReceiverDataLength; i++) {
				oReceiverData[i].R_POSID = "";
				oReceiverData[i].R_POST1 = "";
				oReceiverData[i].R_B_WLGES = "";
				oReceiverData[i].R_C_WLGES = "";
				oReceiverData[i].R_E_WLGES = "";
				oReceiverData[i].R_VKOSTL = "";
			}
			this.getView().byId("oReceiver").getModel().refresh();
		} else if (zhmmaim.util.Formatter.GetElementById(oContextId) === 'SenderPI' || zhmmaim.util.Formatter.GetElementById(oContextId) ===
			'ReceiverPI') {
			if (this.getView().byId("FISCAl")) { //Create
				var oContextPOSID = oEvent.getSource().getValue(),
					oContextGJAHR = this.getView().byId("FISCAl").getValue();

				//Remove Special Charater & Change to UpperCase when Input POSID
				oContextPOSID = oContextPOSID.toUpperCase();
				oEvent.getSource().setValue(oContextPOSID);
				oContextPOSID = oContextPOSID.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');

				var oModel = new sap.ui.model.odata.ODataModel(
					sServiceUrl, true);
				var oJsonModel = new sap.ui.model.json.JSONModel();
				oModel.read("IMPIBudget(POSID='" + oContextPOSID + "',GJAHR='" + oContextGJAHR + "')", null, null, false,
					function(oData, response) {
						oJsonModel.setData(oData);
					});

				this.getView().byId("BudgetTransferCommons").setModel(oJsonModel);

				var POST1 = this.getView().byId("BudgetTransferCommons").getModel().getData().POST1,
					BUD_AMT = this.getView().byId("BudgetTransferCommons").getModel().getData().BUD_AMT,
					BAL_AMT = this.getView().byId("BudgetTransferCommons").getModel().getData().BAL_AMT,
					KOSTL = this.getView().byId("BudgetTransferCommons").getModel().getData().KOSTL;

				var PITransferCells = oEvent.getSource().getParent().getCells();
				//console.log(PITransferCells)

				PITransferCells[1].setValue(POST1);
				PITransferCells[2].setValue(BUD_AMT);
				PITransferCells[3].setValue(BAL_AMT);
				PITransferCells[4].setValue("");
				PITransferCells[5].setValue("");
				PITransferCells[6].setValue(KOSTL);

			} else if (sap.ui.getCore().byId("FISCAl")) { //Inbox
				console.log('inbox')
				var oContextPOSID = oEvent.getSource().getValue(),
					oContextGJAHR = sap.ui.getCore().byId("FISCAl").getValue();

				//Remove Special Charater & Change to UpperCase when Input POSID
				oContextPOSID = oContextPOSID.toUpperCase();
				oEvent.getSource().setValue(oContextPOSID);
				oContextPOSID = oContextPOSID.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');

				var oModel = new sap.ui.model.odata.ODataModel(
					sServiceUrl, true);
				var oJsonModel = new sap.ui.model.json.JSONModel();
				oModel.read("IMPIBudget(POSID='" + oContextPOSID + "',GJAHR='" + oContextGJAHR + "')", null, null, false,
					function(oData, response) {
						oJsonModel.setData(oData);
					});

				var POSID = oJsonModel.getData().POSID,
					POST1 = oJsonModel.getData().POST1,
					BUD_AMT = oJsonModel.getData().BUD_AMT,
					BAL_AMT = oJsonModel.getData().BAL_AMT,
					KOSTL = oJsonModel.getData().KOSTL;

				var PITransferCells = oEvent.getSource().getParent().getCells();

				PITransferCells[0].setValue(POSID);
				PITransferCells[1].setValue(POST1);
				PITransferCells[2].setValue(BUD_AMT);
				PITransferCells[3].setValue(BAL_AMT);
				PITransferCells[4].setValue("");
				PITransferCells[5].setValue("");
				PITransferCells[6].setValue(KOSTL);
			}
		}
	},

	onTRSum: function(oEvent) {
		var oContext = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oEvent.getParameter("liveValue")),
			oContextId = oEvent.getSource().getId(),
			oContextTableId = oEvent.getSource().getParent().getId(),
			oTOTCells = oEvent.getSource().getParent().getCells();

		var floatValue = zhmmaim.util.Formatter.CurrencyFormatter(oContext);

		var oTableC = zhmmaim.util.Formatter.GetElementById(oContextTableId),
			oIndex = oEvent.getSource().getParent().getIndex(),
			nSum = 0;

		if (this.getView().byId(oTableC)) {
			var oTable = this.getView().byId(oTableC);
		} else if (sap.ui.getCore().byId(oTableC)) {
			var oTable = sap.ui.getCore().byId(oTableC);
		}

		/*TextField Number Validation - Sender_EndingBalance / Receiver_EndingBalance*/
		oEvent.getSource().setValue(floatValue);
		if (zhmmaim.util.Formatter.GetElementById(oContextId) === "SenderTrans") {
			/*Calculate the New Amount*/
			oContextTransfer = oContext;
			//console.log(oTable.getContextByIndex(oIndex).getProperty("/"));
			oContextBudget = oTable.getContextByIndex(oIndex).getProperty("S_C_WLGES");
			//console.log(oContextBudget);

			if (oContextTransfer === "") {
				oContextTransfer = 0;
			}
			if (oContextBudget === "") {
				oContextBudget = 0;
			}

			nSum = parseFloat(oContextBudget) - parseFloat(oContextTransfer);
			oTOTCells[5].setValue(nSum);
		} else if (zhmmaim.util.Formatter.GetElementById(oContextId) === "ReceiverTrans") {
			/*Calculate the New Amount*/
			oContextTransfer = oContext;
			oContextBudget = oTable.getContextByIndex(oIndex).getProperty("R_C_WLGES");

			if (oContextTransfer === "") {
				oContextTransfer = 0;
			}
			if (oContextBudget === "") {
				oContextBudget = 0;
			}

			nSum = parseFloat(oContextBudget) + parseFloat(oContextTransfer);
			oTOTCells[5].setValue(nSum);
		}

		//Initialize the Approval Path - only use in Creation Screen
		if (this.getView().byId("oIOCreateWF")) { //Create
			if (this.getView().byId("oIOCreateWF").getModel()) {
				this.getView().byId("oIOCreateWF").getModel().setData("");
			}
			if (this.getView().byId("oIOCreateCP").getModel()) {
				this.getView().byId("oIOCreateCP").getModel().setData("");
			}
		} else {

		}

		//Sum Amount Validation
		var oCurBalance = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oTOTCells[3].getValue()),
			oTransfer = zhmmaim.util.Formatter.ReplaceCurrencyFormatter(oTOTCells[4].getValue());

		if (oCurBalance > 0 && oTransfer > 0 && nSum < 0) {
			// sap.m.MessageBox.alert("Your ending Balance is " + oTOTCells[5].getValue() + ". Ending Balance should not be the negative value, Try Again.", {
			//     title: "Warning",
			//     onClose: null  ,
			//     styleClass: "sapThemeNegativeText" ,
			//     initialFocus: null,
			//     textDirection: sap.ui.core.TextDirection.Inherit
			//     });

			sap.m.MessageToast.show("Your ending Balance is " + oTOTCells[5].getValue() + ". Ending Balance should not be the negative value, Try Again.");
			oTOTCells[4].setValue(""); //Transfer Value set 0
			oTOTCells[5].setValue(""); //Ending Balance Value set 0
		}
	},

	handleTypeMissmatch: function(oEvent) {
		//sap.m.MessageBox.alert("File Type not supported. Only file types supported are *.jpg,*.bmp,*.gif,*.tif,*.png.", {
		//     title: "Warning",
		//     onClose: null  ,
		//     styleClass: "sapThemeNegativeText" ,
		//     initialFocus: null,
		//     textDirection: sap.ui.core.TextDirection.Inherit
		//     });
		sap.m.MessageToast.show("File Type not supported. Only file types supported are *.jpg,*.bmp,*.gif,*.tif,*.png.");
	}
};