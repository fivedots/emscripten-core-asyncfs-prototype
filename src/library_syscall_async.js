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
    handle: function(varargs, fn) {
      return Asyncify.handleSleep(function(wakeUp) {
        SYSCALLS.varargs = varargs;
        fn(wakeUp);
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
    console.log('__syscall3')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), buf = SYSCALLS.get(), count = SYSCALLS.get();
      AsyncFSImpl.read(fd, {{{ heapAndOffset('HEAP8', 'buf') }}}, count, wakeUp);
    });
  },

  __syscall4: function(which, varargs) { // write
    console.log('__syscall4')
    return AsyncFS.handle(varargs, function(wakeUp) {
      console.log('!!! syscall4 write')
      var fd = SYSCALLS.get(), buf = SYSCALLS.get(), count = SYSCALLS.get();
      AsyncFSImpl.write(fd, {{{ heapAndOffset('HEAP8', 'buf') }}}, count, wakeUp);
    });
  },

  __syscall5: function(which, varargs) { // open
    console.log('__syscall5')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var pathname = SYSCALLS.getStr(), flags = SYSCALLS.get(), mode = SYSCALLS.get(); // optional TODO
      AsyncFSImpl.open(pathname, flags, mode, wakeUp);
    });
  },

  __syscall10: function(which, varargs) { // unlink
    console.log('__syscall10')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var pathname = SYSCALLS.getStr();
      AsyncFSImpl.unlink(pathname, wakeUp);
    });
  },

  __syscall15: function(which, varargs) { // chmod
    console.log('__syscall15')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr(), mode = SYSCALLS.get();
      AsyncFSImpl.chmod(path, mode, wakeUp);
    });
  },

  //__syscall20__deps: ['$PROCINFO'],
  __syscall20: function(which, varargs) { // getpid
    console.log('__syscall20')
    return AsyncFS.handle(varargs, function(wakeUp) {
      ///wakeUp(PROCINFO.pid);
      wakeUp(1337);
    });
  },

  __syscall33: function(which, varargs) { // access
    console.log('__syscall33')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr(), amode = SYSCALLS.get();
      AsyncFSImpl.access(path, amode, wakeUp);
    });
  },

 __syscall39: function(which, varargs) { // mkdir
   console.log('__syscall39')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr(), mode = SYSCALLS.get();
      AsyncFSImpl.mkdir(path, mode, wakeUp);
    });
  },

  __syscall40: function(which, varargs) { // rmdir
    console.log('__syscall40')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr();
      AsyncFSImpl.rmdir(path, wakeUp);
    });
  },

  __syscall54: function(which, varargs) { // ioctl
    console.log('__syscall54')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), op = SYSCALLS.get();
      AsyncFSImpl.ioctl(fd, op, wakeUp);
    });
  },

  __syscall85: function(which, varargs) { // readlink
    console.log('__syscall85')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr(), buf = SYSCALLS.get(), bufsize = SYSCALLS.get();
      AsyncFSImpl.readlink(path, buf, bufsize, wakeUp);
    });
  },

  __syscall91: function(which, varargs) { // munmap
    console.log('__syscall91')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var addr = SYSCALLS.get(), len = SYSCALLS.get();
      AsyncFSImpl.munmap(addr, len, wakeUp);
    });
  },

  __syscall94: function(which, varargs) { // fchmod
    console.log('__syscall94')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), mode = SYSCALLS.get();
      AsyncFSImpl.fchmod(fd, mode, wakeUp);
    });
  },

  __syscall118: function(which, varargs) { // fsync
    console.log('__syscall118')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get();
      AsyncFSImpl.fsync(fd, wakeUp);
    });
  },

  __syscall183: function(which, varargs) { // getcwd
    console.log('__syscall183')
    return AsyncFS.handle(varargs, function(wakeUp) {
      console.log('!!! syscall183')
      var buf = SYSCALLS.get(), size = SYSCALLS.get();
      if (size === 0) {

        console.log('syscall183 einval')
        wakeUp(-{{{ cDefine('EINVAL') }}});
        return
      }
      //TODO consider removing fake result here
      var cwd = AsyncFSImpl.fakeCWD;
      var cwdLengthInBytes = lengthBytesUTF8(cwd);
      if (size < cwdLengthInBytes + 1) {
        console.log('syscall183 erange')
        wakeUp(-{{{ cDefine('ERANGE') }}});
        return
      }
      stringToUTF8(cwd, buf, size);
      wakeUp(0);
    });
  },

  __syscall191: function(which, varargs) { // ugetrlimit
    console.log('__syscall191')
    return AsyncFS.handle(varargs, function(wakeUp) {
#if SYSCALL_DEBUG
      err('warning: untested syscall');
#endif
      var resource = SYSCALLS.get(), rlim = SYSCALLS.get();
      {{{ makeSetValue('rlim', C_STRUCTS.rlimit.rlim_cur, '-1', 'i32') }}};  // RLIM_INFINITY
      {{{ makeSetValue('rlim', C_STRUCTS.rlimit.rlim_cur + 4, '-1', 'i32') }}};  // RLIM_INFINITY
      {{{ makeSetValue('rlim', C_STRUCTS.rlimit.rlim_max, '-1', 'i32') }}};  // RLIM_INFINITY
      {{{ makeSetValue('rlim', C_STRUCTS.rlimit.rlim_max + 4, '-1', 'i32') }}};  // RLIM_INFINITY
      wakeUp(0); // just report no limits
    });
  },

  __syscall192: function(which, varargs) { // mmap2
    console.log('__syscall192')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var addr = SYSCALLS.get(), len = SYSCALLS.get(), prot = SYSCALLS.get(), flags = SYSCALLS.get(), fd = SYSCALLS.get(), off = SYSCALLS.get();
      AsyncFSImpl.mmap2(addr, len, prot, flags, fd, off, wakeUp);
    });
  },

  __syscall194: function(which, varargs) { // ftruncate64
    console.log('__syscall194')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), zero = SYSCALLS.getZero(), length = SYSCALLS.get64();
      AsyncFSImpl.truncate(fd, length, wakeUp);
    });
  },

  //TODO: consider adding an async equivalent to SYSCALL.doStat
  __syscall195: function(which, varargs) { // stat64
    console.log('__syscall195')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr(), buf = SYSCALLS.get();
      AsyncFSImpl.stat(path, buf, wakeUp)
    });
  },


  // Since NativeIO doesn't have links, lstat behaves the same as stat
  __syscall196: '__syscall195', // lstat64

  __syscall197: function(which, varargs) { // fstat
    console.log('__syscall197')
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
    console.log('__syscall202')
    return AsyncFS.handle(varargs, function(wakeUp) {
      wakeUp(0);
    })
  },

  __syscall207: function(which, varargs) { // fchown32
    console.log('__syscall207')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), owner = SYSCALLS.get(), group = SYSCALLS.get();
      AsyncFSImpl.fchown(fd, owner, group, wakeUp);
    });
  },

  __syscall212: function(which, varargs) { // chown32
    console.log('__syscall212')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var path = SYSCALLS.getStr(), owner = SYSCALLS.get(), group = SYSCALLS.get();
      AsyncFSImpl.chown(path, owner, group, wakeUp);
    });
  },

  __syscall221: function(which, varargs) { // fcntl64
    console.log('__syscall221')
    return AsyncFS.handle(varargs, function(wakeUp) {
      var fd = SYSCALLS.get(), cmd = SYSCALLS.get();
      AsyncFSImpl.fcntl(fd, cmd, wakeUp);
    });
  },

  // WASI

  fd_write: function(fd, iov, iovcnt, pnum) {
    console.log('fd_write')
    return Asyncify.handleSleep(function(wakeUp) {
      console.log('!!! fd_write write')
      if(fd == 1 || fd==2) {
        //TODO: remove once AsyncFSImpl supports stdio
        // Hack to support printf when AsyncFSImpl does not support stdio
        var num = 0;
        var str = '';
        for (var i = 0; i < iovcnt; i++) {
          var ptr = {{{ makeGetValue('iov', 'i*8', 'i32') }}};
          var len = {{{ makeGetValue('iov', 'i*8 + 4', 'i32') }}};
          for (var j = 0; j < len; j++) {
              str += String.fromCharCode(HEAPU8[ptr+j]);
          }
          num += len;
        }
        console.log(str);
        {{{ makeSetValue('pnum', 0, 'num', 'i32') }}}
        wakeUp(0);
        return;
      }

      AsyncFSImpl.writev(fd, AsyncFS.getIovs(iov, iovcnt), function(result) {
        {{{ makeSetValue('pnum', 0, 'result', 'i32') }}}
        wakeUp(0);
      });
    });
  },

  fd_read: function(fd, iov, iovcnt, pnum) {
    console.log('fd_read')
    return Asyncify.handleSleep(function(wakeUp) {
      AsyncFSImpl.readv(fd, AsyncFS.getIovs(iov, iovcnt), function(result) {
        console.log('!!!! fd_read was called')
        {{{ makeSetValue('pnum', 0, 'result', 'i32') }}}
        wakeUp(0);
      });
    });
  },

  fd_seek: function(fd, offset_low, offset_high, whence, newOffset) {
    console.log('fd_seek')
    return Asyncify.handleSleep(function(wakeUp) {
      AsyncFSImpl.llseek(fd, offset_high, offset_low, whence, function(result) {
        {{{ makeSetValue('newOffset', 0, 'result', 'i32') }}}
        wakeUp(0);
      });
    });
  },

  fd_close: function(fd) {
    console.log('fd_close')
    return Asyncify.handleSleep(function(wakeUp) {
      AsyncFSImpl.close(fd, wakeUp);
    });
  },

  fd_fdstat_get: function(fd, pbuf) {
    console.log('fd_fdstat_get')
    return Asyncify.handleSleep(function(wakeUp) {
      console.log('WARNING called unimplemented fd_fdstat_get syscalls.');
      //var stream = SYSCALLS.getStreamFromFD(fd);
      //// All character devices are terminals (other things a Linux system would
      //// assume is a character device, like the mouse, we have special APIs for).
      //var type = stream.tty ? {{{ cDefine('__WASI_FILETYPE_CHARACTER_DEVICE') }}} :
      //           FS.isDir(stream.mode) ? {{{ cDefine('__WASI_FILETYPE_DIRECTORY') }}} :
      //           FS.isLink(stream.mode) ? {{{ cDefine('__WASI_FILETYPE_SYMBOLIC_LINK') }}} :
      //           {{{ cDefine('__WASI_FILETYPE_REGULAR_FILE') }}};
      //{{{ makeSetValue('pbuf', C_STRUCTS.__wasi_fdstat_t.fs_filetype, 'type', 'i8') }}};
      //// TODO {{{ makeSetValue('pbuf', C_STRUCTS.__wasi_fdstat_t.fs_flags, '?', 'i16') }}};
      //// TODO {{{ makeSetValue('pbuf', C_STRUCTS.__wasi_fdstat_t.fs_rights_base, '?', 'i64') }}};
      //// TODO {{{ makeSetValue('pbuf', C_STRUCTS.__wasi_fdstat_t.fs_rights_inheriting, '?', 'i64') }}};
      wakeUp(-1);
    });
  },

  fd_sync: function(fd) {
    console.log('fd_sync')
    return Asyncify.handleSleep(function(wakeUp) {
      AsyncFSImpl.fsync(fd, wakeUp);
    });
  },

  // TODO all other syscalls that make sense to add
};

autoAddDeps(SyscallsLibraryAsync, '$AsyncFS');

mergeInto(LibraryManager.library, SyscallsLibraryAsync);

assert(ASYNCIFY && WASM_BACKEND, "ASYNCFS requires ASYNCIFY with the wasm backend");

