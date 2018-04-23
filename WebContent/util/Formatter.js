jQuery.sap.declare("zhmmaim.util.Formatter");

zhmmaim.util.Formatter = {

	uppercaseFirstChar : function(sStr) {
		return sStr.charAt(0).toUpperCase() + sStr.slice(1);
	},

	currencyValue : function (value) {
		return parseFloat(value).toFixed(2);
	},
	
	/*Currency Formatter - Currency Control Function*/
	CurrencyFormatter: function(value){
		return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	},
	
	/*Remove Special Character(except decimal(.) - to Submit Currency Field to SAP*/
	ReplaceCurrencyFormatter : function(value){
		return value.toString().replace(/[^\d\.]+/g,'');
	},
	
	/*Get ElementById*/ 
	GetElementById : function(value){
		if(value.split('--')[1]){
			value = value.split('--')[1].split('-')[0];
		}else{
			value = value.split('-')[0];
		}
		return value;
	},
	
	/*Get sId*/
	GetsId : function(value){
		return value.split('--')[1];
	}
	
};