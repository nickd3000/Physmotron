// tvm.js
// Hardware memory.

// TODO: move machine variables to a machine structure.
var memSize = 1024*1024; // 1048576
var mem = new Uint8Array(memSize);
// Registers
var hw_regs = [0,0,0,0,0,0,0,0,0,0,0];
//var hw_r1 = 0;
//var hw_r2 = 0;
//var hw_r3 = 0;
var hw_pc = 0;
var hw_stackTop = 1280; // size = 0xff;
var hw_sp = hw_stackTop;
var hw_flags = 0;

// screen
var hw_screenMode = 1024;
var hw_colBG = 1025;
var hw_scanLine = 1026;
var hw_cursorX = 1027;		// Text cursor x
var hw_cursorY = 1028;		// text cursor y
var hw_screenOffset = 1029;	// Word pointer to display pixels.
// input
var hw_mouseX = 1088;		// Text cursor x
var hw_mouseY = 1089;		// text cursor y
var hw_joyUp = 1090;		// text cursor y
var hw_joyDown = 1091;		// text cursor y
var hw_joyLeft = 1092;		// text cursor y
var hw_joyRight = 1093;		// text cursor y
var hw_joyB1 = 1094;		// text cursor y
var hw_joyB2 = 1095;		// text cursor y


var hw_fontLocation = 0x600; // 1536   320b
var hw_fontSize = 1024; // 128*8=

var hw_screenTextLocation = 0xA00; // 1024
var hw_screenTextSize = 1024;

var hw_screenPixelLocation = 0x1000; // 4096
var hw_screenPixelSize = 65536; // 0xffff
var hw_screenPixelLocationEnd = 0x10fff;

var hw_programDataStart = 0x11000; // 69632


var fpsLastLoop = new Date();
var fpsCount = 0;

// Bit indexes into the flags register.
var sign_flag = 1<<0;
var zero_flag = 1<<1;
var break_flag = 1<<2;
var carry_flag = 1<<3;

var stopAnimation = false;
var steppingMode = false;

// Load bytecode from an int array to a memory location.
function loadBytecode(bc, addr) {
	//console.log("BC: "+bc);
	for (var i=0;i<bc.length;i++) {
		mem[i+addr] = bc[i]|0;
		//console.log("Load:"+bc[i]);
	}
}

function resetMachine() {
	for (var m=0;m<memSize;m++) mem[m]=0|0;
	for (var n=0;n<hw_regs.length;n++) hw_regs[n]=0|0;
	_loadFont(hw_fontLocation);

	hw_pc = hw_programDataStart;
	hw_stackTop = memSize-0xff;
	hw_sp = hw_stackTop;
	hw_flags = 0;
	storeWord(hw_screenOffset, hw_screenPixelLocation);

	// Setup some debug values in memory locations.
	//storeByte(50,123);
	//storeWord(60,1024);
}

function main() {
	"use strict";

	//timeFunction();
	//if (1==1) return;

	resetMachine();

	mem[hw_screenTextLocation]=78;
	mem[hw_screenTextLocation+1]=105;
	mem[hw_screenTextLocation+2]=99;
	mem[hw_screenTextLocation+3]=107;
	for (var n=hw_screenTextLocation;n<hw_screenTextLocation+250;n++) mem[n]=32+(n%128);

	var runWithDisplay = true;


	loadBytecode(compile(getSampleAssemblerCode(11)),hw_programDataStart);


	// Debug mode.
	if (runWithDisplay===false) {
		for (var i=0;i<2500;i++) {
			//displayRegisters();
			tick();
		}
		displayRegisters();
		dumpMemory();
	}

	// Full run with display.
	if (runWithDisplay===true) {
		initDisplay();
		redrawScreen();

		// Start the machine running.
		requestAnimationFrame(draw);
	}

}

// Debug function for testing intensive function times.
function timeFunction()
{
	//var fpsThisLoop = new Date();
	//var fps = 1000 / (fpsThisLoop - fpsLastLoop);
	var startTime = new Date();
	for (var i=0;i<1000000;i++)
	{
		for (var j=0;j<100;j++)
		{
			decodeOperator(i&0xff);
		}
	}
	var endTime = new Date();
	console.log("FUNCTION TIMER: " + (endTime-startTime)/1000.0 + " seconds.");
}

function draw() {

	var fpsThisLoop = new Date();
	var fps = 1000 / (fpsThisLoop - fpsLastLoop);
	fpsLastLoop = fpsThisLoop;
	fpsCount++;
	if (fpsCount>30) {
		fpsCount=0;
		var fpsStr = "hello" + (fps|0); //fps|0+' fps';
		document.getElementById("fps").textContent = ((fps|0)+" fps");
	}

	if (steppingMode===false) requestAnimationFrame(draw);


	for (var j=0;j<0xff;j++) {
		// C64 can do around 20000 CPU cycles per frame.
		for (var i=0;i<10000;i++) {  // 10
			tick();
		}
		redrawScreen(0xff);
	}
}

function tick()
{
	"use strict";

	if (getFlag(break_flag)>0) return;



	var instr = mem[hw_pc++]|0;
	var mapI = findInstructionInMap(instr);

	//console.log("Trace: PC:" + hw_pc + "   instr:" + instr  + "   mapI:" + mapI);

	if (mapI===null) return;

	if (mapI===undefined) {
		console.log("VM ERROR: Instruction not found at byte " + hw_pc);
		setFlag(break_flag,1);
		var trap = 1;
		debugger;
	}


	var numOps = imapNew[mapI][1];
	var iOp1 = null, iOp2 = null;
	var val1=0|0;

	// Read  one or two operator descriptors if instruction allows.
	if (numOps>0) iOp1 = mem[hw_pc++];
	if (numOps>1) iOp2 = mem[hw_pc++];

	//console.log("found:" + mapI + ", iID:" + iID + ", iType:" + iType + ", iOp1:" + iOp1 + ", iOp2:"+ iOp2 + "");

	// Read any extra data for operator.
	var ed1=0|0,ed2=0|0;


	var decoded1 = decodeOperator(iOp1);
	var decoded2 = decodeOperator(iOp2);

	if (iOp1!==null) ed1 = readExtraData(decoded1[0]);
	if (iOp2!==null) ed2 = readExtraData(decoded2[0]);

	switch(instr) {

		case itype.MOV:
			var addr1=null, addr2=null;
			//if (iOp1===op.AB) addr1=getSource(op.WO); // Pointers are always words.
			//if (iOp1===op.AW) addr1=getSource(op.WO);
			//if (iOp2===op.AB) addr2=getSource(op.WO);
			//if (iOp2===op.AW) addr2=getSource(op.WO);
			var srcVal = getSource(iOp2,ed2);

			setTarget(iOp1,srcVal,ed1);
			/*
			if (iOp2===op.AR1B || iOp2===op.AR2B || iOp2===op.AR3B) {
				 //addr=getSource(op.WO);
				 setTarget(iOp1, getSource(iOp2,addr2), null);
			}
			else if (iOp2===op.AB || iOp2===op.AW ) {
				 addr=getSource(op.WO);
				 setTarget(iOp1, getSource(iOp2,addr2), null);
			}
			else {
				 setTarget(iOp1, getSource(iOp2,null), addr1);
			}*/

		break;

		case itype.ADD:
		 	setTarget(iOp1,(getSource(iOp1,ed1)+getSource(iOp2,ed2))&0xffffffff,ed1);
		break;
		case itype.SUB:
		 	setTarget(iOp1,(getSource(iOp1,ed1)-getSource(iOp2,ed2))&0xffffffff,ed1);
		break;
		case itype.MUL:
		 	setTarget(iOp1,(getSource(iOp1,ed1)*getSource(iOp2,ed2))&0xffffffff,ed1);
		break;
		case itype.DIV:
		 	setTarget(iOp1,((getSource(iOp1,ed1)/getSource(iOp2,ed2))|0)&0xffffffff,ed1);
		break;

		case itype.JMP:
			//hw_pc = getSource(op.WO);
			hw_pc = ed1; //getSource(iOp1,ed1);
		break;

		case itype.CMP:
			var result = getSource(iOp1,ed1) - getSource(iOp2,ed2);
			setFlag(zero_flag,0);
			setFlag(sign_flag,0);
			if (result===0) setFlag(zero_flag,1);
			else if (result<0) setFlag(sign_flag,1);
			else setFlag(sign_flag,0);
			break;
		case itype.INC: setTarget(iOp1, getSource(iOp1,ed1) + 1);	break;
		case itype.DEC: setTarget(iOp1, getSource(iOp1)-1, null);	break;

		case itype.JE:
			if (getFlag(zero_flag)) hw_pc = ed1;

			break;
		case itype.JNE:
			if (getFlag(zero_flag)===0) hw_pc = ed1;

			break;
		case itype.JL:
			if (getFlag(sign_flag)>0) hw_pc = ed1;

			break;
		case itype.JLE:
			if (getFlag(sign_flag)>0 || getFlag(zero_flag)) hw_pc = ed1;

			break;
		case itype.JG:
			if (getFlag(sign_flag)===0 && getFlag(zero_flag)===0) hw_pc = ed1;

			break;
		case itype.JGE:
			if (getFlag(sign_flag)===0 || getFlag(zero_flag)) hw_pc = ed1;

			break;
		case itype.PUB: pushByte(getSource(iOp1,ed1)); break;
		case itype.PUW: pushWord(getSource(iOp1,ed1)); break;
		case itype.POB: setTarget(iOp1,popByte()); break;
		case itype.POW: setTarget(iOp1,popWord()); break;

		case itype.SUB: setTarget(iOp1,(getSource(iOp1)-getSource(iOp2))&0xffffffff); break;
		case itype.SYS: sysCall(getSource(iOp1,ed1)); break;
		//case itype.CAL: pushWord(hw_pc+4); hw_pc = getSource(iOp1,ed1); break;
		case itype.CAL:
			pushWord(hw_pc); hw_pc = ed1;

			break;
		case itype.RET:
		 	hw_pc=popWord();

			break;
		case itype.BRK: setFlag(break_flag,1); break;

		case itype.AND: setTarget(iOp1,(getSource(iOp1,ed1)&getSource(iOp2,ed2))&0xffffffff); break;
		case itype.OR: setTarget(iOp1,(getSource(iOp1,ed1)|getSource(iOp2,ed2))&0xffffffff); break;
		case itype.XOR: setTarget(iOp1,(getSource(iOp1,ed1)^getSource(iOp2,ed2))&0xffffffff); break;
		case itype.NOT: setTarget(iOp1,(~getSource(iOp1,ed1))&0xffffffff); break;
		case itype.TEST:
			var result = getSource(iOp1,ed1) & getSource(iOp2,ed2);
			setFlag(zero_flag,0);
			setFlag(sign_flag,0);
			if (result===0) setFlag(zero_flag,1);
			else if (result<0) setFlag(sign_flag,1);
			else setFlag(sign_flag,0);
		 break;


		case itype.PUA: pushAll(); break;
		case itype.POA: popAll(); break;
		case itype.SHL:
			//setTarget(iOp1,(getSource(iOp1,ed1)+getSource(iOp2,ed2))&0xffffffff);
			val1  = getSource(iOp1,ed1);
			var amount = getSource(iOp2,ed2);
			if (0x80000000&val1>0) setFlag(carry_flag,1);
			setTarget(iOp1, (val1<<amount)&0xffffffff, ed1);
			break;
		case itype.SHR:
			val1  = getSource(iOp1);
			var amount = getSource(iOp2,ed2);
			if (0x00000001&val1>0) setFlag(carry_flag,1);
			setTarget(iOp1, (val1>>amount)&0xffffffff);
			break;
		case itype.CLC: setFlag(carry_flag,0); break;
		case itype.CLZ: setFlag(zero_flag,0); break;
		case itype.CLS: setFlag(sign_flag,0); break;
		case itype.CLB: setFlag(break_flag,0); break;

	}
}

// Pass in an operator descriptor, this function reads any other data required
// by the operator.
function readExtraData(opType)
{
	var read = 0|0;
	// next byte literal
	if (opType==opTypes.BLIT) {
		read = mem[hw_pc++]|0;
	}
	if (opType==opTypes.WLIT) {
		read = getNextWord();
	}
	if (opType==opTypes.BADDR) {
		read = getNextWord();
	}
	if (opType==opTypes.WADDR) {
		read = getNextWord();
	}
	return read;
}

function pushAll()
{
	pushWord(hw_regs[0]);
	pushWord(hw_regs[1]);
	pushWord(hw_regs[2]);
	pushWord(hw_regs[3]);
	pushWord(hw_regs[4]);
	pushWord(hw_regs[5]);
	pushWord(hw_regs[6]);
	pushWord(hw_regs[7]);

}

function popAll()
{
	hw_regs[7] = popWord();
	hw_regs[6] = popWord();
	hw_regs[5] = popWord();
	hw_regs[4] = popWord();
	hw_regs[3] = popWord();
	hw_regs[2] = popWord();
	hw_regs[1] = popWord();
	hw_regs[0] = popWord();
}


function processMiscInstruction(instr) {

	switch(instr)
	{
		case opcode.BRK:

		break;
		default:
			console.log("processMiscInstruction: Misc instruction not found: " + instr);
			break;
	}

}


function findInstructionInMap (pInst) {
	return instructionQuickLookup[pInst];
}

function setSteppingMode(to)
{
	steppingMode = to;
}

// Set a bit (using the flag bit mask) in hw_flags to value (0|1)
function setFlag(flag, value)
{
	if (value>0) hw_flags |= flag;
	else hw_flags &= ~flag;
}

function getFlag(flag)
{
	return (hw_flags&flag)>0?(1|0):(0|0);
}

// Stack operations.
function pushByte(data)
{
	//console.log("Pushbyte Start hw_sp="+hw_sp);
	mem[hw_sp--] = data&0xff;
	//console.log("Pushbyte End hw_sp="+hw_sp);
}

// I'm changing words to be 32 bit...
function pushWord(data)
{
	pushByte((data>>24)&0xff);
	pushByte((data>>16)&0xff);
	pushByte((data>>8)&0xff);
	pushByte(data&0xff);
}

function popByte()
{
	//console.log("Popbyte START hw_sp="+hw_sp);
	var popValue = mem[++hw_sp]&0xff;
	//console.log("Value="+popValue);
	return popValue;
	//console.log("Popbyte END hw_sp="+hw_sp);
}

function popWord()
{
	var byte4 = popByte()&0xff;
	var byte3 = popByte()&0xff;
	var byte2 = popByte()&0xff;
	var byte1 = popByte()&0xff;

	return (byte1<<24)+(byte2<<16)+(byte3<<8)+byte4;
}

function toHex(val, charLength)
{
	var hexStr = val.toString(16);
	while (hexStr.length<charLength) hexStr = "0"+hexStr;
	hexStr = "0x"+hexStr;
	return hexStr; 
}

function displayRegisters()
{
	var outHW = "PC:" + toHex(hw_pc,8) + " \tSP:" + toHex(hw_sp,8) + "\n";
	var outRegs =  "R1:" + hw_regs[0] + " \tR2:" + hw_regs[1]  + " \tR3:" + hw_regs[2] + " \tR4:" + hw_regs[3] + "\n";
	var outStack = "ST:";//+mem[hw_sp+1]+","+mem[hw_sp+2]+","+mem[hw_sp+3]+","+mem[hw_sp+4];
	for (var s=0;s<16;s++) outStack = outStack + " ,"+mem[hw_sp+s];
	console.log(outHW + outRegs + outStack);
	return (outHW + outRegs + outStack);
}

function dumpMemory()
{
	var numLines = 5;
	var lineLength = 8;
	var str = "";
	for (var line=0;line<numLines;line++) {
		str = "";
		for (var i=0;i<lineLength;i++) {
			str = str + mem[i+(line*lineLength)] + '\t';
		}
		console.log(str);
	}
}

// Read a word using PC as position, increase PC by 4
function getNextWord()
{
	//var total = mem[hw_pc++];
	//total = total<<8;
	//total+= mem[hw_pc++];
	//return total;

	var byte1 = mem[hw_pc++];
	var byte2 = mem[hw_pc++];
	var byte3 = mem[hw_pc++];
	var byte4 = mem[hw_pc++];

	return ((byte1<<24))+((byte2<<16))+((byte3<<8))+(byte4);
}



// parametrised function to set a value at given target.
function setTarget (op, val, addr)
{
	"use strict";

	var decoded = decodeOperator(op);
	var regId = decoded[1];
	switch (decoded[0]) {
		case opTypes.REG:
			hw_regs[regId] = val;
		break;
		case opTypes.BAREG:
			storeByte(hw_regs[regId], val&0xff);
		break;
		case opTypes.WAREG:
			storeWord(hw_regs[regId], val&0xffffffff);
		break;
		case opTypes.BADDR:
			storeByte(addr, val&0xff);
		break;
		case opTypes.WADDR:
			storeWord(addr, val&0xffffffff);
		break;
		case opTypes.PC: hw_pc = val; break;
		case opTypes.FLAGS: hw_flags = val; break;
		case opTypes.SP: hw_sp = val; break;
	}

	/*
	switch (trg) {
		case op.R1:	hw_r1 = val;	break;
		case op.R2:	hw_r2 = val;	break;
		case op.R3:	hw_r3 = val;	break;
		case op.AR1B:	storeByte(hw_r1,val);	break;
		case op.AR2B:	storeByte(hw_r2,val);	break;
		case op.AR3B:	storeByte(hw_r3,val);	break;
		case op.AR1W:	storeWord(hw_r1,val);	break;
		case op.AR2W:	storeWord(hw_r2,val);	break;
		case op.AR3W:	storeWord(hw_r3,val);	break;
		case op.PC:	hw_pc = val; break;
		case op.SP:	hw_sp = val; break;
		case op.FL:	hw_flags = val; break;

		// We need two vars for these operations...
		case op.AB:	storeByte(addr,val); break;
		case op.AW:	storeWord(addr,val); break;
		//case TBY:	 break;	// TODO: throw an error if we try to write to a constant.
		//case TWO:	 break;
	}*/
}


// parametrised function to get a value at given target.
function getSource(op,val)
{
	var decoded = decodeOperator(op);
	var regId = decoded[1];
	switch (decoded[0]) {
		case opTypes.REG:
			return hw_regs[regId];
		//break;
		case opTypes.BAREG:
			return getByte(hw_regs[regId]);
		//break;
		case opTypes.WAREG:
			return getWord(hw_regs[regId]);
		//break;
		case opTypes.BLIT: return val; //break;	// Byte literal
		case opTypes.WLIT: return val; //break;	// Word literal

		case opTypes.BADDR: return getByte(val); //break;	// Byte literal
		case opTypes.WADDR: return getWord(val); //break;	// Word literal

		case opTypes.PC: return hw_pc; //break;
		case opTypes.FLAGS: return hw_flags; //break;
		case opTypes.SP: return hw_sp; //break;
	}


	//if (src===40) {
//		return val;
//	}

	/*
	switch (src) {
		case op.R1: return hw_r1;
		case op.R2: return hw_r2;
		case op.R3: return hw_r3;
		case op.BY: return mem[hw_pc++];
		case op.WO: return (mem[hw_pc++]<<24)+(mem[hw_pc++]<<16)+(mem[hw_pc++]<<8)+mem[hw_pc++];
		case op.AB: return mem[addr];
		case op.AW: return (mem[addr]<<24)+(mem[addr+1]<<16)+(mem[addr+2]<<8)+mem[addr+3];
		case op.AR1B: return mem[hw_r1];
		case op.AR2B: return mem[hw_r2];
		case op.AR3B: return mem[hw_r3];
		case op.AR1W: return (mem[hw_r1]<<24)+(mem[hw_r1+1]<<16)+(mem[hw_r1+2]<<8)+mem[hw_r1+3];
		case op.AR2W: return (mem[hw_r2]<<24)+(mem[hw_r2+1]<<16)+(mem[hw_r2+2]<<8)+mem[hw_r2+3];
		case op.AR3W: return (mem[hw_r3]<<24)+(mem[hw_r3+1]<<16)+(mem[hw_r3+2]<<8)+mem[hw_r3+3];
	}*/
}

// Store a byte in memory.
// TODO: bounds check on mem access for all these functions.
function storeByte(addr, val)
{
	mem[addr] = val&0xff;
}

// Store a word in memory.
function storeWord(addr, val)
{
	mem[addr] = ((val>>24)&0xff)|0;
	mem[addr+1] = ((val>>16)&0xff)|0;
	mem[addr+2] = ((val>>8)&0xff)|0;
	mem[addr+3] = ((val)&0xff)|0;
}

// Get a byte from memory.
function getByte(addr)
{
	return mem[addr]|0;
}

// Get a word from memory.
function getWord(addr)
{
	var combined = 0;
	combined = (mem[addr]<<24)+(mem[addr+1]<<16)+(mem[addr+2]<<8)+mem[addr+3];
	//(mem[hw_r3]<<24)+(mem[hw_r3+1]<<16)+(mem[hw_r3+2]<<8)+mem[hw_r3+3];
	return combined;
}



function loadTestBinary(number)
{
	var l=0;
	if (number==1)
	{
		mem[0] = MOVB_R1;
		mem[1] = 0;
		mem[2] = MOVB_R2;
		mem[3] = 5;
		mem[4] = INC_R1;
		mem[5] = CMP_R1_R2;
		mem[6] = JMPEQ;
		mem[7] = 0;
		mem[8] = 12;
		mem[9] = JMPW;
		mem[10] = 0;
		mem[11] = 4;
		mem[12] = MOVB_R3;
		mem[13] = 66;
	}

	// test reg to reg.
	if (number==2)
	{
		mem[0] = MOVB_R1;
		mem[1] = 11;
		mem[2] = MOVB_R2;
		mem[3] = 22;
		mem[4] = MOVB_R3;
		mem[5] = 33;
		mem[6] = MOV_R1_R3;	// r1 = 33
		mem[6] = MOV_R3_R2;	// r3 = 22
	}

	// test incriments
	if (number==3)
	{
		mem[l++] = MOVB_R1;
		mem[l++] = 1;
		mem[l++] = MOVB_R2;
		mem[l++] = 2;
		mem[l++] = MOVB_R3;
		mem[l++] = 3;
		mem[l++] = INC_R1;
		mem[l++] = INC_R2;
		mem[l++] = INC_R3;
		mem[l++] = DEC_R1;
		mem[l++] = DEC_R2;
		mem[l++] = DEC_R3;
	}

	// test stack.
	if (number==4)
	{
		mem[l++] = MOVB_R1;
		mem[l++] = 11;
		mem[l++] = MOVB_R2;
		mem[l++] = 22;
		mem[l++] = PUSHB_R1;
		mem[l++] = PUSHB_R2;
		mem[l++] = POPB_R3;
		mem[l++] = PUSHW_R1;
		mem[l++] = POPW_R2;
	}

	// test move reg to address
	if (number==5)
	{
		mem[l++] = MOVB_R1;
		mem[l++] = 111;
		mem[l++] = MOVB_R2;
		mem[l++] = 222;
		mem[l++] = MOV_AW_R1;
		mem[l++] = 0;
		mem[l++] = 16;
		mem[l++] = MOV_AW_R2;
		mem[l++] = 0;
		mem[l++] = 17;
	}

	// test ADD
	if (number==6)
	{
		mem[l++] = MOVB_R1;
		mem[l++] = 11;
		mem[l++] = MOVB_R2;
		mem[l++] = 22;
		mem[l++] = ADD_R1_R2;
		mem[l++] = ADD_R3_R1;
	}

	// test Syscall
	if (number==7)
	{
		mem[l++] = MOVB_R1;
		mem[l++] = 11;
		mem[l++] = PUSHW_R1;
		mem[l++] = SYSCALL;
		mem[l++] = SYS_LOGBYTE;
	}

	// Test stack with new word size.
	if (number==8)
	{
		mem[l++] = MOVW_R1;
		mem[l++] = 4;
		mem[l++] = 3;
		mem[l++] = 2;
		mem[l++] = 1;
		mem[l++] = PUSHW_R1;
		mem[l++] = SYSCALL;
		mem[l++] = SYS_LOGBYTE;
	}

	// test writing to display memory.
	if (number==9)
	{
		mem[l++] = MOVW_R1;
		mem[l++] = 0;
		mem[l++] = 0;
		mem[l++] = 4;
		mem[l++] = 1;
		mem[l++] = MOVB_R2;
		mem[l++] = 1;
		mem[l++] = MOVB_AR1_R2;
		mem[l++] = INC_R1;
		mem[l++] = INC_R2;
		mem[l++] = JMPW;
		mem[l++] = 0;
		mem[l++] = 0;
		mem[l++] = 0;
		mem[l++] = 7;
	}

	// test writing to display memory.
	if (number==10)
	{
		mem[l++] = opcode.MOVW_R1;	// Set r1 to address of screen memory.
		mem[l++] = 0;
		mem[l++] = 0;
		mem[l++] = 4;
		mem[l++] = 1;
		mem[l++] = opcode.MOVB_R2;
		mem[l++] = 1;
		mem[l++] = opcode.MOVB_AR1_R2;
		mem[l++] = opcode.INC_R1;
		mem[l++] = opcode.INC_R2;
		mem[l++] = opcode.INC_R3;
		// need to be able to push a byte to stack
		mem[l++] = opcode.PUSHB;			// push x
		mem[l++] = 25;
		mem[l++] = opcode.PUSHB;			// Push y
		mem[l++] = 25;
		mem[l++] = opcode.PUSHB_R3;		// Push col
		mem[l++] = opcode.SYSCALL;			// set pixel
		mem[l++] = SYS_SETPIXEL;
		mem[l++] = opcode.JMPW;
		mem[l++] = 0;
		mem[l++] = 0;
		mem[l++] = 0;
		mem[l++] = 7;
	}

}




// INIT ROM
function initRom(){

}

function loadFont() {

}
