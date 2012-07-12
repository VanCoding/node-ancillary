#include <node.h>
#include <v8.h>

#include "./stream_wrap.h"

using namespace v8;
using namespace node;

Handle<Value> makeIPC(const Arguments& args) {
	HandleScope scope;
	
	StreamWrap* wrap = static_cast<StreamWrap*>(args[0]->ToObject()->GetPointerFromInternalField(0));
	((uv_pipe_t*)wrap->GetStream())->ipc = 1;
	
	return scope.Close(String::NewSymbol("done"));
}


void init(Handle<Object> target) {
  target->Set(String::NewSymbol("makeIPC"),FunctionTemplate::New(makeIPC)->GetFunction());
}
NODE_MODULE(ancillary, init)
