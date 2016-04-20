// syscall.js

var SYS_LOGBYTE = 1;
var SYS_LOGWORD = 2;
var SYS_LOGCHAR = 3;
var SYS_TEXT = 5; 			// bx,by,wptr

var SYS_SETPIXEL = 20;
var SYS_RGBTOPIXEL = 21;	// (bytes)r,g,b ->
var SYS_PIXELTORGB = 22; 	// byte -> (bytes)r,g,b

var SYS_MUL		= 30;
var SYS_DIV		= 31;
var SYS_SQRT	= 32;
var SYS_MIN		= 33;
var SYS_MAX		= 34;

var SYS_MEMSET	= 50;	// byte value, word start, word length
var SYS_MEMCPY	= 51;	// word src, word dest, word length
var SYS_MEMCPYI	= 52;	// word src, word dest, word length, byte ignore


function sysCall(id)
{
	//console.log("SYSCALL ID: "+id);
	var c,x,y,a,b,p,r,g; // Misc reusable variables.
	var start, length, val, src, dst;
	switch(id) {
		case SYS_LOGBYTE: console.log(popByte()); break;
		case SYS_LOGWORD: console.log(popWord()); break;
		case SYS_LOGCHAR: console.log(String.fromCharCode(popByte())); break;
		case SYS_SETPIXEL:
			c=popByte();
			y=popByte();
			x=popByte();
			mem[1024+x+(y*256)]=c;
			break;
		case SYS_TEXT:
			p=popWord();
			y=popByte();
			x=popByte();
			var pos=x+(y*32);
			while (1) {
				c = mem[p++]|0;
				if (c===0) return;
				mem[hw_screenTextLocation+pos++]=c;
				//mem[hw_screenTextLocation]=65;
			}
		break;
		case SYS_MUL:
			a=popWord();
			b=popWord();
			pushWord((b*a)|0);
			break;
		case SYS_DIV:
			a=popWord();
			b=popWord();
			pushWord((b/a)|0);
			break;
		case SYS_RGBTOPIXEL:
			r=popByte();
			g=popByte();
			b=popByte();
			p=((r>>6)&3)+(((g>>5)&7)<<2)+(((b>>5)&7)<<5);
			pushByte(p&0xff);
		break;
		case SYS_PIXELTORGB:
		break;
		case SYS_MEMSET: // byte value, word start, word length
			val = popByte();
			start = popWord();
			length = popWord();
			for (a=start;a<start+length;a++) mem[a]=val;
		break;
		case SYS_MEMCPY: // word src, word dest, word length
			src = popWord();
			dst = popWord();
			length = popWord();
			for (a=0;a<length;a++) {
				 mem[dst+a]=mem[src+a];
			}
		break;
		case SYS_MEMCPYI: // word src, word dest, word length, byte ignore
			src = popWord();
			dst = popWord();
			length = popWord();
			g = popByte();	// value to ignore.
			for (a=0;a<length;a++) {
				if (mem[src+a]!=g)
				 mem[dst+a]=mem[src+a];
			}	 
		break;
	}
}
