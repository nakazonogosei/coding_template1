function checkDevice() {
  if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
    return "smartPhone";
  } else if (
    /iPad|Macintosh/i.test(navigator.userAgent) &&
    "ontouchend" in document
  ) {
    return "tablet";
  } else {
    return "pc";
  }
}

if (checkDevice() === "tablet") {
  $("[name='viewport']").attr("content", "width=1280");
}

$(function () {
  // smooth scroll
  $("a[href^='#']").click(function () {
    var speed = 400;
    var href = $(this).attr("href");
    var target = $(href == "#" || href == "" ? "html" : href);
    var position = target.offset().top;
    $("html, body").animate({ scrollTop: position }, speed, "swing");
    return false;
  });
});
