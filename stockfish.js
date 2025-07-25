/*!
 * Stockfish.js 17 (c) 2025, Chess.com, LLC
 * https://github.com/nmrugg/stockfish.js
 * License: GPLv3
 *
 * Based on Stockfish (c) T. Romstad, M. Costalba, J. Kiiski, G. Linscott and other contributors.
 * https://github.com/official-stockfish/Stockfish
 */ var enginePartsCount = 6;
!(function () {
  var a, u, s, e, t, r;
  function o() {
    function e(e) {
      (e = e || {}),
        ((f = f || (void 0 !== e ? e : {})).ready = new Promise(function (
          e,
          n
        ) {
          (T = e), (i = n);
        })),
        "undefined" != typeof global &&
          "[object process]" ===
            Object.prototype.toString.call(global.process) &&
          "undefined" != typeof fetch &&
          ("undefined" == typeof XMLHttpRequest &&
            (global.XMLHttpRequest = function () {
              var t,
                r = {
                  open: function (e, n) {
                    t = n;
                  },
                  send: function () {
                    require("fs").readFile(t, function (e, n) {
                      (r.readyState = 4),
                        e
                          ? (console.error(e), (r.status = 404), r.onerror(e))
                          : ((r.status = 200),
                            (r.response = n),
                            r.onreadystatechange(),
                            r.onload());
                    });
                  },
                };
              return r;
            }),
          (fetch = null)),
        (f.print = function (e) {
          f.listener ? f.listener(e) : console.log(e);
        }),
        (f.printErr = function (e) {
          f.listener ? f.listener(e) : console.error(e);
        }),
        (f.terminate = function () {
          "undefined" != typeof PThread && PThread.Y();
        });
      var f,
        T,
        i,
        n,
        t,
        U,
        r,
        H,
        a,
        o = Object.assign({}, f),
        u = [],
        s = "./this.program",
        c = (e, n) => {
          throw n;
        },
        k = "object" == typeof window,
        l = "function" == typeof importScripts,
        q =
          "object" == typeof process &&
          "object" == typeof process.versions &&
          "string" == typeof process.versions.node,
        p = "",
        L =
          (q
            ? ((p = l ? require("path").dirname(p) + "/" : __dirname + "/"),
              (H = () => {
                r || ((U = require("fs")), (r = require("path")));
              }),
              (n = function (e, n) {
                return (
                  H(),
                  (e = r.normalize(e)),
                  U.readFileSync(e, n ? void 0 : "utf8")
                );
              }),
              (t = (e) => (e = (e = n(e, !0)).buffer ? e : new Uint8Array(e))),
              1 < process.argv.length &&
                (s = process.argv[1].replace(/\\/g, "/")),
              (u = process.argv.slice(2)),
              process.on("uncaughtException", function (e) {
                if (!(e instanceof j)) throw e;
              }),
              process.on("unhandledRejection", function (e) {
                throw e;
              }),
              (c = (e, n) => {
                if (m || 0 < _) throw ((process.exitCode = e), n);
                n instanceof j || d("exiting due to exception: " + n),
                  process.exit(e);
              }),
              (f.inspect = function () {
                return "[Emscripten Module object]";
              }))
            : (k || l) &&
              (l
                ? (p = self.location.href)
                : "undefined" != typeof document &&
                  document.currentScript &&
                  (p = document.currentScript.src),
              (p =
                0 !== (p = Pe ? Pe : p).indexOf("blob:")
                  ? p.substr(0, p.replace(/[?#].*/, "").lastIndexOf("/") + 1)
                  : ""),
              (n = (e) => {
                var n = new XMLHttpRequest();
                return n.open("GET", e, !1), n.send(null), n.responseText;
              }),
              l) &&
              (t = (e) => {
                var n = new XMLHttpRequest();
                return (
                  n.open("GET", e, !1),
                  (n.responseType = "arraybuffer"),
                  n.send(null),
                  new Uint8Array(n.response)
                );
              }),
          f.print || console.log.bind(console)),
        d = f.printErr || console.warn.bind(console),
        m =
          (Object.assign(f, o),
          f.arguments && (u = f.arguments),
          f.thisProgram && (s = f.thisProgram),
          f.quit && (c = f.quit),
          f.wasmBinary && (a = f.wasmBinary),
          f.noExitRuntime || !0);
      "object" != typeof WebAssembly && C("no native wasm support detected");
      var W,
        B,
        y,
        h,
        g,
        v = !1,
        N =
          "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;
      function J(e, n, t) {
        var r = n + t;
        for (t = n; e[t] && !(r <= t); ) ++t;
        if (16 < t - n && e.subarray && N) return N.decode(e.subarray(n, t));
        for (r = ""; n < t; ) {
          var o,
            i,
            a = e[n++];
          128 & a
            ? ((o = 63 & e[n++]),
              192 == (224 & a)
                ? (r += String.fromCharCode(((31 & a) << 6) | o))
                : ((i = 63 & e[n++]),
                  (a =
                    224 == (240 & a)
                      ? ((15 & a) << 12) | (o << 6) | i
                      : ((7 & a) << 18) |
                        (o << 12) |
                        (i << 6) |
                        (63 & e[n++])) < 65536
                    ? (r += String.fromCharCode(a))
                    : ((a -= 65536),
                      (r += String.fromCharCode(
                        55296 | (a >> 10),
                        56320 | (1023 & a)
                      )))))
            : (r += String.fromCharCode(a));
        }
        return r;
      }
      function X(e) {
        return e ? J(h, e, void 0) : "";
      }
      function z(e, n, t, r) {
        if (0 < r) {
          r = t + r - 1;
          for (var o = 0; o < e.length; ++o) {
            var i = e.charCodeAt(o);
            if (
              (i =
                55296 <= i && i <= 57343
                  ? (65536 + ((1023 & i) << 10)) | (1023 & e.charCodeAt(++o))
                  : i) <= 127
            ) {
              if (r <= t) break;
              n[t++] = i;
            } else {
              if (i <= 2047) {
                if (r <= t + 1) break;
                n[t++] = 192 | (i >> 6);
              } else {
                if (i <= 65535) {
                  if (r <= t + 2) break;
                  n[t++] = 224 | (i >> 12);
                } else {
                  if (r <= t + 3) break;
                  (n[t++] = 240 | (i >> 18)), (n[t++] = 128 | ((i >> 12) & 63));
                }
                n[t++] = 128 | ((i >> 6) & 63);
              }
              n[t++] = 128 | (63 & i);
            }
          }
          n[t] = 0;
        }
      }
      function G(e) {
        for (var n = 0, t = 0; t < e.length; ++t) {
          var r = e.charCodeAt(t);
          (r =
            55296 <= r && r <= 57343
              ? (65536 + ((1023 & r) << 10)) | (1023 & e.charCodeAt(++t))
              : r) <= 127
            ? ++n
            : (n = r <= 2047 ? n + 2 : r <= 65535 ? n + 3 : n + 4);
        }
        return n;
      }
      function K(e) {
        var n = G(e) + 1,
          t = Y(n);
        return z(e, y, t, n), t;
      }
      function V() {
        var e = W.buffer;
        (B = e),
          (f.HEAP8 = y = new Int8Array(e)),
          (f.HEAP16 = new Int16Array(e)),
          (f.HEAP32 = g = new Int32Array(e)),
          (f.HEAPU8 = h = new Uint8Array(e)),
          (f.HEAPU16 = new Uint16Array(e)),
          (f.HEAPU32 = new Uint32Array(e)),
          (f.HEAPF32 = new Float32Array(e)),
          (f.HEAPF64 = new Float64Array(e));
      }
      var w,
        Z = [],
        $ = [],
        Q = [],
        ee = [],
        ne = !1,
        _ = 0,
        b = 0,
        te = null,
        S = null;
      function C(e) {
        throw (
          (f.onAbort && f.onAbort(e),
          d((e = "Aborted(" + e + ")")),
          (v = !0),
          (e = new WebAssembly.RuntimeError(
            e + ". Build with -s ASSERTIONS=1 for more info."
          )),
          i(e),
          e)
        );
      }
      function re() {
        return w.startsWith("data:application/octet-stream;base64,");
      }
      function oe() {
        var e = w;
        try {
          if (e == w && a) return new Uint8Array(a);
          if (t) return t(e);
          throw "both async and sync fetching of the wasm failed";
        } catch (e) {
          C(e);
        }
      }
      function D(e) {
        for (; 0 < e.length; ) {
          var n,
            t = e.shift();
          "function" == typeof t
            ? t(f)
            : "number" == typeof (n = t.R)
            ? void 0 === t.O
              ? xe.call(null, n)
              : Me.apply(null, [n, t.O])
            : n(void 0 === t.O ? null : t.O);
        }
      }
      function ie(e) {
        e instanceof j || "unwind" == e || c(1, e);
      }
      (f.preloadedImages = {}),
        (f.preloadedAudios = {}),
        (w = "stockfish.wasm"),
        re() || ((o = w), (w = f.locateFile ? f.locateFile(o, p) : p + o));
      var ae = [null, [], []],
        ue = {};
      function se(e) {
        if (!ne && !v)
          try {
            e();
          } catch (e) {
            ie(e);
          }
      }
      var ce,
        le = q
          ? () => {
              var e = process.hrtime();
              return 1e3 * e[0] + e[1] / 1e6;
            }
          : () => performance.now(),
        fe = {};
      function pe() {
        if (!ce) {
          var e,
            n = {
              USER: "web_user",
              LOGNAME: "web_user",
              PATH: "/",
              PWD: "/",
              HOME: "/home/web_user",
              LANG:
                (
                  ("object" == typeof navigator &&
                    navigator.languages &&
                    navigator.languages[0]) ||
                  "C"
                ).replace("-", "_") + ".UTF-8",
              _: s || "./this.program",
            };
          for (e in fe) void 0 === fe[e] ? delete n[e] : (n[e] = fe[e]);
          var t = [];
          for (e in n) t.push(e + "=" + n[e]);
          ce = t;
        }
        return ce;
      }
      function A(e) {
        return 0 == e % 4 && (0 != e % 100 || 0 == e % 400);
      }
      function de(e, n) {
        for (var t = 0, r = 0; r <= n; t += e[r++]);
        return t;
      }
      var I = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        R = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      function M(e, n) {
        for (e = new Date(e.getTime()); 0 < n; ) {
          var t = e.getMonth(),
            r = (A(e.getFullYear()) ? I : R)[t];
          if (!(n > r - e.getDate())) {
            e.setDate(e.getDate() + n);
            break;
          }
          (n -= r - e.getDate() + 1),
            e.setDate(1),
            t < 11
              ? e.setMonth(t + 1)
              : (e.setMonth(0), e.setFullYear(e.getFullYear() + 1));
        }
        return e;
      }
      function me(e, n, t, r) {
        function o(e, n, t) {
          for (
            e = "number" == typeof e ? e.toString() : e || "";
            e.length < n;

          )
            e = t[0] + e;
          return e;
        }
        function i(e, n) {
          return o(e, n, "0");
        }
        function a(e, n) {
          function t(e) {
            return e < 0 ? -1 : 0 < e ? 1 : 0;
          }
          var r;
          return (r =
            0 === (r = t(e.getFullYear() - n.getFullYear())) &&
            0 === (r = t(e.getMonth() - n.getMonth()))
              ? t(e.getDate() - n.getDate())
              : r);
        }
        function u(e) {
          switch (e.getDay()) {
            case 0:
              return new Date(e.getFullYear() - 1, 11, 29);
            case 1:
              return e;
            case 2:
              return new Date(e.getFullYear(), 0, 3);
            case 3:
              return new Date(e.getFullYear(), 0, 2);
            case 4:
              return new Date(e.getFullYear(), 0, 1);
            case 5:
              return new Date(e.getFullYear() - 1, 11, 31);
            case 6:
              return new Date(e.getFullYear() - 1, 11, 30);
          }
        }
        function s(e) {
          e = M(new Date(e.I + 1900, 0, 1), e.N);
          var n = new Date(e.getFullYear() + 1, 0, 4),
            t = u(new Date(e.getFullYear(), 0, 4)),
            n = u(n);
          return a(t, e) <= 0
            ? a(n, e) <= 0
              ? e.getFullYear() + 1
              : e.getFullYear()
            : e.getFullYear() - 1;
        }
        var c,
          l = g[(r + 40) >> 2];
        for (c in ((r = {
          U: g[r >> 2],
          T: g[(r + 4) >> 2],
          L: g[(r + 8) >> 2],
          K: g[(r + 12) >> 2],
          J: g[(r + 16) >> 2],
          I: g[(r + 20) >> 2],
          M: g[(r + 24) >> 2],
          N: g[(r + 28) >> 2],
          Z: g[(r + 32) >> 2],
          S: g[(r + 36) >> 2],
          V: l ? X(l) : "",
        }),
        (t = X(t)),
        (l = {
          "%c": "%a %b %d %H:%M:%S %Y",
          "%D": "%m/%d/%y",
          "%F": "%Y-%m-%d",
          "%h": "%b",
          "%r": "%I:%M:%S %p",
          "%R": "%H:%M",
          "%T": "%H:%M:%S",
          "%x": "%m/%d/%y",
          "%X": "%H:%M:%S",
          "%Ec": "%c",
          "%EC": "%C",
          "%Ex": "%m/%d/%y",
          "%EX": "%H:%M:%S",
          "%Ey": "%y",
          "%EY": "%Y",
          "%Od": "%d",
          "%Oe": "%e",
          "%OH": "%H",
          "%OI": "%I",
          "%Om": "%m",
          "%OM": "%M",
          "%OS": "%S",
          "%Ou": "%u",
          "%OU": "%U",
          "%OV": "%V",
          "%Ow": "%w",
          "%OW": "%W",
          "%Oy": "%y",
        })))
          t = t.replace(new RegExp(c, "g"), l[c]);
        var f,
          p,
          d = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(
            " "
          ),
          m =
            "January February March April May June July August September October November December".split(
              " "
            ),
          l = {
            "%a": function (e) {
              return d[e.M].substring(0, 3);
            },
            "%A": function (e) {
              return d[e.M];
            },
            "%b": function (e) {
              return m[e.J].substring(0, 3);
            },
            "%B": function (e) {
              return m[e.J];
            },
            "%C": function (e) {
              return i(((e.I + 1900) / 100) | 0, 2);
            },
            "%d": function (e) {
              return i(e.K, 2);
            },
            "%e": function (e) {
              return o(e.K, 2, " ");
            },
            "%g": function (e) {
              return s(e).toString().substring(2);
            },
            "%G": s,
            "%H": function (e) {
              return i(e.L, 2);
            },
            "%I": function (e) {
              return 0 == (e = e.L) ? (e = 12) : 12 < e && (e -= 12), i(e, 2);
            },
            "%j": function (e) {
              return i(e.K + de(A(e.I + 1900) ? I : R, e.J - 1), 3);
            },
            "%m": function (e) {
              return i(e.J + 1, 2);
            },
            "%M": function (e) {
              return i(e.T, 2);
            },
            "%n": function () {
              return "\n";
            },
            "%p": function (e) {
              return 0 <= e.L && e.L < 12 ? "AM" : "PM";
            },
            "%S": function (e) {
              return i(e.U, 2);
            },
            "%t": function () {
              return "\t";
            },
            "%u": function (e) {
              return e.M || 7;
            },
            "%U": function (e) {
              var n = new Date(e.I + 1900, 0, 1),
                t = 0 === n.getDay() ? n : M(n, 7 - n.getDay());
              return a(t, (e = new Date(e.I + 1900, e.J, e.K))) < 0
                ? i(
                    Math.ceil(
                      (31 -
                        t.getDate() +
                        (de(A(e.getFullYear()) ? I : R, e.getMonth() - 1) -
                          31) +
                        e.getDate()) /
                        7
                    ),
                    2
                  )
                : 0 === a(t, n)
                ? "01"
                : "00";
            },
            "%V": function (e) {
              var n = new Date(e.I + 1901, 0, 4),
                t = u(new Date(e.I + 1900, 0, 4)),
                n = u(n),
                r = M(new Date(e.I + 1900, 0, 1), e.N);
              return a(r, t) < 0
                ? "53"
                : a(n, r) <= 0
                ? "01"
                : i(
                    Math.ceil(
                      (t.getFullYear() < e.I + 1900
                        ? e.N + 32 - t.getDate()
                        : e.N + 1 - t.getDate()) / 7
                    ),
                    2
                  );
            },
            "%w": function (e) {
              return e.M;
            },
            "%W": function (e) {
              var n = new Date(e.I, 0, 1),
                t =
                  1 === n.getDay()
                    ? n
                    : M(n, 0 === n.getDay() ? 1 : 7 - n.getDay() + 1);
              return a(t, (e = new Date(e.I + 1900, e.J, e.K))) < 0
                ? i(
                    Math.ceil(
                      (31 -
                        t.getDate() +
                        (de(A(e.getFullYear()) ? I : R, e.getMonth() - 1) -
                          31) +
                        e.getDate()) /
                        7
                    ),
                    2
                  )
                : 0 === a(t, n)
                ? "01"
                : "00";
            },
            "%y": function (e) {
              return (e.I + 1900).toString().substring(2);
            },
            "%Y": function (e) {
              return e.I + 1900;
            },
            "%z": function (e) {
              var n = 0 <= (e = e.S);
              return (
                (e = Math.abs(e) / 60),
                (n ? "+" : "-") +
                  String("0000" + ((e / 60) * 100 + (e % 60))).slice(-4)
              );
            },
            "%Z": function (e) {
              return e.V;
            },
            "%%": function () {
              return "%";
            },
          };
        for (c in ((t = t.replace(/%%/g, "\0\0")), l))
          t.includes(c) && (t = t.replace(new RegExp(c, "g"), l[c](r)));
        return (
          (t = t.replace(/\0\0/g, "%")),
          (f = t),
          (p = Array(G(f) + 1)),
          z(f, p, 0, p.length),
          (c = p).length > n ? 0 : (y.set(c, e), c.length - 1)
        );
      }
      function x(e) {
        try {
          e();
        } catch (e) {
          C(e);
        }
      }
      var F = 0,
        E = null,
        O = [],
        ye = {},
        he = {},
        ge = 0,
        ve = null,
        we = [];
      function _e(t) {
        var e,
          r = {};
        for (e in t)
          !(function (e) {
            var n = t[e];
            r[e] =
              "function" == typeof n
                ? function () {
                    O.push(e);
                    try {
                      return n.apply(null, arguments);
                    } finally {
                      v ||
                        (O.pop() !== e && C(void 0),
                        E &&
                          1 === F &&
                          0 === O.length &&
                          ((F = 0),
                          x(f._asyncify_stop_unwind),
                          "undefined" != typeof Fibers) &&
                          Fibers.$());
                    }
                  }
                : n;
          })(e);
        return r;
      }
      function be(e) {
        var o, i, n, t;
        v ||
          (0 === F
            ? ((i = o = !1),
              e(() => {
                if (!v && ((o = !0), i)) {
                  (F = 2),
                    x(() => f._asyncify_start_rewind(E)),
                    "undefined" != typeof Browser &&
                      Browser.P.R &&
                      Browser.P.resume();
                  var n = !1;
                  try {
                    var t = (0, f.asm[he[g[(E + 8) >> 2]]])();
                  } catch (e) {
                    (t = e), (n = !0);
                  }
                  var e,
                    r = !1;
                  if (
                    (E ||
                      ((e = ve) &&
                        ((ve = null), (n ? e.reject : e.resolve)(t), (r = !0))),
                    n && !r)
                  )
                    throw t;
                }
              }),
              (i = !0),
              o ||
                ((F = 1),
                (e = Ae(10485772)),
                (n = e + 12),
                (g[e >> 2] = n),
                (g[(e + 4) >> 2] = n + 10485760),
                (n = O[0]),
                void 0 === (t = ye[n]) &&
                  ((t = ge++), (ye[n] = t), (he[t] = n)),
                (g[(e + 8) >> 2] = t),
                (E = e),
                x(() => f._asyncify_start_unwind(E)),
                "undefined" != typeof Browser &&
                  Browser.P.R &&
                  Browser.P.pause()))
            : 2 === F
            ? ((F = 0),
              x(f._asyncify_stop_rewind),
              Ce(E),
              (E = null),
              we.forEach((e) => se(e)))
            : C("invalid state: " + F));
      }
      var P,
        Se = {
          c: function () {
            return 0;
          },
          j: function () {},
          f: function () {
            return 0;
          },
          g: function () {},
          a: function () {
            C("");
          },
          h: function (e, n) {
            if (0 === e) e = Date.now();
            else {
              if (1 !== e && 4 !== e) return (g[De() >> 2] = 28), -1;
              e = le();
            }
            return (
              (g[n >> 2] = (e / 1e3) | 0),
              (g[(n + 4) >> 2] = ((e % 1e3) * 1e6) | 0),
              0
            );
          },
          i: function (e, n, t) {
            h.copyWithin(e, n, n + t);
          },
          b: function (e) {
            var n = h.length;
            if (!(2147483648 < (e >>>= 0)))
              for (var t = 1; t <= 4; t *= 2) {
                var r = n * (1 + 0.2 / t),
                  r = Math.min(r, e + 100663296),
                  o = Math;
                (r = Math.max(e, r)),
                  (o = o.min.call(
                    o,
                    2147483648,
                    r + ((65536 - (r % 65536)) % 65536)
                  ));
                e: {
                  try {
                    W.grow((o - B.byteLength + 65535) >>> 16), V();
                    var i = 1;
                    break e;
                  } catch (e) {}
                  i = void 0;
                }
                if (i) return !0;
              }
            return !1;
          },
          k: function (t) {
            be((e) => {
              return (
                (n = e),
                setTimeout(function () {
                  se(n);
                }, t)
              );
              var n;
            });
          },
          n: function (r, o) {
            var i = 0;
            return (
              pe().forEach(function (e, n) {
                var t = o + i;
                for (n = g[(r + 4 * n) >> 2] = t, t = 0; t < e.length; ++t)
                  y[n++ >> 0] = e.charCodeAt(t);
                (y[n >> 0] = 0), (i += e.length + 1);
              }),
              0
            );
          },
          o: function (e, n) {
            var t = pe(),
              r = ((g[e >> 2] = t.length), 0);
            return (
              t.forEach(function (e) {
                r += e.length + 1;
              }),
              (g[n >> 2] = r),
              0
            );
          },
          e: function (e) {
            Ee(e);
          },
          d: function () {
            return 0;
          },
          q: function (e, n, t, r) {
            return (e = ue.X(e)), (n = ue.W(e, n, t)), (g[r >> 2] = n), 0;
          },
          l: function () {},
          p: function (e, n, t, r) {
            for (var o = 0, i = 0; i < t; i++) {
              var a = g[n >> 2],
                u = g[(n + 4) >> 2];
              n += 8;
              for (var s = 0; s < u; s++) {
                var c = h[a + s],
                  l = ae[e];
                0 === c || 10 === c
                  ? ((1 === e ? L : d)(J(l, 0)), (l.length = 0))
                  : l.push(c);
              }
              o += u;
            }
            return (g[r >> 2] = o), 0;
          },
          m: me,
        },
        Ce =
          (!(function () {
            function n(e) {
              (e = _e((e = e.exports))),
                (f.asm = e),
                (W = f.asm.r),
                V(),
                $.unshift(f.asm.s),
                b--,
                f.monitorRunDependencies && f.monitorRunDependencies(b),
                0 == b &&
                  (null !== te && (clearInterval(te), (te = null)), S) &&
                  ((e = S), (S = null), e());
            }
            function t(e) {
              n(e.instance);
            }
            function r(e) {
              return (
                a || (!k && !l) || "function" != typeof fetch
                  ? Promise.resolve().then(oe)
                  : fetch(w, { credentials: "same-origin" })
                      .then(function (e) {
                        if (e.ok) return e.arrayBuffer();
                        throw "failed to load wasm binary file at '" + w + "'";
                      })
                      .catch(oe)
              )
                .then(function (e) {
                  return WebAssembly.instantiate(e, o);
                })
                .then(function (e) {
                  return e;
                })
                .then(e, function (e) {
                  d("failed to asynchronously prepare wasm: " + e), C(e);
                });
            }
            var o = { a: Se };
            if (
              (b++,
              f.monitorRunDependencies && f.monitorRunDependencies(b),
              f.instantiateWasm)
            )
              try {
                var e = f.instantiateWasm(o, n);
                return _e(e);
              } catch (e) {
                return d(
                  "Module.instantiateWasm callback failed with error: " + e
                );
              }
            (a ||
            "function" != typeof WebAssembly.instantiateStreaming ||
            re() ||
            "function" != typeof fetch
              ? r(t)
              : fetch(w, { credentials: "same-origin" }).then(function (e) {
                  return WebAssembly.instantiateStreaming(e, o).then(
                    t,
                    function (e) {
                      return (
                        d("wasm streaming compile failed: " + e),
                        d("falling back to ArrayBuffer instantiation"),
                        r(t)
                      );
                    }
                  );
                })
            ).catch(i);
          })(),
          (f.___wasm_call_ctors = function () {
            return (f.___wasm_call_ctors = f.asm.s).apply(null, arguments);
          }),
          (f._main = function () {
            return (f._main = f.asm.t).apply(null, arguments);
          }),
          (f._command = function () {
            return (f._command = f.asm.u).apply(null, arguments);
          }),
          (f._free = function () {
            return (Ce = f._free = f.asm.v).apply(null, arguments);
          })),
        De = (f.___errno_location = function () {
          return (De = f.___errno_location = f.asm.w).apply(null, arguments);
        }),
        Ae = (f._malloc = function () {
          return (Ae = f._malloc = f.asm.x).apply(null, arguments);
        }),
        Ie = (f.stackSave = function () {
          return (Ie = f.stackSave = f.asm.z).apply(null, arguments);
        }),
        Re = (f.stackRestore = function () {
          return (Re = f.stackRestore = f.asm.A).apply(null, arguments);
        }),
        Y = (f.stackAlloc = function () {
          return (Y = f.stackAlloc = f.asm.B).apply(null, arguments);
        }),
        Me = (f.dynCall_vi = function () {
          return (Me = f.dynCall_vi = f.asm.C).apply(null, arguments);
        }),
        xe = (f.dynCall_v = function () {
          return (xe = f.dynCall_v = f.asm.D).apply(null, arguments);
        });
      function j(e) {
        (this.name = "ExitStatus"),
          (this.message = "Program terminated with exit(" + e + ")"),
          (this.status = e);
      }
      function Fe(i) {
        function e() {
          if (!P && ((P = !0), (f.calledRun = !0), !v)) {
            if (
              (D($),
              D(Q),
              T(f),
              f.onRuntimeInitialized && f.onRuntimeInitialized(),
              Oe)
            ) {
              var e = i,
                n = f._main,
                t = (e = e || []).length + 1,
                r = Y(4 * (t + 1));
              g[r >> 2] = K(s);
              for (var o = 1; o < t; o++) g[(r >> 2) + o] = K(e[o - 1]);
              g[(r >> 2) + t] = 0;
              try {
                Ee(n(t, r));
              } catch (e) {
                ie(e);
              }
            }
            if (f.postRun)
              for (
                "function" == typeof f.postRun && (f.postRun = [f.postRun]);
                f.postRun.length;

              )
                (e = f.postRun.shift()), ee.unshift(e);
            D(ee);
          }
        }
        if (((i = i || u), !(0 < b))) {
          if (f.preRun)
            for (
              "function" == typeof f.preRun && (f.preRun = [f.preRun]);
              f.preRun.length;

            )
              (n = void 0), (n = f.preRun.shift()), Z.unshift(n);
          D(Z),
            0 < b ||
              (f.setStatus
                ? (f.setStatus("Running..."),
                  setTimeout(function () {
                    setTimeout(function () {
                      f.setStatus("");
                    }, 1),
                      e();
                  }, 1))
                : e());
        }
        var n;
      }
      function Ee(e) {
        m || 0 < _ || (ne = !0),
          m || 0 < _ || (f.onExit && f.onExit(e), (v = !0)),
          c(e, new j(e));
      }
      if (
        ((f._asyncify_start_unwind = function () {
          return (f._asyncify_start_unwind = f.asm.E).apply(null, arguments);
        }),
        (f._asyncify_stop_unwind = function () {
          return (f._asyncify_stop_unwind = f.asm.F).apply(null, arguments);
        }),
        (f._asyncify_start_rewind = function () {
          return (f._asyncify_start_rewind = f.asm.G).apply(null, arguments);
        }),
        (f._asyncify_stop_rewind = function () {
          return (f._asyncify_stop_rewind = f.asm.H).apply(null, arguments);
        }),
        (f.ccall = function (e, n, t, r, o) {
          function i(e) {
            return (
              --_,
              0 !== s && Re(s),
              "string" === n ? X(e) : "boolean" === n ? !!e : e
            );
          }
          var a = {
              string: function (e) {
                var n,
                  t = 0;
                return (
                  null != e &&
                    0 !== e &&
                    ((n = 1 + (e.length << 2)), (t = Y(n)), z(e, h, t, n)),
                  t
                );
              },
              array: function (e) {
                var n = Y(e.length);
                return y.set(e, n), n;
              },
            },
            u = ((e = f["_" + e]), []),
            s = 0;
          if (r)
            for (var c = 0; c < r.length; c++) {
              var l = a[t[c]];
              l ? (0 === s && (s = Ie()), (u[c] = l(r[c]))) : (u[c] = r[c]);
            }
          return (
            (t = E),
            (r = e.apply(null, u)),
            (_ += 1),
            (o = o && o.async),
            E != t
              ? new Promise((e, n) => {
                  ve = { resolve: e, reject: n };
                }).then(i)
              : ((r = i(r)), o ? Promise.resolve(r) : r)
          );
        }),
        (S = function e() {
          P || Fe(), P || (S = e);
        }),
        (f.run = Fe),
        f.preInit)
      )
        for (
          "function" == typeof f.preInit && (f.preInit = [f.preInit]);
          0 < f.preInit.length;

        )
          f.preInit.pop()();
      var Oe = !0;
      return f.noInitialRun && (Oe = !1), Fe(), e.ready;
    }
    var Pe;
    (Pe =
      "undefined" != typeof document && document.currentScript
        ? document.currentScript.src
        : void 0),
      "undefined" != typeof __filename && (Pe = Pe || __filename);
    return (
      "object" == typeof exports && "object" == typeof module
        ? (module.exports = e)
        : "function" == typeof define && define.amd
        ? define([], function () {
            return e;
          })
        : "object" == typeof exports && (exports.Stockfish = e),
      e
    );
  }
  function n(t) {
    var e,
      r = 0,
      o = [],
      n = a.slice(1 + ((a.lastIndexOf(".") - 1) >>> 0)),
      i = a.slice(0, -n.length);
    // Patch: Use chrome.runtime.getURL for each part if in extension
    var isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL;
    for (e = 0; e < t; ++e) {
      var wasmUrl = isExtension
        ? chrome.runtime.getURL(i + "-part-" + e + n)
        : i + "-part-" + e + n;
      !(function (wasmUrl, n) {
        fetch(new Request(wasmUrl))
          .then(function (e) {
            return e.blob();
          })
          .then(function (e) {
            n(e);
          });
      })(wasmUrl, (function (n) {
        return function (e) {
          ++r,
            (o[n] = e),
            r === t && ((e = URL.createObjectURL(new Blob(o))), u(e));
        };
      })(e));
    }
  }
})(
  (function () {
    return (function (e) {
      function t(r) {
        if (n[r]) return n[r].exports;
        var o = (n[r] = { exports: {} });
        return e[r](o, o.exports, t), o.exports;
      }
      var n = {};
      return t.m = e, t(0);
    })(
      {
        0: function (e, t, n) {
          "use strict";
          n.r(t),
            n.d(t, {
              _free: function () {
                return Ce;
              },
              _main: function () {
                return Fe;
              },
              _malloc: function () {
                return Ae;
              },
              _stockfish: function () {
                return j;
              },
              ccall: function () {
                return f.ccall;
              },
              setStatus: function () {
                return f.setStatus;
              },
              run: function () {
                return f.run;
              },
              onRuntimeInitialized: function () {
                return f.onRuntimeInitialized;
              },
              terminate: function () {
                return f.terminate;
              },
              preloadedImages: function () {
                return f.preloadedImages;
              },
              preloadedAudios: function () {
                return f.preloadedAudios;
              },
            }),
            n(
              (function () {
                var e = document.createElement("script");
                return (
                  (e.src =
                    "data:application/javascript;base64," +
                    "Ly8gU3RvY2tmaXNoIC4uLg=="),
                  document.head.appendChild(e),
                  e
                );
              })()
            );
        },
      }
    );
  })()
);
