sap.ui.controller("zhmmaim.controller.DpOutbox", {

	onInit: function() {
		//oData List
		var sServiceUrl ="http://haeccd00.hmma.hmgc.net:8000/sap/opu/odata/SAP/Z_IM_APPROVAL_SRV/";
		var oModel = new sap.ui.model.odata.ODataModel(
				sServiceUrl,true);
		var oJsonModel = new sap.ui.model.json.JSONModel();
		
		oModel.read("IMOutboxDeptInfo?",null,["$filter=PERNR eq 'IMUSER'"],false,
				function(oData,response){
			oJsonModel.setData(oData);
		});
		this.getView().setModel(oJsonModel);
	},

});