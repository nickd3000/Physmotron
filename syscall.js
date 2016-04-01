// syscall.js

var SYS_LOGBYTE = 1;
var SYS_LOGWORD = 2;
var SYS_LOGCHAR = 3;
var SYS_SETPIXEL = 4;


function sysCall(id)
{
	//console.log("SYSCALL ID: "+id);
	switch(id) {
		case SYS_LOGBYTE: console.log(popByte()); break;
		case SYS_LOGWORD: console.log(popWord()); break;
		case SYS_LOGCHAR: console.log(String.fromCharCode(popByte())); break;
		case SYS_SETPIXEL:
			var c=popByte(), y=popByte(), x=popByte();
			mem[1024+x+(y*256)]=c;
			break;
	}
}
