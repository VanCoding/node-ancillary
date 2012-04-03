#include <node.h>
#include <v8.h>
#include <iostream>

#include "tcp_wrap.h"
#include "fd_send.c"
#include "fd_recv.c"

using namespace v8;
using namespace node;

Handle<Value> GetFD(const Arguments& args) {
  HandleScope scope;
  TCPWrap* wrap = static_cast<TCPWrap*>(args[0]->ToObject()->GetPointerFromInternalField(0));

  StreamWrap* s = (StreamWrap*)wrap;
  return scope.Close(Number::New(s->GetStream()->fd));
}
Handle<Value> Send(const Arguments& args){
  HandleScope scope;
  return scope.Close(Number::New(ancil_send_fd((int)args[0]->ToNumber()->Value(),(int)args[1]->ToNumber()->Value())));
}
Handle<Value> Receive(const Arguments& args){
  HandleScope scope;
  int * fd = new int[1];
  fd[0] = -1;

  ancil_recv_fd((int)args[0]->ToNumber()->Value(),fd);
  return scope.Close(Number::New(fd[0]));
}

void init(Handle<Object> target) {
  target->Set(String::NewSymbol("GetFD"),FunctionTemplate::New(GetFD)->GetFunction());
  target->Set(String::NewSymbol("Send"),FunctionTemplate::New(Send)->GetFunction());
  target->Set(String::NewSymbol("Receive"),FunctionTemplate::New(Receive)->GetFunction());
}
NODE_MODULE(ancillary, init)