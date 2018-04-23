jQuery.sap.declare("zhmmaim.Component");
jQuery.sap.require("zhmmaim.MyRouter");
jQuery.sap.require("jquery.sap.storage");

sap.ui.core.UIComponent
	.extend(
		"zhmmaim.Component", {
			metadata: {
				name: "HMMA Investment APP",
				version: "1.0",
				includes: [],
				dependencies: {
					libs: ["sap.m", "sap.ui.layout", "sap.ui.table", "sap.ui.commons"],
					components: []
				},
				rootView: "zhmmaim.view.App",

				routing: {
					config: {
						routerClass: "zhmmaim.MyRouter",
						viewType: "XML",
						viewPath: "zhmmaim.view",
						targetAggregation: "detailPages",
						clearTarget: false
					},
					routes: [
						/*Login Page(Full Screen)*/
						{
							pattern: "",
							name: "_login",
							view: "login",
							targetAggregation: "pages",
							targetControl: "idAppControl"
						},
						/*Dashboard Page(Full Screen)*/
						{
							pattern: "Dashboard",
							name: "_dashboard",
							view: "dashboard",
							targetAggregation: "pages",
							targetControl: "idAppControl"
						},
						/*Inbox Page(Split Screen)*/
						{
							pattern: "Inbox",
							name: "_IMinbox",
							view: "PvInbox",
							targetAggregation: "pages",
							targetControl: "idAppControl"
						},
						/*Create Page(Split Screen)*/
						{
							pattern: "Create",
							name: "_IMcreate",
							view: "SplitContainer",
							targetAggregation: "pages",
							targetControl: "idAppControl",
							subroutes: [
								/*Create Menu(Master)*/
								{
									pattern: "Create",
									name: "createMenu",
									view: "CreateMenu",
									targetAggregation: "masterPages",
									targetControl: "idSplitContainerControl",
									subroutes: [
										/*Create Information(Detail)-ABP Budget Planning*/
										{
											pattern: "Create/BudgetPlanning",
											name: "abpplanning",
											view: "BudgetPlanning",
											targetAggregation: "detailPages"
										},
										/*Create Information(Detail)-Budget Transfer*/
										{
											pattern: "Create/BudgetTransfer",
											name: "budgettransfer",
											view: "BudgetTransfer",
											targetAggregation: "detailPages"
										},
										/*Create Information(Detail)-IO Create & Release*/
										{
											pattern: "Create/IOCreateRelease",
											name: "iocreate",
											view: "IOCreateRelease",
											targetAggregation: "detailPages"
										},
										/*Create Information(Detail)-PR Create*/
										{
											pattern: "Create/CreatePR",
											name: "createpr",
											view: "CreatePR",
											targetAggregation: "detailPages"
										},
										/*Create Information(Detail)-Complete IO*/
										{
											pattern: "Create/CompleteIO",
											name: "completeio",
											view: "CompleteIO",
											targetAggregation: "detailPages"
										}
									]
								}
							]
						},
						/*Inquiry Page(Split Screen)*/
						{
							pattern: "Inquiry",
							name: "_IMinquiry",
							view: "SplitContainer",
							targetAggregation: "pages",
							targetControl: "idAppControl",
							subroutes: [
								/*Inquiry Menu(Master)*/
								{
									pattern: "Inquiry",
									name: "inquiryMenu",
									view: "InquiryMenu",
									targetAggregation: "masterPages",
									targetControl: "idSplitContainerControl",
									subroutes: [
										/*Inquiry Information(Detail)-ABP Budget Status*/
										{
											pattern: "Inquiry/BudgetStatus",
											name: "abpbudgetstatus",
											view: "BudgetStatus",
											targetAggregation: "detailPages"
										},

										/*Inquiry Information(Detail)-Budget Transfer Status 10.31.2016 Victor*/
										{
											pattern: "Inquiry/BudgetTransferStatus",
											name: "budgettransferstatus",
											view: "BudgetTransferStatus",
											targetAggregation: "detailPages"
										},

										/*Inquiry Information(Detail)-PI/IO Status*/
										{
											pattern: "Inquiry/PIIOStatus",
											name: "piiostatus",
											view: "PIIOStatus",
											targetAggregation: "detailPages"
										},
										/*Inquiry Information(Detail)-PR Status*/
										{
											pattern: "Inquiry/PRStatus",
											name: "prstatus",
											view: "PRStatus",
											targetAggregation: "detailPages"
										}
									]
								}
							]
						}
					]
				}
			},

			init: function() {
				sap.ui.core.UIComponent.prototype.init.apply(this,
					arguments);
				var mConfig = this.getMetadata().getConfig();
				var rootPath = jQuery.sap.getModulePath("zhmmaim");

				this.getRouter().initialize();

				var oJQueryStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session);

				if (!oJQueryStorage.get("UserInfo")) { //session not exists
					$.ajax({
						type: "GET",
						url: "/sap/public/bc/icf/logoff"
					});
				} else {
					// ;
				}
			}
		});