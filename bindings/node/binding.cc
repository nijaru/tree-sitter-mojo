#include <napi.h>

typedef struct TSLanguage TSLanguage;

extern "C" TSLanguage *tree_sitter_mojo();

namespace {

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports["name"] = Napi::String::New(env, "mojo");
  auto language = Napi::External<TSLanguage>::New(env, tree_sitter_mojo());
  exports["language"] = language;
  return exports;
}

NODE_API_MODULE(tree_sitter_mojo_binding, Init)

}  // namespace