// syscall.js

var SYS_LOGBYTE = 1;
var SYS_LOGWORD = 2;
var SYS_LOGCHAR = 3;
var SYS_SETPIXEL = 4;
var SYS_TEXT = 5; // b x,b y, w ptr


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
		case SYS_TEXT:
			var p=popWord(), y=popByte(), x=popByte();
			var pos=x+(y*32);
			while (1) {
				var c = mem[p++]|0;
				if (c===0) return;
				mem[hw_screenTextLocation+pos++]=c;
				//mem[hw_screenTextLocation]=65;
			}
		break;
	}
}
