// tvm.js
// Hardware memory.

// TODO: move machine variables to a machine structure.
var memSize = 1024*1024; // 1048576
var mem = new Uint8Array(memSize);
// Registers
var hw_regs = [0,0,0,0,0,0,0,0,0,0,0];

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
var hw_mouseX = 1088;		// Mouse x (0..255)
var hw_mouseY = 1089;		// Mouse Y (0..255)
var hw_mouseLeft = 1090;		// Mouse Left Button
var hw_mouseRight = 1091;		// Mouse Right Button
var hw_joyUp = 1094;		// text cursor y
var hw_joyDown = 1095;		// text cursor y
var hw_joyLeft = 1096;		// text cursor y
var hw_joyRight = 1097;		// text cursor y
var hw_joyB1 = 1098;		// text cursor y
var hw_joyB2 = 1099;		// text cursor y


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
var warpMode = false;

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

	var numTicksPerScanline = 10;
	if (warpMode==true) numTicksPerScanline = 500;

	for (var j=0;j<0xff;j++) {
		// C64 can do around 20000 CPU cycles per frame.
		for (var i=0;i<numTicksPerScanline;i++) {  // 10
			tick();
		}
		redrawScreen(0x1);
	}
}


// 
var _instr;
var _mapI;
var _numOps;
var _iOp1;
var _iOp2;
var _val1;
var _ed1;
var _ed2;
var _decoded1;
var _decoded2;
var _srcVal;
var _result;
var _amount;

function tick()
{
	"use strict";

	if (getFlag(break_flag)>0) return;

	_instr = mem[hw_pc++]|0;
	_mapI = findInstructionInMap(_instr);

	//console.log("Trace: PC:" + hw_pc + "   instr:" + instr  + "   _mapI:" + _mapI);

	if (_mapI===null) return;

	if (_mapI===undefined) {
		console.log("VM ERROR: Instruction not found at byte " + hw_pc);
		setFlag(break_flag,1);
		var trap = 1;
		debugger;
	}


	_numOps = imapNew[_mapI][1];
	_iOp1 = null;
	_iOp2 = null;
	_val1=0|0;

	// Read  zero, one or two operator descriptors, depending on the instruction.
	if (_numOps>0) _iOp1 = mem[hw_pc++];
	if (_numOps>1) _iOp2 = mem[hw_pc++];

	//console.log("found:" + _mapI + ", iID:" + iID + ", iType:" + iType + ", _iOp1:" + _iOp1 + ", _iOp2:"+ _iOp2 + "");

	// Read any extra data for operator.
	_ed1=0|0;
	_ed2=0|0;
	_decoded1 = decodeOperator(_iOp1);
	_decoded2 = decodeOperator(_iOp2);

	if (_iOp1!==null) _ed1 = readExtraData(_decoded1[0]);
	if (_iOp2!==null) _ed2 = readExtraData(_decoded2[0]);

	switch(_instr) {

		case itype.MOV:
			_srcVal = getSource(_decoded2,_ed2);

			setTarget(_decoded1,_srcVal,_ed1);

		break;

		case itype.ADD:
		 	setTarget(_decoded1,(getSource(_decoded1,_ed1)+getSource(_decoded2,_ed2))&0xffffffff,_ed1);
		break;
		case itype.SUB:
		 	setTarget(_decoded1,(getSource(_decoded1,_ed1)-getSource(_decoded2,_ed2))&0xffffffff,_ed1);
		break;
		case itype.MUL:
		 	setTarget(_decoded1,(getSource(_decoded1,_ed1)*getSource(_decoded2,_ed2))&0xffffffff,_ed1);
		break;
		case itype.DIV:
		 	setTarget(_decoded1,((getSource(_decoded1,_ed1)/getSource(_decoded2,_ed2))|0)&0xffffffff,_ed1);
		break;

		case itype.JMP:
			//hw_pc = getSource(op.WO);
			hw_pc = _ed1; //getSource(_iOp1,_ed1);
		break;

		case itype.CMP:
			_result = getSource(_decoded1,_ed1) - getSource(_decoded2,_ed2);
			setFlag(zero_flag,0);
			setFlag(sign_flag,0);
			if (_result===0) setFlag(zero_flag,1);
			else if (_result<0) setFlag(sign_flag,1);
			else setFlag(sign_flag,0);
			break;
		case itype.INC: setTarget(_decoded1, getSource(_decoded1,_ed1) + 1);	break;
		case itype.DEC: setTarget(_decoded1, getSource(_decoded1)-1, null);	break;

		case itype.JE:
			if (getFlag(zero_flag)) hw_pc = _ed1;

			break;
		case itype.JNE:
			if (getFlag(zero_flag)===0) hw_pc = _ed1;

			break;
		case itype.JL:
			if (getFlag(sign_flag)>0) hw_pc = _ed1;

			break;
		case itype.JLE:
			if (getFlag(sign_flag)>0 || getFlag(zero_flag)) hw_pc = _ed1;

			break;
		case itype.JG:
			if (getFlag(sign_flag)===0 && getFlag(zero_flag)===0) hw_pc = _ed1;

			break;
		case itype.JGE:
			if (getFlag(sign_flag)===0 || getFlag(zero_flag)) hw_pc = _ed1;

			break;
		case itype.PUB: pushByte(getSource(_decoded1,_ed1)); break;
		case itype.PUW: pushWord(getSource(_decoded1,_ed1)); break;
		case itype.POB: setTarget(_decoded1,popByte()); break;
		case itype.POW: setTarget(_decoded1,popWord()); break;

		case itype.SUB: setTarget(_decoded1,(getSource(_decoded1)-getSource(_decoded2))&0xffffffff); break;
		case itype.SYS: sysCall(getSource(_decoded1,_ed1)); break;
		//case itype.CAL: pushWord(hw_pc+4); hw_pc = getSource(_iOp1,_ed1); break;
		case itype.CAL:
			pushWord(hw_pc); hw_pc = _ed1;

			break;
		case itype.RET:
		 	hw_pc=popWord();

			break;
		case itype.BRK: setFlag(break_flag,1); break;

		case itype.AND: setTarget(_decoded1,(getSource(_decoded1,_ed1)&getSource(_decoded2,_ed2))&0xffffffff); break;
		case itype.OR: setTarget(_decoded1,(getSource(_decoded1,_ed1)|getSource(_decoded2,_ed2))&0xffffffff); break;
		case itype.XOR: setTarget(_decoded1,(getSource(_decoded1,_ed1)^getSource(_decoded2,_ed2))&0xffffffff); break;
		case itype.NOT: setTarget(_decoded1,(~getSource(_decoded1,_ed1))&0xffffffff); break;
		case itype.TEST:
			_result = getSource(_decoded1,_ed1) & getSource(_decoded2,_ed2);
			setFlag(zero_flag,0);
			setFlag(sign_flag,0);
			if (_result===0) setFlag(zero_flag,1);
			else if (_result<0) setFlag(sign_flag,1);
			else setFlag(sign_flag,0);
		 break;


		case itype.PUA: pushAll(); break;
		case itype.POA: popAll(); break;
		case itype.SHL:
			//setTarget(_iOp1,(getSource(_iOp1,_ed1)+getSource(_iOp2,_ed2))&0xffffffff);
			_val1  = getSource(_decoded1,_ed1);
			_amount = getSource(_decoded2,_ed2);
			if (0x80000000&_val1>0) setFlag(carry_flag,1);
			setTarget(_decoded1, (_val1<<_amount)&0xffffffff, _ed1);
			break;
		case itype.SHR:
			_val1  = getSource(_decoded1);
			_amount = getSource(_decoded2,_ed2);
			if (0x00000001&_val1>0) setFlag(carry_flag,1);
			setTarget(_decoded1, (_val1>>_amount)&0xffffffff);
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


function findInstructionInMap (pInst) {
	return instructionQuickLookup[pInst];
}

function setSteppingMode(to)
{
	steppingMode = to;
}

function setWarpMode(to)
{
	warpMode = to;
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
	mem[hw_sp--] = data&0xff;
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
	var popValue = mem[++hw_sp]&0xff;
	return popValue;
}

function popWord()
{
	var byte4 = popByte()&0xff;
	var byte3 = popByte()&0xff;
	var byte2 = popByte()&0xff;
	var byte1 = popByte()&0xff;

	return (byte1<<24)+(byte2<<16)+(byte3<<8)+byte4;
}

// Convert number to hex and pad to charLength characters (not counting the 0x)
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
	var byte1 = mem[hw_pc++];
	var byte2 = mem[hw_pc++];
	var byte3 = mem[hw_pc++];
	var byte4 = mem[hw_pc++];

	return ((byte1<<24))+((byte2<<16))+((byte3<<8))+(byte4);
}



// parametrised function to set a value at given target.
function setTarget (decoded, val, addr)
{
	"use strict";

	//var decoded = decodeOperator(op);
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
}


// parametrised function to get a value at given target.
function getSource(decoded,val)
{
	
	//var decoded = decodeOperator(op);
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
