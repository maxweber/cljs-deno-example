var global = globalThis;

var goog = global.goog;

var SHADOW_IMPORTED = global.SHADOW_IMPORTED = {};
import * as PATH from "https://deno.land/std@0.201.0/path/mod.ts";
import * as VM from "https://deno.land/std@0.140.0/node/vm.ts";

var SHADOW_PROVIDE = function(name) {
  return goog.exportPath_(name, undefined);
};

var SHADOW_REQUIRE = function(name) {
  if (goog.isInModuleLoader_()) {
    return goog.module.getInternal_(name);
  }
  return true;
};

var SHADOW_WRAP = function(js) {
  var code = "(function (require, module, __filename, __dirname) {\n";
  // this is part of goog/base.js and for some reason the only global var not on goog or goog.global
    code += "var COMPILED = false;\n"
  code += js;
  code += "\n});";
  return code;
};

var SHADOW_IMPORT_PATH = "./public/js/cljs-runtime"

var SHADOW_IMPORT = global.SHADOW_IMPORT = async function(src) {
  if (CLOSURE_DEFINES["shadow.debug"]) {
    console.info("SHADOW load:", src);
  }

  SHADOW_IMPORTED[src] = true;

  // SHADOW_IMPORT_PATH is an absolute path
  var filePath = PATH.resolve(SHADOW_IMPORT_PATH, src);
  var fn;

  try {
    // see: https://medium.com/deno-the-complete-reference/dynamic-imports-in-deno-5e9eb7f66238
    fn = await import(filePath);
  } catch(e) {
    console.log('=== '+e.message);
  }

  return true;
};

// strip a leading comment as generated for (defn x "foo" [a] a)
// /**
//  * foo
//  */
// (function (){

function SHADOW_STRIP_COMMENT(js) {
  if (!js.startsWith("/*")) {
    return js;
  } else {
    return js.substring(js.indexOf("*/") + 2).trimLeft();
  }
};

global.SHADOW_NODE_EVAL = function(js, smJson) {
  // special case handling for require since it may otherwise not be available
  // FIXME: source maps get destroyed by the strip
  js = "(function cljsEval(require) {\n return " + SHADOW_STRIP_COMMENT(js) + "\n});";

  if (smJson) {
    js += "\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,";
    js += btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(smJson))));
  }

  var fn = VM.runInThisContext.call(global, js,
    {filename: "<eval>",
     lineOffset: -1, // wrapper adds one line on top
     displayErrors: true});

  return fn(null);
};
