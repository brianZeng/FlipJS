/**
 * Created by 柏然 on 2014/12/13.
 */
(function (Flip) {

  function $$(slt, ele) {
    var r = [], root = ele || document;
    return slt.split(',').forEach(function (selector) {
      r.push.apply(r, r.slice.apply(root.querySelectorAll(selector)))
    });
  }

  Flip.$$ = $$;
})(Flip);
document.addEventListener('DOMContentLoad', function () {
  FlipScope.global.init();
});