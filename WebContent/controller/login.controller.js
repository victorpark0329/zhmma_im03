jQuery.sap.require("jquery.sap.storage"); 
jQuery.sap.require("sap.m.MessageStrip");
jQuery.sap.require("zhmmaim.util.Commons");
jQuery.sap.require("zhmmaim.util.APP_CONTAINS");

sap.ui.controller("zhmmaim.controller.login", {
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.login
*/
  onInit: function() {
	  var usernameInput = this.getView().byId("username"),
	  	passwordInput = this.getView().byId("password");

	  oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);

	  /*Redirect to dashboard when user access to index.html with userInfo*/
      var oUserInfo = oJQueryStorage.get("UserInfo");
      if (oUserInfo != null) {
    	  /*sap.ui.core.UIComponent.getRouterFor(this).navTo("_dashboard",{
	        currentView : this.getView()
	      }, true);*/
         window.location = "index.html#/Dashboard";
         return;
      }
      
      /*using enter key to login*/
	  usernameInput.onsapenter = (function(oEvent){
		  this.UserAuthentication();
	  }).bind(this);
	  
	  passwordInput.onsapenter = (function(oEvent){
		  this.UserAuthentication();
	  }).bind(this);
  },

/**
* Similar to onAfterRendering, but this hook is invoked before the controllers View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.login
*/
//  onBeforeRendering: function() {
//
//  },

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.login
*/
//  onAfterRendering: function() {
//
//  },

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.login
*/
//  onExit: function() {
//
//  },
  
  /*
   * Validation User Info and save User Info in the jQueryStorage to use until log-off
   * */
  UserAuthentication: function(oEvent) {
    /*
     *Validation Login Info Check(ID/Password)
     * message = 0 : Login Info Exist
     * message != 0 : Login Info Not Exist / Print the Message to POPUP
     *   
     * */
	  
    var oModel = new sap.ui.model.odata.ODataModel(
        sServiceUrl,true); 
    var oJsonModel = new sap.ui.model.json.JSONModel();

    var user = this.byId("username").getValue(),
        password = this.byId("password").getValue();
    
    function hex2a(hexx) {
    	var str = '';
        for (var i = 0; i < hexx.length; i++)
            str += hexx.charCodeAt(i).toString(16);
        return str;
    }
   // console.log(hex2a(password).toUpperCase());
    
    var b64Password = btoa(password);
    oModel.read("/IMLogonCheck(USER_ID='"+user+"',PASSWORD='"+hex2a(password).toUpperCase()+"')",null,null,false,
        function(oData,response){
      oJsonModel.setData(oData);
    });
    
    sap.ui.getCore().setModel(oJsonModel);

    var LoginMessage = sap.ui.getCore().getModel().getProperty("/MESSAGE");
    var SUBRC = sap.ui.getCore().getModel().getProperty("/SUBRC");

    if(SUBRC === "0"){//Login Info Check Success
      /*
       * JQueryStorage : Save Login User Info
       * Go to the Next Page
       *
       */
      var LoginModel = new sap.ui.model.json.JSONModel([]);
      LoginModel.UserInfo = oJsonModel.getData();
      //console.log("LoginModel.UserInfo = "+ LoginModel.UserInfo);

      oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);
      oJQueryStorage.put("UserInfo",LoginModel.UserInfo);

      var oUserInfo = oJQueryStorage.get("UserInfo");

      var items = [];
      for(var key in oUserInfo){
        items.push(oUserInfo[key]);
      }

     /* console.log("items="+items);*/
      oJsonModel.setData(items);
      /*console.log("oJsonModel="+oJsonModel);*/

      /*if success to login, call the userInfo*/
      sap.ui.getCore().byId("oAppShellUser").setUsername(oUserInfo.NAME_TEXT);

      sap.ui.core.UIComponent.getRouterFor(this).navTo("_dashboard",{
        currentView : this.getView()
      }, true);
      location.reload(true);
      
    }else{//Login Info Check Fail
      /*Print the Message to Message-Strip*/
    	//alert(LoginMessage);
    	this.showMsgStrip(LoginMessage);
    }
  },
  
  PasswordRecovery:function(){
	//Relocation to Password Recovery  
	location.href = "http://myess.hmmausa.com:59080/AIMS/aims_change_request.jsp?syslink=ASXS687x3c6LB9aBqxqlx7d81A527446";  
  },

  /*Function(goDashboard) - Validation User Info And Go to the dashboard View*/
  goDashboard : function() {
    var user = this.byId("username").getValue(),
      password = this.byId("password").getValue();
    if(user == "admin" && password == "admin"){
      sap.ui.core.UIComponent.getRouterFor(this).navTo("_dashboard",{
        currentView : this.getView()
      }, true);
    }
  },
  
	/*
	 * Message
	 * */
  
	/*Create Message Strip - sapui5 library 1.30 update */
	  showMsgStrip: function(value){
	    var oMs = sap.ui.getCore().byId("msgStrip");
	    if(oMs){
	      oMs.destroy();
	    }
	    this._generateMsgStrip(value);
	  }, 
	
	  _generateMsgStrip:function(value){
	    var oVC = this.getView().byId("oVerticalContent"),
	    oMsgStrip = new sap.m.MessageStrip("msgStrip",{
	        text:value,
	        showCloseButton:true,
	        showIcon:false,
	        type:"Warning"
	      });
	      oVC.addContent(oMsgStrip);
	  },
});