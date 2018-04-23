jQuery.sap.declare("zhmmaim.util.AttachPrint");

zhmmaim.util.AttachPrint = {
	/*
	 *
	 * Generate & Save PDF File
	 *
	 * */

	generatePDFReal: function(pDivName, pCallback) {
		var pageWidth = 815,
			pageHeight = 990;
		var ppp = new jsPDF('p', 'px', 'letter'); // 215.9 mm ï¿½ 279.4 mm

		var pages = document.getElementsByClassName(pDivName);
		var currentPageIdx = 0;
		var numPages = pages.length;

		for (var i = 0; i < numPages; i++) {
			pages[i].style.display = "block";
		}

		function renderPage() {
			div2img(pages[currentPageIdx], function(pImgData) {
				ppp.addImage(pImgData, 'JPEG', 0, 10);
				currentPageIdx++;
				if (currentPageIdx < numPages) {
					ppp.addPage();
					renderPage();
				} else {
					for (var i = 0; i < numPages; i++) {
						pages[i].style.display = "none";
					}
					pCallback(ppp);
				}
			}, pageWidth, pageHeight);
		}

		setTimeout(function() {
			renderPage();
		}, 1000);
	}

	,
	preparePDF: function(pageType) {

		var pageWidth = 815,
			pageHeight = 990;

		function updateTbl(pTblName) {
			var xTable = sap.ui.getCore().byId("print" + pTblName);
			xTable.removeAllColumns();
			xTable.removeAllItems();

			var srcTableColumns = sap.ui.getCore().byId("o" + pTblName).getColumns();
			srcTableColumns.forEach(function(pCol) {
				xTable.addColumn(new sap.m.Column({
					header: new sap.m.Label({
						text: pCol.getHeader().getText()
					})
				}));
			});

			var srcTableItems = sap.ui.getCore().byId("o" + pTblName).getItems();
			var numTableItems = srcTableItems.length;
			srcTableItems.forEach(function(pItems, idx) {
				if (idx + 1 < numTableItems) {
					var tItemCell = [];

					pItems.getCells().forEach(function(pItemCell) {
						tItemCell.push(new sap.m.Text({
							text: pItemCell.getText()
						}));
					});

					xTable.addItem(new sap.m.ColumnListItem({
						cells: tItemCell
					}));
				}
			});
		}
		//Create PR
		function copyTable2(tblName, minRows) {
			var xTable = sap.ui.getCore().byId("print" + tblName);
			var xModel = xTable.getModel();

			if (xModel == null) {
				xModel = new sap.ui.model.json.JSONModel();
				xTable.setModel(xModel);
			}

			xTable.removeAllColumns();
			xTable.setShowNoData(false);

			var oCols = sap.ui.getCore().byId("o" + tblName).getColumns();
			var tColWidth = (pageWidth * 0.75 / oCols.length);
			oCols.forEach(function(pCol, idx) {
				if (idx == 0) {
					mColWidth = 120;
				} else if (idx == 1) {
					mColWidth = 150;
				} else {
					mColWidth = 80;
				}
				var tpl = "{C" + idx + "}";
				xTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: pCol.getLabel().getText()
					}),
					template: new sap.ui.commons.TextView({
						text: "{C" + idx + "}"
					}),
					width: mColWidth + "px"
				}));
			});
			xTable.setFixedColumnCount(xTable.getColumns().length);

			var oRows = sap.ui.getCore().byId("o" + tblName).getRows();
			var tRowData = [];
			oRows.forEach(function(pRow) {
				var oCells = pRow.getCells();
				var tRow = {};
				oCells.forEach(function(pCell, idx) {
					tRow["C" + idx] = pCell.getValue();
				});
				tRowData.push(tRow);
			});

			xModel.setProperty("/" + tblName, tRowData);
			xTable.bindRows("/" + tblName);

			if (minRows)
				xTable.setVisibleRowCount(minRows);
			else
				xTable.setVisibleRowCount(oRows.length);
		}

		function copyTable(tblName, minRows) {
			var xTable = sap.ui.getCore().byId("print" + tblName);
			var xModel = xTable.getModel();

			if (xModel == null) {
				xModel = new sap.ui.model.json.JSONModel();
				xTable.setModel(xModel);
			}

			xTable.removeAllColumns();
			xTable.setShowNoData(false);

			var oCols = sap.ui.getCore().byId("o" + tblName).getColumns();
			var tColWidth = (pageWidth * 0.75 / oCols.length);
			oCols.forEach(function(pCol, idx) {
				var tpl = "{C" + idx + "}";
				xTable.addColumn(new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: pCol.getLabel().getText()
					}),
					template: new sap.ui.commons.TextView({
						text: "{C" + idx + "}"
					}),
					width: tColWidth + "px"
				}));
			});
			xTable.setFixedColumnCount(xTable.getColumns().length);

			var oRows = sap.ui.getCore().byId("o" + tblName).getRows();
			var tRowData = [];
			oRows.forEach(function(pRow) {
				var oCells = pRow.getCells();
				var tRow = {};
				oCells.forEach(function(pCell, idx) {
					tRow["C" + idx] = pCell.getValue();
				});
				tRowData.push(tRow);
			});

			xModel.setProperty("/" + tblName, tRowData);
			xTable.bindRows("/" + tblName);

			if (minRows)
				xTable.setVisibleRowCount(minRows);
			else
				xTable.setVisibleRowCount(oRows.length);
		}

		function checkActualNumRows(tblName) {
			var numRows = 0;
			var oRows = sap.ui.getCore().byId("o" + tblName).getRows();

			oRows.forEach(function(pRow) {
				var chkData = false;
				var oCells = pRow.getCells();
				oCells.forEach(function(pCell) {
					// IG Moon
					// if (pCell.getValue() && pCell.getValue().trim().length > 0) chkData = true;
					var var_pCell = null;
					try {
						var_pCell = pCell.getValue();
					} catch (e) { }
					if (var_pCell) {
						if (var_pCell.trim().length > 0) chkData = true;
					}
				});
				if (chkData) numRows++;
			});

			return numRows;
		}

		if (pageType === "IOCreationDetail") { // IO Creation Print

			function dateFormatter(num) {
				if (num) {
					num = num.trim();
					if (num.length == 8) {
						return num.substring(0, 2) + "/" + num.substring(2, 4) + "/" + num.substring(4, 8);
					}
				}
				return "MM/dd/yyyy";
			}

			updateTbl("CreateWF");
			updateTbl("IOCreateCP");

			// update contents
			{
				// Header
				document.getElementsByClassName("printClassUSER4")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("USER4").getValue());
				document.getElementsByClassName("printClassYear")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("Year").getValue());
				document.getElementsByClassName("printClassPOSID")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("POSID").getValue());
				document.getElementsByClassName("printClassPOSIDD")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("POSIDD").getValue());
				document.getElementsByClassName("printClassKTEXT")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("KTEXT").getValue());
				document.getElementsByClassName("printClassPURPO")[0].childNodes[0].innerHTML = sap.ui.getCore().byId("PURPO").getValue();
			}

			{
				// IO-Basic
				document.getElementsByClassName("printClassWERKS")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("WERKS").getValue());
				document.getElementsByClassName("printClassWERKSD")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("WERKSD").getValue());

				document.getElementsByClassName("printClassKOSTV")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("KOSTV").getValue());
				document.getElementsByClassName("printClassKOSTVD")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("KOSTVD").getValue());

				document.getElementsByClassName("printClassAKSTL")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("AKSTL").getValue());
				document.getElementsByClassName("printClassAKSTLD")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("AKSTLD").getValue());

				document.getElementsByClassName("printClassUser0")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("USER0").getValue());
				document.getElementsByClassName("printClassUser1")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("USER1").getValue());
				document.getElementsByClassName("printClassUser2")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("USER2").getValue());
			}

			{
				// IO Schedule
				document.getElementsByClassName("printClassUSER5")[0].childNodes[0].setAttribute("value", dateFormatter(sap.ui.getCore().byId("USER5")
					.getValue()));
				document.getElementsByClassName("printClassUSER7")[0].childNodes[0].setAttribute("value", dateFormatter(sap.ui.getCore().byId("USER7")
					.getValue()));
				document.getElementsByClassName("printClassPODATE")[0].childNodes[0].setAttribute("value", dateFormatter(sap.ui.getCore().byId(
					"PODATE").getValue()));
				document.getElementsByClassName("printClassGRDATE")[0].childNodes[0].setAttribute("value", dateFormatter(sap.ui.getCore().byId(
					"GRDATE").getValue()));
				document.getElementsByClassName("printClassINSDATE")[0].childNodes[0].setAttribute("value", dateFormatter(sap.ui.getCore().byId(
					"INSDATE").getValue()));
				document.getElementsByClassName("printClassUSER8")[0].childNodes[0].setAttribute("value", dateFormatter(sap.ui.getCore().byId("USER8")
					.getValue()));
			}

			{
				// IM
				document.getElementsByClassName("printClassIVPRO")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("IVPRO").getValue());
				document.getElementsByClassName("printClassIVPROD")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("IVPROD").getValue());

				document.getElementsByClassName("printClassIZWEK")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("IZWEK").getValue());
				document.getElementsByClassName("printClassIZWEKD")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("IZWEKD").getValue());

				document.getElementsByClassName("printClassANLKL")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("ANLKL").getValue());
				document.getElementsByClassName("printClassANLKLD")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("ANLKLD").getValue());

				document.getElementsByClassName("printClassCapitalDate")[0].childNodes[0].setAttribute("value", dateFormatter(sap.ui.getCore().byId(
					"AKTIV").getValue()));
				document.getElementsByClassName("printClassTXT50")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("TXT50").getValue());
			}

		} else if (pageType === "PRCreationDetail") { // PR Creation Print

			function dateFormatter(num) {
				if (num) {
					num = num.trim();
					if (num.length == 8) {
						return num.substring(4, 6) + "/" + num.substring(6, 8) + "/" + num.substring(0, 4);
					}
				}
				return "MM/dd/yyyy";
			}

			updateTbl("CreateWF");
			updateTbl("IOCreateCP");

			if (document.getElementsByClassName("printClassWERKS")[0] != undefined) {
				// Header
				document.getElementsByClassName("printClassAUFNR")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("AUFNR").getValue());
				document.getElementsByClassName("printClassAUFNRD")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("AUFNRD").getValue());
				document.getElementsByClassName("printClassWERKS")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("WERKS").getValue());
				document.getElementsByClassName("printClassWERKSD")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("WERKSD").getValue());
				document.getElementsByClassName("printClassLFDAT")[0].childNodes[0].setAttribute("value", dateFormatter(sap.ui.getCore().byId("LFDAT")
					.getValue()));
				document.getElementsByClassName("printClassKTEXT")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("KTEXT").getValue());
				document.getElementsByClassName("printClassPURPO")[0].childNodes[0].innerHTML = sap.ui.getCore().byId("PURPO").getValue();
			} else {
				// Header
				document.getElementsByClassName("printClassAUFNR")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("AUFNR").getValue());
				document.getElementsByClassName("printClassAUFNRD")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("AUFNRD").getValue());
				document.getElementsByClassName("printClassLFDAT")[0].childNodes[0].setAttribute("value", dateFormatter(sap.ui.getCore().byId("LFDAT")
					.getValue()));
				document.getElementsByClassName("printClassKTEXT")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("KTEXT").getValue());
				document.getElementsByClassName("printClassPURPO")[0].childNodes[0].innerHTML = sap.ui.getCore().byId("PURPO").getValue();
			}

			copyTable("SupplierTB");
			copyTable2("ItemTB", checkActualNumRows("ItemTB"));

		} else if (pageType === "BudgetTransferDetail") { // Budget Transfer Print

			updateTbl("CreateWF");
			updateTbl("IOCreateCP");

			{
				// Header
				document.getElementsByClassName("printClassKTEXTLabel")[0].innerHTML = sap.ui.getCore().byId("KTEXT").getValue();

				document.getElementsByClassName("printClassIOTypeSelect")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("IOTypeSelect")
					.getSelectedItem().getText());
				document.getElementsByClassName("printClassFISCAl")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("FISCAl").getValue());
				document.getElementsByClassName("printClassMONTH")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("MONTH").getSelectedItem()
					.getText());

				document.getElementsByClassName("printClassREASON")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("REASON").getValue());
				document.getElementsByClassName("printClassREASOND")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("REASOND").getValue());
				document.getElementsByClassName("printClassKTEXT")[0].childNodes[0].setAttribute("value", sap.ui.getCore().byId("KTEXT").getValue());
				document.getElementsByClassName("printClassPURPO")[0].childNodes[0].innerHTML = sap.ui.getCore().byId("PURPO").getValue();
			}

			copyTable("Sender", checkActualNumRows("Sender"));
			copyTable("Receiver", checkActualNumRows("Receiver"));

		} else {
			console.log("NOT DEFINED PAGE TYPE!");
		}

	}

	,
	generatePDF: function(oEvent) {
		sap.ui.core.BusyIndicator.show(10);
		if (oEvent.getSource().getParent().sId.indexOf('Dialog') > -1) {
			oDetailId = oEvent.getSource().getParent().getContent()[0].sId;
		} else {
			oDetailId = oEvent.getSource().getParent().getParent().sId;
		}
		var tFileName = oDetailId + "_" + sap.ui.getCore().byId("KTEXT").getValue() + "_" +
			sap.ui.getCore().byId("BGTDOC").getText() + ".pdf";
		zhmmaim.util.AttachPrint.preparePDF(oDetailId);
		zhmmaim.util.AttachPrint.generatePDFReal("hiddenPrintPage", function(pdfData) {
			pdfData.save(tFileName);
			sap.ui.core.BusyIndicator.hide();
		});

	}

	/*
	 *
	 * Generate & Attach PDF File
	 *
	 * */

	,
	attachPDF: function(oDetailId, callBack) {
		//sap.ui.getCore().byId("oIconTab").setSelectedKey("workflowInfo");

		zhmmaim.util.AttachPrint.preparePDF(oDetailId);
		zhmmaim.util.AttachPrint.generatePDFReal("hiddenPrintPage", function(pdfData) {
			var doc = pdfData.output();
			var binaryString = btoa(doc);
			callBack(binaryString);
		});

	}

};