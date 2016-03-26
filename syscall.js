// syscall.js

var SYS_LOGBYTE = 1;
var SYS_LOGWORD = 2;
var SYS_SETPIXEL = 3;


var sysCall = function (id)
{
	console.log("SYSCALL ID: "+id);
	switch(id) {
		case SYS_LOGBYTE: console.log(popByte()); break;
		case SYS_LOGWORD: console.log(popWord()); break;
		case SYS_SETPIXEL:
			var c=popByte();
			var y=popByte();
			var x=popByte();
			mem[1024+x+(y*256)]=c;
			break;
	}
};
