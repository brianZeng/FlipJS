/**
 * Created by 柏然 on 2014/12/15.
 */
(function (register) {
  function formatMoney(n, c, d, t) {
    var s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j;
    j = (j = i.length) > 3 ? j % 3 : 0;
    c = isNaN(c = Math.abs(c)) ? 2 : c;
    d = d == undefined ? "." : d;
    t = t == undefined ? "," : t;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  }

  function mapValue(ele) {
    var v = ele.innerHTML || ele.value, d = v.replace(/\,|[^\d\.]/g, '');
    ele.unit = v.replace(/.*\d(.*)/, '$1');
    return parseFloat(d);
  }

  function applyValue(ele, value, prec) {
    ele.innerHTML = ele.value = prec == -1 ? value + ele.unit : formatMoney(value, prec).replace(/\.0+$/, '');
  }

  register(
    {
      name: 'increase',
      beforeCallBase: function (proxy) {
        var eles = proxy.source('elements', Flip.$$(proxy.source('selector')));
        this.targets = eles.map(mapValue);
        proxy.source('duration', 1.2);
      },
      param: {
        fracPrecision: 1
      },
      prototype: {
        apply: function () {
          var v = this.clock.value, targets = this.targets, precition = this.finished ? -1 : this.fracPrecision;
          this.elements.forEach(function (ele, i) {
            applyValue(ele, targets[i] * v, precition);
          });
        }
      }
    }
  )
})(Flip.animation);