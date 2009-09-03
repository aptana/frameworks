/**
  *  (c) 2005-2007 Richard Cowin (http://openrico.org)
  *  (c) 2005-2007 Matt Brown (http://dowdybrown.com)
  *
  *  Rico is licensed under the Apache License, Version 2.0 (the "License"); you may not use this
  *  file except in compliance with the License. You may obtain a copy of the License at
  *   http://www.apache.org/licenses/LICENSE-2.0
  **/


if(typeof Rico=='undefined') throw("SimpleGrid requires the Rico JavaScript framework");
if(typeof RicoUtil=='undefined') throw("SimpleGrid requires the RicoUtil Library");
if(typeof RicoTranslate=='undefined') throw("SimpleGrid requires the RicoTranslate Library");

Rico.SimpleGrid = Class.create();

Rico.SimpleGrid.prototype = {

  initialize: function( tableId, options ) {
    Object.extend(this, new Rico.GridCommon);
    this.baseInit(tableId);
    Rico.setDebugArea(tableId+"_debugmsgs");    // if used, this should be a textarea
    Object.extend(this.options, options || {});
    this.tableId = tableId;
    this.createDivs();
    this.hdrTabs=new Array(2);
    for (var i=0; i<2; i++) {
      this.tabs[i]=$(tableId+'_tab'+i);
      this.hdrTabs[i]=$(tableId+'_tab'+i+'h');
      if (i==0) this.tabs[i].style.position='absolute';
      if (i==0) this.tabs[i].style.left='0px';
      this.hdrTabs[i].style.position='absolute';
      this.hdrTabs[i].style.top='0px';
      this.hdrTabs[i].style.zIndex=1;
      this.thead[i]=this.hdrTabs[i];
      this.tbody[i]=this.tabs[i];
      this.headerColCnt = this.getColumnInfo(this.hdrTabs[i].rows);
      if (i==0) this.options.frozenColumns=this.headerColCnt;
    }
    if (this.headerColCnt==0) {
      alert('ERROR: no columns found in "'+this.tableId+'"');
      return;
    }
    this.hdrHt=Math.max(RicoUtil.nan2zero(this.hdrTabs[0].offsetHeight),this.hdrTabs[1].offsetHeight);
    for (var i=0; i<2; i++)
      if (i==0) this.tabs[i].style.top=this.hdrHt+'px';
    this.createColumnArray();
    this.pageSize=this.columns[0].dataColDiv.childNodes.length;
    this.sizeDivs();
    this.attachMenuEvents();
    this.scrollEventFunc=this.handleScroll.bindAsEventListener(this);
    this.pluginScroll();
    if (this.options.windowResize)
      Event.observe(window,"resize", this.sizeDivs.bindAsEventListener(this), false);
  },

  /**
   * Register a menu that will only be used in the scrolling part of the grid.
   * If submenus are used, they must be registered after the main menu.
   */
  registerScrollMenu: function(menu) {
    if (!this.menu) this.menu=menu;
    menu.grid=this;
    menu.showmenu=menu.showSimpleMenu;
    menu.showSubMenu=menu.showSimpleSubMenu;
    menu.createDiv(this.scrollDiv);
  },
  
  handleMenuClick: function(e) {
    this.cancelMenu();
    this.menuCell=RicoUtil.getParentByTagName(Event.element(e),'div');
    this.highlightEnabled=false;
    if (this.hideScroll) this.scrollDiv.style.overflow="hidden";
    if (this.menu.buildGridMenu) this.menu.buildGridMenu(this.menuCell);
    this.menu.showmenu(e,this.closeMenu.bind(this));
  },

  closeMenu: function() {
    if (this.hideScroll) this.scrollDiv.style.overflow="";
    this.highlightEnabled=true;
  },

  sizeDivs: function() {
    if (this.outerDiv.offsetParent.style.display=='none') return;
    this.baseSizeDivs();
    var maxHt=Math.max(this.options.maxHt || this.availHt(), 50);
    var totHt=Math.min(this.hdrHt+this.dataHt, maxHt);
    Rico.writeDebugMsg('sizeDivs '+this.tableId+': hdrHt='+this.hdrHt+' dataHt='+this.dataHt);
    this.dataHt=totHt-this.hdrHt;
    if (this.scrWi>0) this.dataHt+=this.options.scrollBarWidth;
    this.scrollDiv.style.height=this.dataHt+'px';
    var divAdjust=2;
    this.innerDiv.style.width=(this.scrWi-this.options.scrollBarWidth+divAdjust)+'px';
    this.innerDiv.style.height=this.hdrHt+'px';
    totHt+=divAdjust;
    this.resizeDiv.style.height=this.frozenTabs.style.height=totHt+'px';
    this.outerDiv.style.height=(totHt+this.options.scrollBarWidth)+'px';
    this.setHorizontalScroll();
  }

};

if (Rico.Menu) {
Object.extend(Rico.Menu.prototype, {

showSimpleMenu: function(e,hideFunc) {
  Event.stop(e);
  this.hideFunc=hideFunc;
  if (this.div.childNodes.length==0) {
    this.cancelmenu();
    return false;
  }
  this.clientX=Event.pointerX(e);
  this.clientY=Event.pointerY(e);
  var elem=Event.element(e);
  while (elem && !Element.hasClassName(elem,'ricoLG_cell'))
    elem=elem.parentNode;
  if (!elem) return false;
  var td=RicoUtil.getParentByTagName(elem,'td');

  var newLeft=Math.floor(td.offsetLeft+td.offsetWidth/2);
  if (this.direction == 'rtl') {
    if (newLeft > this.width) newLeft-=this.width;
  } else {
    if (newLeft+this.width+this.options.margin > this.grid.scrollDiv.scrollLeft+this.grid.scrollDiv.clientWidth) newLeft-=this.width;
  }
  this.div.style.visibility="hidden";
  this.div.style.display="block";
  var contentHt=this.div.offsetHeight;
  var newTop=Math.floor(elem.offsetTop+elem.offsetHeight/2);
  if (newTop+contentHt+this.options.margin > this.grid.scrollDiv.scrollTop+this.grid.scrollDiv.clientHeight)
    newTop=Math.max(newTop-contentHt,0);
  this.openPopup(newLeft,newTop);
  this.div.style.visibility ="visible";
  return elem;
},

showSimpleSubMenu: function(a,submenu) {
  if (this.openSubMenu) this.hideSubMenu();
  this.openSubMenu=submenu;
  this.openMenuAnchor=a;
  if (a.className=='ricoSubMenu') a.className='ricoSubMenuOpen';
  var top=parseInt(this.div.style.top);
  var left=parseInt(this.div.style.left);
  submenu.openPopup(left+a.offsetWidth,top+a.offsetTop);
  submenu.div.style.visibility ="visible";
}
    
});
}

Object.extend(Rico.TableColumn.prototype, {

initialize: function(grid,colIdx,hdrInfo,tabIdx) {
  this.baseInit(grid,colIdx,hdrInfo,tabIdx);
}

});

Rico.includeLoaded('ricoSimpleGrid.js');
