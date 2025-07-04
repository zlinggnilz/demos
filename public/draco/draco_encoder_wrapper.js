var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function (n) {
  var q = 0;
  return function () {
    return q < n.length ? { done: !1, value: n[q++] } : { done: !0 };
  };
};
$jscomp.arrayIterator = function (n) {
  return { next: $jscomp.arrayIteratorImpl(n) };
};
$jscomp.makeIterator = function (n) {
  var q = 'undefined' != typeof Symbol && Symbol.iterator && n[Symbol.iterator];
  return q ? q.call(n) : $jscomp.arrayIterator(n);
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.ISOLATE_POLYFILLS = !1;
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION = !1;
$jscomp.getGlobal = function (n) {
  n = [
    'object' == typeof globalThis && globalThis,
    n,
    'object' == typeof window && window,
    'object' == typeof self && self,
    'object' == typeof global && global,
  ];
  for (var q = 0; q < n.length; ++q) {
    var m = n[q];
    if (m && m.Math == Math) return m;
  }
  throw Error('Cannot find global object');
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || 'function' == typeof Object.defineProperties
    ? Object.defineProperty
    : function (n, q, m) {
        if (n == Array.prototype || n == Object.prototype) return n;
        n[q] = m.value;
        return n;
      };
$jscomp.IS_SYMBOL_NATIVE = 'function' === typeof Symbol && 'symbol' === typeof Symbol('x');
$jscomp.TRUST_ES6_POLYFILLS = !$jscomp.ISOLATE_POLYFILLS || $jscomp.IS_SYMBOL_NATIVE;
$jscomp.polyfills = {};
$jscomp.propertyToPolyfillSymbol = {};
$jscomp.POLYFILL_PREFIX = '$jscp$';
var $jscomp$lookupPolyfilledValue = function (n, q) {
  var m = $jscomp.propertyToPolyfillSymbol[q];
  if (null == m) return n[q];
  m = n[m];
  return void 0 !== m ? m : n[q];
};
$jscomp.polyfill = function (n, q, m, r) {
  q && ($jscomp.ISOLATE_POLYFILLS ? $jscomp.polyfillIsolated(n, q, m, r) : $jscomp.polyfillUnisolated(n, q, m, r));
};
$jscomp.polyfillUnisolated = function (n, q, m, r) {
  m = $jscomp.global;
  n = n.split('.');
  for (r = 0; r < n.length - 1; r++) {
    var k = n[r];
    if (!(k in m)) return;
    m = m[k];
  }
  n = n[n.length - 1];
  r = m[n];
  q = q(r);
  q != r && null != q && $jscomp.defineProperty(m, n, { configurable: !0, writable: !0, value: q });
};
$jscomp.polyfillIsolated = function (n, q, m, r) {
  var k = n.split('.');
  n = 1 === k.length;
  r = k[0];
  r = !n && r in $jscomp.polyfills ? $jscomp.polyfills : $jscomp.global;
  for (var D = 0; D < k.length - 1; D++) {
    var h = k[D];
    if (!(h in r)) return;
    r = r[h];
  }
  k = k[k.length - 1];
  m = $jscomp.IS_SYMBOL_NATIVE && 'es6' === m ? r[k] : null;
  q = q(m);
  null != q &&
    (n
      ? $jscomp.defineProperty($jscomp.polyfills, k, { configurable: !0, writable: !0, value: q })
      : q !== m &&
        (void 0 === $jscomp.propertyToPolyfillSymbol[k] &&
          ((m = (1e9 * Math.random()) >>> 0),
          ($jscomp.propertyToPolyfillSymbol[k] = $jscomp.IS_SYMBOL_NATIVE
            ? $jscomp.global.Symbol(k)
            : $jscomp.POLYFILL_PREFIX + m + '$' + k)),
        $jscomp.defineProperty(r, $jscomp.propertyToPolyfillSymbol[k], { configurable: !0, writable: !0, value: q })));
};
$jscomp.polyfill(
  'Promise',
  function (n) {
    function q() {
      this.batch_ = null;
    }
    function m(h) {
      return h instanceof k
        ? h
        : new k(function (p, v) {
            p(h);
          });
    }
    if (
      n &&
      (!(
        $jscomp.FORCE_POLYFILL_PROMISE ||
        ($jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION &&
          'undefined' === typeof $jscomp.global.PromiseRejectionEvent)
      ) ||
        !$jscomp.global.Promise ||
        -1 === $jscomp.global.Promise.toString().indexOf('[native code]'))
    )
      return n;
    q.prototype.asyncExecute = function (h) {
      if (null == this.batch_) {
        this.batch_ = [];
        var p = this;
        this.asyncExecuteFunction(function () {
          p.executeBatch_();
        });
      }
      this.batch_.push(h);
    };
    var r = $jscomp.global.setTimeout;
    q.prototype.asyncExecuteFunction = function (h) {
      r(h, 0);
    };
    q.prototype.executeBatch_ = function () {
      for (; this.batch_ && this.batch_.length; ) {
        var h = this.batch_;
        this.batch_ = [];
        for (var p = 0; p < h.length; ++p) {
          var v = h[p];
          h[p] = null;
          try {
            v();
          } catch (B) {
            this.asyncThrow_(B);
          }
        }
      }
      this.batch_ = null;
    };
    q.prototype.asyncThrow_ = function (h) {
      this.asyncExecuteFunction(function () {
        throw h;
      });
    };
    var k = function (h) {
      this.state_ = 0;
      this.result_ = void 0;
      this.onSettledCallbacks_ = [];
      this.isRejectionHandled_ = !1;
      var p = this.createResolveAndReject_();
      try {
        h(p.resolve, p.reject);
      } catch (v) {
        p.reject(v);
      }
    };
    k.prototype.createResolveAndReject_ = function () {
      function h(B) {
        return function (J) {
          v || ((v = !0), B.call(p, J));
        };
      }
      var p = this,
        v = !1;
      return { resolve: h(this.resolveTo_), reject: h(this.reject_) };
    };
    k.prototype.resolveTo_ = function (h) {
      if (h === this) this.reject_(new TypeError('A Promise cannot resolve to itself'));
      else if (h instanceof k) this.settleSameAsPromise_(h);
      else {
        a: switch (typeof h) {
          case 'object':
            var p = null != h;
            break a;
          case 'function':
            p = !0;
            break a;
          default:
            p = !1;
        }
        p ? this.resolveToNonPromiseObj_(h) : this.fulfill_(h);
      }
    };
    k.prototype.resolveToNonPromiseObj_ = function (h) {
      var p = void 0;
      try {
        p = h.then;
      } catch (v) {
        this.reject_(v);
        return;
      }
      'function' == typeof p ? this.settleSameAsThenable_(p, h) : this.fulfill_(h);
    };
    k.prototype.reject_ = function (h) {
      this.settle_(2, h);
    };
    k.prototype.fulfill_ = function (h) {
      this.settle_(1, h);
    };
    k.prototype.settle_ = function (h, p) {
      if (0 != this.state_)
        throw Error('Cannot settle(' + h + ', ' + p + '): Promise already settled in state' + this.state_);
      this.state_ = h;
      this.result_ = p;
      2 === this.state_ && this.scheduleUnhandledRejectionCheck_();
      this.executeOnSettledCallbacks_();
    };
    k.prototype.scheduleUnhandledRejectionCheck_ = function () {
      var h = this;
      r(function () {
        if (h.notifyUnhandledRejection_()) {
          var p = $jscomp.global.console;
          'undefined' !== typeof p && p.error(h.result_);
        }
      }, 1);
    };
    k.prototype.notifyUnhandledRejection_ = function () {
      if (this.isRejectionHandled_) return !1;
      var h = $jscomp.global.CustomEvent,
        p = $jscomp.global.Event,
        v = $jscomp.global.dispatchEvent;
      if ('undefined' === typeof v) return !0;
      'function' === typeof h
        ? (h = new h('unhandledrejection', { cancelable: !0 }))
        : 'function' === typeof p
        ? (h = new p('unhandledrejection', { cancelable: !0 }))
        : ((h = $jscomp.global.document.createEvent('CustomEvent')),
          h.initCustomEvent('unhandledrejection', !1, !0, h));
      h.promise = this;
      h.reason = this.result_;
      return v(h);
    };
    k.prototype.executeOnSettledCallbacks_ = function () {
      if (null != this.onSettledCallbacks_) {
        for (var h = 0; h < this.onSettledCallbacks_.length; ++h) D.asyncExecute(this.onSettledCallbacks_[h]);
        this.onSettledCallbacks_ = null;
      }
    };
    var D = new q();
    k.prototype.settleSameAsPromise_ = function (h) {
      var p = this.createResolveAndReject_();
      h.callWhenSettled_(p.resolve, p.reject);
    };
    k.prototype.settleSameAsThenable_ = function (h, p) {
      var v = this.createResolveAndReject_();
      try {
        h.call(p, v.resolve, v.reject);
      } catch (B) {
        v.reject(B);
      }
    };
    k.prototype.then = function (h, p) {
      function v(w, C) {
        return 'function' == typeof w
          ? function (T) {
              try {
                B(w(T));
              } catch (P) {
                J(P);
              }
            }
          : C;
      }
      var B,
        J,
        U = new k(function (w, C) {
          B = w;
          J = C;
        });
      this.callWhenSettled_(v(h, B), v(p, J));
      return U;
    };
    k.prototype.catch = function (h) {
      return this.then(void 0, h);
    };
    k.prototype.callWhenSettled_ = function (h, p) {
      function v() {
        switch (B.state_) {
          case 1:
            h(B.result_);
            break;
          case 2:
            p(B.result_);
            break;
          default:
            throw Error('Unexpected state: ' + B.state_);
        }
      }
      var B = this;
      null == this.onSettledCallbacks_ ? D.asyncExecute(v) : this.onSettledCallbacks_.push(v);
      this.isRejectionHandled_ = !0;
    };
    k.resolve = m;
    k.reject = function (h) {
      return new k(function (p, v) {
        v(h);
      });
    };
    k.race = function (h) {
      return new k(function (p, v) {
        for (var B = $jscomp.makeIterator(h), J = B.next(); !J.done; J = B.next()) m(J.value).callWhenSettled_(p, v);
      });
    };
    k.all = function (h) {
      var p = $jscomp.makeIterator(h),
        v = p.next();
      return v.done
        ? m([])
        : new k(function (B, J) {
            function U(T) {
              return function (P) {
                w[T] = P;
                C--;
                0 == C && B(w);
              };
            }
            var w = [],
              C = 0;
            do w.push(void 0), C++, m(v.value).callWhenSettled_(U(w.length - 1), J), (v = p.next());
            while (!v.done);
          });
    };
    return k;
  },
  'es6',
  'es3',
);
$jscomp.polyfill(
  'Array.prototype.copyWithin',
  function (n) {
    function q(m) {
      m = Number(m);
      return Infinity === m || -Infinity === m ? m : m | 0;
    }
    return n
      ? n
      : function (m, r, k) {
          var D = this.length;
          m = q(m);
          r = q(r);
          k = void 0 === k ? D : q(k);
          m = 0 > m ? Math.max(D + m, 0) : Math.min(m, D);
          r = 0 > r ? Math.max(D + r, 0) : Math.min(r, D);
          k = 0 > k ? Math.max(D + k, 0) : Math.min(k, D);
          if (m < r) for (; r < k; ) r in this ? (this[m++] = this[r++]) : (delete this[m++], r++);
          else
            for (k = Math.min(k, D + r - m), m += k - r; k > r; )
              --k in this ? (this[--m] = this[k]) : delete this[--m];
          return this;
        };
  },
  'es6',
  'es3',
);
$jscomp.typedArrayCopyWithin = function (n) {
  return n ? n : Array.prototype.copyWithin;
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
var DracoEncoderModule = (function () {
  var n = 'undefined' !== typeof document && document.currentScript ? document.currentScript.src : void 0;
  'undefined' !== typeof __filename && (n = n || __filename);
  return function (q) {
    function m(f) {
      return a.locateFile ? a.locateFile(f, M) : M + f;
    }
    function r(f, b) {
      f || D('Assertion failed: ' + b);
    }
    function k(f) {
      va = f;
      a.HEAP8 = Q = new Int8Array(f);
      a.HEAP16 = ka = new Int16Array(f);
      a.HEAP32 = L = new Int32Array(f);
      a.HEAPU8 = la = new Uint8Array(f);
      a.HEAPU16 = new Uint16Array(f);
      a.HEAPU32 = new Uint32Array(f);
      a.HEAPF32 = ma = new Float32Array(f);
      a.HEAPF64 = new Float64Array(f);
    }
    function D(f) {
      if (a.onAbort) a.onAbort(f);
      f += '';
      Y(f);
      wa = !0;
      f = new WebAssembly.RuntimeError('abort(' + f + '). Build with -s ASSERTIONS=1 for more info.');
      na(f);
      throw f;
    }
    function h(f, b) {
      return String.prototype.startsWith ? f.startsWith(b) : 0 === f.indexOf(b);
    }
    function p(f) {
      try {
        if (f == K && Z) return new Uint8Array(Z);
        if (da) return da(f);
        throw 'both async and sync fetching of the wasm failed';
      } catch (b) {
        D(b);
      }
    }
    function v() {
      if (!Z && (ea || V)) {
        if ('function' === typeof fetch && !h(K, 'file://'))
          return fetch(K, { credentials: 'same-origin' })
            .then(function (f) {
              if (!f.ok) throw "failed to load wasm binary file at '" + K + "'";
              return f.arrayBuffer();
            })
            .catch(function () {
              return p(K);
            });
        if (xa)
          return new Promise(function (f, b) {
            xa(
              K,
              function (c) {
                f(new Uint8Array(c));
              },
              b,
            );
          });
      }
      return Promise.resolve().then(function () {
        return p(K);
      });
    }
    function B(f) {
      for (; 0 < f.length; ) {
        var b = f.shift();
        if ('function' == typeof b) b(a);
        else {
          var c = b.func;
          'number' === typeof c
            ? void 0 === b.arg
              ? oa.get(c)()
              : oa.get(c)(b.arg)
            : c(void 0 === b.arg ? null : b.arg);
        }
      }
    }
    function J(f) {
      this.excPtr = f;
      this.ptr = f - G.SIZE;
      this.set_type = function (b) {
        L[(this.ptr + G.TYPE_OFFSET) >> 2] = b;
      };
      this.get_type = function () {
        return L[(this.ptr + G.TYPE_OFFSET) >> 2];
      };
      this.set_destructor = function (b) {
        L[(this.ptr + G.DESTRUCTOR_OFFSET) >> 2] = b;
      };
      this.get_destructor = function () {
        return L[(this.ptr + G.DESTRUCTOR_OFFSET) >> 2];
      };
      this.set_refcount = function (b) {
        L[(this.ptr + G.REFCOUNT_OFFSET) >> 2] = b;
      };
      this.set_caught = function (b) {
        Q[(this.ptr + G.CAUGHT_OFFSET) >> 0] = b ? 1 : 0;
      };
      this.get_caught = function () {
        return 0 != Q[(this.ptr + G.CAUGHT_OFFSET) >> 0];
      };
      this.set_rethrown = function (b) {
        Q[(this.ptr + G.RETHROWN_OFFSET) >> 0] = b ? 1 : 0;
      };
      this.get_rethrown = function () {
        return 0 != Q[(this.ptr + G.RETHROWN_OFFSET) >> 0];
      };
      this.init = function (b, c) {
        this.set_type(b);
        this.set_destructor(c);
        this.set_refcount(0);
        this.set_caught(!1);
        this.set_rethrown(!1);
      };
      this.add_ref = function () {
        L[(this.ptr + G.REFCOUNT_OFFSET) >> 2] += 1;
      };
      this.release_ref = function () {
        var b = L[(this.ptr + G.REFCOUNT_OFFSET) >> 2];
        L[(this.ptr + G.REFCOUNT_OFFSET) >> 2] = b - 1;
        return 1 === b;
      };
    }
    function U(f) {
      function b() {
        if (!fa && ((fa = !0), (a.calledRun = !0), !wa)) {
          ya = !0;
          B(za);
          B(pa);
          Aa(a);
          if (a.onRuntimeInitialized) a.onRuntimeInitialized();
          if (a.postRun)
            for ('function' == typeof a.postRun && (a.postRun = [a.postRun]); a.postRun.length; )
              Ba.unshift(a.postRun.shift());
          B(Ba);
        }
      }
      if (!(0 < W)) {
        if (a.preRun)
          for ('function' == typeof a.preRun && (a.preRun = [a.preRun]); a.preRun.length; )
            Ca.unshift(a.preRun.shift());
        B(Ca);
        0 < W ||
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
    function w() {}
    function C(f) {
      return (f || w).__cache__;
    }
    function T(f, b) {
      var c = C(b),
        d = c[f];
      if (d) return d;
      d = Object.create((b || w).prototype);
      d.ptr = f;
      return (c[f] = d);
    }
    function P(f) {
      if ('string' === typeof f) {
        for (var b = 0, c = 0; c < f.length; ++c) {
          var d = f.charCodeAt(c);
          55296 <= d && 57343 >= d && (d = (65536 + ((d & 1023) << 10)) | (f.charCodeAt(++c) & 1023));
          127 >= d ? ++b : (b = 2047 >= d ? b + 2 : 65535 >= d ? b + 3 : b + 4);
        }
        b = Array(b + 1);
        c = 0;
        d = b.length;
        if (0 < d) {
          d = c + d - 1;
          for (var e = 0; e < f.length; ++e) {
            var g = f.charCodeAt(e);
            if (55296 <= g && 57343 >= g) {
              var t = f.charCodeAt(++e);
              g = (65536 + ((g & 1023) << 10)) | (t & 1023);
            }
            if (127 >= g) {
              if (c >= d) break;
              b[c++] = g;
            } else {
              if (2047 >= g) {
                if (c + 1 >= d) break;
                b[c++] = 192 | (g >> 6);
              } else {
                if (65535 >= g) {
                  if (c + 2 >= d) break;
                  b[c++] = 224 | (g >> 12);
                } else {
                  if (c + 3 >= d) break;
                  b[c++] = 240 | (g >> 18);
                  b[c++] = 128 | ((g >> 12) & 63);
                }
                b[c++] = 128 | ((g >> 6) & 63);
              }
              b[c++] = 128 | (g & 63);
            }
          }
          b[c] = 0;
        }
        f = l.alloc(b, Q);
        l.copy(b, Q, f);
        return f;
      }
      return f;
    }
    function ha(f) {
      if ('object' === typeof f) {
        var b = l.alloc(f, Q);
        l.copy(f, Q, b);
        return b;
      }
      return f;
    }
    function ia(f) {
      if ('object' === typeof f) {
        var b = l.alloc(f, ka);
        l.copy(f, ka, b);
        return b;
      }
      return f;
    }
    function X(f) {
      if ('object' === typeof f) {
        var b = l.alloc(f, L);
        l.copy(f, L, b);
        return b;
      }
      return f;
    }
    function aa(f) {
      if ('object' === typeof f) {
        var b = l.alloc(f, ma);
        l.copy(f, ma, b);
        return b;
      }
      return f;
    }
    function R() {
      throw 'cannot construct a VoidPtr, no constructor in IDL';
    }
    function N() {
      this.ptr = Da();
      C(N)[this.ptr] = this;
    }
    function z() {
      this.ptr = Ea();
      C(z)[this.ptr] = this;
    }
    function H() {
      this.ptr = Fa();
      C(H)[this.ptr] = this;
    }
    function E() {
      this.ptr = Ga();
      C(E)[this.ptr] = this;
    }
    function O() {
      this.ptr = Ha();
      C(O)[this.ptr] = this;
    }
    function I() {
      this.ptr = Ia();
      C(I)[this.ptr] = this;
    }
    function F() {
      this.ptr = Ja();
      C(F)[this.ptr] = this;
    }
    function x() {
      this.ptr = Ka();
      C(x)[this.ptr] = this;
    }
    function u() {
      this.ptr = La();
      C(u)[this.ptr] = this;
    }
    function y() {
      this.ptr = Ma();
      C(y)[this.ptr] = this;
    }
    function A(f) {
      f && 'object' === typeof f && (f = f.ptr);
      this.ptr = Na(f);
      C(A)[this.ptr] = this;
    }
    q = q || {};
    var a = 'undefined' !== typeof q ? q : {},
      Aa,
      na;
    a.ready = new Promise(function (f, b) {
      Aa = f;
      na = b;
    });
    var Oa = !1,
      Pa = !1;
    a.onRuntimeInitialized = function () {
      Oa = !0;
      a.callRuntimeCallbacks(a.mainCallbacks);
      if (Pa && 'function' === typeof a.onModuleLoaded) a.onModuleLoaded(a);
    };
    a.onModuleParsed = function () {
      Pa = !0;
      if (Oa && 'function' === typeof a.onModuleLoaded) a.onModuleLoaded(a);
    };
    a.isVersionSupported = function (f) {
      if ('string' !== typeof f) return !1;
      f = f.split('.');
      return 2 > f.length || 3 < f.length
        ? !1
        : 1 == f[0] && 0 <= f[1] && 4 >= f[1]
        ? !0
        : 0 != f[0] || 10 < f[1]
        ? !1
        : !0;
    };
    var ba = {},
      S;
    for (S in a) a.hasOwnProperty(S) && (ba[S] = a[S]);
    var ea = !1,
      V = !1,
      qa = !1,
      Qa = !1;
    ea = 'object' === typeof window;
    V = 'function' === typeof importScripts;
    qa =
      'object' === typeof process && 'object' === typeof process.versions && 'string' === typeof process.versions.node;
    Qa = !ea && !qa && !V;
    var M = '',
      ra,
      sa;
    if (qa) {
      M = V ? require('path').dirname(M) + '/' : __dirname + '/';
      var ta = function (f, b) {
        ra || (ra = require('fs'));
        sa || (sa = require('path'));
        f = sa.normalize(f);
        return ra.readFileSync(f, b ? null : 'utf8');
      };
      var da = function (f) {
        f = ta(f, !0);
        f.buffer || (f = new Uint8Array(f));
        r(f.buffer);
        return f;
      };
      1 < process.argv.length && process.argv[1].replace(/\\/g, '/');
      process.argv.slice(2);
      a.inspect = function () {
        return '[Emscripten Module object]';
      };
    } else if (Qa)
      'undefined' != typeof read &&
        (ta = function (f) {
          return read(f);
        }),
        (da = function (f) {
          if ('function' === typeof readbuffer) return new Uint8Array(readbuffer(f));
          f = read(f, 'binary');
          r('object' === typeof f);
          return f;
        }),
        'undefined' !== typeof print &&
          ('undefined' === typeof console && (console = {}),
          (console.log = print),
          (console.warn = console.error = 'undefined' !== typeof printErr ? printErr : print));
    else if (ea || V) {
      V
        ? (M = self.location.href)
        : 'undefined' !== typeof document && document.currentScript && (M = document.currentScript.src);
      n && (M = n);
      M = 0 !== M.indexOf('blob:') ? M.substr(0, M.lastIndexOf('/') + 1) : '';
      ta = function (f) {
        var b = new XMLHttpRequest();
        b.open('GET', f, !1);
        b.send(null);
        return b.responseText;
      };
      V &&
        (da = function (f) {
          var b = new XMLHttpRequest();
          b.open('GET', f, !1);
          b.responseType = 'arraybuffer';
          b.send(null);
          return new Uint8Array(b.response);
        });
      var xa = function (f, b, c) {
        var d = new XMLHttpRequest();
        d.open('GET', f, !0);
        d.responseType = 'arraybuffer';
        d.onload = function () {
          200 == d.status || (0 == d.status && d.response) ? b(d.response) : c();
        };
        d.onerror = c;
        d.send(null);
      };
    }
    a.print || console.log.bind(console);
    var Y = a.printErr || console.warn.bind(console);
    for (S in ba) ba.hasOwnProperty(S) && (a[S] = ba[S]);
    ba = null;
    var Z;
    a.wasmBinary && (Z = a.wasmBinary);
    'object' !== typeof WebAssembly && D('no native wasm support detected');
    var ja,
      wa = !1,
      va,
      Q,
      la,
      ka,
      L,
      ma,
      oa,
      Ca = [],
      za = [],
      pa = [],
      Ba = [],
      ya = !1,
      W = 0,
      ua = null,
      ca = null;
    a.preloadedImages = {};
    a.preloadedAudios = {};
    var K = 'draco_encoder.wasm';
    h(K, 'data:application/octet-stream;base64,') || (K = m(K));
    var G = {
        DESTRUCTOR_OFFSET: 0,
        REFCOUNT_OFFSET: 4,
        TYPE_OFFSET: 8,
        CAUGHT_OFFSET: 12,
        RETHROWN_OFFSET: 13,
        SIZE: 16,
      },
      uc = 0,
      vc = {
        e: function (f) {
          return Ra(f + G.SIZE) + G.SIZE;
        },
        d: function (f, b, c) {
          new J(f).init(b, c);
          uc++;
          throw f;
        },
        a: function () {
          D();
        },
        b: function (f, b, c) {
          la.copyWithin(f, b, b + c);
        },
        c: function (f) {
          var b = la.length;
          f >>>= 0;
          if (2147483648 < f) return !1;
          for (var c = 1; 4 >= c; c *= 2) {
            var d = b * (1 + 0.2 / c);
            d = Math.min(d, f + 100663296);
            var e = Math,
              g = e.min;
            d = Math.max(f, d);
            0 < d % 65536 && (d += 65536 - (d % 65536));
            e = g.call(e, 2147483648, d);
            a: {
              try {
                ja.grow((e - va.byteLength + 65535) >>> 16);
                k(ja.buffer);
                var t = 1;
                break a;
              } catch (wc) {}
              t = void 0;
            }
            if (t) return !0;
          }
          return !1;
        },
      };
    (function () {
      function f(e, g) {
        a.asm = e.exports;
        ja = a.asm.f;
        k(ja.buffer);
        oa = a.asm.h;
        za.unshift(a.asm.g);
        W--;
        a.monitorRunDependencies && a.monitorRunDependencies(W);
        0 == W && (null !== ua && (clearInterval(ua), (ua = null)), ca && ((e = ca), (ca = null), e()));
      }
      function b(e) {
        f(e.instance);
      }
      function c(e) {
        return v()
          .then(function (g) {
            return WebAssembly.instantiate(g, d);
          })
          .then(e, function (g) {
            Y('failed to asynchronously prepare wasm: ' + g);
            D(g);
          });
      }
      var d = { a: vc };
      W++;
      a.monitorRunDependencies && a.monitorRunDependencies(W);
      if (a.instantiateWasm)
        try {
          return a.instantiateWasm(d, f);
        } catch (e) {
          return Y('Module.instantiateWasm callback failed with error: ' + e), !1;
        }
      (function () {
        return Z ||
          'function' !== typeof WebAssembly.instantiateStreaming ||
          h(K, 'data:application/octet-stream;base64,') ||
          h(K, 'file://') ||
          'function' !== typeof fetch
          ? c(b)
          : fetch(K, { credentials: 'same-origin' }).then(function (e) {
              return WebAssembly.instantiateStreaming(e, d).then(b, function (g) {
                Y('wasm streaming compile failed: ' + g);
                Y('falling back to ArrayBuffer instantiation');
                return c(b);
              });
            });
      })().catch(na);
      return {};
    })();
    a.___wasm_call_ctors = function () {
      return (a.___wasm_call_ctors = a.asm.g).apply(null, arguments);
    };
    var Sa = (a._emscripten_bind_VoidPtr___destroy___0 = function () {
        return (Sa = a._emscripten_bind_VoidPtr___destroy___0 = a.asm.i).apply(null, arguments);
      }),
      Da = (a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = function () {
        return (Da = a._emscripten_bind_GeometryAttribute_GeometryAttribute_0 = a.asm.j).apply(null, arguments);
      }),
      Ta = (a._emscripten_bind_GeometryAttribute___destroy___0 = function () {
        return (Ta = a._emscripten_bind_GeometryAttribute___destroy___0 = a.asm.k).apply(null, arguments);
      }),
      Ea = (a._emscripten_bind_PointAttribute_PointAttribute_0 = function () {
        return (Ea = a._emscripten_bind_PointAttribute_PointAttribute_0 = a.asm.l).apply(null, arguments);
      }),
      Ua = (a._emscripten_bind_PointAttribute_size_0 = function () {
        return (Ua = a._emscripten_bind_PointAttribute_size_0 = a.asm.m).apply(null, arguments);
      }),
      Va = (a._emscripten_bind_PointAttribute_attribute_type_0 = function () {
        return (Va = a._emscripten_bind_PointAttribute_attribute_type_0 = a.asm.n).apply(null, arguments);
      }),
      Wa = (a._emscripten_bind_PointAttribute_data_type_0 = function () {
        return (Wa = a._emscripten_bind_PointAttribute_data_type_0 = a.asm.o).apply(null, arguments);
      }),
      Xa = (a._emscripten_bind_PointAttribute_num_components_0 = function () {
        return (Xa = a._emscripten_bind_PointAttribute_num_components_0 = a.asm.p).apply(null, arguments);
      }),
      Ya = (a._emscripten_bind_PointAttribute_normalized_0 = function () {
        return (Ya = a._emscripten_bind_PointAttribute_normalized_0 = a.asm.q).apply(null, arguments);
      }),
      Za = (a._emscripten_bind_PointAttribute_byte_stride_0 = function () {
        return (Za = a._emscripten_bind_PointAttribute_byte_stride_0 = a.asm.r).apply(null, arguments);
      }),
      $a = (a._emscripten_bind_PointAttribute_byte_offset_0 = function () {
        return ($a = a._emscripten_bind_PointAttribute_byte_offset_0 = a.asm.s).apply(null, arguments);
      }),
      ab = (a._emscripten_bind_PointAttribute_unique_id_0 = function () {
        return (ab = a._emscripten_bind_PointAttribute_unique_id_0 = a.asm.t).apply(null, arguments);
      }),
      bb = (a._emscripten_bind_PointAttribute___destroy___0 = function () {
        return (bb = a._emscripten_bind_PointAttribute___destroy___0 = a.asm.u).apply(null, arguments);
      }),
      Fa = (a._emscripten_bind_PointCloud_PointCloud_0 = function () {
        return (Fa = a._emscripten_bind_PointCloud_PointCloud_0 = a.asm.v).apply(null, arguments);
      }),
      cb = (a._emscripten_bind_PointCloud_num_attributes_0 = function () {
        return (cb = a._emscripten_bind_PointCloud_num_attributes_0 = a.asm.w).apply(null, arguments);
      }),
      db = (a._emscripten_bind_PointCloud_num_points_0 = function () {
        return (db = a._emscripten_bind_PointCloud_num_points_0 = a.asm.x).apply(null, arguments);
      }),
      eb = (a._emscripten_bind_PointCloud___destroy___0 = function () {
        return (eb = a._emscripten_bind_PointCloud___destroy___0 = a.asm.y).apply(null, arguments);
      }),
      Ga = (a._emscripten_bind_Mesh_Mesh_0 = function () {
        return (Ga = a._emscripten_bind_Mesh_Mesh_0 = a.asm.z).apply(null, arguments);
      }),
      fb = (a._emscripten_bind_Mesh_num_faces_0 = function () {
        return (fb = a._emscripten_bind_Mesh_num_faces_0 = a.asm.A).apply(null, arguments);
      }),
      gb = (a._emscripten_bind_Mesh_num_attributes_0 = function () {
        return (gb = a._emscripten_bind_Mesh_num_attributes_0 = a.asm.B).apply(null, arguments);
      }),
      hb = (a._emscripten_bind_Mesh_num_points_0 = function () {
        return (hb = a._emscripten_bind_Mesh_num_points_0 = a.asm.C).apply(null, arguments);
      }),
      ib = (a._emscripten_bind_Mesh_set_num_points_1 = function () {
        return (ib = a._emscripten_bind_Mesh_set_num_points_1 = a.asm.D).apply(null, arguments);
      }),
      jb = (a._emscripten_bind_Mesh___destroy___0 = function () {
        return (jb = a._emscripten_bind_Mesh___destroy___0 = a.asm.E).apply(null, arguments);
      }),
      Ha = (a._emscripten_bind_Metadata_Metadata_0 = function () {
        return (Ha = a._emscripten_bind_Metadata_Metadata_0 = a.asm.F).apply(null, arguments);
      }),
      kb = (a._emscripten_bind_Metadata___destroy___0 = function () {
        return (kb = a._emscripten_bind_Metadata___destroy___0 = a.asm.G).apply(null, arguments);
      }),
      Ia = (a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = function () {
        return (Ia = a._emscripten_bind_DracoInt8Array_DracoInt8Array_0 = a.asm.H).apply(null, arguments);
      }),
      lb = (a._emscripten_bind_DracoInt8Array_GetValue_1 = function () {
        return (lb = a._emscripten_bind_DracoInt8Array_GetValue_1 = a.asm.I).apply(null, arguments);
      }),
      mb = (a._emscripten_bind_DracoInt8Array_size_0 = function () {
        return (mb = a._emscripten_bind_DracoInt8Array_size_0 = a.asm.J).apply(null, arguments);
      }),
      nb = (a._emscripten_bind_DracoInt8Array___destroy___0 = function () {
        return (nb = a._emscripten_bind_DracoInt8Array___destroy___0 = a.asm.K).apply(null, arguments);
      }),
      Ja = (a._emscripten_bind_MetadataBuilder_MetadataBuilder_0 = function () {
        return (Ja = a._emscripten_bind_MetadataBuilder_MetadataBuilder_0 = a.asm.L).apply(null, arguments);
      }),
      ob = (a._emscripten_bind_MetadataBuilder_AddStringEntry_3 = function () {
        return (ob = a._emscripten_bind_MetadataBuilder_AddStringEntry_3 = a.asm.M).apply(null, arguments);
      }),
      pb = (a._emscripten_bind_MetadataBuilder_AddIntEntry_3 = function () {
        return (pb = a._emscripten_bind_MetadataBuilder_AddIntEntry_3 = a.asm.N).apply(null, arguments);
      }),
      qb = (a._emscripten_bind_MetadataBuilder_AddIntEntryArray_4 = function () {
        return (qb = a._emscripten_bind_MetadataBuilder_AddIntEntryArray_4 = a.asm.O).apply(null, arguments);
      }),
      rb = (a._emscripten_bind_MetadataBuilder_AddDoubleEntry_3 = function () {
        return (rb = a._emscripten_bind_MetadataBuilder_AddDoubleEntry_3 = a.asm.P).apply(null, arguments);
      }),
      sb = (a._emscripten_bind_MetadataBuilder___destroy___0 = function () {
        return (sb = a._emscripten_bind_MetadataBuilder___destroy___0 = a.asm.Q).apply(null, arguments);
      }),
      Ka = (a._emscripten_bind_PointCloudBuilder_PointCloudBuilder_0 = function () {
        return (Ka = a._emscripten_bind_PointCloudBuilder_PointCloudBuilder_0 = a.asm.R).apply(null, arguments);
      }),
      tb = (a._emscripten_bind_PointCloudBuilder_AddFloatAttribute_5 = function () {
        return (tb = a._emscripten_bind_PointCloudBuilder_AddFloatAttribute_5 = a.asm.S).apply(null, arguments);
      }),
      ub = (a._emscripten_bind_PointCloudBuilder_AddInt8Attribute_5 = function () {
        return (ub = a._emscripten_bind_PointCloudBuilder_AddInt8Attribute_5 = a.asm.T).apply(null, arguments);
      }),
      vb = (a._emscripten_bind_PointCloudBuilder_AddUInt8Attribute_5 = function () {
        return (vb = a._emscripten_bind_PointCloudBuilder_AddUInt8Attribute_5 = a.asm.U).apply(null, arguments);
      }),
      wb = (a._emscripten_bind_PointCloudBuilder_AddInt16Attribute_5 = function () {
        return (wb = a._emscripten_bind_PointCloudBuilder_AddInt16Attribute_5 = a.asm.V).apply(null, arguments);
      }),
      xb = (a._emscripten_bind_PointCloudBuilder_AddUInt16Attribute_5 = function () {
        return (xb = a._emscripten_bind_PointCloudBuilder_AddUInt16Attribute_5 = a.asm.W).apply(null, arguments);
      }),
      yb = (a._emscripten_bind_PointCloudBuilder_AddInt32Attribute_5 = function () {
        return (yb = a._emscripten_bind_PointCloudBuilder_AddInt32Attribute_5 = a.asm.X).apply(null, arguments);
      }),
      zb = (a._emscripten_bind_PointCloudBuilder_AddUInt32Attribute_5 = function () {
        return (zb = a._emscripten_bind_PointCloudBuilder_AddUInt32Attribute_5 = a.asm.Y).apply(null, arguments);
      }),
      Ab = (a._emscripten_bind_PointCloudBuilder_AddMetadata_2 = function () {
        return (Ab = a._emscripten_bind_PointCloudBuilder_AddMetadata_2 = a.asm.Z).apply(null, arguments);
      }),
      Bb = (a._emscripten_bind_PointCloudBuilder_SetMetadataForAttribute_3 = function () {
        return (Bb = a._emscripten_bind_PointCloudBuilder_SetMetadataForAttribute_3 = a.asm._).apply(null, arguments);
      }),
      Cb = (a._emscripten_bind_PointCloudBuilder___destroy___0 = function () {
        return (Cb = a._emscripten_bind_PointCloudBuilder___destroy___0 = a.asm.$).apply(null, arguments);
      }),
      La = (a._emscripten_bind_MeshBuilder_MeshBuilder_0 = function () {
        return (La = a._emscripten_bind_MeshBuilder_MeshBuilder_0 = a.asm.aa).apply(null, arguments);
      }),
      Db = (a._emscripten_bind_MeshBuilder_AddFacesToMesh_3 = function () {
        return (Db = a._emscripten_bind_MeshBuilder_AddFacesToMesh_3 = a.asm.ba).apply(null, arguments);
      }),
      Eb = (a._emscripten_bind_MeshBuilder_AddFloatAttributeToMesh_5 = function () {
        return (Eb = a._emscripten_bind_MeshBuilder_AddFloatAttributeToMesh_5 = a.asm.ca).apply(null, arguments);
      }),
      Fb = (a._emscripten_bind_MeshBuilder_AddInt32AttributeToMesh_5 = function () {
        return (Fb = a._emscripten_bind_MeshBuilder_AddInt32AttributeToMesh_5 = a.asm.da).apply(null, arguments);
      }),
      Gb = (a._emscripten_bind_MeshBuilder_AddMetadataToMesh_2 = function () {
        return (Gb = a._emscripten_bind_MeshBuilder_AddMetadataToMesh_2 = a.asm.ea).apply(null, arguments);
      }),
      Hb = (a._emscripten_bind_MeshBuilder_AddFloatAttribute_5 = function () {
        return (Hb = a._emscripten_bind_MeshBuilder_AddFloatAttribute_5 = a.asm.fa).apply(null, arguments);
      }),
      Ib = (a._emscripten_bind_MeshBuilder_AddInt8Attribute_5 = function () {
        return (Ib = a._emscripten_bind_MeshBuilder_AddInt8Attribute_5 = a.asm.ga).apply(null, arguments);
      }),
      Jb = (a._emscripten_bind_MeshBuilder_AddUInt8Attribute_5 = function () {
        return (Jb = a._emscripten_bind_MeshBuilder_AddUInt8Attribute_5 = a.asm.ha).apply(null, arguments);
      }),
      Kb = (a._emscripten_bind_MeshBuilder_AddInt16Attribute_5 = function () {
        return (Kb = a._emscripten_bind_MeshBuilder_AddInt16Attribute_5 = a.asm.ia).apply(null, arguments);
      }),
      Lb = (a._emscripten_bind_MeshBuilder_AddUInt16Attribute_5 = function () {
        return (Lb = a._emscripten_bind_MeshBuilder_AddUInt16Attribute_5 = a.asm.ja).apply(null, arguments);
      }),
      Mb = (a._emscripten_bind_MeshBuilder_AddInt32Attribute_5 = function () {
        return (Mb = a._emscripten_bind_MeshBuilder_AddInt32Attribute_5 = a.asm.ka).apply(null, arguments);
      }),
      Nb = (a._emscripten_bind_MeshBuilder_AddUInt32Attribute_5 = function () {
        return (Nb = a._emscripten_bind_MeshBuilder_AddUInt32Attribute_5 = a.asm.la).apply(null, arguments);
      }),
      Ob = (a._emscripten_bind_MeshBuilder_AddMetadata_2 = function () {
        return (Ob = a._emscripten_bind_MeshBuilder_AddMetadata_2 = a.asm.ma).apply(null, arguments);
      }),
      Pb = (a._emscripten_bind_MeshBuilder_SetMetadataForAttribute_3 = function () {
        return (Pb = a._emscripten_bind_MeshBuilder_SetMetadataForAttribute_3 = a.asm.na).apply(null, arguments);
      }),
      Qb = (a._emscripten_bind_MeshBuilder___destroy___0 = function () {
        return (Qb = a._emscripten_bind_MeshBuilder___destroy___0 = a.asm.oa).apply(null, arguments);
      }),
      Ma = (a._emscripten_bind_Encoder_Encoder_0 = function () {
        return (Ma = a._emscripten_bind_Encoder_Encoder_0 = a.asm.pa).apply(null, arguments);
      }),
      Rb = (a._emscripten_bind_Encoder_SetEncodingMethod_1 = function () {
        return (Rb = a._emscripten_bind_Encoder_SetEncodingMethod_1 = a.asm.qa).apply(null, arguments);
      }),
      Sb = (a._emscripten_bind_Encoder_SetAttributeQuantization_2 = function () {
        return (Sb = a._emscripten_bind_Encoder_SetAttributeQuantization_2 = a.asm.ra).apply(null, arguments);
      }),
      Tb = (a._emscripten_bind_Encoder_SetAttributeExplicitQuantization_5 = function () {
        return (Tb = a._emscripten_bind_Encoder_SetAttributeExplicitQuantization_5 = a.asm.sa).apply(null, arguments);
      }),
      Ub = (a._emscripten_bind_Encoder_SetSpeedOptions_2 = function () {
        return (Ub = a._emscripten_bind_Encoder_SetSpeedOptions_2 = a.asm.ta).apply(null, arguments);
      }),
      Vb = (a._emscripten_bind_Encoder_SetTrackEncodedProperties_1 = function () {
        return (Vb = a._emscripten_bind_Encoder_SetTrackEncodedProperties_1 = a.asm.ua).apply(null, arguments);
      }),
      Wb = (a._emscripten_bind_Encoder_EncodeMeshToDracoBuffer_2 = function () {
        return (Wb = a._emscripten_bind_Encoder_EncodeMeshToDracoBuffer_2 = a.asm.va).apply(null, arguments);
      }),
      Xb = (a._emscripten_bind_Encoder_EncodePointCloudToDracoBuffer_3 = function () {
        return (Xb = a._emscripten_bind_Encoder_EncodePointCloudToDracoBuffer_3 = a.asm.wa).apply(null, arguments);
      }),
      Yb = (a._emscripten_bind_Encoder_GetNumberOfEncodedPoints_0 = function () {
        return (Yb = a._emscripten_bind_Encoder_GetNumberOfEncodedPoints_0 = a.asm.xa).apply(null, arguments);
      }),
      Zb = (a._emscripten_bind_Encoder_GetNumberOfEncodedFaces_0 = function () {
        return (Zb = a._emscripten_bind_Encoder_GetNumberOfEncodedFaces_0 = a.asm.ya).apply(null, arguments);
      }),
      $b = (a._emscripten_bind_Encoder___destroy___0 = function () {
        return ($b = a._emscripten_bind_Encoder___destroy___0 = a.asm.za).apply(null, arguments);
      }),
      Na = (a._emscripten_bind_ExpertEncoder_ExpertEncoder_1 = function () {
        return (Na = a._emscripten_bind_ExpertEncoder_ExpertEncoder_1 = a.asm.Aa).apply(null, arguments);
      }),
      ac = (a._emscripten_bind_ExpertEncoder_SetEncodingMethod_1 = function () {
        return (ac = a._emscripten_bind_ExpertEncoder_SetEncodingMethod_1 = a.asm.Ba).apply(null, arguments);
      }),
      bc = (a._emscripten_bind_ExpertEncoder_SetAttributeQuantization_2 = function () {
        return (bc = a._emscripten_bind_ExpertEncoder_SetAttributeQuantization_2 = a.asm.Ca).apply(null, arguments);
      }),
      cc = (a._emscripten_bind_ExpertEncoder_SetAttributeExplicitQuantization_5 = function () {
        return (cc = a._emscripten_bind_ExpertEncoder_SetAttributeExplicitQuantization_5 = a.asm.Da).apply(
          null,
          arguments,
        );
      }),
      dc = (a._emscripten_bind_ExpertEncoder_SetSpeedOptions_2 = function () {
        return (dc = a._emscripten_bind_ExpertEncoder_SetSpeedOptions_2 = a.asm.Ea).apply(null, arguments);
      }),
      ec = (a._emscripten_bind_ExpertEncoder_SetTrackEncodedProperties_1 = function () {
        return (ec = a._emscripten_bind_ExpertEncoder_SetTrackEncodedProperties_1 = a.asm.Fa).apply(null, arguments);
      }),
      fc = (a._emscripten_bind_ExpertEncoder_EncodeToDracoBuffer_2 = function () {
        return (fc = a._emscripten_bind_ExpertEncoder_EncodeToDracoBuffer_2 = a.asm.Ga).apply(null, arguments);
      }),
      gc = (a._emscripten_bind_ExpertEncoder_GetNumberOfEncodedPoints_0 = function () {
        return (gc = a._emscripten_bind_ExpertEncoder_GetNumberOfEncodedPoints_0 = a.asm.Ha).apply(null, arguments);
      }),
      hc = (a._emscripten_bind_ExpertEncoder_GetNumberOfEncodedFaces_0 = function () {
        return (hc = a._emscripten_bind_ExpertEncoder_GetNumberOfEncodedFaces_0 = a.asm.Ia).apply(null, arguments);
      }),
      ic = (a._emscripten_bind_ExpertEncoder___destroy___0 = function () {
        return (ic = a._emscripten_bind_ExpertEncoder___destroy___0 = a.asm.Ja).apply(null, arguments);
      }),
      jc = (a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = function () {
        return (jc = a._emscripten_enum_draco_GeometryAttribute_Type_INVALID = a.asm.Ka).apply(null, arguments);
      }),
      kc = (a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = function () {
        return (kc = a._emscripten_enum_draco_GeometryAttribute_Type_POSITION = a.asm.La).apply(null, arguments);
      }),
      lc = (a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = function () {
        return (lc = a._emscripten_enum_draco_GeometryAttribute_Type_NORMAL = a.asm.Ma).apply(null, arguments);
      }),
      mc = (a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = function () {
        return (mc = a._emscripten_enum_draco_GeometryAttribute_Type_COLOR = a.asm.Na).apply(null, arguments);
      }),
      nc = (a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = function () {
        return (nc = a._emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = a.asm.Oa).apply(null, arguments);
      }),
      oc = (a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = function () {
        return (oc = a._emscripten_enum_draco_GeometryAttribute_Type_GENERIC = a.asm.Pa).apply(null, arguments);
      }),
      pc = (a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = function () {
        return (pc = a._emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = a.asm.Qa).apply(
          null,
          arguments,
        );
      }),
      qc = (a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = function () {
        return (qc = a._emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = a.asm.Ra).apply(null, arguments);
      }),
      rc = (a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = function () {
        return (rc = a._emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = a.asm.Sa).apply(null, arguments);
      }),
      sc = (a._emscripten_enum_draco_MeshEncoderMethod_MESH_SEQUENTIAL_ENCODING = function () {
        return (sc = a._emscripten_enum_draco_MeshEncoderMethod_MESH_SEQUENTIAL_ENCODING = a.asm.Ta).apply(
          null,
          arguments,
        );
      }),
      tc = (a._emscripten_enum_draco_MeshEncoderMethod_MESH_EDGEBREAKER_ENCODING = function () {
        return (tc = a._emscripten_enum_draco_MeshEncoderMethod_MESH_EDGEBREAKER_ENCODING = a.asm.Ua).apply(
          null,
          arguments,
        );
      });
    a._free = function () {
      return (a._free = a.asm.Va).apply(null, arguments);
    };
    var Ra = (a._malloc = function () {
      return (Ra = a._malloc = a.asm.Wa).apply(null, arguments);
    });
    a.callRuntimeCallbacks = B;
    var fa;
    ca = function b() {
      fa || U();
      fa || (ca = b);
    };
    a.run = U;
    if (a.preInit)
      for ('function' == typeof a.preInit && (a.preInit = [a.preInit]); 0 < a.preInit.length; ) a.preInit.pop()();
    U();
    w.prototype = Object.create(w.prototype);
    w.prototype.constructor = w;
    w.prototype.__class__ = w;
    w.__cache__ = {};
    a.WrapperObject = w;
    a.getCache = C;
    a.wrapPointer = T;
    a.castObject = function (b, c) {
      return T(b.ptr, c);
    };
    a.NULL = T(0);
    a.destroy = function (b) {
      if (!b.__destroy__) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
      b.__destroy__();
      delete C(b.__class__)[b.ptr];
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
    var l = {
      buffer: 0,
      size: 0,
      pos: 0,
      temps: [],
      needed: 0,
      prepare: function () {
        if (l.needed) {
          for (var b = 0; b < l.temps.length; b++) a._free(l.temps[b]);
          l.temps.length = 0;
          a._free(l.buffer);
          l.buffer = 0;
          l.size += l.needed;
          l.needed = 0;
        }
        l.buffer || ((l.size += 128), (l.buffer = a._malloc(l.size)), r(l.buffer));
        l.pos = 0;
      },
      alloc: function (b, c) {
        r(l.buffer);
        b = b.length * c.BYTES_PER_ELEMENT;
        b = (b + 7) & -8;
        l.pos + b >= l.size
          ? (r(0 < b), (l.needed += b), (c = a._malloc(b)), l.temps.push(c))
          : ((c = l.buffer + l.pos), (l.pos += b));
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
        for (var e = 0; e < b.length; e++) c[d + e] = b[e];
      },
    };
    R.prototype = Object.create(w.prototype);
    R.prototype.constructor = R;
    R.prototype.__class__ = R;
    R.__cache__ = {};
    a.VoidPtr = R;
    R.prototype.__destroy__ = R.prototype.__destroy__ = function () {
      Sa(this.ptr);
    };
    N.prototype = Object.create(w.prototype);
    N.prototype.constructor = N;
    N.prototype.__class__ = N;
    N.__cache__ = {};
    a.GeometryAttribute = N;
    N.prototype.__destroy__ = N.prototype.__destroy__ = function () {
      Ta(this.ptr);
    };
    z.prototype = Object.create(w.prototype);
    z.prototype.constructor = z;
    z.prototype.__class__ = z;
    z.__cache__ = {};
    a.PointAttribute = z;
    z.prototype.size = z.prototype.size = function () {
      return Ua(this.ptr);
    };
    z.prototype.attribute_type = z.prototype.attribute_type = function () {
      return Va(this.ptr);
    };
    z.prototype.data_type = z.prototype.data_type = function () {
      return Wa(this.ptr);
    };
    z.prototype.num_components = z.prototype.num_components = function () {
      return Xa(this.ptr);
    };
    z.prototype.normalized = z.prototype.normalized = function () {
      return !!Ya(this.ptr);
    };
    z.prototype.byte_stride = z.prototype.byte_stride = function () {
      return Za(this.ptr);
    };
    z.prototype.byte_offset = z.prototype.byte_offset = function () {
      return $a(this.ptr);
    };
    z.prototype.unique_id = z.prototype.unique_id = function () {
      return ab(this.ptr);
    };
    z.prototype.__destroy__ = z.prototype.__destroy__ = function () {
      bb(this.ptr);
    };
    H.prototype = Object.create(w.prototype);
    H.prototype.constructor = H;
    H.prototype.__class__ = H;
    H.__cache__ = {};
    a.PointCloud = H;
    H.prototype.num_attributes = H.prototype.num_attributes = function () {
      return cb(this.ptr);
    };
    H.prototype.num_points = H.prototype.num_points = function () {
      return db(this.ptr);
    };
    H.prototype.__destroy__ = H.prototype.__destroy__ = function () {
      eb(this.ptr);
    };
    E.prototype = Object.create(w.prototype);
    E.prototype.constructor = E;
    E.prototype.__class__ = E;
    E.__cache__ = {};
    a.Mesh = E;
    E.prototype.num_faces = E.prototype.num_faces = function () {
      return fb(this.ptr);
    };
    E.prototype.num_attributes = E.prototype.num_attributes = function () {
      return gb(this.ptr);
    };
    E.prototype.num_points = E.prototype.num_points = function () {
      return hb(this.ptr);
    };
    E.prototype.set_num_points = E.prototype.set_num_points = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      ib(c, b);
    };
    E.prototype.__destroy__ = E.prototype.__destroy__ = function () {
      jb(this.ptr);
    };
    O.prototype = Object.create(w.prototype);
    O.prototype.constructor = O;
    O.prototype.__class__ = O;
    O.__cache__ = {};
    a.Metadata = O;
    O.prototype.__destroy__ = O.prototype.__destroy__ = function () {
      kb(this.ptr);
    };
    I.prototype = Object.create(w.prototype);
    I.prototype.constructor = I;
    I.prototype.__class__ = I;
    I.__cache__ = {};
    a.DracoInt8Array = I;
    I.prototype.GetValue = I.prototype.GetValue = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      return lb(c, b);
    };
    I.prototype.size = I.prototype.size = function () {
      return mb(this.ptr);
    };
    I.prototype.__destroy__ = I.prototype.__destroy__ = function () {
      nb(this.ptr);
    };
    F.prototype = Object.create(w.prototype);
    F.prototype.constructor = F;
    F.prototype.__class__ = F;
    F.__cache__ = {};
    a.MetadataBuilder = F;
    F.prototype.AddStringEntry = F.prototype.AddStringEntry = function (b, c, d) {
      var e = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : P(c);
      d = d && 'object' === typeof d ? d.ptr : P(d);
      return !!ob(e, b, c, d);
    };
    F.prototype.AddIntEntry = F.prototype.AddIntEntry = function (b, c, d) {
      var e = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : P(c);
      d && 'object' === typeof d && (d = d.ptr);
      return !!pb(e, b, c, d);
    };
    F.prototype.AddIntEntryArray = F.prototype.AddIntEntryArray = function (b, c, d, e) {
      var g = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : P(c);
      'object' == typeof d && (d = X(d));
      e && 'object' === typeof e && (e = e.ptr);
      return !!qb(g, b, c, d, e);
    };
    F.prototype.AddDoubleEntry = F.prototype.AddDoubleEntry = function (b, c, d) {
      var e = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c = c && 'object' === typeof c ? c.ptr : P(c);
      d && 'object' === typeof d && (d = d.ptr);
      return !!rb(e, b, c, d);
    };
    F.prototype.__destroy__ = F.prototype.__destroy__ = function () {
      sb(this.ptr);
    };
    x.prototype = Object.create(w.prototype);
    x.prototype.constructor = x;
    x.prototype.__class__ = x;
    x.__cache__ = {};
    a.PointCloudBuilder = x;
    x.prototype.AddFloatAttribute = x.prototype.AddFloatAttribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = aa(g));
      return tb(t, b, c, d, e, g);
    };
    x.prototype.AddInt8Attribute = x.prototype.AddInt8Attribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = ha(g));
      return ub(t, b, c, d, e, g);
    };
    x.prototype.AddUInt8Attribute = x.prototype.AddUInt8Attribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = ha(g));
      return vb(t, b, c, d, e, g);
    };
    x.prototype.AddInt16Attribute = x.prototype.AddInt16Attribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = ia(g));
      return wb(t, b, c, d, e, g);
    };
    x.prototype.AddUInt16Attribute = x.prototype.AddUInt16Attribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = ia(g));
      return xb(t, b, c, d, e, g);
    };
    x.prototype.AddInt32Attribute = x.prototype.AddInt32Attribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = X(g));
      return yb(t, b, c, d, e, g);
    };
    x.prototype.AddUInt32Attribute = x.prototype.AddUInt32Attribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = X(g));
      return zb(t, b, c, d, e, g);
    };
    x.prototype.AddMetadata = x.prototype.AddMetadata = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return !!Ab(d, b, c);
    };
    x.prototype.SetMetadataForAttribute = x.prototype.SetMetadataForAttribute = function (b, c, d) {
      var e = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Bb(e, b, c, d);
    };
    x.prototype.__destroy__ = x.prototype.__destroy__ = function () {
      Cb(this.ptr);
    };
    u.prototype = Object.create(w.prototype);
    u.prototype.constructor = u;
    u.prototype.__class__ = u;
    u.__cache__ = {};
    a.MeshBuilder = u;
    u.prototype.AddFacesToMesh = u.prototype.AddFacesToMesh = function (b, c, d) {
      var e = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      'object' == typeof d && (d = X(d));
      return !!Db(e, b, c, d);
    };
    u.prototype.AddFloatAttributeToMesh = u.prototype.AddFloatAttributeToMesh = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = aa(g));
      return Eb(t, b, c, d, e, g);
    };
    u.prototype.AddInt32AttributeToMesh = u.prototype.AddInt32AttributeToMesh = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = X(g));
      return Fb(t, b, c, d, e, g);
    };
    u.prototype.AddMetadataToMesh = u.prototype.AddMetadataToMesh = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return !!Gb(d, b, c);
    };
    u.prototype.AddFloatAttribute = u.prototype.AddFloatAttribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = aa(g));
      return Hb(t, b, c, d, e, g);
    };
    u.prototype.AddInt8Attribute = u.prototype.AddInt8Attribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = ha(g));
      return Ib(t, b, c, d, e, g);
    };
    u.prototype.AddUInt8Attribute = u.prototype.AddUInt8Attribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = ha(g));
      return Jb(t, b, c, d, e, g);
    };
    u.prototype.AddInt16Attribute = u.prototype.AddInt16Attribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = ia(g));
      return Kb(t, b, c, d, e, g);
    };
    u.prototype.AddUInt16Attribute = u.prototype.AddUInt16Attribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = ia(g));
      return Lb(t, b, c, d, e, g);
    };
    u.prototype.AddInt32Attribute = u.prototype.AddInt32Attribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = X(g));
      return Mb(t, b, c, d, e, g);
    };
    u.prototype.AddUInt32Attribute = u.prototype.AddUInt32Attribute = function (b, c, d, e, g) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      e && 'object' === typeof e && (e = e.ptr);
      'object' == typeof g && (g = X(g));
      return Nb(t, b, c, d, e, g);
    };
    u.prototype.AddMetadata = u.prototype.AddMetadata = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return !!Ob(d, b, c);
    };
    u.prototype.SetMetadataForAttribute = u.prototype.SetMetadataForAttribute = function (b, c, d) {
      var e = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return !!Pb(e, b, c, d);
    };
    u.prototype.__destroy__ = u.prototype.__destroy__ = function () {
      Qb(this.ptr);
    };
    y.prototype = Object.create(w.prototype);
    y.prototype.constructor = y;
    y.prototype.__class__ = y;
    y.__cache__ = {};
    a.Encoder = y;
    y.prototype.SetEncodingMethod = y.prototype.SetEncodingMethod = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      Rb(c, b);
    };
    y.prototype.SetAttributeQuantization = y.prototype.SetAttributeQuantization = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      Sb(d, b, c);
    };
    y.prototype.SetAttributeExplicitQuantization = y.prototype.SetAttributeExplicitQuantization = function (
      b,
      c,
      d,
      e,
      g,
    ) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      'object' == typeof e && (e = aa(e));
      g && 'object' === typeof g && (g = g.ptr);
      Tb(t, b, c, d, e, g);
    };
    y.prototype.SetSpeedOptions = y.prototype.SetSpeedOptions = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      Ub(d, b, c);
    };
    y.prototype.SetTrackEncodedProperties = y.prototype.SetTrackEncodedProperties = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      Vb(c, b);
    };
    y.prototype.EncodeMeshToDracoBuffer = y.prototype.EncodeMeshToDracoBuffer = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return Wb(d, b, c);
    };
    y.prototype.EncodePointCloudToDracoBuffer = y.prototype.EncodePointCloudToDracoBuffer = function (b, c, d) {
      var e = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      return Xb(e, b, c, d);
    };
    y.prototype.GetNumberOfEncodedPoints = y.prototype.GetNumberOfEncodedPoints = function () {
      return Yb(this.ptr);
    };
    y.prototype.GetNumberOfEncodedFaces = y.prototype.GetNumberOfEncodedFaces = function () {
      return Zb(this.ptr);
    };
    y.prototype.__destroy__ = y.prototype.__destroy__ = function () {
      $b(this.ptr);
    };
    A.prototype = Object.create(w.prototype);
    A.prototype.constructor = A;
    A.prototype.__class__ = A;
    A.__cache__ = {};
    a.ExpertEncoder = A;
    A.prototype.SetEncodingMethod = A.prototype.SetEncodingMethod = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      ac(c, b);
    };
    A.prototype.SetAttributeQuantization = A.prototype.SetAttributeQuantization = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      bc(d, b, c);
    };
    A.prototype.SetAttributeExplicitQuantization = A.prototype.SetAttributeExplicitQuantization = function (
      b,
      c,
      d,
      e,
      g,
    ) {
      var t = this.ptr;
      l.prepare();
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      d && 'object' === typeof d && (d = d.ptr);
      'object' == typeof e && (e = aa(e));
      g && 'object' === typeof g && (g = g.ptr);
      cc(t, b, c, d, e, g);
    };
    A.prototype.SetSpeedOptions = A.prototype.SetSpeedOptions = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      dc(d, b, c);
    };
    A.prototype.SetTrackEncodedProperties = A.prototype.SetTrackEncodedProperties = function (b) {
      var c = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      ec(c, b);
    };
    A.prototype.EncodeToDracoBuffer = A.prototype.EncodeToDracoBuffer = function (b, c) {
      var d = this.ptr;
      b && 'object' === typeof b && (b = b.ptr);
      c && 'object' === typeof c && (c = c.ptr);
      return fc(d, b, c);
    };
    A.prototype.GetNumberOfEncodedPoints = A.prototype.GetNumberOfEncodedPoints = function () {
      return gc(this.ptr);
    };
    A.prototype.GetNumberOfEncodedFaces = A.prototype.GetNumberOfEncodedFaces = function () {
      return hc(this.ptr);
    };
    A.prototype.__destroy__ = A.prototype.__destroy__ = function () {
      ic(this.ptr);
    };
    (function () {
      function b() {
        a.INVALID = jc();
        a.POSITION = kc();
        a.NORMAL = lc();
        a.COLOR = mc();
        a.TEX_COORD = nc();
        a.GENERIC = oc();
        a.INVALID_GEOMETRY_TYPE = pc();
        a.POINT_CLOUD = qc();
        a.TRIANGULAR_MESH = rc();
        a.MESH_SEQUENTIAL_ENCODING = sc();
        a.MESH_EDGEBREAKER_ENCODING = tc();
      }
      ya ? b() : pa.unshift(b);
    })();
    a.mainCallbacks = pa;
    if ('function' === typeof a.onModuleParsed) a.onModuleParsed();
    return q.ready;
  };
})();
'object' === typeof exports && 'object' === typeof module
  ? (module.exports = DracoEncoderModule)
  : 'function' === typeof define && define.amd
  ? define([], function () {
      return DracoEncoderModule;
    })
  : 'object' === typeof exports && (exports.DracoEncoderModule = DracoEncoderModule);
