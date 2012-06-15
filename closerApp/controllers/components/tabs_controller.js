// create a new Tabs class
$.Controller.extend('Closer.Controllers.Components.Tabs',
{
  instance:null,
  Tabs:$("#Nav ul"),
  
  setup: function() {

    var self = this;
    OpenAjax.hub.subscribe('Core.Loaded', function() {
      
      self.Tabs.closer_components_tabs();
      self.instance = self.Tabs.controller();

      // window.tabs = self.instance;
      return self.instance;
    });
  },

  /**
   *  This function will return the singleton instance of Tundra.History
   *  @return {Tundra.History} instance of Tundra.History (prototype)
   */
  getInstance: function() {
    if (this.instance == null) {
      return this.setup();
    }
    return this.instance;
  },

  
  // helper function finds the tab for a given li
  tab : function(li){
    return $(li.find("a").attr("href"))
  },




  drawMenu: function() {
    // console.log('DRAW MENU!!!????');
    // Using settings json draw each menu item while checking permissions
    var menuItems = Closer.Controllers.Application.settings.menuList;
    $("#Nav ul").html("");

    $.each( menuItems, function(key, item) {
      if ( Closer.Controllers.Page.Login.checkPermission( item.internalName ) ) {
        $("#Nav ul").append($.View("//closerApp/views/components/menu_item", { item: item }));
      }
    });

  }
},
{

  currentState:null,

  // initialize widget
  init : function(el){
    // OpenAjax.hub.publish('Tabs loaded');
    // this.checkAuth();
  },



  destroyTabs : function(){
    this.element.html('');
  },

  hideTabs:function(){
    // this.element.find('li').find;
    //
    $.each(this.element.find('li a'), function(k,v){
      $( $(this).attr('href') ).hide();
    });
  },

  // hides old active tab, shows new one
  "li click" : function(el, ev){
    ev.preventDefault();

    if ( Closer.Controllers.Page.Login.checkAuth() ) { 

      OpenAjax.hub.publish("tab.load", { tab: $(el) });
    }
  },

  "tab.load subscribe": function(event, data) {

    var currentState={};
    
    if ( $.type(data['tab']) === "string" ) {
      currentState.tab = data['tab'];
      data['tab'] = $("#" + data['tab'] + "TabLink").parent()
    }
    else{
      currentState.tab = data.tab.data('internalName');
    }

    // console.warn(this.find('.active'), "ACTIVE TAB the one we are leaving");
    // console.log(data['tab'], "ACTIVE TAB");

    //Publish the tabname.destroyed event so page can unload object that are not needed
    if( this.find('.active a').length > 0 ){
      OpenAjax.hub.publish(this.find('.active a').attr('id').replace(/TabLink$/, '') + ".destroyed");
    }
    
    // Let the application know the tab has changed
    OpenAjax.hub.publish('tab.changed', data);
    currentState.historyType='tab.change';
    this.currentState=currentState;

    // Set the current state of the application
    // console.warn(data, 'state of the application');
    
    Closer.Controllers.Components.Tabs.tab(this.find('.active').removeClass('active')).hide();

    //hide all to be safe
    this.hideTabs();

    Closer.Controllers.Components.Tabs.tab(data['tab'].addClass('active')).show();

    switch(Closer.Controllers.Components.Tabs.tab(data['tab']).attr("id")) {
      
      case "enquiriesTab":
        OpenAjax.hub.publish('enquiriesTab.Focus');
        break;
      
      case "searchTab":
        OpenAjax.hub.publish('searchTab.Focus');
        break;
      
      case "manageQueuesTab":
        OpenAjax.hub.publish('manageQueuesTab.Focus');
        break;
      
      case "queueReportTab":
        OpenAjax.hub.publish('queueReportTab.Focus');
        break;
      
      case "consultantSetupTab": 
        OpenAjax.hub.publish('consultantSetupTab.Focus');
        break;

      case "loginTab":
        OpenAjax.hub.publish('loginTab.Focus');
        break;
    }

    if( $.type( data.callback ) === "function"){
      data.callback();
    }
  },

  checkAuth: function(attribute){
    if ( Closer.Controllers.Page.Login.checkAuth() ) {

      this.Class.drawMenu();
      

      // activate the first tab
      this.element.children("li:first").addClass('active');

      // hide the other tabs
      var tab = Closer.Controllers.Components.Tabs.tab;
    // "li:gt(0)"
      this.element.children().each(function(){
        tab($(this)).hide()
      });

    }
  },

  "Auth.Success.Ready subscribe":function(called, data){
    this.checkAuth();
  },


  // HELPER METHODS
  getCurrent:function(){
    return this.currentState.tab;
  }

});