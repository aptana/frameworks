$(function() {
  jQuery.visual = { pane: 0 };
  jQuery.visual.slideRight = function(again) {
    if(!jQuery.visual.allRight()) {
      $("#wrapper > dl, #wrapper > dd")
      .each(function() { $(this).animate({ left: parseInt($(this).css("left")) - 201},500,
        function() {
          if(!$(this).is(".absolute")) {
            var size = (-1 * (jQuery("#wrapper > dl, #wrapper > dd").length));
            if(($("dd.text:visible").length != 0) && $("dd.text:visible").offset().width < 350 && ((jQuery.visual.pane - 1) > size) && again) {
              jQuery.visual.slideRight(1);
            }
          }
        }
      ) });
      jQuery.visual.pane -= 1;
    }
    $.visual.setArrows();
  }

  jQuery.visual.slideLeft = function() {
    if(!jQuery.visual.allLeft()) {
      var c = $("dd.text:visible");
      if((c.length != 0) && ($("dd.text:visible").offset().width - 200) < 200) {
        $("dd.text:visible").remove();
        $("#wrapper > dl:visible:last dt.active").removeClass("active");
        $("#current-path").html($.map($("dt.active:visible"), function(i) { return i.innerHTML }).join("/"))
      }
      $("#wrapper > dl, #wrapper > dd")
      .each(function() { $(this).animate({ left: parseInt($(this).css("left")) + 201},500); });
      jQuery.visual.pane += 1;
    }
    $.visual.setArrows();
  }

  jQuery.visual.setArrows = function() {
    jQuery("#left-button").css("display", jQuery.visual.allLeft() ? "none" : "");
    jQuery("#right-button").css("display", jQuery.visual.allRight() ? "none" : "");
  }

  jQuery.visual.allLeft = function() {
    return (jQuery.visual.pane == 0);
  }

  jQuery.visual.allRight = function() {
    return (jQuery.visual.pane - 1) == (-1 * (jQuery("#wrapper > dl, #wrapper > dd").length));
  }

  $("a#left-button").click(jQuery.visual.slideLeft)

  $("a#right-button").click(jQuery.visual.slideRight)

  $.visual.setArrows();
  $("body > dl > dt").click(function() {  })
  $("dt").click(function(e) {
    $(this).siblings("dt.active").removeClass("active");
    $(this).addClass("active");
    $("#wrapper")[0].scrollTop = 0;
    if(!$(this.parentNode).is(".absolute") && $("+ dd", this).length == 0) {
      $("dl.absolute").remove();
    } else {
      curr = $("dl.absolute").index(this.parentNode);
      $("dl.absolute, #wrapper > dd.text").gt(curr).remove();
      if(c = $("+ dd > dl", this).length > 0) c = $("+ dd > dl", this);
      else c = $("+ dd", this)
      c = c.clone().appendTo("#wrapper").addClass("absolute");
      var d = c.is(".text") ? c : c.find("dt")
      if(d[0]) d.not(".text").click(arguments.callee)
      var dds = $("#wrapper > dl").length;
      if(!d.is(".text")) {
        $(d[0].parentNode).css("left", ((dds - 1 + jQuery.visual.pane) * 200) + 10 + "px").show()
        var offset = $(d).offset();
        if((offset.left + offset.width) > $("body").offset().width) jQuery.visual.slideRight()
      }
      else {
        d.css("left", ((dds + jQuery.visual.pane) * 200) + 10 + "px").show();
        var size = (-1 * (jQuery("#wrapper > dl, #wrapper > dd").length))
        var offset = d.offset();
        if((offset.width < 350 || (offset.left + offset.width) > $("body").offset().width) && (jQuery.visual.pane - 1) > size) { jQuery.visual.slideRight(1); }
      }
      $("#current-path").html($.map($("dt.active:visible"), function(i) { return i.innerHTML }).join("/"))
      $.visual.setArrows();
      return false;
    }
  })

  $(document).keydown(function(e) {
		var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
		switch(key) {
			case 37:
			  if(e.ctrlKey) $.visual.slideLeft()
			  break;
			case 39:
			  if(e.ctrlKey) $.visual.slideRight();
			  break;
    }
  });

});