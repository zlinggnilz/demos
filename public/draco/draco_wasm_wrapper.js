var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (m) {
  var p = 0;
  return function () {
    return p < m.length ? { done: !1, value: m[p++] } : { done: !0 };
  };
};
$jscomp.arrayIterator = function (m) {
  return { next: $jscomp.arrayIteratorImpl(m) };
};
$jscomp.makeIterator = function (m) {
  var p = 'undefined' != typeof Symbol && Symbol.iterator && m[Symbol.iterator];
  return p ? p.call(m) : $jscomp.arrayIterator(m);
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = !1;
$jscomp.getGlobal = function (m) {
  m = [
    'object' == typeof globalThis && globalThis,
    m,
    'object' == typeof window && window,
    'object' == typeof self && self,
    'object' == typeof global && global,
  ];
  for (var p = 0; p < m.length; ++p) {
    var l = m[p];
    if (l && l.Math == Math) return l;
  }
  throw Error('Cannot find global object');
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || 'function' == typeof Object.defineProperties
    ? Object.defineProperty
    : function (m, p, l) {
        if (m == Array.prototype || m == Object.prototype) return m;
        m[p] = l.value;
        return m;
      };
$jscomp.IS_SYMBOL_NATIVE = 'function' === typeof Symbol && 'symbol' === typeof Symbol('x');
$jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = '$jscp$';
var $jscomp$lookupPolyfilledValue = function (m, p) {
  var l = $jscomp.propertyToPolyfillSymbol[p];
  if (null == l) return m[p];
  l = m[l];
  return void 0 !== l ? l : m[p];
};
$jscomp.polyfill = function (m, p, l, q) {
  p && ($jscomp.ISOLATE_POLYFILLS ? $jscomp.polyfillIsolated(m, p, l, q) : $jscomp.polyfillUnisolated(m, p, l, q));
};
$jscomp.polyfillUnisolated = function (m, p, l, q) {
  l = $jscomp.global;
  m = m.split('.');
  for (q = 0; q < m.length - 1; q++) {
    var k = m[q];
    if (!(k in l)) return;
    l = l[k];
  }
  m = m[m.length - 1];
  q = l[m];
  p = p(q);
  p != q && null != p && $jscomp.defineProperty(l, m, { configurable: !0, writable: !0, value: p });
};
$jscomp.polyfillIsolated = function (m, p, l, q) {
  var k = m.split('.');
  m = 1 === k.length;
  q = k[0];
  q = !m && q in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var A = 0; A < k.length - 1; A++) {
    var g = k[A];
    if (!(g in q)) return;
    q = q[g];
  }
  k = k[k.length - 1];
  l = $jscomp.IS_SYMBOL_NATIVE && 'es6' === l ? q[k] : null;
  p = p(l);
  null != p &&
    (m
      ? $jscomp.defineProperty($jscomp.polyfills, k, { configurable: !0, writable: !0, value: p })
      : p !== l &&
        (void 0 === $jscomp.propertyToPolyfillSymbol[k] &&
          ((l = (1e9 * Math.random()) >>> 0),
          ($jscomp.propertyToPolyfillSymbol[k] = $jscomp.IS_SYMBOL_NATIVE
            ? $jscomp.global.Symbol(k)
            : $jscomp.POLYFILL_PREFIX + l + '$' + k)),
        $jscomp.defineProperty(q, $jscomp.propertyToPolyfillSymbol[k], { configurable: !0, writable: !0, value: p })));
};
$jscomp.polyfill(
  'Promise',
  function (m) {
    function p() {
      this.batch_ = null;
    }
    function l(g) {
      return g instanceof k
        ? g
        : new k(function (n, u) {
            n(g);
          });
    }
    if (
      m &&
      (!(
        $jscomp.FORCE_POLYFILL_PROMISE ||
        ($jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION &&
          'undefined' === typeof $jscomp.global.PromiseRejectionEvent)
      ) ||
        !$jscomp.global.Promise ||
        -1 === $jscomp.global.Promise.toString().indexOf('[native code]'))
    )
      return m;
    p.prototype.asyncExecute = function (g) {
      if (null == this.batch_) {
        this.batch_ = [];
        var n = this;
        this.asyncExecuteFunction(function () {
          n.executeBatch_();
        });
      }
      this.batch_.push(g);
    };
    var q = $jscomp.global.setTimeout;
    p.prototype.asyncExecuteFunction = function (g) {
      q(g, 0);
    };
    p.prototype.executeBatch_ = function () {
      for (; this.batch_ && this.batch_.length; ) {
        var g = this.batch_;
        this.batch_ = [];
        for (var n = 0; n < g.length; ++n) {
          var u = g[n];
          g[n] = null;
          try {
            u();
          } catch (z) {
            this.asyncThrow_(z);
          }
        }
      }
      this.batch_ = null;
    };
    p.prototype.asyncThrow_ = function (g) {
      this.asyncExecuteFunction(function () {
        throw g;
      });
    };
    var k = function (g) {
      this.state_ = 0;
      this.result_ = void 0;
      this.onSettledCallbacks_ = [];
      this.isRejectionHandled_ = !1;
      var n = this.createResolveAndReject_();
      try {
        g(n.resolve, n.reject);
      } catch (u) {
        n.reject(u);
      }
    };
    k.prototype.createResolveAndReject_ = function () {
      function g(z) {
        return function (P) {
          u || ((u = !0), z.call(n, P));
        };
      }
      var n = this,
        u = !1;
      return { resolve: g(this.resolveTo_), reject: g(this.reject_) };
    };
    k.prototype.resolveTo_ = function (g) {
      if (g === this) this.reject_(new TypeError('A Promise cannot resolve to itself'));
      else if (g instanceof k) this.settleSameAsPromise_(g);
      else {
        a: switch (typeof g) {
          case 'object':
            var n = null != g;
            break a;
          case 'function':
            n = !0;
            break a;
          default:
            n = !1;
        }
        n ? this.resolveToNonPromiseObj_(g) : this.fulfill_(g);
      }
    };
    k.prototype.resolveToNonPromiseObj_ = function (g) {
      var n = void 0;
      try {
        n = g.then;
      } catch (u) {
        this.reject_(u);
        return;
      }
      'function' == typeof n ? this.settleSameAsThenable_(n, g) : this.fulfill_(g);
    };
    k.prototype.reject_ = function (g) {
      this.settle_(2, g);
    };
    k.prototype.fulfill_ = function (g) {
      this.settle_(1, g);
    };
    k.prototype.settle_ = function (g, n) {
      if (0 != this.state_)
        throw Error('Cannot settle(' + g + ', ' + n + '): Promise already settled in state' + this.state_);
      this.state_ = g;
      this.result_ = n;
      2 === this.state_ && this.scheduleUnhandledRejectionCheck_();
      this.executeOnSettledCallbacks_();
    };
    k.prototype.scheduleUnhandledRejectionCheck_ = function () {
      var g = this;
      q(function () {
        if (g.notifyUnhandledRejection_()) {
          var n = $jscomp.global.console;
          'undefined' !== typeof n && n.error(g.result_);
        }
      }, 1);
    };
    k.prototype.notifyUnhandledRejection_ = function () {
      if (this.isRejectionHandled_) return !1;
      var g = $jscomp.global.CustomEvent,
        n = $jscomp.global.Event,
        u = $jscomp.global.dispatchEvent;
      if ('undefined' === typeof u) return !0;
      'function' === typeof g
        ? (g = new g('unhandledrejection', { cancelable: !0 }))
        : 'function' === typeof n
        ? (g = new n('unhandledrejection', { cancelable: !0 }))
        : ((g = $jscomp.global.document.createEvent('CustomEvent')),
          g.initCustomEvent('unhandledrejection', !1, !0, g));
      g.promise = this;
      g.reason = this.result_;
      return u(g);
    };
    k.prototype.executeOnSettledCallbacks_ = function () {
      if (null != this.onSettledCallbacks_) {
        for (var g = 0; g < this.onSettledCallbacks_.length; ++g) A.asyncExecute(this.onSettledCallbacks_[g]);
        this.onSettledCallbacks_ = null;
      }
    };
    var A = new p();
    k.prototype.settleSameAsPromise_ = function (g) {
      var n = this.createResolveAndReject_();
      g.callWhenSettled_(n.resolve, n.reject);
    };
    k.prototype.settleSameAsThenable_ = function (g, n) {
      var u = this.createResolveAndReject_();
      try {
        g.call(n, u.resolve, u.reject);
      } catch (z) {
        u.reject(z);
      }
    };
    k.prototype.then = function (g, n) {
      function u(V, W) {
        return 'function' == typeof V
          ? function (v) {
              try {
                z(V(v));
              } catch (x) {
                P(x);
              }
            }
          : W;
      }
      var z,
        P,
        aa = new k(function (V, W) {
          z = V;
          P = W;
        });
      this.callWhenSettled_(u(g, z), u(n, P));
      return aa;
    };
    k.prototype.catch = function (g) {
      return this.then(void 0, g);
    };
    k.prototype.callWhenSettled_ = function (g, n) {
      function u() {
        switch (z.state_) {
          case 1:
            g(z.result_);
            break;
          case 2:
            n(z.result_);
            break;
          default:
            throw Error('Unexpected state: ' + z.state_);
        }
      }
      var z = this;
      null == this.onSettledCallbacks_ ? A.asyncExecute(u) : this.onSettledCallbacks_.push(u);
      this.isRejectionHandled_ = !0;
    };
    k.resolve = l;
    k.reject = function (g) {
      return new k(function (n, u) {
        u(g);
      });
    };
    k.race = function (g) {
      return new k(function (n, u) {
        for (var z = $jscomp.makeIterator(g), P = z.next(); !P.done; P = z.next()) l(P.value).callWhenSettled_(n, u);
      });
    };
    k.all = function (g) {
      var n = $jscomp.makeIterator(g),
        u = n.next();
      return u.done
        ? l([])
        : new k(function (z, P) {
            function aa(v) {
              return function (x) {
                V[v] = x;
                W--;
                0 == W && z(V);
              };
            }
            var V = [],
              W = 0;
            do V.push(void 0), W++, l(u.value).callWhenSettled_(aa(V.length - 1), P), (u = n.next());
            while (!u.done);
          });
    };
    return k;
  },
  'es6',
  'es3',
);
$jscomp.polyfill(
  'Array.prototype.copyWithin',
  function (m) {
    function p(l) {
      l = Number(l);
      return Infinity === l || -Infinity === l ? l : l | 0;
    }
    return m
      ? m
      : function (l, q, k) {
          var A = this.length;
          l = p(l);
          q = p(q);
          k = void 0 === k ? A : p(k);
          l = 0 > l ? Math.max(A + l, 0) : Math.min(l, A);
          q = 0 > q ? Math.max(A + q, 0) : Math.min(q, A);
          k = 0 > k ? Math.max(A + k, 0) : Math.min(k, A);
          if (l < q) for (; q < k; ) q in this ? (this[l++] = this[q++]) : (delete this[l++], q++);
          else
            for (k = Math.min(k, A + q - l), l += k - q; k > q; )
              --k in this ? (this[--l] = this[k]) : delete this[--l];
          return this;
        };
  },
  'es6',
  'es3',
);
$jscomp.typedArrayCopyWithin = function (m) {
  return m ? m : Array.prototype.copyWithin;
};
$jscomp.polyfill('Int8Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Uint8Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Uint8ClampedArray.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Int16Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Uint16Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Int32Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Uint32Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Float32Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
$jscomp.polyfill('Float64Array.prototype.copyWithin', $jscomp.typedArrayCopyWithin, 'es6', 'es5');
var DracoDecoderModule = (function () {
  var m = 'undefined' !== typeof document && document.currentScript ? document.currentScript.src : void 0;
  'undefined' !== typeof __filename && (m = m || __filename);
  return function (p) {
    function l(e) {
      return a.locateFile ? a.locateFile(e, X) : X + e;
    }
    function q(e, b) {
      e || n('Assertion failed: ' + b);
    }
    function k(e, b, c) {
      var d = b + c;
      for (c = b; e[c] && !(c >= d); ) ++c;
      if (16 < c - b && e.subarray && Da) return Da.decode(e.subarray(b, c));
      for (d = ''; b < c; ) {
        var f = e[b++];
        if (f & 128) {
          var t = e[b++] & 63;
          if (192 == (f & 224)) d += String.fromCharCode(((f & 31) << 6) | t);
          else {
            var Y = e[b++] & 63;
            f =
              224 == (f & 240)
                ? ((f & 15) << 12) | (t << 6) | Y
                : ((f & 7) << 18) | (t << 12) | (Y << 6) | (e[b++] & 63);
            65536 > f
              ? (d += String.fromCharCode(f))
              : ((f -= 65536), (d += String.fromCharCode(55296 | (f >> 10), 56320 | (f & 1023))));
          }
        } else d += String.fromCharCode(f);
      }
      return d;
    }
    function A(e, b) {
      return e ? k(ja, e, b) : '';
    }
    function g(e) {
      Ea = e;
      a.HEAP8 = ba = new Int8Array(e);
      a.HEAP16 = new Int16Array(e);
      a.HEAP32 = F = new Int32Array(e);
      a.HEAPU8 = ja = new Uint8Array(e);
      a.HEAPU16 = new Uint16Array(e);
      a.HEAPU32 = new Uint32Array(e);
      a.HEAPF32 = new Float32Array(e);
      a.HEAPF64 = new Float64Array(e);
    }
    function n(e) {
      if (a.onAbort) a.onAbort(e);
      e += '';
      ia(e);
      Fa = !0;
      e = new WebAssembly.RuntimeError('abort(' + e + '). Build with -s ASSERTIONS=1 for more info.');
      sa(e);
      throw e;
    }
    function u(e, b) {
      return String.prototype.startsWith ? e.startsWith(b) : 0 === e.indexOf(b);
    }
    function z(e) {
      try {
        if (e == Q && ka) return new Uint8Array(ka);
        if (oa) return oa(e);
        throw 'both async and sync fetching of the wasm failed';
      } catch (b) {
        n(b);
      }
    }
    function P() {
      if (!ka && (pa || fa)) {
        if ('function' === typeof fetch && !u(Q, 'file://'))
          return fetch(Q, { credentials: 'same-origin' })
            .then(function (e) {
              if (!e.ok) throw "failed to load wasm binary file at '" + Q + "'";
              return e.arrayBuffer();
            })
            .catch(function () {
              return z(Q);
            });
        if (Ga)
          return new Promise(function (e, b) {
            Ga(
              Q,
              function (c) {
                e(new Uint8Array(c));
              },
              b,
            );
          });
      }
      return Promise.resolve().then(function () {
        return z(Q);
      });
    }
    function aa(e) {
      for (; 0 < e.length; ) {
        var b = e.shift();
        if ('function' == typeof b) b(a);
        else {
          var c = b.func;
          'number' === typeof c
            ? void 0 === b.arg
              ? ta.get(c)()
              : ta.get(c)(b.arg)
            : c(void 0 === b.arg ? null : b.arg);
        }
      }
    }
    function V(e) {
      this.excPtr = e;
      this.ptr = e - D.SIZE;
      this.set_type = function (b) {
        F[(this.ptr + D.TYPE_OFFSET) >> 2] = b;
      };
      this.get_type = function () {
        return F[(this.ptr + D.TYPE_OFFSET) >> 2];
      };
      this.set_destructor = function (b) {
        F[(this.ptr + D.DESTRUCTOR_OFFSET) >> 2] = b;
      };
      this.get_destructor = function () {
        return F[(this.ptr + D.DESTRUCTOR_OFFSET) >> 2];
      };
      this.set_refcount = function (b) {
        F[(this.ptr + D.REFCOUNT_OFFSET) >> 2] = b;
      };
      this.set_caught = function (b) {
        ba[(this.ptr + D.CAUGHT_OFFSET) >> 0] = b ? 1 : 0;
      };
      this.get_caught = function () {
        return 0 != ba[(this.ptr + D.CAUGHT_OFFSET) >> 0];
      };
      this.set_rethrown = function (b) {
        ba[(this.ptr + D.RETHROWN_OFFSET) >> 0] = b ? 1 : 0;
      };
      this.get_rethrown = function () {
        return 0 != ba[(this.ptr + D.RETHROWN_OFFSET) >> 0];
      };
      this.init = function (b, c) {
        this.set_type(b);
        this.set_destructor(c);
        this.set_refcount(0);
        this.set_caught(!1);
        this.set_rethrown(!1);
      };
      this.add_ref = function () {
        F[(this.ptr + D.REFCOUNT_OFFSET) >> 2] += 1;
      };
      this.release_ref = function () {
        var b = F[(this.ptr + D.REFCOUNT_OFFSET) >> 2];
        F[(this.ptr + D.REFCOUNT_OFFSET) >> 2] = b - 1;
        return 1 === b;
      };
    }
    function W(e) {
      function b() {
        if (!qa && ((qa = !0), (a.calledRun = !0), !Fa)) {
          Ha = !0;
          aa(Ia);
          aa(ua);
          Ja(a);
          if (a.onRuntimeInitialized) a.onRuntimeInitialized();
          if (a.postRun)
            for ('function' == typeof a.postRun && (a.postRun = [a.postRun]); a.postRun.length; )
              Ka.unshift(a.postRun.shift());
          aa(Ka);
        }
      }
      if (!(0 < ha)) {
        if (a.preRun)
          for ('function' == typeof a.preRun && (a.preRun = [a.preRun]); a.preRun.length; )
            La.unshift(a.preRun.shift());
        aa(La);
        0 < ha ||
          (a.setStatus
            ? (a.setStatus('Running...'),
              setTimeout(function () {
                setTimeout(function () {
                  a.setStatus('');
                }, 1);
                b();
              }, 1))
            : b());
      }
    }
    function v() {}
    function x(e) {
      return (e || v).__cache__;
    }
    function S(e, b) {
      var c = x(b),
        d = c[e];
      if (d) return d;
      d = Object.create((b || v).prototype);
      d.ptr = e;
      return (c[e] = d);
    }
    function da(e) {
      if ('string' === typeof e) {
        for (var b = 0, c = 0; c < e.length; ++c) {
          var d = e.charCodeAt(c);
          55296 <= d && 57343 >= d && (d = (65536 + ((d & 1023) << 10)) | (e.charCodeAt(++c) & 1023));
          127 >= d ? ++b : (b = 2047 >= d ? b + 2 : 65535 >= d ? b + 3 : b + 4);
        }
        b = Array(b + 1);
        c = 0;
        d = b.length;
        if (0 < d) {
          d = c + d - 1;
          for (var f = 0; f < e.length; ++f) {
            var t = e.charCodeAt(f);
            if (55296 <= t && 57343 >= t) {
              var Y = e.charCodeAt(++f);
              t = (65536 + ((t & 1023) << 10)) | (Y & 1023);
            }
            if (127 >= t) {
              if (c >= d) break;
              b[c++] = t;
            } else {
              if (2047 >= t) {
                if (c + 1 >= d) break;
                b[c++] = 192 | (t >> 6);
              } else {
                if (65535 >= t) {
                  if (c + 2 >= d) break;
                  b[c++] = 224 | (t >> 12);
                } else {
                  if (c + 3 >= d) break;
                  b[c++] = 240 | (t >> 18);
                  b[c++] = 128 | ((t >> 12) & 63);
                }
                b[c++] = 128 | ((t >> 6) & 63);
              }
              b[c++] = 128 | (t & 63);
            }
          }
          b[c] = 0;
        }
        e = r.alloc(b, ba);
        r.copy(b, ba, e);
        return e;
      }
      return e;
    }
    function va(e) {
      if ('object' === typeof e) {
        var b = r.alloc(e, ba);
        r.copy(e, ba, b);
        return b;
      }
      return e;
    }
    function ca() {
      throw 'cannot construct a VoidPtr, no constructor in IDL';
    }
    function T() {
      this.ptr = Ma();
      x(T)[this.ptr] = this;
    }
    function R() {
      this.ptr = Na();
      x(R)[this.ptr] = this;
    }
    function Z() {
      this.ptr = Oa();
      x(Z)[this.ptr] = this;
    }
    function w() {
      this.ptr = Pa();
      x(w)[this.ptr] = this;
    }
    function C() {
      this.ptr = Qa();
      x(C)[this.ptr] = this;
    }
    function G() {
      this.ptr = Ra();
      x(G)[this.ptr] = this;
    }
    function H() {
      this.ptr = Sa();
      x(H)[this.ptr] = this;
    }
    function E() {
      this.ptr = Ta();
      x(E)[this.ptr] = this;
    }
    function U() {
      this.ptr = Ua();
      x(U)[this.ptr] = this;
    }
    function B() {
      throw 'cannot construct a Status, no constructor in IDL';
    }
    function I() {
      this.ptr = Va();
      x(I)[this.ptr] = this;
    }
    function J() {
      this.ptr = Wa();
      x(J)[this.ptr] = this;
    }
    function K() {
      this.ptr = Xa();
      x(K)[this.ptr] = this;
    }
    function L() {
      this.ptr = Ya();
      x(L)[this.ptr] = this;
    }
    function M() {
      this.ptr = Za();
      x(M)[this.ptr] = this;
    }
    function N() {
      this.ptr = $a();
      x(N)[this.ptr] = this;
    }
    function O() {
      this.ptr = ab();
      x(O)[this.ptr] = this;
    }
    function y() {
      this.ptr = bb();
      x(y)[this.ptr] = this;
    }
    function h() {
      this.ptr = cb();
      x(h)[this.ptr] = this;
    }
    p = p || {};
    var a = 'undefined' !== typeof p ? p : {},
      Ja,
      sa;
    a.ready = new Promise(function (e, b) {
      Ja = e;
      sa = b;
    });
    var db = !1,
      eb = !1;
    a.onRuntimeInitialized = function () {
      db = !0;
      a.callRuntimeCallbacks(a.mainCallbacks);
      if (eb && 'function' === typeof a.onModuleLoaded) a.onModuleLoaded(a);
    };
    a.onModuleParsed = function () {
      eb = !0;
      if (db && 'function' === typeof a.onModuleLoaded) a.onModuleLoaded(a);
    };
    a.isVersionSupported = function (e) {
      if ('string' !== typeof e) return !1;
      e = e.split('.');
      return 2 > e.length || 3 < e.length
        ? !1
        : 1 == e[0] && 0 <= e[1] && 4 >= e[1]
        ? !0
        : 0 != e[0] || 10 < e[1]
        ? !1
        : !0;
    };
    var la = {},
      ea;
    for (ea in a) a.hasOwnProperty(ea) && (la[ea] = a[ea]);
    var pa = !1,
      fa = !1,
      wa = !1,
      fb = !1;
    pa = 'object' === typeof window;
    fa = 'function' === typeof importScripts;
    wa =
      'object' === typeof process && 'object' === typeof process.versions && 'string' === typeof process.versions.node;
    fb = !pa && !wa && !fa;
    var X = '',
      xa,
      ya;
    if (wa) {
      X = fa ? require('path').dirname(X) + '/' : __dirname + '/';
      var za = function (e, b) {
        xa || (xa = require('fs'));
        ya || (ya = require('path'));
        e = ya.normalize(e);
        return xa.readFileSync(e, b ? null : 'utf8');
      };
      var oa = function (e) {
        e = za(e, !0);
        e.buffer || (e = new Uint8Array(e));
        q(e.buffer);
        return e;
      };
      1 < process.argv.length && process.argv[1].replace(/\\/g, '/');
      process.argv.slice(2);
      a.inspect = function () {
        return '[Emscripten Module object]';
      };
    } else if (fb)
      'undefined' != typeof read &&
        (za = function (e) {
          return read(e);
        }),
        (oa = function (e) {
          if ('function' === typeof readbuffer) return new Uint8Array(readbuffer(e));
          e = read(e, 'binary');
          q('object' === typeof e);
          return e;
        }),
        'undefined' !== typeof print &&
          ('undefined' === typeof console && (console = {}),
          (console.log = print),
          (console.warn = console.error = 'undefined' !== typeof printErr ? printErr : print));
    else if (pa || fa) {
      fa
        ? (X = self.location.href)
        : 'undefined' !== typeof document && document.currentScript && (X = document.currentScript.src);
      m && (X = m);
      X = 0 !== X.indexOf('blob:') ? X.substr(0, X.lastIndexOf('/') + 1) : '';
      za = function (e) {
        var b = new XMLHttpRequest();
        b.open('GET', e, !1);
        b.send(null);
        return b.responseText;
      };
      fa &&
        (oa = function (e) {
          var b = new XMLHttpRequest();
          b.open('GET', e, !1);
          b.responseType = 'arraybuffer';
          b.send(null);
          return new Uint8Array(b.response);
        });
      var Ga = function (e, b, c) {
        var d = new XMLHttpRequest();
        d.open('GET', e, !0);
        d.responseType = 'arraybuffer';
        d.onload = function () {
          200 == d.status || (0 == d.status && d.response) ? b(d.response) : c();
        };
        d.onerror = c;
        d.send(null);
      };
    }
    var Ad = a.print || console.log.bind(console),
      ia = a.printErr || console.warn.bind(console);
    for (ea in la) la.hasOwnProperty(ea) && (a[ea] = la[ea]);
    la = null;
    var ka;
    a.wasmBinary && (ka = a.wasmBinary);
    'object' !== typeof WebAssembly && n('no native wasm support detected');
    var ra,
      Fa = !1,
      Da = 'undefined' !== typeof TextDecoder ? new TextDecoder('utf8') : void 0,
      Ea,
      ba,
      ja,
      F,
      ta,
      La = [],
      Ia = [],
      ua = [],
      Ka = [],
      Ha = !1,
      ha = 0,
      Aa = null,
      ma = null;
    a.preloadedImages = {};
    a.preloadedAudios = {};
    var Q = 'draco_decoder.wasm';
    u(Q, 'data:application/octet-stream;base64,') || (Q = l(Q));
    var D = {
        DESTRUCTOR_OFFSET: 0,
        REFCOUNT_OFFSET: 4,
        TYPE_OFFSET: 8,
        CAUGHT_OFFSET: 12,
        RETHROWN_OFFSET: 13,
        SIZE: 16,
      },
      Bd = 0,
      na = {
        mappings: {},
        buffers: [null, [], []],
        printChar: function (e, b) {
          var c = na.buffers[e];
          0 === b || 10 === b ? ((1 === e ? Ad : ia)(k(c, 0)), (c.length = 0)) : c.push(b);
        },
        varargs: void 0,
        get: function () {
          na.varargs += 4;
          return F[(na.varargs - 4) >> 2];
        },
        getStr: function (e) {
          return A(e);
        },
        get64: function (e, b) {
          return e;
        },
      },
      Cd = {
        h: function (e) {
          return gb(e + D.SIZE) + D.SIZE;
        },
        g: function (e, b, c) {
          new V(e).init(b, c);
          Bd++;
          throw e;
        },
        a: function () {
          n();
        },
        d: function (e, b, c) {
          ja.copyWithin(e, b, b + c);
        },
        e: function (e) {
          var b = ja.length;
          e >>>= 0;
          if (2147483648 < e) return !1;
          for (var c = 1; 4 >= c; c *= 2) {
            var d = b * (1 + 0.2 / c);
            d = Math.min(d, e + 100663296);
            var f = Math,
              t = f.min;
            d = Math.max(e, d);
            0 < d % 65536 && (d += 65536 - (d % 65536));
            f = t.call(f, 2147483648, d);
            a: {
              try {
                ra.grow((f - Ea.byteLength + 65535) >>> 16);
                g(ra.buffer);
                var Y = 1;
                break a;
              } catch (Ba) {}
              Y = void 0;
            }
            if (Y) return !0;
          }
          return !1;
        },
        f: function (e) {
          return 0;
        },
        c: function (e, b, c, d, f) {},
        b: function (e, b, c, d) {
          for (var f = 0, t = 0; t < c; t++) {
            for (var Y = F[(b + 8 * t) >> 2], Ba = F[(b + (8 * t + 4)) >> 2], Ca = 0; Ca < Ba; Ca++)
              na.printChar(e, ja[Y + Ca]);
            f += Ba;
          }
          F[d >> 2] = f;
          return 0;
        },
      };
    (function () {
      function e(f, t) {
        a.asm = f.exports;
        ra = a.asm.i;
        g(ra.buffer);
        ta = a.asm.k;
        Ia.unshift(a.asm.j);
        ha--;
        a.monitorRunDependencies && a.monitorRunDependencies(ha);
        0 == ha && (null !== Aa && (clearInterval(Aa), (Aa = null)), ma && ((f = ma), (ma = null), f()));
      }
      function b(f) {
        e(f.instance);
      }
      function c(f) {
        return P()
          .then(function (t) {
            return WebAssembly.instantiate(t, d);
          })
          .then(f, function (t) {
            ia('failed to asynchronously prepare wasm: ' + t);
            n(t);
          });
      }
      var d = { a: Cd };
      ha++;
      a.monitorRunDependencies && a.monitorRunDependencies(ha);
      if (a.instantiateWasm)
        try {
          return a.instantiateWasm(d, e);
        } catch (f) {
          return ia('Module.instantiateWasm callback failed with error: ' + f), !1;
        }
      (function () {
        return ka ||
          'function' !== typeof WebAssembly.instantiateStreaming ||
          u(Q, 'data:application/octet-stream;base64,') ||
          u(Q, 'file://') ||
          'function' !== typeof fetch
          ? c(b)
          : fetch(Q, { credentials: 'same-origin' }).then(function (f) {
              return WebAssembly.instantiateStreaming(f, d).then(b, function (t) {
                ia('wasm streaming compile failed: ' + t);
                ia('falling back to ArrayBuffer instantiation');
                return c(b);
              });
            });
      })().catch(sa);
      return {};
    })();
    a.___wasm_call_ctors = function () {
      return (a.___wasm_call_ctors = a.asm.j).apply(null, arguments);
    };
    var hb = (a._emscripten_bind_VoidPtr___destroy___0 = function () {
        return (hb = a._emscripten_bind_VoidPtr___destroy___0 = a.asm.l).apply(null, arguments);
      }),
      Ma = (a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 = function () {
        return (Ma = a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 = a.asm.m).apply(null, arguments);
      }),
      ib = (a._emscripten_bind_DecoderBuffer_Init_2 = function () {
        return (ib = a._emscripten_bind_DecoderBuffer_Init_2 = a.asm.n).apply(null, arguments);
      }),
      jb = (a._emscripten_bind_DecoderBuffer___destroy___0 = function () {
        return (jb = a._emscripten_bind_DecoderBuffer___destroy___0 = a.asm.o).apply(null, arguments);
      }),
      Na = (a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 = function () {
        return (Na = a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 = a.asm.p).apply(
          null,
          arguments,
        );
      }),
      kb = (a._emscripten_bind_AttributeTransformData_transform_type_0 = function () {
        return (kb = a._emscripten_bind_AttributeTransformData_transform_type_0 = a.asm.q).apply(null, arguments);
      }),
      lb = (a._emscripten_bind_AttributeTransformData___destroy___0 = function () {
        return (lb = a._emscripten_bind_AttributeTransformData___destroy___0 = a.asm.r).apply(null, arguments);
      }),
      Oa = (a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = function () {
        return (Oa = a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = a.asm.s).apply(null, arguments);
      }),
      mb = (a._emscripten_bind_GeometryAttribute___destroy___0 = function () {
        return (mb = a._emscripten_bind_GeometryAttribute___destroy___0 = a.asm.t).apply(null, arguments);
      }),
      Pa = (a._emscripten_bind_PointAttribute_PointAttribute_0 = function () {
        return (Pa = a._emscripten_bind_PointAttribute_PointAttribute_0 = a.asm.u).apply(null, arguments);
      }),
      nb = (a._emscripten_bind_PointAttribute_size_0 = function () {
        return (nb = a._emscripten_bind_PointAttribute_size_0 = a.asm.v).apply(null, arguments);
      }),
      ob = (a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 = function () {
        return (ob = a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 = a.asm.w).apply(null, arguments);
      }),
      pb = (a._emscripten_bind_PointAttribute_attribute_type_0 = function () {
        return (pb = a._emscripten_bind_PointAttribute_attribute_type_0 = a.asm.x).apply(null, arguments);
      }),
      qb = (a._emscripten_bind_PointAttribute_data_type_0 = function () {
        return (qb = a._emscripten_bind_PointAttribute_data_type_0 = a.asm.y).apply(null, arguments);
      }),
      rb = (a._emscripten_bind_PointAttribute_num_components_0 = function () {
        return (rb = a._emscripten_bind_PointAttribute_num_components_0 = a.asm.z).apply(null, arguments);
      }),
      sb = (a._emscripten_bind_PointAttribute_normalized_0 = function () {
        return (sb = a._emscripten_bind_PointAttribute_normalized_0 = a.asm.A).apply(null, arguments);
      }),
      tb = (a._emscripten_bind_PointAttribute_byte_stride_0 = function () {
        return (tb = a._emscripten_bind_PointAttribute_byte_stride_0 = a.asm.B).apply(null, arguments);
      }),
      ub = (a._emscripten_bind_PointAttribute_byte_offset_0 = function () {
        return (ub = a._emscripten_bind_PointAttribute_byte_offset_0 = a.asm.C).apply(null, arguments);
      }),
      vb = (a._emscripten_bind_PointAttribute_unique_id_0 = function () {
        return (vb = a._emscripten_bind_PointAttribute_unique_id_0 = a.asm.D).apply(null, arguments);
      }),
      wb = (a._emscripten_bind_PointAttribute___destroy___0 = function () {
        return (wb = a._emscripten_bind_PointAttribute___destroy___0 = a.asm.E).apply(null, arguments);
      }),
      Qa = (a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 = function () {
        return (Qa = a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 =
          a.asm.F).apply(null, arguments);
      }),
      xb = (a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 = function () {
        return (xb = a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 = a.asm.G).apply(
          null,
          arguments,
        );
      }),
      yb = (a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 = function () {
        return (yb = a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 = a.asm.H).apply(
          null,
          arguments,
        );
      }),
      zb = (a._emscripten_bind_AttributeQuantizationTransform_min_value_1 = function () {
        return (zb = a._emscripten_bind_AttributeQuantizationTransform_min_value_1 = a.asm.I).apply(null, arguments);
      }),
      Ab = (a._emscripten_bind_AttributeQuantizationTransform_range_0 = function () {
        return (Ab = a._emscripten_bind_AttributeQuantizationTransform_range_0 = a.asm.J).apply(null, arguments);
      }),
      Bb = (a._emscripten_bind_AttributeQuantizationTransform___destroy___0 = function () {
        return (Bb = a._emscripten_bind_AttributeQuantizationTransform___destroy___0 = a.asm.K).apply(null, arguments);
      }),
      Ra = (a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 = function () {
        return (Ra = a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 = a.asm.L).apply(
          null,
          arguments,
        );
      }),
      Cb = (a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 = function () {
        return (Cb = a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 = a.asm.M).apply(
          null,
          arguments,
        );
      }),
      Db = (a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 = function () {
        return (Db = a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 = a.asm.N).apply(
          null,
          arguments,
        );
      }),
      Eb = (a._emscripten_bind_AttributeOctahedronTransform___destroy___0 = function () {
        return (Eb = a._emscripten_bind_AttributeOctahedronTransform___destroy___0 = a.asm.O).apply(null, arguments);
      }),
      Sa = (a._emscripten_bind_PointCloud_PointCloud_0 = function () {
        return (Sa = a._emscripten_bind_PointCloud_PointCloud_0 = a.asm.P).apply(null, arguments);
      }),
      Fb = (a._emscripten_bind_PointCloud_num_attributes_0 = function () {
        return (Fb = a._emscripten_bind_PointCloud_num_attributes_0 = a.asm.Q).apply(null, arguments);
      }),
      Gb = (a._emscripten_bind_PointCloud_num_points_0 = function () {
        return (Gb = a._emscripten_bind_PointCloud_num_points_0 = a.asm.R).apply(null, arguments);
      }),
      Hb = (a._emscripten_bind_PointCloud___destroy___0 = function () {
        return (Hb = a._emscripten_bind_PointCloud___destroy___0 = a.asm.S).apply(null, arguments);
      }),
      Ta = (a._emscripten_bind_Mesh_Mesh_0 = function () {
        return (Ta = a._emscripten_bind_Mesh_Mesh_0 = a.asm.T).apply(null, arguments);
      }),
      Ib = (a._emscripten_bind_Mesh_num_faces_0 = function () {
        return (Ib = a._emscripten_bind_Mesh_num_faces_0 = a.asm.U).apply(null, arguments);
      }),
      Jb = (a._emscripten_bind_Mesh_num_attributes_0 = function () {
        return (Jb = a._emscripten_bind_Mesh_num_attributes_0 = a.asm.V).apply(null, arguments);
      }),
      Kb = (a._emscripten_bind_Mesh_num_points_0 = function () {
        return (Kb = a._emscripten_bind_Mesh_num_points_0 = a.asm.W).apply(null, arguments);
      }),
      Lb = (a._emscripten_bind_Mesh___destroy___0 = function () {
        return (Lb = a._emscripten_bind_Mesh___destroy___0 = a.asm.X).apply(null, arguments);
      }),
      Ua = (a._emscripten_bind_Metadata_Metadata_0 = function () {
        return (Ua = a._emscripten_bind_Metadata_Metadata_0 = a.asm.Y).apply(null, arguments);
      }),
      Mb = (a._emscripten_bind_Metadata___destroy___0 = function () {
        return (Mb = a._emscripten_bind_Metadata___destroy___0 = a.asm.Z).apply(null, arguments);
      }),
      Nb = (a._emscripten_bind_Status_code_0 = function () {
        return (Nb = a._emscripten_bind_Status_code_0 = a.asm._).apply(null, arguments);
      }),
      Ob = (a._emscripten_bind_Status_ok_0 = function () {
        return (Ob = a._emscripten_bind_Status_ok_0 = a.asm.$).apply(null, arguments);
      }),
      Pb = (a._emscripten_bind_Status_error_msg_0 = function () {
        return (Pb = a._emscripten_bind_Status_error_msg_0 = a.asm.aa).apply(null, arguments);
      }),
      Qb = (a._emscripten_bind_Status___destroy___0 = function () {
        return (Qb = a._emscripten_bind_Status___destroy___0 = a.asm.ba).apply(null, arguments);
      }),
      Va = (a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 = function () {
        return (Va = a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 = a.asm.ca).apply(null, arguments);
      }),
      Rb = (a._emscripten_bind_DracoFloat32Array_GetValue_1 = function () {
        return (Rb = a._emscripten_bind_DracoFloat32Array_GetValue_1 = a.asm.da).apply(null, arguments);
      }),
      Sb = (a._emscripten_bind_DracoFloat32Array_size_0 = function () {
        return (Sb = a._emscripten_bind_DracoFloat32Array_size_0 = a.asm.ea).apply(null, arguments);
      }),
      Tb = (a._emscripten_bind_DracoFloat32Array___destroy___0 = function () {
        return (Tb = a._emscripten_bind_DracoFloat32Array___destroy___0 = a.asm.fa).apply(null, arguments);
      }),
      Wa = (a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = function () {
        return (Wa = a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = a.asm.ga).apply(null, arguments);
      }),
      Ub = (a._emscripten_bind_DracoInt8Array_GetValue_1 = function () {
        return (Ub = a._emscripten_bind_DracoInt8Array_GetValue_1 = a.asm.ha).apply(null, arguments);
      }),
      Vb = (a._emscripten_bind_DracoInt8Array_size_0 = function () {
        return (Vb = a._emscripten_bind_DracoInt8Array_size_0 = a.asm.ia).apply(null, arguments);
      }),
      Wb = (a._emscripten_bind_DracoInt8Array___destroy___0 = function () {
        return (Wb = a._emscripten_bind_DracoInt8Array___destroy___0 = a.asm.ja).apply(null, arguments);
      }),
      Xa = (a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 = function () {
        return (Xa = a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 = a.asm.ka).apply(null, arguments);
      }),
      Xb = (a._emscripten_bind_DracoUInt8Array_GetValue_1 = function () {
        return (Xb = a._emscripten_bind_DracoUInt8Array_GetValue_1 = a.asm.la).apply(null, arguments);
      }),
      Yb = (a._emscripten_bind_DracoUInt8Array_size_0 = function () {
        return (Yb = a._emscripten_bind_DracoUInt8Array_size_0 = a.asm.ma).apply(null, arguments);
      }),
      Zb = (a._emscripten_bind_DracoUInt8Array___destroy___0 = function () {
        return (Zb = a._emscripten_bind_DracoUInt8Array___destroy___0 = a.asm.na).apply(null, arguments);
      }),
      Ya = (a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 = function () {
        return (Ya = a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 = a.asm.oa).apply(null, arguments);
      }),
      $b = (a._emscripten_bind_DracoInt16Array_GetValue_1 = function () {
        return ($b = a._emscripten_bind_DracoInt16Array_GetValue_1 = a.asm.pa).apply(null, arguments);
      }),
      ac = (a._emscripten_bind_DracoInt16Array_size_0 = function () {
        return (ac = a._emscripten_bind_DracoInt16Array_size_0 = a.asm.qa).apply(null, arguments);
      }),
      bc = (a._emscripten_bind_DracoInt16Array___destroy___0 = function () {
        return (bc = a._emscripten_bind_DracoInt16Array___destroy___0 = a.asm.ra).apply(null, arguments);
      }),
      Za = (a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 = function () {
        return (Za = a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 = a.asm.sa).apply(null, arguments);
      }),
      cc = (a._emscripten_bind_DracoUInt16Array_GetValue_1 = function () {
        return (cc = a._emscripten_bind_DracoUInt16Array_GetValue_1 = a.asm.ta).apply(null, arguments);
      }),
      dc = (a._emscripten_bind_DracoUInt16Array_size_0 = function () {
        return (dc = a._emscripten_bind_DracoUInt16Array_size_0 = a.asm.ua).apply(null, arguments);
      }),
      ec = (a._emscripten_bind_DracoUInt16Array___destroy___0 = function () {
        return (ec = a._emscripten_bind_DracoUInt16Array___destroy___0 = a.asm.va).apply(null, arguments);
      }),
      $a = (a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 = function () {
        return ($a = a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 = a.asm.wa).apply(null, arguments);
      }),
      fc = (a._emscripten_bind_DracoInt32Array_GetValue_1 = function () {
        return (fc = a._emscripten_bind_DracoInt32Array_GetValue_1 = a.asm.xa).apply(null, arguments);
      }),
      gc = (a._emscripten_bind_DracoInt32Array_size_0 = function () {
        return (gc = a._emscripten_bind_DracoInt32Array_size_0 = a.asm.ya).apply(null, arguments);
      }),
      hc = (a._emscripten_bind_DracoInt32Array___destroy___0 = function () {
        return (hc = a._emscripten_bind_DracoInt32Array___destroy___0 = a.asm.za).apply(null, arguments);
      }),
      ab = (a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 = function () {
        return (ab = a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 = a.asm.Aa).apply(null, arguments);
      }),
      ic = (a._emscripten_bind_DracoUInt32Array_GetValue_1 = function () {
        return (ic = a._emscripten_bind_DracoUInt32Array_GetValue_1 = a.asm.Ba).apply(null, arguments);
      }),
      jc = (a._emscripten_bind_DracoUInt32Array_size_0 = function () {
        return (jc = a._emscripten_bind_DracoUInt32Array_size_0 = a.asm.Ca).apply(null, arguments);
      }),
      kc = (a._emscripten_bind_DracoUInt32Array___destroy___0 = function () {
        return (kc = a._emscripten_bind_DracoUInt32Array___destroy___0 = a.asm.Da).apply(null, arguments);
      }),
      bb = (a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 = function () {
        return (bb = a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 = a.asm.Ea).apply(null, arguments);
      }),
      lc = (a._emscripten_bind_MetadataQuerier_HasEntry_2 = function () {
        return (lc = a._emscripten_bind_MetadataQuerier_HasEntry_2 = a.asm.Fa).apply(null, arguments);
      }),
      mc = (a._emscripten_bind_MetadataQuerier_GetIntEntry_2 = function () {
        return (mc = a._emscripten_bind_MetadataQuerier_GetIntEntry_2 = a.asm.Ga).apply(null, arguments);
      }),
      nc = (a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 = function () {
        return (nc = a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 = a.asm.Ha).apply(null, arguments);
      }),
      oc = (a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 = function () {
        return (oc = a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 = a.asm.Ia).apply(null, arguments);
      }),
      pc = (a._emscripten_bind_MetadataQuerier_GetStringEntry_2 = function () {
        return (pc = a._emscripten_bind_MetadataQuerier_GetStringEntry_2 = a.asm.Ja).apply(null, arguments);
      }),
      qc = (a._emscripten_bind_MetadataQuerier_NumEntries_1 = function () {
        return (qc = a._emscripten_bind_MetadataQuerier_NumEntries_1 = a.asm.Ka).apply(null, arguments);
      }),
      rc = (a._emscripten_bind_MetadataQuerier_GetEntryName_2 = function () {
        return (rc = a._emscripten_bind_MetadataQuerier_GetEntryName_2 = a.asm.La).apply(null, arguments);
      }),
      sc = (a._emscripten_bind_MetadataQuerier___destroy___0 = function () {
        return (sc = a._emscripten_bind_MetadataQuerier___destroy___0 = a.asm.Ma).apply(null, arguments);
      }),
      cb = (a._emscripten_bind_Decoder_Decoder_0 = function () {
        return (cb = a._emscripten_bind_Decoder_Decoder_0 = a.asm.Na).apply(null, arguments);
      }),
      tc = (a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 = function () {
        return (tc = a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 = a.asm.Oa).apply(null, arguments);
      }),
      uc = (a._emscripten_bind_Decoder_DecodeArrayToMesh_3 = function () {
        return (uc = a._emscripten_bind_Decoder_DecodeArrayToMesh_3 = a.asm.Pa).apply(null, arguments);
      }),
      vc = (a._emscripten_bind_Decoder_GetAttributeId_2 = function () {
        return (vc = a._emscripten_bind_Decoder_GetAttributeId_2 = a.asm.Qa).apply(null, arguments);
      }),
      wc = (a._emscripten_bind_Decoder_GetAttributeIdByName_2 = function () {
        return (wc = a._emscripten_bind_Decoder_GetAttributeIdByName_2 = a.asm.Ra).apply(null, arguments);
      }),
      xc = (a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 = function () {
        return (xc = a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 = a.asm.Sa).apply(null, arguments);
      }),
      yc = (a._emscripten_bind_Decoder_GetAttribute_2 = function () {
        return (yc = a._emscripten_bind_Decoder_GetAttribute_2 = a.asm.Ta).apply(null, arguments);
      }),
      zc = (a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 = function () {
        return (zc = a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 = a.asm.Ua).apply(null, arguments);
      }),
      Ac = (a._emscripten_bind_Decoder_GetMetadata_1 = function () {
        return (Ac = a._emscripten_bind_Decoder_GetMetadata_1 = a.asm.Va).apply(null, arguments);
      }),
      Bc = (a._emscripten_bind_Decoder_GetAttributeMetadata_2 = function () {
        return (Bc = a._emscripten_bind_Decoder_GetAttributeMetadata_2 = a.asm.Wa).apply(null, arguments);
      }),
      Cc = (a._emscripten_bind_Decoder_GetFaceFromMesh_3 = function () {
        return (Cc = a._emscripten_bind_Decoder_GetFaceFromMesh_3 = a.asm.Xa).apply(null, arguments);
      }),
      Dc = (a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 = function () {
        return (Dc = a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 = a.asm.Ya).apply(null, arguments);
      }),
      Ec = (a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 = function () {
        return (Ec = a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 = a.asm.Za).apply(null, arguments);
      }),
      Fc = (a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 = function () {
        return (Fc = a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 = a.asm._a).apply(null, arguments);
      }),
      Gc = (a._emscripten_bind_Decoder_GetAttributeFloat_3 = function () {
        return (Gc = a._emscripten_bind_Decoder_GetAttributeFloat_3 = a.asm.$a).apply(null, arguments);
      }),
      Hc = (a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 = function () {
        return (Hc = a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 = a.asm.ab).apply(null, arguments);
      }),
      Ic = (a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 = function () {
        return (Ic = a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 = a.asm.bb).apply(null, arguments);
      }),
      Jc = (a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 = function () {
        return (Jc = a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 = a.asm.cb).apply(null, arguments);
      }),
      Kc = (a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 = function () {
        return (Kc = a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 = a.asm.db).apply(null, arguments);
      }),
      Lc = (a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 = function () {
        return (Lc = a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 = a.asm.eb).apply(null, arguments);
      }),
      Mc = (a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 = function () {
        return (Mc = a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 = a.asm.fb).apply(null, arguments);
      }),
      Nc = (a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 = function () {
        return (Nc = a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 = a.asm.gb).apply(null, arguments);
      }),
      Oc = (a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 = function () {
        return (Oc = a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 = a.asm.hb).apply(null, arguments);
      }),
      Pc = (a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 = function () {
        return (Pc = a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 = a.asm.ib).apply(null, arguments);
      }),
      Qc = (a._emscripten_bind_Decoder_SkipAttributeTransform_1 = function () {
        return (Qc = a._emscripten_bind_Decoder_SkipAttributeTransform_1 = a.asm.jb).apply(null, arguments);
      }),
      Rc = (a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 = function () {
        return (Rc = a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 = a.asm.kb).apply(null, arguments);
      }),
      Sc = (a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 = function () {
        return (Sc = a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 = a.asm.lb).apply(null, arguments);
      }),
      Tc = (a._emscripten_bind_Decoder_DecodeBufferToMesh_2 = function () {
        return (Tc = a._emscripten_bind_Decoder_DecodeBufferToMesh_2 = a.asm.mb).apply(null, arguments);
      }),
      Uc = (a._emscripten_bind_Decoder___destroy___0 = function () {
        return (Uc = a._emscripten_bind_Decoder___destroy___0 = a.asm.nb).apply(null, arguments);
      }),
      Vc = (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM = function () {
        return (Vc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM = a.asm.ob).apply(
          null,
          arguments,
        );
      }),
      Wc = (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM = function () {
        return (Wc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM = a.asm.pb).apply(
          null,
          arguments,
        );
      }),
      Xc = (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM = function () {
        return (Xc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM = a.asm.qb).apply(
          null,
          arguments,
        );
      }),
      Yc = (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM = function () {
        return (Yc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM = a.asm.rb).apply(
          null,
          arguments,
        );
      }),
      Zc = (a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = function () {
        return (Zc = a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = a.asm.sb).apply(null, arguments);
      }),
      $c = (a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = function () {
        return ($c = a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = a.asm.tb).apply(null, arguments);
      }),
      ad = (a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = function () {
        return (ad = a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = a.asm.ub).apply(null, arguments);
      }),
      bd = (a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = function () {
        return (bd = a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = a.asm.vb).apply(null, arguments);
      }),
      cd = (a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = function () {
        return (cd = a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = a.asm.wb).apply(null, arguments);
      }),
      dd = (a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = function () {
        return (dd = a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = a.asm.xb).apply(null, arguments);
      }),
      ed = (a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = function () {
        return (ed = a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = a.asm.yb).apply(
          null,
          arguments,
        );
      }),
      fd = (a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = function () {
        return (fd = a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = a.asm.zb).apply(null, arguments);
      }),
      gd = (a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = function () {
        return (gd = a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = a.asm.Ab).apply(null, arguments);
      }),
      hd = (a._emscripten_enum_draco_DataType_DT_INVALID = function () {
        return (hd = a._emscripten_enum_draco_DataType_DT_INVALID = a.asm.Bb).apply(null, arguments);
      }),
      id = (a._emscripten_enum_draco_DataType_DT_INT8 = function () {
        return (id = a._emscripten_enum_draco_DataType_DT_INT8 = a.asm.Cb).apply(null, arguments);
      }),
      jd = (a._emscripten_enum_draco_DataType_DT_UINT8 = function () {
        return (jd = a._emscripten_enum_draco_DataType_DT_UINT8 = a.asm.Db).apply(null, arguments);
      }),
      kd = (a._emscripten_enum_draco_DataType_DT_INT16 = function () {
        return (kd = a._emscripten_enum_draco_DataType_DT_INT16 = a.asm.Eb).apply(null, arguments);
      }),
      ld = (a._emscripten_enum_draco_DataType_DT_UINT16 = function () {
        return (ld = a._emscripten_enum_draco_DataType_DT_UINT16 = a.asm.Fb).apply(null, arguments);
      }),
      md = (a._emscripten_enum_draco_DataType_DT_INT32 = function () {
        return (md = a._emscripten_enum_draco_DataType_DT_INT32 = a.asm.Gb).apply(null, arguments);
      }),
      nd = (a._emscripten_enum_draco_DataType_DT_UINT32 = function () {
        return (nd = a._emscripten_enum_draco_DataType_DT_UINT32 = a.asm.Hb).apply(null, arguments);
      }),
      od = (a._emscripten_enum_draco_DataType_DT_INT64 = function () {
        return (od = a._emscripten_enum_draco_DataType_DT_INT64 = a.asm.Ib).apply(null, arguments);
      }),
      pd = (a._emscripten_enum_draco_DataType_DT_UINT64 = function () {
        return (pd = a._emscripten_enum_draco_DataType_DT_UINT64 = a.asm.Jb).apply(null, arguments);
      }),
      qd = (a._emscripten_enum_draco_DataType_DT_FLOAT32 = function () {
        return (qd = a._emscripten_enum_draco_DataType_DT_FLOAT32 = a.asm.Kb).apply(null, arguments);
      }),
      rd = (a._emscripten_enum_draco_DataType_DT_FLOAT64 = function () {
        return (rd = a._emscripten_enum_draco_DataType_DT_FLOAT64 = a.asm.Lb).apply(null, arguments);
      }),
      sd = (a._emscripten_enum_draco_DataType_DT_BOOL = function () {
        return (sd = a._emscripten_enum_draco_DataType_DT_BOOL = a.asm.Mb).apply(null, arguments);
      }),
      td = (a._emscripten_enum_draco_DataType_DT_TYPES_COUNT = function () {
        return (td = a._emscripten_enum_draco_DataType_DT_TYPES_COUNT = a.asm.Nb).apply(null, arguments);
      }),
      ud = (a._emscripten_enum_draco_StatusCode_OK = function () {
        return (ud = a._emscripten_enum_draco_StatusCode_OK = a.asm.Ob).apply(null, arguments);
      }),
      vd = (a._emscripten_enum_draco_StatusCode_DRACO_ERROR = function () {
        return (vd = a._emscripten_enum_draco_StatusCode_DRACO_ERROR = a.asm.Pb).apply(null, arguments);
      }),
      wd = (a._emscripten_enum_draco_StatusCode_IO_ERROR = function () {
        return (wd = a._emscripten_enum_draco_StatusCode_IO_ERROR = a.asm.Qb).apply(null, arguments);
      }),
      xd = (a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER = function () {
        return (xd = a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER = a.asm.Rb).apply(null, arguments);
      }),
      yd = (a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION = function () {
        return (yd = a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION = a.asm.Sb).apply(null, arguments);
      }),
      zd = (a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION = function () {
        return (zd = a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION = a.asm.Tb).apply(null, arguments);
      });
    a._free = function () {
      return (a._free = a.asm.Ub).apply(null, arguments);
    };
    var gb = (a._malloc = function () {
      return (gb = a._malloc = a.asm.Vb).apply(null, arguments);
    });
    a.callRuntimeCallbacks = aa;
    var qa;
    ma = function b() {
      qa || W();
      qa || (ma = b);
    };
    a.run = W;
    if (a.preInit)
      for ('function' == typeof a.preInit && (a.preInit = [a.preInit]); 0 < a.preInit.length; ) a.preInit.pop()();
    W();
    v.prototype = Object.create(v.prototype);
    v.prototype.constructor = v;
    v.prototype.__class__ = v;
    v.__cache__ = {};
    a.WrapperObject = v;
    a.getCache = x;
    a.wrapPointer = S;
    a.castObject = function (b, c) {
      return S(b.ptr, c);
    };
    a.NULL = S(0);
    a.destroy = function (b) {
      if (!b.__destroy__) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
      b.__destroy__();
      delete x(b.__class__)[b.ptr];
    };
    a.compare = function (b, c) {
      return b.ptr === c.ptr;
    };
    a.getPointer = function (b) {
      return b.ptr;
    };
    a.getClass = function (b) {
      return b.__class__;
    };
    var r = {
      buffer: 0,
      size: 0,
      pos: 0,
      temps: [],
      needed: 0,
      prepare: function () {
        if (r.needed) {
          for (var b = 0; b < r.temps.length; b++) a._free(r.temps[b]);
          r.temps.length = 0;
          a._free(r.buffer);
          r.buffer = 0;
          r.size += r.needed;
          r.needed = 0;
        }
        r.buffer || ((r.size += 128), (r.buffer = a._malloc(r.size)), q(r.buffer));
        r.pos = 0;
      },
      alloc: function (b, c) {
        q(r.buffer);
        b = b.length * c.BYTES_PER_ELEMENT;
        b = (b + 7) & -8;
        r.pos + b >= r.size
          ? (q(0 < b), (r.needed += b), (c = a._malloc(b)), r.temps.push(c))
          : ((c = r.buffer + r.pos), (r.pos += b));
        return c;
      },
      copy: function (b, c, d) {
        d >>>= 0;
        switch (c.BYTES_PER_ELEMENT) {
          case 2:
            d >>>= 1;
            break;
          case 4:
            d >>>= 2;
            break;
          case 8:
            d >>>= 3;
        }
        for (var f = 0; f < b.length; f++) c[d + f] = b[f];
      },
    };
    ca.prototype = Object.create(v.prototype);
    ca.prototype.constructor = ca;
    ca.prototype.__class__ = ca;
    ca.__cache__ = {};
    a.VoidPtr = ca;
    ca.prototype.__destroy__ = ca.prototype.__destroy__ = function () {
      hb(this.ptr);
    };
    T.prototype = Object.create(v.prototype);
    T.prototype.constructor = T;
    T.prototype.__class__ = T;
    T.__cache__ = {};
    a.DecoderBuffer = T;
    T.prototype.Init = T.prototype.Init = function (b, c) {
      var d = this.ptr;
      r.prepare();
      'object' == typeof b && (b = va(b));
      c && 'object' === typeof c && (c = c.ptr);
      ib(d, b, c);
    };
    T.prototype.__destroy__ = T.prototype.__destroy__ = function () {
      jb(this.ptr);
    };
    R.prototype = Object.create(v.prototype);
    R.prototype.constructor = R;
    R.prototype.__class__ = R;
    R.__cache__ = {};
    a.AttributeTransformData = R;
    R.prototype.transform_type = R.prototype.transform_type = function () {
      return kb(this.ptr);
    };
    R.prototype.__destroy__ = R.prototype.__destroy__ = function () {
      lb(this.ptr);
    };
    Z.prototype = Object.create(v.prototype);
    Z.prototype.constructor = Z;
    Z.prototype.__class__ = Z;
    Z.__cache__ = {};
    a.GeometryAttribute = Z;
    Z.prototype.__destroy__ = Z.prototype.__destroy__ = function () {
      mb(this.ptr);
    };
    w.prototype = Object.create(v.prototype);
    w.prototype.constructor = w;
    w.prototype.__class__ = w;
    w.__cache__ = {};
    a.PointAttribute = w;
    w.prototype.size = w.prototype.size = function () {
      return nb(this.ptr);
    };
    w.prototype.GetAttributeTransformData = w.prototype.GetAttributeTransformData = function () {
      return S(ob(this.ptr), R);
    };
    w.prototype.attribute_type = w.prototype.attribute_type = function () {
      return pb(this.ptr);
    };
    w.prototype.data_type = w.prototype.data_type = function () {
      return qb(this.ptr);
    };
    w.prototype.num_components = w.prototype.num_components = function () {
      return rb(this.ptr);
    };
    w.prototype.normalized = w.prototype.normalized = function () {
      return !!sb(this.ptr);
    };
    w.prototype.byte_stride = w.prototype.byte_stride = function () {
      return tb(this.ptr);
    };
    w.prototype.byte_offset = w.prototype.byte_offset = function () {
      return ub(this.ptr);
    };
    w.prototype.unique_id = w.prototype.unique_id = function () {
      return vb(this.ptr);
    };
    w.prototype.__destroy__ = w.prototype.__destroy__ = function () {
      wb(this.ptr);
    };
    C.prototype = Object.create(v.prototype);
    C.prototype.constructor = C;
    C.prototype.__class__ = C;
    C.__cache__ = {};
    a.AttributeQuantizationTransform = C;
    C.prototype.InitFromAttribute = C.prototype.InitFromAttribute = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return !!xb(c, b);
    };
    C.prototype.quantization_bits = C.prototype.quantization_bits = function () {
      return yb(this.ptr);
    };
    C.prototype.min_value = C.prototype.min_value = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return zb(c, b);
    };
    C.prototype.range = C.prototype.range = function () {
      return Ab(this.ptr);
    };
    C.prototype.__destroy__ = C.prototype.__destroy__ = function () {
      Bb(this.ptr);
    };
    G.prototype = Object.create(v.prototype);
    G.prototype.constructor = G;
    G.prototype.__class__ = G;
    G.__cache__ = {};
    a.AttributeOctahedronTransform = G;
    G.prototype.InitFromAttribute = G.prototype.InitFromAttribute = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return !!Cb(c, b);
    };
    G.prototype.quantization_bits = G.prototype.quantization_bits = function () {
      return Db(this.ptr);
    };
    G.prototype.__destroy__ = G.prototype.__destroy__ = function () {
      Eb(this.ptr);
    };
    H.prototype = Object.create(v.prototype);
    H.prototype.constructor = H;
    H.prototype.__class__ = H;
    H.__cache__ = {};
    a.PointCloud = H;
    H.prototype.num_attributes = H.prototype.num_attributes = function () {
      return Fb(this.ptr);
    };
    H.prototype.num_points = H.prototype.num_points = function () {
      return Gb(this.ptr);
    };
    H.prototype.__destroy__ = H.prototype.__destroy__ = function () {
      Hb(this.ptr);
    };
    E.prototype = Object.create(v.prototype);
    E.prototype.constructor = E;
    E.prototype.__class__ = E;
    E.__cache__ = {};
    a.Mesh = E;
    E.prototype.num_faces = E.prototype.num_faces = function () {
      return Ib(this.ptr);
    };
    E.prototype.num_attributes = E.prototype.num_attributes = function () {
      return Jb(this.ptr);
    };
    E.prototype.num_points = E.prototype.num_points = function () {
      return Kb(this.ptr);
    };
    E.prototype.__destroy__ = E.prototype.__destroy__ = function () {
      Lb(this.ptr);
    };
    U.prototype = Object.create(v.prototype);
    U.prototype.constructor = U;
    U.prototype.__class__ = U;
    U.__cache__ = {};
    a.Metadata = U;
    U.prototype.__destroy__ = U.prototype.__destroy__ = function () {
      Mb(this.ptr);
    };
    B.prototype = Object.create(v.prototype);
    B.prototype.constructor = B;
    B.prototype.__class__ = B;
    B.__cache__ = {};
    a.Status = B;
    B.prototype.code = B.prototype.code = function () {
      return Nb(this.ptr);
    };
    B.prototype.ok = B.prototype.ok = function () {
      return !!Ob(this.ptr);
    };
    B.prototype.error_msg = B.prototype.error_msg = function () {
      return A(Pb(this.ptr));
    };
    B.prototype.__destroy__ = B.prototype.__destroy__ = function () {
      Qb(this.ptr);
    };
    I.prototype = Object.create(v.prototype);
    I.prototype.constructor = I;
    I.prototype.__class__ = I;
    I.__cache__ = {};
    a.DracoFloat32Array = I;
    I.prototype.GetValue = I.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return Rb(c, b);
    };
    I.prototype.size = I.prototype.size = function () {
      return Sb(this.ptr);
    };
    I.prototype.__destroy__ = I.prototype.__destroy__ = function () {
      Tb(this.ptr);
    };
    J.prototype = Object.create(v.prototype);
    J.prototype.constructor = J;
    J.prototype.__class__ = J;
    J.__cache__ = {};
    a.DracoInt8Array = J;
    J.prototype.GetValue = J.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return Ub(c, b);
    };
    J.prototype.size = J.prototype.size = function () {
      return Vb(this.ptr);
    };
    J.prototype.__destroy__ = J.prototype.__destroy__ = function () {
      Wb(this.ptr);
    };
    K.prototype = Object.create(v.prototype);
    K.prototype.constructor = K;
    K.prototype.__class__ = K;
    K.__cache__ = {};
    a.DracoUInt8Array = K;
    K.prototype.GetValue = K.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return Xb(c, b);
    };
    K.prototype.size = K.prototype.size = function () {
      return Yb(this.ptr);
    };
    K.prototype.__destroy__ = K.prototype.__destroy__ = function () {
      Zb(this.ptr);
    };
    L.prototype = Object.create(v.prototype);
    L.prototype.constructor = L;
    L.prototype.__class__ = L;
    L.__cache__ = {};
    a.DracoInt16Array = L;
    L.prototype.GetValue = L.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return $b(c, b);
    };
    L.prototype.size = L.prototype.size = function () {
      return ac(this.ptr);
    };
    L.prototype.__destroy__ = L.prototype.__destroy__ = function () {
      bc(this.ptr);
    };
    M.prototype = Object.create(v.prototype);
    M.prototype.constructor = M;
    M.prototype.__class__ = M;
    M.__cache__ = {};
    a.DracoUInt16Array = M;
    M.prototype.GetValue = M.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return cc(c, b);
    };
    M.prototype.size = M.prototype.size = function () {
      return dc(this.ptr);
    };
    M.prototype.__destroy__ = M.prototype.__destroy__ = function () {
      ec(this.ptr);
    };
    N.prototype = Object.create(v.prototype);
    N.prototype.constructor = N;
    N.prototype.__class__ = N;
    N.__cache__ = {};
    a.DracoInt32Array = N;
    N.prototype.GetValue = N.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return fc(c, b);
    };
    N.prototype.size = N.prototype.size = function () {
      return gc(this.ptr);
    };
    N.prototype.__destroy__ = N.prototype.__destroy__ = function () {
      hc(this.ptr);
    };
    O.prototype = Object.create(v.prototype);
    O.prototype.constructor = O;
    O.prototype.__class__ = O;
    O.__cache__ = {};
    a.DracoUInt32Array = O;
    O.prototype.GetValue = O.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return ic(c, b);
    };
    O.prototype.size = O.prototype.size = function () {
      return jc(this.ptr);
    };
    O.prototype.__destroy__ = O.prototype.__destroy__ = function () {
      kc(this.ptr);
    };
    y.prototype = Object.create(v.prototype);
    y.prototype.constructor = y;
    y.prototype.__class__ = y;
    y.__cache__ = {};
    a.MetadataQuerier = y;
    y.prototype.HasEntry = y.prototype.HasEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : da(c);
      return !!lc(d, b, c);
    };
    y.prototype.GetIntEntry = y.prototype.GetIntEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : da(c);
      return mc(d, b, c);
    };
    y.prototype.GetIntEntryArray = y.prototype.GetIntEntryArray = function (b, c, d) {
      var f = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : da(c);
      d && 'object' === typeof d && (d = d.ptr);
      nc(f, b, c, d);
    };
    y.prototype.GetDoubleEntry = y.prototype.GetDoubleEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : da(c);
      return oc(d, b, c);
    };
    y.prototype.GetStringEntry = y.prototype.GetStringEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : da(c);
      return A(pc(d, b, c));
    };
    y.prototype.NumEntries = y.prototype.NumEntries = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return qc(c, b);
    };
    y.prototype.GetEntryName = y.prototype.GetEntryName = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return A(rc(d, b, c));
    };
    y.prototype.__destroy__ = y.prototype.__destroy__ = function () {
      sc(this.ptr);
    };
    h.prototype = Object.create(v.prototype);
    h.prototype.constructor = h;
    h.prototype.__class__ = h;
    h.__cache__ = {};
    a.Decoder = h;
    h.prototype.DecodeArrayToPointCloud = h.prototype.DecodeArrayToPointCloud = function (b, c, d) {
      var f = this.ptr;
      r.prepare();
      'object' == typeof b && (b = va(b));
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return S(tc(f, b, c, d), B);
    };
    h.prototype.DecodeArrayToMesh = h.prototype.DecodeArrayToMesh = function (b, c, d) {
      var f = this.ptr;
      r.prepare();
      'object' == typeof b && (b = va(b));
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return S(uc(f, b, c, d), B);
    };
    h.prototype.GetAttributeId = h.prototype.GetAttributeId = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return vc(d, b, c);
    };
    h.prototype.GetAttributeIdByName = h.prototype.GetAttributeIdByName = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : da(c);
      return wc(d, b, c);
    };
    h.prototype.GetAttributeIdByMetadataEntry = h.prototype.GetAttributeIdByMetadataEntry = function (b, c, d) {
      var f = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : da(c);
      d = d && 'object' === typeof d ? d.ptr : da(d);
      return xc(f, b, c, d);
    };
    h.prototype.GetAttribute = h.prototype.GetAttribute = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return S(yc(d, b, c), w);
    };
    h.prototype.GetAttributeByUniqueId = h.prototype.GetAttributeByUniqueId = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return S(zc(d, b, c), w);
    };
    h.prototype.GetMetadata = h.prototype.GetMetadata = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return S(Ac(c, b), U);
    };
    h.prototype.GetAttributeMetadata = h.prototype.GetAttributeMetadata = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return S(Bc(d, b, c), U);
    };
    h.prototype.GetFaceFromMesh = h.prototype.GetFaceFromMesh = function (b, c, d) {
      var f = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Cc(f, b, c, d);
    };
    h.prototype.GetTriangleStripsFromMesh = h.prototype.GetTriangleStripsFromMesh = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return Dc(d, b, c);
    };
    h.prototype.GetTrianglesUInt16Array = h.prototype.GetTrianglesUInt16Array = function (b, c, d) {
      var f = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Ec(f, b, c, d);
    };
    h.prototype.GetTrianglesUInt32Array = h.prototype.GetTrianglesUInt32Array = function (b, c, d) {
      var f = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Fc(f, b, c, d);
    };
    h.prototype.GetAttributeFloat = h.prototype.GetAttributeFloat = function (b, c, d) {
      var f = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Gc(f, b, c, d);
    };
    h.prototype.GetAttributeFloatForAllPoints = h.prototype.GetAttributeFloatForAllPoints = function (b, c, d) {
      var f = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Hc(f, b, c, d);
    };
    h.prototype.GetAttributeIntForAllPoints = h.prototype.GetAttributeIntForAllPoints = function (b, c, d) {
      var f = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Ic(f, b, c, d);
    };
    h.prototype.GetAttributeInt8ForAllPoints = h.prototype.GetAttributeInt8ForAllPoints = function (b, c, d) {
      var f = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Jc(f, b, c, d);
    };
    h.prototype.GetAttributeUInt8ForAllPoints = h.prototype.GetAttributeUInt8ForAllPoints = function (b, c, d) {
      var f = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Kc(f, b, c, d);
    };
    h.prototype.GetAttributeInt16ForAllPoints = h.prototype.GetAttributeInt16ForAllPoints = function (b, c, d) {
      var f = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Lc(f, b, c, d);
    };
    h.prototype.GetAttributeUInt16ForAllPoints = h.prototype.GetAttributeUInt16ForAllPoints = function (b, c, d) {
      var f = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Mc(f, b, c, d);
    };
    h.prototype.GetAttributeInt32ForAllPoints = h.prototype.GetAttributeInt32ForAllPoints = function (b, c, d) {
      var f = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Nc(f, b, c, d);
    };
    h.prototype.GetAttributeUInt32ForAllPoints = h.prototype.GetAttributeUInt32ForAllPoints = function (b, c, d) {
      var f = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Oc(f, b, c, d);
    };
    h.prototype.GetAttributeDataArrayForAllPoints = h.prototype.GetAttributeDataArrayForAllPoints = function (
      b,
      c,
      d,
      f,
      t,
    ) {
      var Y = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      f && 'object' === typeof f && (f = f.ptr);
      t && 'object' === typeof t && (t = t.ptr);
      return !!Pc(Y, b, c, d, f, t);
    };
    h.prototype.SkipAttributeTransform = h.prototype.SkipAttributeTransform = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      Qc(c, b);
    };
    h.prototype.GetEncodedGeometryType_Deprecated = h.prototype.GetEncodedGeometryType_Deprecated = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return Rc(c, b);
    };
    h.prototype.DecodeBufferToPointCloud = h.prototype.DecodeBufferToPointCloud = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return S(Sc(d, b, c), B);
    };
    h.prototype.DecodeBufferToMesh = h.prototype.DecodeBufferToMesh = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return S(Tc(d, b, c), B);
    };
    h.prototype.__destroy__ = h.prototype.__destroy__ = function () {
      Uc(this.ptr);
    };
    (function () {
      function b() {
        a.ATTRIBUTE_INVALID_TRANSFORM = Vc();
        a.ATTRIBUTE_NO_TRANSFORM = Wc();
        a.ATTRIBUTE_QUANTIZATION_TRANSFORM = Xc();
        a.ATTRIBUTE_OCTAHEDRON_TRANSFORM = Yc();
        a.INVALID = Zc();
        a.POSITION = $c();
        a.NORMAL = ad();
        a.COLOR = bd();
        a.TEX_COORD = cd();
        a.GENERIC = dd();
        a.INVALID_GEOMETRY_TYPE = ed();
        a.POINT_CLOUD = fd();
        a.TRIANGULAR_MESH = gd();
        a.DT_INVALID = hd();
        a.DT_INT8 = id();
        a.DT_UINT8 = jd();
        a.DT_INT16 = kd();
        a.DT_UINT16 = ld();
        a.DT_INT32 = md();
        a.DT_UINT32 = nd();
        a.DT_INT64 = od();
        a.DT_UINT64 = pd();
        a.DT_FLOAT32 = qd();
        a.DT_FLOAT64 = rd();
        a.DT_BOOL = sd();
        a.DT_TYPES_COUNT = td();
        a.OK = ud();
        a.DRACO_ERROR = vd();
        a.IO_ERROR = wd();
        a.INVALID_PARAMETER = xd();
        a.UNSUPPORTED_VERSION = yd();
        a.UNKNOWN_VERSION = zd();
      }
      Ha ? b() : ua.unshift(b);
    })();
    a.mainCallbacks = ua;
    if ('function' === typeof a.onModuleParsed) a.onModuleParsed();
    a.Decoder.prototype.GetEncodedGeometryType = function (b) {
      if (b.__class__ && b.__class__ === a.DecoderBuffer)
        return a.Decoder.prototype.GetEncodedGeometryType_Deprecated(b);
      if (8 > b.byteLength) return a.INVALID_GEOMETRY_TYPE;
      switch (b[7]) {
        case 0:
          return a.POINT_CLOUD;
        case 1:
          return a.TRIANGULAR_MESH;
        default:
          return a.INVALID_GEOMETRY_TYPE;
      }
    };
    return p.ready;
  };
})();
'object' === typeof exports && 'object' === typeof module
  ? (module.exports = DracoDecoderModule)
  : 'function' === typeof define && define.amd
  ? define([], function () {
      return DracoDecoderModule;
    })
  : 'object' === typeof exports && (exports.DracoDecoderModule = DracoDecoderModule);
