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
  for (var B = 0; B < k.length - 1; B++) {
    var f = k[B];
    if (!(f in q)) return;
    q = q[f];
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
    function l(f) {
      return f instanceof k
        ? f
        : new k(function (n, u) {
            n(f);
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
    p.prototype.asyncExecute = function (f) {
      if (null == this.batch_) {
        this.batch_ = [];
        var n = this;
        this.asyncExecuteFunction(function () {
          n.executeBatch_();
        });
      }
      this.batch_.push(f);
    };
    var q = $jscomp.global.setTimeout;
    p.prototype.asyncExecuteFunction = function (f) {
      q(f, 0);
    };
    p.prototype.executeBatch_ = function () {
      for (; this.batch_ && this.batch_.length; ) {
        var f = this.batch_;
        this.batch_ = [];
        for (var n = 0; n < f.length; ++n) {
          var u = f[n];
          f[n] = null;
          try {
            u();
          } catch (z) {
            this.asyncThrow_(z);
          }
        }
      }
      this.batch_ = null;
    };
    p.prototype.asyncThrow_ = function (f) {
      this.asyncExecuteFunction(function () {
        throw f;
      });
    };
    var k = function (f) {
      this.state_ = 0;
      this.result_ = void 0;
      this.onSettledCallbacks_ = [];
      this.isRejectionHandled_ = !1;
      var n = this.createResolveAndReject_();
      try {
        f(n.resolve, n.reject);
      } catch (u) {
        n.reject(u);
      }
    };
    k.prototype.createResolveAndReject_ = function () {
      function f(z) {
        return function (D) {
          u || ((u = !0), z.call(n, D));
        };
      }
      var n = this,
        u = !1;
      return { resolve: f(this.resolveTo_), reject: f(this.reject_) };
    };
    k.prototype.resolveTo_ = function (f) {
      if (f === this) this.reject_(new TypeError('A Promise cannot resolve to itself'));
      else if (f instanceof k) this.settleSameAsPromise_(f);
      else {
        a: switch (typeof f) {
          case 'object':
            var n = null != f;
            break a;
          case 'function':
            n = !0;
            break a;
          default:
            n = !1;
        }
        n ? this.resolveToNonPromiseObj_(f) : this.fulfill_(f);
      }
    };
    k.prototype.resolveToNonPromiseObj_ = function (f) {
      var n = void 0;
      try {
        n = f.then;
      } catch (u) {
        this.reject_(u);
        return;
      }
      'function' == typeof n ? this.settleSameAsThenable_(n, f) : this.fulfill_(f);
    };
    k.prototype.reject_ = function (f) {
      this.settle_(2, f);
    };
    k.prototype.fulfill_ = function (f) {
      this.settle_(1, f);
    };
    k.prototype.settle_ = function (f, n) {
      if (0 != this.state_)
        throw Error('Cannot settle(' + f + ', ' + n + '): Promise already settled in state' + this.state_);
      this.state_ = f;
      this.result_ = n;
      2 === this.state_ && this.scheduleUnhandledRejectionCheck_();
      this.executeOnSettledCallbacks_();
    };
    k.prototype.scheduleUnhandledRejectionCheck_ = function () {
      var f = this;
      q(function () {
        if (f.notifyUnhandledRejection_()) {
          var n = $jscomp.global.console;
          'undefined' !== typeof n && n.error(f.result_);
        }
      }, 1);
    };
    k.prototype.notifyUnhandledRejection_ = function () {
      if (this.isRejectionHandled_) return !1;
      var f = $jscomp.global.CustomEvent,
        n = $jscomp.global.Event,
        u = $jscomp.global.dispatchEvent;
      if ('undefined' === typeof u) return !0;
      'function' === typeof f
        ? (f = new f('unhandledrejection', { cancelable: !0 }))
        : 'function' === typeof n
        ? (f = new n('unhandledrejection', { cancelable: !0 }))
        : ((f = $jscomp.global.document.createEvent('CustomEvent')),
          f.initCustomEvent('unhandledrejection', !1, !0, f));
      f.promise = this;
      f.reason = this.result_;
      return u(f);
    };
    k.prototype.executeOnSettledCallbacks_ = function () {
      if (null != this.onSettledCallbacks_) {
        for (var f = 0; f < this.onSettledCallbacks_.length; ++f) B.asyncExecute(this.onSettledCallbacks_[f]);
        this.onSettledCallbacks_ = null;
      }
    };
    var B = new p();
    k.prototype.settleSameAsPromise_ = function (f) {
      var n = this.createResolveAndReject_();
      f.callWhenSettled_(n.resolve, n.reject);
    };
    k.prototype.settleSameAsThenable_ = function (f, n) {
      var u = this.createResolveAndReject_();
      try {
        f.call(n, u.resolve, u.reject);
      } catch (z) {
        u.reject(z);
      }
    };
    k.prototype.then = function (f, n) {
      function u(Q, t) {
        return 'function' == typeof Q
          ? function (x) {
              try {
                z(Q(x));
              } catch (E) {
                D(E);
              }
            }
          : t;
      }
      var z,
        D,
        fa = new k(function (Q, t) {
          z = Q;
          D = t;
        });
      this.callWhenSettled_(u(f, z), u(n, D));
      return fa;
    };
    k.prototype.catch = function (f) {
      return this.then(void 0, f);
    };
    k.prototype.callWhenSettled_ = function (f, n) {
      function u() {
        switch (z.state_) {
          case 1:
            f(z.result_);
            break;
          case 2:
            n(z.result_);
            break;
          default:
            throw Error('Unexpected state: ' + z.state_);
        }
      }
      var z = this;
      null == this.onSettledCallbacks_ ? B.asyncExecute(u) : this.onSettledCallbacks_.push(u);
      this.isRejectionHandled_ = !0;
    };
    k.resolve = l;
    k.reject = function (f) {
      return new k(function (n, u) {
        u(f);
      });
    };
    k.race = function (f) {
      return new k(function (n, u) {
        for (var z = $jscomp.makeIterator(f), D = z.next(); !D.done; D = z.next()) l(D.value).callWhenSettled_(n, u);
      });
    };
    k.all = function (f) {
      var n = $jscomp.makeIterator(f),
        u = n.next();
      return u.done
        ? l([])
        : new k(function (z, D) {
            function fa(x) {
              return function (E) {
                Q[x] = E;
                t--;
                0 == t && z(Q);
              };
            }
            var Q = [],
              t = 0;
            do Q.push(void 0), t++, l(u.value).callWhenSettled_(fa(Q.length - 1), D), (u = n.next());
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
          var B = this.length;
          l = p(l);
          q = p(q);
          k = void 0 === k ? B : p(k);
          l = 0 > l ? Math.max(B + l, 0) : Math.min(l, B);
          q = 0 > q ? Math.max(B + q, 0) : Math.min(q, B);
          k = 0 > k ? Math.max(B + k, 0) : Math.min(k, B);
          if (l < q) for (; q < k; ) q in this ? (this[l++] = this[q++]) : (delete this[l++], q++);
          else
            for (k = Math.min(k, B + q - l), l += k - q; k > q; )
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
      return a.locateFile ? a.locateFile(e, V) : V + e;
    }
    function q(e, b) {
      e || f('Assertion failed: ' + b);
    }
    function k(e, b) {
      if (e) {
        var c = la;
        var d = e + b;
        for (b = e; c[b] && !(b >= d); ) ++b;
        if (16 < b - e && c.subarray && za) c = za.decode(c.subarray(e, b));
        else {
          for (d = ''; e < b; ) {
            var g = c[e++];
            if (g & 128) {
              var v = c[e++] & 63;
              if (192 == (g & 224)) d += String.fromCharCode(((g & 31) << 6) | v);
              else {
                var Y = c[e++] & 63;
                g =
                  224 == (g & 240)
                    ? ((g & 15) << 12) | (v << 6) | Y
                    : ((g & 7) << 18) | (v << 12) | (Y << 6) | (c[e++] & 63);
                65536 > g
                  ? (d += String.fromCharCode(g))
                  : ((g -= 65536), (d += String.fromCharCode(55296 | (g >> 10), 56320 | (g & 1023))));
              }
            } else d += String.fromCharCode(g);
          }
          c = d;
        }
      } else c = '';
      return c;
    }
    function B(e) {
      Aa = e;
      a.HEAP8 = Z = new Int8Array(e);
      a.HEAP16 = new Int16Array(e);
      a.HEAP32 = W = new Int32Array(e);
      a.HEAPU8 = la = new Uint8Array(e);
      a.HEAPU16 = new Uint16Array(e);
      a.HEAPU32 = new Uint32Array(e);
      a.HEAPF32 = new Float32Array(e);
      a.HEAPF64 = new Float64Array(e);
    }
    function f(e) {
      if (a.onAbort) a.onAbort(e);
      e += '';
      ha(e);
      Ba = !0;
      e = new WebAssembly.RuntimeError('abort(' + e + '). Build with -s ASSERTIONS=1 for more info.');
      qa(e);
      throw e;
    }
    function n(e, b) {
      return String.prototype.startsWith ? e.startsWith(b) : 0 === e.indexOf(b);
    }
    function u(e) {
      try {
        if (e == R && ia) return new Uint8Array(ia);
        if (ma) return ma(e);
        throw 'both async and sync fetching of the wasm failed';
      } catch (b) {
        f(b);
      }
    }
    function z() {
      if (!ia && (na || da)) {
        if ('function' === typeof fetch && !n(R, 'file://'))
          return fetch(R, { credentials: 'same-origin' })
            .then(function (e) {
              if (!e.ok) throw "failed to load wasm binary file at '" + R + "'";
              return e.arrayBuffer();
            })
            .catch(function () {
              return u(R);
            });
        if (Ca)
          return new Promise(function (e, b) {
            Ca(
              R,
              function (c) {
                e(new Uint8Array(c));
              },
              b,
            );
          });
      }
      return Promise.resolve().then(function () {
        return u(R);
      });
    }
    function D(e) {
      for (; 0 < e.length; ) {
        var b = e.shift();
        if ('function' == typeof b) b(a);
        else {
          var c = b.func;
          'number' === typeof c
            ? void 0 === b.arg
              ? ra.get(c)()
              : ra.get(c)(b.arg)
            : c(void 0 === b.arg ? null : b.arg);
        }
      }
    }
    function fa(e) {
      this.excPtr = e;
      this.ptr = e - F.SIZE;
      this.set_type = function (b) {
        W[(this.ptr + F.TYPE_OFFSET) >> 2] = b;
      };
      this.get_type = function () {
        return W[(this.ptr + F.TYPE_OFFSET) >> 2];
      };
      this.set_destructor = function (b) {
        W[(this.ptr + F.DESTRUCTOR_OFFSET) >> 2] = b;
      };
      this.get_destructor = function () {
        return W[(this.ptr + F.DESTRUCTOR_OFFSET) >> 2];
      };
      this.set_refcount = function (b) {
        W[(this.ptr + F.REFCOUNT_OFFSET) >> 2] = b;
      };
      this.set_caught = function (b) {
        Z[(this.ptr + F.CAUGHT_OFFSET) >> 0] = b ? 1 : 0;
      };
      this.get_caught = function () {
        return 0 != Z[(this.ptr + F.CAUGHT_OFFSET) >> 0];
      };
      this.set_rethrown = function (b) {
        Z[(this.ptr + F.RETHROWN_OFFSET) >> 0] = b ? 1 : 0;
      };
      this.get_rethrown = function () {
        return 0 != Z[(this.ptr + F.RETHROWN_OFFSET) >> 0];
      };
      this.init = function (b, c) {
        this.set_type(b);
        this.set_destructor(c);
        this.set_refcount(0);
        this.set_caught(!1);
        this.set_rethrown(!1);
      };
      this.add_ref = function () {
        W[(this.ptr + F.REFCOUNT_OFFSET) >> 2] += 1;
      };
      this.release_ref = function () {
        var b = W[(this.ptr + F.REFCOUNT_OFFSET) >> 2];
        W[(this.ptr + F.REFCOUNT_OFFSET) >> 2] = b - 1;
        return 1 === b;
      };
    }
    function Q(e) {
      function b() {
        if (!oa && ((oa = !0), (a.calledRun = !0), !Ba)) {
          Da = !0;
          D(Ea);
          D(sa);
          Fa(a);
          if (a.onRuntimeInitialized) a.onRuntimeInitialized();
          if (a.postRun)
            for ('function' == typeof a.postRun && (a.postRun = [a.postRun]); a.postRun.length; )
              Ga.unshift(a.postRun.shift());
          D(Ga);
        }
      }
      if (!(0 < ea)) {
        if (a.preRun)
          for ('function' == typeof a.preRun && (a.preRun = [a.preRun]); a.preRun.length; )
            Ha.unshift(a.preRun.shift());
        D(Ha);
        0 < ea ||
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
    function t() {}
    function x(e) {
      return (e || t).__cache__;
    }
    function E(e, b) {
      var c = x(b),
        d = c[e];
      if (d) return d;
      d = Object.create((b || t).prototype);
      d.ptr = e;
      return (c[e] = d);
    }
    function ba(e) {
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
          for (var g = 0; g < e.length; ++g) {
            var v = e.charCodeAt(g);
            if (55296 <= v && 57343 >= v) {
              var Y = e.charCodeAt(++g);
              v = (65536 + ((v & 1023) << 10)) | (Y & 1023);
            }
            if (127 >= v) {
              if (c >= d) break;
              b[c++] = v;
            } else {
              if (2047 >= v) {
                if (c + 1 >= d) break;
                b[c++] = 192 | (v >> 6);
              } else {
                if (65535 >= v) {
                  if (c + 2 >= d) break;
                  b[c++] = 224 | (v >> 12);
                } else {
                  if (c + 3 >= d) break;
                  b[c++] = 240 | (v >> 18);
                  b[c++] = 128 | ((v >> 12) & 63);
                }
                b[c++] = 128 | ((v >> 6) & 63);
              }
              b[c++] = 128 | (v & 63);
            }
          }
          b[c] = 0;
        }
        e = r.alloc(b, Z);
        r.copy(b, Z, e);
        return e;
      }
      return e;
    }
    function ta(e) {
      if ('object' === typeof e) {
        var b = r.alloc(e, Z);
        r.copy(e, Z, b);
        return b;
      }
      return e;
    }
    function aa() {
      throw 'cannot construct a VoidPtr, no constructor in IDL';
    }
    function T() {
      this.ptr = Ia();
      x(T)[this.ptr] = this;
    }
    function S() {
      this.ptr = Ja();
      x(S)[this.ptr] = this;
    }
    function X() {
      this.ptr = Ka();
      x(X)[this.ptr] = this;
    }
    function w() {
      this.ptr = La();
      x(w)[this.ptr] = this;
    }
    function C() {
      this.ptr = Ma();
      x(C)[this.ptr] = this;
    }
    function H() {
      this.ptr = Na();
      x(H)[this.ptr] = this;
    }
    function I() {
      this.ptr = Oa();
      x(I)[this.ptr] = this;
    }
    function G() {
      this.ptr = Pa();
      x(G)[this.ptr] = this;
    }
    function U() {
      this.ptr = Qa();
      x(U)[this.ptr] = this;
    }
    function A() {
      throw 'cannot construct a Status, no constructor in IDL';
    }
    function J() {
      this.ptr = Ra();
      x(J)[this.ptr] = this;
    }
    function K() {
      this.ptr = Sa();
      x(K)[this.ptr] = this;
    }
    function L() {
      this.ptr = Ta();
      x(L)[this.ptr] = this;
    }
    function M() {
      this.ptr = Ua();
      x(M)[this.ptr] = this;
    }
    function N() {
      this.ptr = Va();
      x(N)[this.ptr] = this;
    }
    function O() {
      this.ptr = Wa();
      x(O)[this.ptr] = this;
    }
    function P() {
      this.ptr = Xa();
      x(P)[this.ptr] = this;
    }
    function y() {
      this.ptr = Ya();
      x(y)[this.ptr] = this;
    }
    function h() {
      this.ptr = Za();
      x(h)[this.ptr] = this;
    }
    p = p || {};
    var a = 'undefined' !== typeof p ? p : {},
      Fa,
      qa;
    a.ready = new Promise(function (e, b) {
      Fa = e;
      qa = b;
    });
    var $a = !1,
      ab = !1;
    a.onRuntimeInitialized = function () {
      $a = !0;
      a.callRuntimeCallbacks(a.mainCallbacks);
      if (ab && 'function' === typeof a.onModuleLoaded) a.onModuleLoaded(a);
    };
    a.onModuleParsed = function () {
      ab = !0;
      if ($a && 'function' === typeof a.onModuleLoaded) a.onModuleLoaded(a);
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
    var ja = {},
      ca;
    for (ca in a) a.hasOwnProperty(ca) && (ja[ca] = a[ca]);
    var na = !1,
      da = !1,
      ua = !1,
      bb = !1;
    na = 'object' === typeof window;
    da = 'function' === typeof importScripts;
    ua =
      'object' === typeof process && 'object' === typeof process.versions && 'string' === typeof process.versions.node;
    bb = !na && !ua && !da;
    var V = '',
      va,
      wa;
    if (ua) {
      V = da ? require('path').dirname(V) + '/' : __dirname + '/';
      var xa = function (e, b) {
        va || (va = require('fs'));
        wa || (wa = require('path'));
        e = wa.normalize(e);
        return va.readFileSync(e, b ? null : 'utf8');
      };
      var ma = function (e) {
        e = xa(e, !0);
        e.buffer || (e = new Uint8Array(e));
        q(e.buffer);
        return e;
      };
      1 < process.argv.length && process.argv[1].replace(/\\/g, '/');
      process.argv.slice(2);
      a.inspect = function () {
        return '[Emscripten Module object]';
      };
    } else if (bb)
      'undefined' != typeof read &&
        (xa = function (e) {
          return read(e);
        }),
        (ma = function (e) {
          if ('function' === typeof readbuffer) return new Uint8Array(readbuffer(e));
          e = read(e, 'binary');
          q('object' === typeof e);
          return e;
        }),
        'undefined' !== typeof print &&
          ('undefined' === typeof console && (console = {}),
          (console.log = print),
          (console.warn = console.error = 'undefined' !== typeof printErr ? printErr : print));
    else if (na || da) {
      da
        ? (V = self.location.href)
        : 'undefined' !== typeof document && document.currentScript && (V = document.currentScript.src);
      m && (V = m);
      V = 0 !== V.indexOf('blob:') ? V.substr(0, V.lastIndexOf('/') + 1) : '';
      xa = function (e) {
        var b = new XMLHttpRequest();
        b.open('GET', e, !1);
        b.send(null);
        return b.responseText;
      };
      da &&
        (ma = function (e) {
          var b = new XMLHttpRequest();
          b.open('GET', e, !1);
          b.responseType = 'arraybuffer';
          b.send(null);
          return new Uint8Array(b.response);
        });
      var Ca = function (e, b, c) {
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
    a.print || console.log.bind(console);
    var ha = a.printErr || console.warn.bind(console);
    for (ca in ja) ja.hasOwnProperty(ca) && (a[ca] = ja[ca]);
    ja = null;
    var ia;
    a.wasmBinary && (ia = a.wasmBinary);
    'object' !== typeof WebAssembly && f('no native wasm support detected');
    var pa,
      Ba = !1,
      za = 'undefined' !== typeof TextDecoder ? new TextDecoder('utf8') : void 0,
      Aa,
      Z,
      la,
      W,
      ra,
      Ha = [],
      Ea = [],
      sa = [],
      Ga = [],
      Da = !1,
      ea = 0,
      ya = null,
      ka = null;
    a.preloadedImages = {};
    a.preloadedAudios = {};
    var R = 'draco_decoder_gltf.wasm';
    n(R, 'data:application/octet-stream;base64,') || (R = l(R));
    var F = {
        DESTRUCTOR_OFFSET: 0,
        REFCOUNT_OFFSET: 4,
        TYPE_OFFSET: 8,
        CAUGHT_OFFSET: 12,
        RETHROWN_OFFSET: 13,
        SIZE: 16,
      },
      wd = 0,
      xd = {
        e: function (e) {
          return cb(e + F.SIZE) + F.SIZE;
        },
        d: function (e, b, c) {
          new fa(e).init(b, c);
          wd++;
          throw e;
        },
        a: function () {
          f();
        },
        b: function (e, b, c) {
          la.copyWithin(e, b, b + c);
        },
        c: function (e) {
          var b = la.length;
          e >>>= 0;
          if (2147483648 < e) return !1;
          for (var c = 1; 4 >= c; c *= 2) {
            var d = b * (1 + 0.2 / c);
            d = Math.min(d, e + 100663296);
            var g = Math,
              v = g.min;
            d = Math.max(e, d);
            0 < d % 65536 && (d += 65536 - (d % 65536));
            g = v.call(g, 2147483648, d);
            a: {
              try {
                pa.grow((g - Aa.byteLength + 65535) >>> 16);
                B(pa.buffer);
                var Y = 1;
                break a;
              } catch (yd) {}
              Y = void 0;
            }
            if (Y) return !0;
          }
          return !1;
        },
      };
    (function () {
      function e(g, v) {
        a.asm = g.exports;
        pa = a.asm.f;
        B(pa.buffer);
        ra = a.asm.h;
        Ea.unshift(a.asm.g);
        ea--;
        a.monitorRunDependencies && a.monitorRunDependencies(ea);
        0 == ea && (null !== ya && (clearInterval(ya), (ya = null)), ka && ((g = ka), (ka = null), g()));
      }
      function b(g) {
        e(g.instance);
      }
      function c(g) {
        return z()
          .then(function (v) {
            return WebAssembly.instantiate(v, d);
          })
          .then(g, function (v) {
            ha('failed to asynchronously prepare wasm: ' + v);
            f(v);
          });
      }
      var d = { a: xd };
      ea++;
      a.monitorRunDependencies && a.monitorRunDependencies(ea);
      if (a.instantiateWasm)
        try {
          return a.instantiateWasm(d, e);
        } catch (g) {
          return ha('Module.instantiateWasm callback failed with error: ' + g), !1;
        }
      (function () {
        return ia ||
          'function' !== typeof WebAssembly.instantiateStreaming ||
          n(R, 'data:application/octet-stream;base64,') ||
          n(R, 'file://') ||
          'function' !== typeof fetch
          ? c(b)
          : fetch(R, { credentials: 'same-origin' }).then(function (g) {
              return WebAssembly.instantiateStreaming(g, d).then(b, function (v) {
                ha('wasm streaming compile failed: ' + v);
                ha('falling back to ArrayBuffer instantiation');
                return c(b);
              });
            });
      })().catch(qa);
      return {};
    })();
    a.___wasm_call_ctors = function () {
      return (a.___wasm_call_ctors = a.asm.g).apply(null, arguments);
    };
    var db = (a._emscripten_bind_VoidPtr___destroy___0 = function () {
        return (db = a._emscripten_bind_VoidPtr___destroy___0 = a.asm.i).apply(null, arguments);
      }),
      Ia = (a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 = function () {
        return (Ia = a._emscripten_bind_DecoderBuffer_DecoderBuffer_0 = a.asm.j).apply(null, arguments);
      }),
      eb = (a._emscripten_bind_DecoderBuffer_Init_2 = function () {
        return (eb = a._emscripten_bind_DecoderBuffer_Init_2 = a.asm.k).apply(null, arguments);
      }),
      fb = (a._emscripten_bind_DecoderBuffer___destroy___0 = function () {
        return (fb = a._emscripten_bind_DecoderBuffer___destroy___0 = a.asm.l).apply(null, arguments);
      }),
      Ja = (a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 = function () {
        return (Ja = a._emscripten_bind_AttributeTransformData_AttributeTransformData_0 = a.asm.m).apply(
          null,
          arguments,
        );
      }),
      gb = (a._emscripten_bind_AttributeTransformData_transform_type_0 = function () {
        return (gb = a._emscripten_bind_AttributeTransformData_transform_type_0 = a.asm.n).apply(null, arguments);
      }),
      hb = (a._emscripten_bind_AttributeTransformData___destroy___0 = function () {
        return (hb = a._emscripten_bind_AttributeTransformData___destroy___0 = a.asm.o).apply(null, arguments);
      }),
      Ka = (a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = function () {
        return (Ka = a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = a.asm.p).apply(null, arguments);
      }),
      ib = (a._emscripten_bind_GeometryAttribute___destroy___0 = function () {
        return (ib = a._emscripten_bind_GeometryAttribute___destroy___0 = a.asm.q).apply(null, arguments);
      }),
      La = (a._emscripten_bind_PointAttribute_PointAttribute_0 = function () {
        return (La = a._emscripten_bind_PointAttribute_PointAttribute_0 = a.asm.r).apply(null, arguments);
      }),
      jb = (a._emscripten_bind_PointAttribute_size_0 = function () {
        return (jb = a._emscripten_bind_PointAttribute_size_0 = a.asm.s).apply(null, arguments);
      }),
      kb = (a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 = function () {
        return (kb = a._emscripten_bind_PointAttribute_GetAttributeTransformData_0 = a.asm.t).apply(null, arguments);
      }),
      lb = (a._emscripten_bind_PointAttribute_attribute_type_0 = function () {
        return (lb = a._emscripten_bind_PointAttribute_attribute_type_0 = a.asm.u).apply(null, arguments);
      }),
      mb = (a._emscripten_bind_PointAttribute_data_type_0 = function () {
        return (mb = a._emscripten_bind_PointAttribute_data_type_0 = a.asm.v).apply(null, arguments);
      }),
      nb = (a._emscripten_bind_PointAttribute_num_components_0 = function () {
        return (nb = a._emscripten_bind_PointAttribute_num_components_0 = a.asm.w).apply(null, arguments);
      }),
      ob = (a._emscripten_bind_PointAttribute_normalized_0 = function () {
        return (ob = a._emscripten_bind_PointAttribute_normalized_0 = a.asm.x).apply(null, arguments);
      }),
      pb = (a._emscripten_bind_PointAttribute_byte_stride_0 = function () {
        return (pb = a._emscripten_bind_PointAttribute_byte_stride_0 = a.asm.y).apply(null, arguments);
      }),
      qb = (a._emscripten_bind_PointAttribute_byte_offset_0 = function () {
        return (qb = a._emscripten_bind_PointAttribute_byte_offset_0 = a.asm.z).apply(null, arguments);
      }),
      rb = (a._emscripten_bind_PointAttribute_unique_id_0 = function () {
        return (rb = a._emscripten_bind_PointAttribute_unique_id_0 = a.asm.A).apply(null, arguments);
      }),
      sb = (a._emscripten_bind_PointAttribute___destroy___0 = function () {
        return (sb = a._emscripten_bind_PointAttribute___destroy___0 = a.asm.B).apply(null, arguments);
      }),
      Ma = (a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 = function () {
        return (Ma = a._emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 =
          a.asm.C).apply(null, arguments);
      }),
      tb = (a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 = function () {
        return (tb = a._emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 = a.asm.D).apply(
          null,
          arguments,
        );
      }),
      ub = (a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 = function () {
        return (ub = a._emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 = a.asm.E).apply(
          null,
          arguments,
        );
      }),
      vb = (a._emscripten_bind_AttributeQuantizationTransform_min_value_1 = function () {
        return (vb = a._emscripten_bind_AttributeQuantizationTransform_min_value_1 = a.asm.F).apply(null, arguments);
      }),
      wb = (a._emscripten_bind_AttributeQuantizationTransform_range_0 = function () {
        return (wb = a._emscripten_bind_AttributeQuantizationTransform_range_0 = a.asm.G).apply(null, arguments);
      }),
      xb = (a._emscripten_bind_AttributeQuantizationTransform___destroy___0 = function () {
        return (xb = a._emscripten_bind_AttributeQuantizationTransform___destroy___0 = a.asm.H).apply(null, arguments);
      }),
      Na = (a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 = function () {
        return (Na = a._emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 = a.asm.I).apply(
          null,
          arguments,
        );
      }),
      yb = (a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 = function () {
        return (yb = a._emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 = a.asm.J).apply(
          null,
          arguments,
        );
      }),
      zb = (a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 = function () {
        return (zb = a._emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 = a.asm.K).apply(
          null,
          arguments,
        );
      }),
      Ab = (a._emscripten_bind_AttributeOctahedronTransform___destroy___0 = function () {
        return (Ab = a._emscripten_bind_AttributeOctahedronTransform___destroy___0 = a.asm.L).apply(null, arguments);
      }),
      Oa = (a._emscripten_bind_PointCloud_PointCloud_0 = function () {
        return (Oa = a._emscripten_bind_PointCloud_PointCloud_0 = a.asm.M).apply(null, arguments);
      }),
      Bb = (a._emscripten_bind_PointCloud_num_attributes_0 = function () {
        return (Bb = a._emscripten_bind_PointCloud_num_attributes_0 = a.asm.N).apply(null, arguments);
      }),
      Cb = (a._emscripten_bind_PointCloud_num_points_0 = function () {
        return (Cb = a._emscripten_bind_PointCloud_num_points_0 = a.asm.O).apply(null, arguments);
      }),
      Db = (a._emscripten_bind_PointCloud___destroy___0 = function () {
        return (Db = a._emscripten_bind_PointCloud___destroy___0 = a.asm.P).apply(null, arguments);
      }),
      Pa = (a._emscripten_bind_Mesh_Mesh_0 = function () {
        return (Pa = a._emscripten_bind_Mesh_Mesh_0 = a.asm.Q).apply(null, arguments);
      }),
      Eb = (a._emscripten_bind_Mesh_num_faces_0 = function () {
        return (Eb = a._emscripten_bind_Mesh_num_faces_0 = a.asm.R).apply(null, arguments);
      }),
      Fb = (a._emscripten_bind_Mesh_num_attributes_0 = function () {
        return (Fb = a._emscripten_bind_Mesh_num_attributes_0 = a.asm.S).apply(null, arguments);
      }),
      Gb = (a._emscripten_bind_Mesh_num_points_0 = function () {
        return (Gb = a._emscripten_bind_Mesh_num_points_0 = a.asm.T).apply(null, arguments);
      }),
      Hb = (a._emscripten_bind_Mesh___destroy___0 = function () {
        return (Hb = a._emscripten_bind_Mesh___destroy___0 = a.asm.U).apply(null, arguments);
      }),
      Qa = (a._emscripten_bind_Metadata_Metadata_0 = function () {
        return (Qa = a._emscripten_bind_Metadata_Metadata_0 = a.asm.V).apply(null, arguments);
      }),
      Ib = (a._emscripten_bind_Metadata___destroy___0 = function () {
        return (Ib = a._emscripten_bind_Metadata___destroy___0 = a.asm.W).apply(null, arguments);
      }),
      Jb = (a._emscripten_bind_Status_code_0 = function () {
        return (Jb = a._emscripten_bind_Status_code_0 = a.asm.X).apply(null, arguments);
      }),
      Kb = (a._emscripten_bind_Status_ok_0 = function () {
        return (Kb = a._emscripten_bind_Status_ok_0 = a.asm.Y).apply(null, arguments);
      }),
      Lb = (a._emscripten_bind_Status_error_msg_0 = function () {
        return (Lb = a._emscripten_bind_Status_error_msg_0 = a.asm.Z).apply(null, arguments);
      }),
      Mb = (a._emscripten_bind_Status___destroy___0 = function () {
        return (Mb = a._emscripten_bind_Status___destroy___0 = a.asm._).apply(null, arguments);
      }),
      Ra = (a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 = function () {
        return (Ra = a._emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 = a.asm.$).apply(null, arguments);
      }),
      Nb = (a._emscripten_bind_DracoFloat32Array_GetValue_1 = function () {
        return (Nb = a._emscripten_bind_DracoFloat32Array_GetValue_1 = a.asm.aa).apply(null, arguments);
      }),
      Ob = (a._emscripten_bind_DracoFloat32Array_size_0 = function () {
        return (Ob = a._emscripten_bind_DracoFloat32Array_size_0 = a.asm.ba).apply(null, arguments);
      }),
      Pb = (a._emscripten_bind_DracoFloat32Array___destroy___0 = function () {
        return (Pb = a._emscripten_bind_DracoFloat32Array___destroy___0 = a.asm.ca).apply(null, arguments);
      }),
      Sa = (a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = function () {
        return (Sa = a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = a.asm.da).apply(null, arguments);
      }),
      Qb = (a._emscripten_bind_DracoInt8Array_GetValue_1 = function () {
        return (Qb = a._emscripten_bind_DracoInt8Array_GetValue_1 = a.asm.ea).apply(null, arguments);
      }),
      Rb = (a._emscripten_bind_DracoInt8Array_size_0 = function () {
        return (Rb = a._emscripten_bind_DracoInt8Array_size_0 = a.asm.fa).apply(null, arguments);
      }),
      Sb = (a._emscripten_bind_DracoInt8Array___destroy___0 = function () {
        return (Sb = a._emscripten_bind_DracoInt8Array___destroy___0 = a.asm.ga).apply(null, arguments);
      }),
      Ta = (a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 = function () {
        return (Ta = a._emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 = a.asm.ha).apply(null, arguments);
      }),
      Tb = (a._emscripten_bind_DracoUInt8Array_GetValue_1 = function () {
        return (Tb = a._emscripten_bind_DracoUInt8Array_GetValue_1 = a.asm.ia).apply(null, arguments);
      }),
      Ub = (a._emscripten_bind_DracoUInt8Array_size_0 = function () {
        return (Ub = a._emscripten_bind_DracoUInt8Array_size_0 = a.asm.ja).apply(null, arguments);
      }),
      Vb = (a._emscripten_bind_DracoUInt8Array___destroy___0 = function () {
        return (Vb = a._emscripten_bind_DracoUInt8Array___destroy___0 = a.asm.ka).apply(null, arguments);
      }),
      Ua = (a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 = function () {
        return (Ua = a._emscripten_bind_DracoInt16Array_DracoInt16Array_0 = a.asm.la).apply(null, arguments);
      }),
      Wb = (a._emscripten_bind_DracoInt16Array_GetValue_1 = function () {
        return (Wb = a._emscripten_bind_DracoInt16Array_GetValue_1 = a.asm.ma).apply(null, arguments);
      }),
      Xb = (a._emscripten_bind_DracoInt16Array_size_0 = function () {
        return (Xb = a._emscripten_bind_DracoInt16Array_size_0 = a.asm.na).apply(null, arguments);
      }),
      Yb = (a._emscripten_bind_DracoInt16Array___destroy___0 = function () {
        return (Yb = a._emscripten_bind_DracoInt16Array___destroy___0 = a.asm.oa).apply(null, arguments);
      }),
      Va = (a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 = function () {
        return (Va = a._emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 = a.asm.pa).apply(null, arguments);
      }),
      Zb = (a._emscripten_bind_DracoUInt16Array_GetValue_1 = function () {
        return (Zb = a._emscripten_bind_DracoUInt16Array_GetValue_1 = a.asm.qa).apply(null, arguments);
      }),
      $b = (a._emscripten_bind_DracoUInt16Array_size_0 = function () {
        return ($b = a._emscripten_bind_DracoUInt16Array_size_0 = a.asm.ra).apply(null, arguments);
      }),
      ac = (a._emscripten_bind_DracoUInt16Array___destroy___0 = function () {
        return (ac = a._emscripten_bind_DracoUInt16Array___destroy___0 = a.asm.sa).apply(null, arguments);
      }),
      Wa = (a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 = function () {
        return (Wa = a._emscripten_bind_DracoInt32Array_DracoInt32Array_0 = a.asm.ta).apply(null, arguments);
      }),
      bc = (a._emscripten_bind_DracoInt32Array_GetValue_1 = function () {
        return (bc = a._emscripten_bind_DracoInt32Array_GetValue_1 = a.asm.ua).apply(null, arguments);
      }),
      cc = (a._emscripten_bind_DracoInt32Array_size_0 = function () {
        return (cc = a._emscripten_bind_DracoInt32Array_size_0 = a.asm.va).apply(null, arguments);
      }),
      dc = (a._emscripten_bind_DracoInt32Array___destroy___0 = function () {
        return (dc = a._emscripten_bind_DracoInt32Array___destroy___0 = a.asm.wa).apply(null, arguments);
      }),
      Xa = (a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 = function () {
        return (Xa = a._emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 = a.asm.xa).apply(null, arguments);
      }),
      ec = (a._emscripten_bind_DracoUInt32Array_GetValue_1 = function () {
        return (ec = a._emscripten_bind_DracoUInt32Array_GetValue_1 = a.asm.ya).apply(null, arguments);
      }),
      fc = (a._emscripten_bind_DracoUInt32Array_size_0 = function () {
        return (fc = a._emscripten_bind_DracoUInt32Array_size_0 = a.asm.za).apply(null, arguments);
      }),
      gc = (a._emscripten_bind_DracoUInt32Array___destroy___0 = function () {
        return (gc = a._emscripten_bind_DracoUInt32Array___destroy___0 = a.asm.Aa).apply(null, arguments);
      }),
      Ya = (a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 = function () {
        return (Ya = a._emscripten_bind_MetadataQuerier_MetadataQuerier_0 = a.asm.Ba).apply(null, arguments);
      }),
      hc = (a._emscripten_bind_MetadataQuerier_HasEntry_2 = function () {
        return (hc = a._emscripten_bind_MetadataQuerier_HasEntry_2 = a.asm.Ca).apply(null, arguments);
      }),
      ic = (a._emscripten_bind_MetadataQuerier_GetIntEntry_2 = function () {
        return (ic = a._emscripten_bind_MetadataQuerier_GetIntEntry_2 = a.asm.Da).apply(null, arguments);
      }),
      jc = (a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 = function () {
        return (jc = a._emscripten_bind_MetadataQuerier_GetIntEntryArray_3 = a.asm.Ea).apply(null, arguments);
      }),
      kc = (a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 = function () {
        return (kc = a._emscripten_bind_MetadataQuerier_GetDoubleEntry_2 = a.asm.Fa).apply(null, arguments);
      }),
      lc = (a._emscripten_bind_MetadataQuerier_GetStringEntry_2 = function () {
        return (lc = a._emscripten_bind_MetadataQuerier_GetStringEntry_2 = a.asm.Ga).apply(null, arguments);
      }),
      mc = (a._emscripten_bind_MetadataQuerier_NumEntries_1 = function () {
        return (mc = a._emscripten_bind_MetadataQuerier_NumEntries_1 = a.asm.Ha).apply(null, arguments);
      }),
      nc = (a._emscripten_bind_MetadataQuerier_GetEntryName_2 = function () {
        return (nc = a._emscripten_bind_MetadataQuerier_GetEntryName_2 = a.asm.Ia).apply(null, arguments);
      }),
      oc = (a._emscripten_bind_MetadataQuerier___destroy___0 = function () {
        return (oc = a._emscripten_bind_MetadataQuerier___destroy___0 = a.asm.Ja).apply(null, arguments);
      }),
      Za = (a._emscripten_bind_Decoder_Decoder_0 = function () {
        return (Za = a._emscripten_bind_Decoder_Decoder_0 = a.asm.Ka).apply(null, arguments);
      }),
      pc = (a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 = function () {
        return (pc = a._emscripten_bind_Decoder_DecodeArrayToPointCloud_3 = a.asm.La).apply(null, arguments);
      }),
      qc = (a._emscripten_bind_Decoder_DecodeArrayToMesh_3 = function () {
        return (qc = a._emscripten_bind_Decoder_DecodeArrayToMesh_3 = a.asm.Ma).apply(null, arguments);
      }),
      rc = (a._emscripten_bind_Decoder_GetAttributeId_2 = function () {
        return (rc = a._emscripten_bind_Decoder_GetAttributeId_2 = a.asm.Na).apply(null, arguments);
      }),
      sc = (a._emscripten_bind_Decoder_GetAttributeIdByName_2 = function () {
        return (sc = a._emscripten_bind_Decoder_GetAttributeIdByName_2 = a.asm.Oa).apply(null, arguments);
      }),
      tc = (a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 = function () {
        return (tc = a._emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 = a.asm.Pa).apply(null, arguments);
      }),
      uc = (a._emscripten_bind_Decoder_GetAttribute_2 = function () {
        return (uc = a._emscripten_bind_Decoder_GetAttribute_2 = a.asm.Qa).apply(null, arguments);
      }),
      vc = (a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 = function () {
        return (vc = a._emscripten_bind_Decoder_GetAttributeByUniqueId_2 = a.asm.Ra).apply(null, arguments);
      }),
      wc = (a._emscripten_bind_Decoder_GetMetadata_1 = function () {
        return (wc = a._emscripten_bind_Decoder_GetMetadata_1 = a.asm.Sa).apply(null, arguments);
      }),
      xc = (a._emscripten_bind_Decoder_GetAttributeMetadata_2 = function () {
        return (xc = a._emscripten_bind_Decoder_GetAttributeMetadata_2 = a.asm.Ta).apply(null, arguments);
      }),
      yc = (a._emscripten_bind_Decoder_GetFaceFromMesh_3 = function () {
        return (yc = a._emscripten_bind_Decoder_GetFaceFromMesh_3 = a.asm.Ua).apply(null, arguments);
      }),
      zc = (a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 = function () {
        return (zc = a._emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 = a.asm.Va).apply(null, arguments);
      }),
      Ac = (a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 = function () {
        return (Ac = a._emscripten_bind_Decoder_GetTrianglesUInt16Array_3 = a.asm.Wa).apply(null, arguments);
      }),
      Bc = (a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 = function () {
        return (Bc = a._emscripten_bind_Decoder_GetTrianglesUInt32Array_3 = a.asm.Xa).apply(null, arguments);
      }),
      Cc = (a._emscripten_bind_Decoder_GetAttributeFloat_3 = function () {
        return (Cc = a._emscripten_bind_Decoder_GetAttributeFloat_3 = a.asm.Ya).apply(null, arguments);
      }),
      Dc = (a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 = function () {
        return (Dc = a._emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 = a.asm.Za).apply(null, arguments);
      }),
      Ec = (a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 = function () {
        return (Ec = a._emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 = a.asm._a).apply(null, arguments);
      }),
      Fc = (a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 = function () {
        return (Fc = a._emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 = a.asm.$a).apply(null, arguments);
      }),
      Gc = (a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 = function () {
        return (Gc = a._emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 = a.asm.ab).apply(null, arguments);
      }),
      Hc = (a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 = function () {
        return (Hc = a._emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 = a.asm.bb).apply(null, arguments);
      }),
      Ic = (a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 = function () {
        return (Ic = a._emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 = a.asm.cb).apply(null, arguments);
      }),
      Jc = (a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 = function () {
        return (Jc = a._emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 = a.asm.db).apply(null, arguments);
      }),
      Kc = (a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 = function () {
        return (Kc = a._emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 = a.asm.eb).apply(null, arguments);
      }),
      Lc = (a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 = function () {
        return (Lc = a._emscripten_bind_Decoder_GetAttributeDataArrayForAllPoints_5 = a.asm.fb).apply(null, arguments);
      }),
      Mc = (a._emscripten_bind_Decoder_SkipAttributeTransform_1 = function () {
        return (Mc = a._emscripten_bind_Decoder_SkipAttributeTransform_1 = a.asm.gb).apply(null, arguments);
      }),
      Nc = (a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 = function () {
        return (Nc = a._emscripten_bind_Decoder_GetEncodedGeometryType_Deprecated_1 = a.asm.hb).apply(null, arguments);
      }),
      Oc = (a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 = function () {
        return (Oc = a._emscripten_bind_Decoder_DecodeBufferToPointCloud_2 = a.asm.ib).apply(null, arguments);
      }),
      Pc = (a._emscripten_bind_Decoder_DecodeBufferToMesh_2 = function () {
        return (Pc = a._emscripten_bind_Decoder_DecodeBufferToMesh_2 = a.asm.jb).apply(null, arguments);
      }),
      Qc = (a._emscripten_bind_Decoder___destroy___0 = function () {
        return (Qc = a._emscripten_bind_Decoder___destroy___0 = a.asm.kb).apply(null, arguments);
      }),
      Rc = (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM = function () {
        return (Rc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM = a.asm.lb).apply(
          null,
          arguments,
        );
      }),
      Sc = (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM = function () {
        return (Sc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM = a.asm.mb).apply(
          null,
          arguments,
        );
      }),
      Tc = (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM = function () {
        return (Tc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM = a.asm.nb).apply(
          null,
          arguments,
        );
      }),
      Uc = (a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM = function () {
        return (Uc = a._emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM = a.asm.ob).apply(
          null,
          arguments,
        );
      }),
      Vc = (a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = function () {
        return (Vc = a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = a.asm.pb).apply(null, arguments);
      }),
      Wc = (a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = function () {
        return (Wc = a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = a.asm.qb).apply(null, arguments);
      }),
      Xc = (a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = function () {
        return (Xc = a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = a.asm.rb).apply(null, arguments);
      }),
      Yc = (a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = function () {
        return (Yc = a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = a.asm.sb).apply(null, arguments);
      }),
      Zc = (a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = function () {
        return (Zc = a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = a.asm.tb).apply(null, arguments);
      }),
      $c = (a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = function () {
        return ($c = a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = a.asm.ub).apply(null, arguments);
      }),
      ad = (a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = function () {
        return (ad = a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = a.asm.vb).apply(
          null,
          arguments,
        );
      }),
      bd = (a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = function () {
        return (bd = a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = a.asm.wb).apply(null, arguments);
      }),
      cd = (a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = function () {
        return (cd = a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = a.asm.xb).apply(null, arguments);
      }),
      dd = (a._emscripten_enum_draco_DataType_DT_INVALID = function () {
        return (dd = a._emscripten_enum_draco_DataType_DT_INVALID = a.asm.yb).apply(null, arguments);
      }),
      ed = (a._emscripten_enum_draco_DataType_DT_INT8 = function () {
        return (ed = a._emscripten_enum_draco_DataType_DT_INT8 = a.asm.zb).apply(null, arguments);
      }),
      fd = (a._emscripten_enum_draco_DataType_DT_UINT8 = function () {
        return (fd = a._emscripten_enum_draco_DataType_DT_UINT8 = a.asm.Ab).apply(null, arguments);
      }),
      gd = (a._emscripten_enum_draco_DataType_DT_INT16 = function () {
        return (gd = a._emscripten_enum_draco_DataType_DT_INT16 = a.asm.Bb).apply(null, arguments);
      }),
      hd = (a._emscripten_enum_draco_DataType_DT_UINT16 = function () {
        return (hd = a._emscripten_enum_draco_DataType_DT_UINT16 = a.asm.Cb).apply(null, arguments);
      }),
      id = (a._emscripten_enum_draco_DataType_DT_INT32 = function () {
        return (id = a._emscripten_enum_draco_DataType_DT_INT32 = a.asm.Db).apply(null, arguments);
      }),
      jd = (a._emscripten_enum_draco_DataType_DT_UINT32 = function () {
        return (jd = a._emscripten_enum_draco_DataType_DT_UINT32 = a.asm.Eb).apply(null, arguments);
      }),
      kd = (a._emscripten_enum_draco_DataType_DT_INT64 = function () {
        return (kd = a._emscripten_enum_draco_DataType_DT_INT64 = a.asm.Fb).apply(null, arguments);
      }),
      ld = (a._emscripten_enum_draco_DataType_DT_UINT64 = function () {
        return (ld = a._emscripten_enum_draco_DataType_DT_UINT64 = a.asm.Gb).apply(null, arguments);
      }),
      md = (a._emscripten_enum_draco_DataType_DT_FLOAT32 = function () {
        return (md = a._emscripten_enum_draco_DataType_DT_FLOAT32 = a.asm.Hb).apply(null, arguments);
      }),
      nd = (a._emscripten_enum_draco_DataType_DT_FLOAT64 = function () {
        return (nd = a._emscripten_enum_draco_DataType_DT_FLOAT64 = a.asm.Ib).apply(null, arguments);
      }),
      od = (a._emscripten_enum_draco_DataType_DT_BOOL = function () {
        return (od = a._emscripten_enum_draco_DataType_DT_BOOL = a.asm.Jb).apply(null, arguments);
      }),
      pd = (a._emscripten_enum_draco_DataType_DT_TYPES_COUNT = function () {
        return (pd = a._emscripten_enum_draco_DataType_DT_TYPES_COUNT = a.asm.Kb).apply(null, arguments);
      }),
      qd = (a._emscripten_enum_draco_StatusCode_OK = function () {
        return (qd = a._emscripten_enum_draco_StatusCode_OK = a.asm.Lb).apply(null, arguments);
      }),
      rd = (a._emscripten_enum_draco_StatusCode_DRACO_ERROR = function () {
        return (rd = a._emscripten_enum_draco_StatusCode_DRACO_ERROR = a.asm.Mb).apply(null, arguments);
      }),
      sd = (a._emscripten_enum_draco_StatusCode_IO_ERROR = function () {
        return (sd = a._emscripten_enum_draco_StatusCode_IO_ERROR = a.asm.Nb).apply(null, arguments);
      }),
      td = (a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER = function () {
        return (td = a._emscripten_enum_draco_StatusCode_INVALID_PARAMETER = a.asm.Ob).apply(null, arguments);
      }),
      ud = (a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION = function () {
        return (ud = a._emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION = a.asm.Pb).apply(null, arguments);
      }),
      vd = (a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION = function () {
        return (vd = a._emscripten_enum_draco_StatusCode_UNKNOWN_VERSION = a.asm.Qb).apply(null, arguments);
      });
    a._free = function () {
      return (a._free = a.asm.Rb).apply(null, arguments);
    };
    var cb = (a._malloc = function () {
      return (cb = a._malloc = a.asm.Sb).apply(null, arguments);
    });
    a.callRuntimeCallbacks = D;
    var oa;
    ka = function b() {
      oa || Q();
      oa || (ka = b);
    };
    a.run = Q;
    if (a.preInit)
      for ('function' == typeof a.preInit && (a.preInit = [a.preInit]); 0 < a.preInit.length; ) a.preInit.pop()();
    Q();
    t.prototype = Object.create(t.prototype);
    t.prototype.constructor = t;
    t.prototype.__class__ = t;
    t.__cache__ = {};
    a.WrapperObject = t;
    a.getCache = x;
    a.wrapPointer = E;
    a.castObject = function (b, c) {
      return E(b.ptr, c);
    };
    a.NULL = E(0);
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
        for (var g = 0; g < b.length; g++) c[d + g] = b[g];
      },
    };
    aa.prototype = Object.create(t.prototype);
    aa.prototype.constructor = aa;
    aa.prototype.__class__ = aa;
    aa.__cache__ = {};
    a.VoidPtr = aa;
    aa.prototype.__destroy__ = aa.prototype.__destroy__ = function () {
      db(this.ptr);
    };
    T.prototype = Object.create(t.prototype);
    T.prototype.constructor = T;
    T.prototype.__class__ = T;
    T.__cache__ = {};
    a.DecoderBuffer = T;
    T.prototype.Init = T.prototype.Init = function (b, c) {
      var d = this.ptr;
      r.prepare();
      'object' == typeof b && (b = ta(b));
      c && 'object' === typeof c && (c = c.ptr);
      eb(d, b, c);
    };
    T.prototype.__destroy__ = T.prototype.__destroy__ = function () {
      fb(this.ptr);
    };
    S.prototype = Object.create(t.prototype);
    S.prototype.constructor = S;
    S.prototype.__class__ = S;
    S.__cache__ = {};
    a.AttributeTransformData = S;
    S.prototype.transform_type = S.prototype.transform_type = function () {
      return gb(this.ptr);
    };
    S.prototype.__destroy__ = S.prototype.__destroy__ = function () {
      hb(this.ptr);
    };
    X.prototype = Object.create(t.prototype);
    X.prototype.constructor = X;
    X.prototype.__class__ = X;
    X.__cache__ = {};
    a.GeometryAttribute = X;
    X.prototype.__destroy__ = X.prototype.__destroy__ = function () {
      ib(this.ptr);
    };
    w.prototype = Object.create(t.prototype);
    w.prototype.constructor = w;
    w.prototype.__class__ = w;
    w.__cache__ = {};
    a.PointAttribute = w;
    w.prototype.size = w.prototype.size = function () {
      return jb(this.ptr);
    };
    w.prototype.GetAttributeTransformData = w.prototype.GetAttributeTransformData = function () {
      return E(kb(this.ptr), S);
    };
    w.prototype.attribute_type = w.prototype.attribute_type = function () {
      return lb(this.ptr);
    };
    w.prototype.data_type = w.prototype.data_type = function () {
      return mb(this.ptr);
    };
    w.prototype.num_components = w.prototype.num_components = function () {
      return nb(this.ptr);
    };
    w.prototype.normalized = w.prototype.normalized = function () {
      return !!ob(this.ptr);
    };
    w.prototype.byte_stride = w.prototype.byte_stride = function () {
      return pb(this.ptr);
    };
    w.prototype.byte_offset = w.prototype.byte_offset = function () {
      return qb(this.ptr);
    };
    w.prototype.unique_id = w.prototype.unique_id = function () {
      return rb(this.ptr);
    };
    w.prototype.__destroy__ = w.prototype.__destroy__ = function () {
      sb(this.ptr);
    };
    C.prototype = Object.create(t.prototype);
    C.prototype.constructor = C;
    C.prototype.__class__ = C;
    C.__cache__ = {};
    a.AttributeQuantizationTransform = C;
    C.prototype.InitFromAttribute = C.prototype.InitFromAttribute = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return !!tb(c, b);
    };
    C.prototype.quantization_bits = C.prototype.quantization_bits = function () {
      return ub(this.ptr);
    };
    C.prototype.min_value = C.prototype.min_value = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return vb(c, b);
    };
    C.prototype.range = C.prototype.range = function () {
      return wb(this.ptr);
    };
    C.prototype.__destroy__ = C.prototype.__destroy__ = function () {
      xb(this.ptr);
    };
    H.prototype = Object.create(t.prototype);
    H.prototype.constructor = H;
    H.prototype.__class__ = H;
    H.__cache__ = {};
    a.AttributeOctahedronTransform = H;
    H.prototype.InitFromAttribute = H.prototype.InitFromAttribute = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return !!yb(c, b);
    };
    H.prototype.quantization_bits = H.prototype.quantization_bits = function () {
      return zb(this.ptr);
    };
    H.prototype.__destroy__ = H.prototype.__destroy__ = function () {
      Ab(this.ptr);
    };
    I.prototype = Object.create(t.prototype);
    I.prototype.constructor = I;
    I.prototype.__class__ = I;
    I.__cache__ = {};
    a.PointCloud = I;
    I.prototype.num_attributes = I.prototype.num_attributes = function () {
      return Bb(this.ptr);
    };
    I.prototype.num_points = I.prototype.num_points = function () {
      return Cb(this.ptr);
    };
    I.prototype.__destroy__ = I.prototype.__destroy__ = function () {
      Db(this.ptr);
    };
    G.prototype = Object.create(t.prototype);
    G.prototype.constructor = G;
    G.prototype.__class__ = G;
    G.__cache__ = {};
    a.Mesh = G;
    G.prototype.num_faces = G.prototype.num_faces = function () {
      return Eb(this.ptr);
    };
    G.prototype.num_attributes = G.prototype.num_attributes = function () {
      return Fb(this.ptr);
    };
    G.prototype.num_points = G.prototype.num_points = function () {
      return Gb(this.ptr);
    };
    G.prototype.__destroy__ = G.prototype.__destroy__ = function () {
      Hb(this.ptr);
    };
    U.prototype = Object.create(t.prototype);
    U.prototype.constructor = U;
    U.prototype.__class__ = U;
    U.__cache__ = {};
    a.Metadata = U;
    U.prototype.__destroy__ = U.prototype.__destroy__ = function () {
      Ib(this.ptr);
    };
    A.prototype = Object.create(t.prototype);
    A.prototype.constructor = A;
    A.prototype.__class__ = A;
    A.__cache__ = {};
    a.Status = A;
    A.prototype.code = A.prototype.code = function () {
      return Jb(this.ptr);
    };
    A.prototype.ok = A.prototype.ok = function () {
      return !!Kb(this.ptr);
    };
    A.prototype.error_msg = A.prototype.error_msg = function () {
      return k(Lb(this.ptr));
    };
    A.prototype.__destroy__ = A.prototype.__destroy__ = function () {
      Mb(this.ptr);
    };
    J.prototype = Object.create(t.prototype);
    J.prototype.constructor = J;
    J.prototype.__class__ = J;
    J.__cache__ = {};
    a.DracoFloat32Array = J;
    J.prototype.GetValue = J.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return Nb(c, b);
    };
    J.prototype.size = J.prototype.size = function () {
      return Ob(this.ptr);
    };
    J.prototype.__destroy__ = J.prototype.__destroy__ = function () {
      Pb(this.ptr);
    };
    K.prototype = Object.create(t.prototype);
    K.prototype.constructor = K;
    K.prototype.__class__ = K;
    K.__cache__ = {};
    a.DracoInt8Array = K;
    K.prototype.GetValue = K.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return Qb(c, b);
    };
    K.prototype.size = K.prototype.size = function () {
      return Rb(this.ptr);
    };
    K.prototype.__destroy__ = K.prototype.__destroy__ = function () {
      Sb(this.ptr);
    };
    L.prototype = Object.create(t.prototype);
    L.prototype.constructor = L;
    L.prototype.__class__ = L;
    L.__cache__ = {};
    a.DracoUInt8Array = L;
    L.prototype.GetValue = L.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return Tb(c, b);
    };
    L.prototype.size = L.prototype.size = function () {
      return Ub(this.ptr);
    };
    L.prototype.__destroy__ = L.prototype.__destroy__ = function () {
      Vb(this.ptr);
    };
    M.prototype = Object.create(t.prototype);
    M.prototype.constructor = M;
    M.prototype.__class__ = M;
    M.__cache__ = {};
    a.DracoInt16Array = M;
    M.prototype.GetValue = M.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return Wb(c, b);
    };
    M.prototype.size = M.prototype.size = function () {
      return Xb(this.ptr);
    };
    M.prototype.__destroy__ = M.prototype.__destroy__ = function () {
      Yb(this.ptr);
    };
    N.prototype = Object.create(t.prototype);
    N.prototype.constructor = N;
    N.prototype.__class__ = N;
    N.__cache__ = {};
    a.DracoUInt16Array = N;
    N.prototype.GetValue = N.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return Zb(c, b);
    };
    N.prototype.size = N.prototype.size = function () {
      return $b(this.ptr);
    };
    N.prototype.__destroy__ = N.prototype.__destroy__ = function () {
      ac(this.ptr);
    };
    O.prototype = Object.create(t.prototype);
    O.prototype.constructor = O;
    O.prototype.__class__ = O;
    O.__cache__ = {};
    a.DracoInt32Array = O;
    O.prototype.GetValue = O.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return bc(c, b);
    };
    O.prototype.size = O.prototype.size = function () {
      return cc(this.ptr);
    };
    O.prototype.__destroy__ = O.prototype.__destroy__ = function () {
      dc(this.ptr);
    };
    P.prototype = Object.create(t.prototype);
    P.prototype.constructor = P;
    P.prototype.__class__ = P;
    P.__cache__ = {};
    a.DracoUInt32Array = P;
    P.prototype.GetValue = P.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return ec(c, b);
    };
    P.prototype.size = P.prototype.size = function () {
      return fc(this.ptr);
    };
    P.prototype.__destroy__ = P.prototype.__destroy__ = function () {
      gc(this.ptr);
    };
    y.prototype = Object.create(t.prototype);
    y.prototype.constructor = y;
    y.prototype.__class__ = y;
    y.__cache__ = {};
    a.MetadataQuerier = y;
    y.prototype.HasEntry = y.prototype.HasEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : ba(c);
      return !!hc(d, b, c);
    };
    y.prototype.GetIntEntry = y.prototype.GetIntEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : ba(c);
      return ic(d, b, c);
    };
    y.prototype.GetIntEntryArray = y.prototype.GetIntEntryArray = function (b, c, d) {
      var g = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : ba(c);
      d && 'object' === typeof d && (d = d.ptr);
      jc(g, b, c, d);
    };
    y.prototype.GetDoubleEntry = y.prototype.GetDoubleEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : ba(c);
      return kc(d, b, c);
    };
    y.prototype.GetStringEntry = y.prototype.GetStringEntry = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : ba(c);
      return k(lc(d, b, c));
    };
    y.prototype.NumEntries = y.prototype.NumEntries = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return mc(c, b);
    };
    y.prototype.GetEntryName = y.prototype.GetEntryName = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return k(nc(d, b, c));
    };
    y.prototype.__destroy__ = y.prototype.__destroy__ = function () {
      oc(this.ptr);
    };
    h.prototype = Object.create(t.prototype);
    h.prototype.constructor = h;
    h.prototype.__class__ = h;
    h.__cache__ = {};
    a.Decoder = h;
    h.prototype.DecodeArrayToPointCloud = h.prototype.DecodeArrayToPointCloud = function (b, c, d) {
      var g = this.ptr;
      r.prepare();
      'object' == typeof b && (b = ta(b));
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return E(pc(g, b, c, d), A);
    };
    h.prototype.DecodeArrayToMesh = h.prototype.DecodeArrayToMesh = function (b, c, d) {
      var g = this.ptr;
      r.prepare();
      'object' == typeof b && (b = ta(b));
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return E(qc(g, b, c, d), A);
    };
    h.prototype.GetAttributeId = h.prototype.GetAttributeId = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return rc(d, b, c);
    };
    h.prototype.GetAttributeIdByName = h.prototype.GetAttributeIdByName = function (b, c) {
      var d = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : ba(c);
      return sc(d, b, c);
    };
    h.prototype.GetAttributeIdByMetadataEntry = h.prototype.GetAttributeIdByMetadataEntry = function (b, c, d) {
      var g = this.ptr;
      r.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : ba(c);
      d = d && 'object' === typeof d ? d.ptr : ba(d);
      return tc(g, b, c, d);
    };
    h.prototype.GetAttribute = h.prototype.GetAttribute = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return E(uc(d, b, c), w);
    };
    h.prototype.GetAttributeByUniqueId = h.prototype.GetAttributeByUniqueId = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return E(vc(d, b, c), w);
    };
    h.prototype.GetMetadata = h.prototype.GetMetadata = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return E(wc(c, b), U);
    };
    h.prototype.GetAttributeMetadata = h.prototype.GetAttributeMetadata = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return E(xc(d, b, c), U);
    };
    h.prototype.GetFaceFromMesh = h.prototype.GetFaceFromMesh = function (b, c, d) {
      var g = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!yc(g, b, c, d);
    };
    h.prototype.GetTriangleStripsFromMesh = h.prototype.GetTriangleStripsFromMesh = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return zc(d, b, c);
    };
    h.prototype.GetTrianglesUInt16Array = h.prototype.GetTrianglesUInt16Array = function (b, c, d) {
      var g = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Ac(g, b, c, d);
    };
    h.prototype.GetTrianglesUInt32Array = h.prototype.GetTrianglesUInt32Array = function (b, c, d) {
      var g = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Bc(g, b, c, d);
    };
    h.prototype.GetAttributeFloat = h.prototype.GetAttributeFloat = function (b, c, d) {
      var g = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Cc(g, b, c, d);
    };
    h.prototype.GetAttributeFloatForAllPoints = h.prototype.GetAttributeFloatForAllPoints = function (b, c, d) {
      var g = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Dc(g, b, c, d);
    };
    h.prototype.GetAttributeIntForAllPoints = h.prototype.GetAttributeIntForAllPoints = function (b, c, d) {
      var g = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Ec(g, b, c, d);
    };
    h.prototype.GetAttributeInt8ForAllPoints = h.prototype.GetAttributeInt8ForAllPoints = function (b, c, d) {
      var g = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Fc(g, b, c, d);
    };
    h.prototype.GetAttributeUInt8ForAllPoints = h.prototype.GetAttributeUInt8ForAllPoints = function (b, c, d) {
      var g = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Gc(g, b, c, d);
    };
    h.prototype.GetAttributeInt16ForAllPoints = h.prototype.GetAttributeInt16ForAllPoints = function (b, c, d) {
      var g = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Hc(g, b, c, d);
    };
    h.prototype.GetAttributeUInt16ForAllPoints = h.prototype.GetAttributeUInt16ForAllPoints = function (b, c, d) {
      var g = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Ic(g, b, c, d);
    };
    h.prototype.GetAttributeInt32ForAllPoints = h.prototype.GetAttributeInt32ForAllPoints = function (b, c, d) {
      var g = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Jc(g, b, c, d);
    };
    h.prototype.GetAttributeUInt32ForAllPoints = h.prototype.GetAttributeUInt32ForAllPoints = function (b, c, d) {
      var g = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Kc(g, b, c, d);
    };
    h.prototype.GetAttributeDataArrayForAllPoints = h.prototype.GetAttributeDataArrayForAllPoints = function (
      b,
      c,
      d,
      g,
      v,
    ) {
      var Y = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      g && 'object' === typeof g && (g = g.ptr);
      v && 'object' === typeof v && (v = v.ptr);
      return !!Lc(Y, b, c, d, g, v);
    };
    h.prototype.SkipAttributeTransform = h.prototype.SkipAttributeTransform = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      Mc(c, b);
    };
    h.prototype.GetEncodedGeometryType_Deprecated = h.prototype.GetEncodedGeometryType_Deprecated = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return Nc(c, b);
    };
    h.prototype.DecodeBufferToPointCloud = h.prototype.DecodeBufferToPointCloud = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return E(Oc(d, b, c), A);
    };
    h.prototype.DecodeBufferToMesh = h.prototype.DecodeBufferToMesh = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return E(Pc(d, b, c), A);
    };
    h.prototype.__destroy__ = h.prototype.__destroy__ = function () {
      Qc(this.ptr);
    };
    (function () {
      function b() {
        a.ATTRIBUTE_INVALID_TRANSFORM = Rc();
        a.ATTRIBUTE_NO_TRANSFORM = Sc();
        a.ATTRIBUTE_QUANTIZATION_TRANSFORM = Tc();
        a.ATTRIBUTE_OCTAHEDRON_TRANSFORM = Uc();
        a.INVALID = Vc();
        a.POSITION = Wc();
        a.NORMAL = Xc();
        a.COLOR = Yc();
        a.TEX_COORD = Zc();
        a.GENERIC = $c();
        a.INVALID_GEOMETRY_TYPE = ad();
        a.POINT_CLOUD = bd();
        a.TRIANGULAR_MESH = cd();
        a.DT_INVALID = dd();
        a.DT_INT8 = ed();
        a.DT_UINT8 = fd();
        a.DT_INT16 = gd();
        a.DT_UINT16 = hd();
        a.DT_INT32 = id();
        a.DT_UINT32 = jd();
        a.DT_INT64 = kd();
        a.DT_UINT64 = ld();
        a.DT_FLOAT32 = md();
        a.DT_FLOAT64 = nd();
        a.DT_BOOL = od();
        a.DT_TYPES_COUNT = pd();
        a.OK = qd();
        a.DRACO_ERROR = rd();
        a.IO_ERROR = sd();
        a.INVALID_PARAMETER = td();
        a.UNSUPPORTED_VERSION = ud();
        a.UNKNOWN_VERSION = vd();
      }
      Da ? b() : sa.unshift(b);
    })();
    a.mainCallbacks = sa;
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
