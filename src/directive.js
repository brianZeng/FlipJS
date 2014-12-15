/**
 * Created by 柏然 on 2014/12/13.
 */
(function (Flip) {
  function $$(slt, ele) {
    var r = [], root = ele || document;
    if (slt)
      slt.split(',').forEach(function (selector) {
        r.push.apply(r, r.slice.apply(root.querySelectorAll(selector)))
      });
    return r;
  }

  Flip.$$ = Flip.$ = $$;
  document.addEventListener('DOMContentLoaded', function () {
    FlipScope.global.init();
    FlipScope.readyFuncs.forEach(function (callback) {
      callback(Flip);
    });
    FlipScope.readyFuncs = null;
  });
})(Flip);
