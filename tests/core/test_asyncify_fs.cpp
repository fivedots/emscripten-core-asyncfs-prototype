// Copyright 2019 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

#include <assert.h>
#include <stdio.h>
#include <stdlib.h>

#include <emscripten.h>

void log(const char* str) {
  EM_ASM({ console.log("log:", UTF8ToString($0)) }, str);
}

void error(const char* str) {
  log(str);
  exit(1);
}

int main() {
  EM_ASM({
    // A silly example of implementing AsyncFSImpl hooks. No real async
    // work is done here, just timeouts (which are enough to show this
    // works).
    AsyncFSImpl.open = function(pathname, flags, mode, wakeUp) {
      // Open should return a file descriptor. This code does not work, as C++
      // receives a 0 instead of a 1337
      setTimeout(function() {
        var fd = 1337;
        console.log('AsyncFSImpl.open fd: ' + fd);
        wakeUp(fd);
      }, 0);

      // Using a promise instead of a timeout results in the same error
      //
      //Promise.resolve(1337).then(fd => {
      //  console.log('AsyncFSImpl.open fd: ' + fd);
      //  wakeUp(fd);
      //});

      // Removing the timeout resolves the issue:
      //
      //var fd = 1337;
      //console.log('AsyncFSImpl.open fd: ' + fd);
      //wakeUp(fd);
    };
    AsyncFSImpl.ioctl = function(fd, op, wakeUp) {
      setTimeout(function() {
        wakeUp(0);
      }, 0);
    };
    AsyncFSImpl.readv = function(fd, iovs, wakeUp) {
      setTimeout(function() {
        var total = 0;
        var index = 0;
        iovs.forEach(function(iov) {
          for (var i = 0; i < iov.len; i++) {
            HEAPU8[iov.ptr + i] = index * index;
            index++;
          }
          total += iov.len;
        });
        wakeUp(total);
      }, 0);
    };
    AsyncFSImpl.llseek = function(fd, offset_high, offset_low, whence, wakeUp) {
      setTimeout(function() {
        wakeUp(0);
      }, 0);
    };
    AsyncFSImpl.close = function(fd, wakeUp) {
      // Test the case of an immediate synchronous call of the callback, to make
      // sure that works too.
      wakeUp(0);
    };
  });

  log("opening");
  FILE* f = fopen("does_not_matter", "r");
  if (!f) error("open error");
  int fd = fileno(f);
  EM_ASM({ console.log("log: open fileno", $0) }, fd);
  if (fd != 1337) error("open returned unexpected fileno");


  log("reading");
  const int N = 5;
  char buffer[N];
  int rv = fread(buffer, 1, N, f);
  if (rv != N) error("read error");

  log("checking");
  for (int i = 0; i < N; i++) {
    EM_ASM({ console.log("read:", $0, $1) }, i, buffer[i]);
    if (buffer[i] != i * i) error("data error");
  }

  log("closing");
  rv = fclose(f);
  if (rv) error("close error");

  log("ok.");

  return 0;
}

