sap.ui.controller("zhmmaim.controller.dashboard", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.dashboard
*/

	onInit: function() {

		// IG Moon 9/27/2016
			oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
			if(!oJQueryStorage.get("UserInfo")){ //session not exists
				window.location = "index.html"; 
			}
						
		/*Email URL decode to redirect to inbox document page*/
        function getParameterByName(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }
                     
        var oRedirectionInfo = null;
        try {
               var encodedData = getParameterByName("r");
               oRedirectionInfo = JSON.parse(atob(encodedData));                    
        } catch (e) {
               oRedirectionInfo = null;
        }
        
        if (oRedirectionInfo != null) {
               var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
               oStorage.put("redirectionInfo", oRedirectionInfo);
        } else {
               var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
               oRedirectionInfo = oStorage.get("redirectionInfo");         
        }
        
        if (oRedirectionInfo != null) {
               if (oRedirectionInfo.pType == "Inbox") {
                     window.location = "index.html#/Inbox";
               }
        }

	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.dashboard
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.dashboard
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.dashboard
*/
//	onExit: function() {
//
//	},
	/*Function(onNavBack)-To go back to pre Screen*/
	onNavBack : function(oEvent) {
		sap.ui.core.UIComponent.getRouterFor(this).navTo("_login");
	},
	
	goIMMenu : function(oEvent){
		var ToPageId = oEvent.getParameter("id").split('--')[1];
		sap.ui.core.UIComponent.getRouterFor(this).navTo("_"+ToPageId ,{
			currentView : this.getView()
		}, true);
		location.reload(true);
	}
});