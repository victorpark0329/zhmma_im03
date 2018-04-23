sap.ui.controller("zhmmaim.controller.CreateMenu", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.InboxMenu
*/
	/*onInit: function() {
	},
*/
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.InboxMenu
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.InboxMenu
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.InboxMenu
*/
//	onExit: function() {
//
//	},

	getIconFlag:function(status)
	{
		  if (status === "New") {       
		  	return "sap-icon://flag";       
		  } else {
        	return "sap-icon://flag";       
		  }
        
    }, 
	
	onNavBack : function(oEvent) {
		// This is only relevant when running on phone devices
		sap.ui.core.UIComponent.getRouterFor(this).navTo("_dashboard");
		
	},
	
	onMenuPress : function(oEvent){
		var ToPageId = oEvent.getParameter("listItem").sId.split('--')[1];
		sap.ui.core.UIComponent.getRouterFor(this).navTo(ToPageId);
		}

});