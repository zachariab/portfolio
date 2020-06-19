(function ($, window, document) {
  var SHRINK_AFTER = 450;

  var $window = $(window);
  var menuShrunk = false;
  var docBody = $('body');

  var galleryScrollSection = $('#the-indispensables .article-body');
  var galleryScrollTop = galleryScrollSection.offset().top;
  var galleryScrollBottom = galleryScrollTop + galleryScrollSection.height();
  var isInScrollGallery = false;

  /* Master scroll watcher */
  $(window).on("scrol", function(e) {
    var scrollPosition = $window.scrollTop()
    /* Check for shrinking nav bar */
    if (!menuShrunk && (scrollPosition > SHRINK_AFTER)) {
      docBody.addClass("scrolled");
      menuShrunk = true;
    }
    else if (menuShrunk && (scrollPosition <= SHRINK_AFTER)) {
      docBody.removeClass("scrolled");
      menuShrunk = false;
    }
    /* Check for scroll gallery */
    if (isInScrollGallery) {
      if (scrollPosition < galleryScrollTop || scrollPosition > galleryScrollBottom) {
        isInScrollGallery = false;
        console.log("We're out");
      }
    } else {
      if (scrollPosition >= galleryScrollTop && scrollPosition <= galleryScrollBottom) {
        isInScrollGallery = true;
        console.log("We're in");
      }
    }
  })

$(document).ready(function() {
  $('.scroll-gallery').slick({
    vertical: true,
    speed: 1000
  });

  // init controller
  var controller = new ScrollMagic();

  var tween = TweenMax.fromTo("#textbracket", 1,
            {"opacity": 0, "transform": "scale(.8,0.2)"},
            {"opacity": 1, "transform": "scale(1,1)"}
          );

        // build scene
        var scene = new ScrollScene({triggerElement: "#the-indispensables"})
                .setTween(tween)
                .addTo(controller);

  // build scene
        var scene = new ScrollScene({triggerElement: galleryScrollSection, duration: galleryScrollSection.height(), triggerHook: "onLeave"})
                .setPin(".gallery-container", {pushFollowers: false})
                .addTo(controller);

    //Scroll Gallery
    $("[data-slide-number]").each(function(index) {
      var slideNumber = $(this).attr("data-slide-number") - 1;
      var slideScreen = new ScrollScene({triggerElement: $(this), duration: $(this).height(), triggerHook: "onLeave", offset: -50})
        .on("enter", function(e) {
          console.log(slideNumber);
          $('.scroll-gallery')[0].slick.slickGoTo(slideNumber);
        })
        .addTo(controller);

    });
});




})(jQuery, window, document);

