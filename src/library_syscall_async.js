// Copyright 2019 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// See settings.js for more details.

var SyscallsLibraryAsync = {
  // This should be implemented with the proper callbacks.
  $AsyncFSImpl: {},

  $AsyncFS__deps: ['$SYSCALLS', '$Asyncify', '$AsyncFSImpl'],
  $AsyncFS: {
    handle: function(varargs, handle) {
      return Asyncify.handleSleep(function(wakeUp) {
        SYSCALLS.varargs = varargs;
        handle(wakeUp);
      });
    },

    getIovs: function(iov, iovcnt) {
      var iovs = [];
      for (var i = 0; i < iovcnt; i++) {
        var ptr = {{{ makeGetValue('iov', 'i*8', 'i32') }}};
        var len = {{{ makeGetValue('iov', 'i*8 + 4', 'i32') }}};
        iovs.push({ ptr: ptr, len: len });
      }
      return iovs;
    },
  },

  __syscall3: function(which, varargs) { // read
    return AsyncFS.handle(varargs, function(wakeUp) {
      var stream = SYSCALLS.getStreamFromFD(), buf = SYSCALLS.get(), count = SYSCALLS.get();
      AsyncFSImpl.read(stream, {{{ heapAndOffset('HEAP8', 'buf') }}}, count, wakeUp);
    });
  },

  __syscall4: function(which, varargs) { // write
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), buf = SYSCALLS.get(), count = SYSCALLS.get();
      AsyncFSImpl.write(fd, {{{ heapAndOffset('HEAP8', 'buf') }}}, count, wakeUp);
    });
  },

  __syscall5: function(which, varargs) { // open
    return AsyncFS.handle(varargs, function(wakeUp) {
      var pathname = SYSCALLS.getStr(), flags = SYSCALLS.get(), mode = SYSCALLS.get(); // optional TODO
      AsyncFSImpl.open(pathname, flags, mode, wakeUp);
    });
  },

  __syscall10: function(which, varargs) { // unlink
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr();
      AsyncFSImpl.unlink(path, wakeUp);
    });
  },

  __syscall15: function(which, varargs) { // chmod
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr(), mode = SYSCALLS.get();
      AsyncFSImpl.chmod(path, mode, wakeUp);
    });
  },

  __syscall20__deps: ['$PROCINFO'],
  __syscall20: function(which, varargs) { // getpid
    return PROCINFO.pid;
  },

  __syscall33: function(which, varargs) { // access
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr(), amode = SYSCALLS.get();
      AsyncFSImpl.access(path, amode, wakeUp);
    });
  },

 __syscall39: function(which, varargs) { // mkdir
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr(), mode = SYSCALLS.get();
      AsyncFSImpl.mkdir(path, mode, wakeUp);
    });
  },

  __syscall40: function(which, varargs) { // rmdir
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr();
      AsyncFSImpl.rmdir(path, wakeUp);
    });
  },

  __syscall54: function(which, varargs) { // ioctl
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), op = SYSCALLS.get();
      AsyncFSImpl.ioctl(fd, op, wakeUp);
    });
  },

  __syscall85: function(which, varargs) { // readlink
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr(), buf = SYSCALLS.get(), bufsize = SYSCALLS.get();
      AsyncFSImpl.readlink(path, buf, bufsize, wakeUp);
    });
  },

  __syscall91: function(which, varargs) { // munmap
    return AsyncFS.handle(varargs, function(wakeUp) {
      var addr = SYSCALLS.get(), len = SYSCALLS.get();
      AsyncFSImpl.munmap(addr, len, wakeUp);
    });
  },

  __syscall94: function(which, varargs) { // fchmod
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), mode = SYSCALLS.get();
      AsyncFSImpl.fchmod(fd, mode, wakeUp);
    });
  },

  __syscall118: function(which, varargs) { // fsync
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get();
      AsyncFSImpl.fsync(fd, wakeUp);
    });
  },

  __syscall183: function(which, varargs) { // getcwd
    return AsyncFS.handle(varargs, function(wakeUp) {
      var buf = SYSCALLS.get(), size = SYSCALLS.get();
      if (size === 0) return -{{{ cDefine('EINVAL') }}};
      //TODO consider removing fake result here
      var cwd = '/async-syscall-fake-dir';
      var cwdLengthInBytes = lengthBytesUTF8(cwd);
      if (size < cwdLengthInBytes + 1) return -{{{ cDefine('ERANGE') }}};
      stringToUTF8(cwd, buf, size);
      return buf;
    });
  },

  __syscall191: function(which, varargs) { // ugetrlimit
    return AsyncFS.handle(varargs, function(wakeUp) {
#if SYSCALL_DEBUG
      err('warning: untested syscall');
#endif
      var resource = SYSCALLS.get(), rlim = SYSCALLS.get();
      {{{ makeSetValue('rlim', C_STRUCTS.rlimit.rlim_cur, '-1', 'i32') }}};  // RLIM_INFINITY
      {{{ makeSetValue('rlim', C_STRUCTS.rlimit.rlim_cur + 4, '-1', 'i32') }}};  // RLIM_INFINITY
      {{{ makeSetValue('rlim', C_STRUCTS.rlimit.rlim_max, '-1', 'i32') }}};  // RLIM_INFINITY
      {{{ makeSetValue('rlim', C_STRUCTS.rlimit.rlim_max + 4, '-1', 'i32') }}};  // RLIM_INFINITY
      return 0; // just report no limits
    });
  },

  __syscall192: function(which, varargs) { // mmap2
    return AsyncFS.handle(varargs, function(wakeUp) {
      var addr = SYSCALLS.get(), len = SYSCALLS.get(), prot = SYSCALLS.get(), flags = SYSCALLS.get(), fd = SYSCALLS.get(), off = SYSCALLS.get();
      AsyncFSImpl.mmap(addr, len, prot, flags, fd, off, wakeUp);
    });
  },

  __syscall194: function(which, varargs) { // ftruncate64
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), zero = SYSCALLS.getZero(), length = SYSCALLS.get64();
      AsyncFSImpl.truncate(fd, length, wakeUp);
    });
  },

  //TODO: consider adding an async equivalent to SYSCALL.doStat
  __syscall195: function(which, varargs) { // stat64
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr(), buf = SYSCALLS.get();
      callback = function(arg) {
        console.log('!!! syscall195: ' + arg);
        wakeUp(arg)
      }
      AsyncFSImpl.stat(path, buf, callback)
    });
  },


  // Since NativeIO doesn't have links, lstat behaves the same as stat
  __syscall196: '__syscall195', // lstat64

  __syscall197: function(which, varargs) { // fstat
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), buf = SYSCALLS.get();
      AsyncFSImpl.fstat(fd, buf, wakeUp);
    });
  },

  __syscall199__sig: 'iii',
  __syscall199: '__syscall202',     // getuid32
  __syscall200__sig: 'iii',
  __syscall200: '__syscall202',     // getgid32
  __syscall201__sig: 'iii',
  __syscall201: '__syscall202',     // geteuid32
  __syscall202: function(which, varargs) { // getgid32
    return 0;
  },

  __syscall207: function(which, varargs) { // fchown32
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), owner = SYSCALLS.get(), group = SYSCALLS.get();
      AsyncFSImpl.fchown(fd, owner, group, wakeUp);
    });
  },

  __syscall212: function(which, varargs) { // chown32
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr(), owner = SYSCALLS.get(), group = SYSCALLS.get();
      AsyncFSImpl.chown(path, owner, group, wakeUp);
    });
  },

  __syscall221: function(which, varargs) { // fcntl64
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), cmd = SYSCALLS.get();
      AsyncFSImpl.fcntl(fd, cmd, wakeUp);
    });
  },

  // WASI

  fd_write: function(fd, iov, iovcnt, pnum) {
    return Asyncify.handleSleep(function(wakeUp) {
      AsyncFSImpl.writev(fd, AsyncFS.getIovs(iov, iovcnt), function(result) {
        {{{ makeSetValue('pnum', 0, 'result', 'i32') }}}
        wakeUp(0);
      });
    });
  },

  fd_read: function(fd, iov, iovcnt, pnum) {
    return Asyncify.handleSleep(function(wakeUp) {
      AsyncFSImpl.readv(fd, AsyncFS.getIovs(iov, iovcnt), function(result) {
        {{{ makeSetValue('pnum', 0, 'result', 'i32') }}}
        wakeUp(0);
      });
    });
  },

  fd_seek: function(fd, offset_low, offset_high, whence, newOffset) {
    return Asyncify.handleSleep(function(wakeUp) {
      AsyncFSImpl.llseek(fd, offset_high, offset_low, whence, function(result) {
        {{{ makeSetValue('newOffset', 0, 'result', 'i32') }}}
        wakeUp(0);
      });
    });
  },

  fd_close: function(fd) {
    return Asyncify.handleSleep(function(wakeUp) {
      AsyncFSImpl.close(fd, wakeUp);
    });
  },

  fd_fdstat_get: function(fd, pbuf) {
    return Asyncify.handleSleep(function(wakeUp) {
      var stream = SYSCALLS.getStreamFromFD(fd);
      // All character devices are terminals (other things a Linux system would
      // assume is a character device, like the mouse, we have special APIs for).
      var type = stream.tty ? {{{ cDefine('__WASI_FILETYPE_CHARACTER_DEVICE') }}} :
                 FS.isDir(stream.mode) ? {{{ cDefine('__WASI_FILETYPE_DIRECTORY') }}} :
                 FS.isLink(stream.mode) ? {{{ cDefine('__WASI_FILETYPE_SYMBOLIC_LINK') }}} :
                 {{{ cDefine('__WASI_FILETYPE_REGULAR_FILE') }}};
      {{{ makeSetValue('pbuf', C_STRUCTS.__wasi_fdstat_t.fs_filetype, 'type', 'i8') }}};
      // TODO {{{ makeSetValue('pbuf', C_STRUCTS.__wasi_fdstat_t.fs_flags, '?', 'i16') }}};
      // TODO {{{ makeSetValue('pbuf', C_STRUCTS.__wasi_fdstat_t.fs_rights_base, '?', 'i64') }}};
      // TODO {{{ makeSetValue('pbuf', C_STRUCTS.__wasi_fdstat_t.fs_rights_inheriting, '?', 'i64') }}};
      wakeUp(0);
    });
  },

  fd_sync: function(fd) {
    return Asyncify.handleSleep(function(wakeUp) {
      //TODO: does fd_sync make sense for ASYNCFS?
      wakeUp(0);
    });
  },

  // TODO all other syscalls that make sense to add
};

autoAddDeps(SyscallsLibraryAsync, '$AsyncFS');

mergeInto(LibraryManager.library, SyscallsLibraryAsync);

assert(ASYNCIFY && WASM_BACKEND, "ASYNCFS requires ASYNCIFY with the wasm backend");

