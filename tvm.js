// tvm.js
// Hardware memory.


var memSize = 1024;
var mem = new Uint8Array(memSize);
// Registers
var hw_r1 = 0;
var hw_r2 = 0;
var hw_r3 = 0;
var hw_pc = 0;
var hw_stackTop = memSize-100;
var hw_sp = hw_stackTop;
var hw_flags = 0;

// Bit indexes into the flags register.
var sign_flag = 1<<0;
var zero_flag = 1<<1;



var main = function () {
	//compile();

	for (var m=0;m<memSize;m++) mem[m]=0;

	displayRegisters();
	loadTestBinary(6);

	for (var i=0;i<10;i++) {
		tick();
		displayRegisters();
	}

	dumpMemory();
};

var tick = function ()
{
	var instr = mem[hw_pc++];
	var mapI = findInstructionInMap(instr);

	if (mapI===null) return;

	var iID = instructionMap[mapI][0];
	var iType = instructionMap[mapI][1];
	var iOp1 = instructionMap[mapI][2];
	var iOp2 = instructionMap[mapI][3];

	//console.log("found:" + mapI + ", iID:" + iID + ", iType:" + iType + ", iOp1:" + iOp1 + ", iOp2:"+ iOp2 + "");

	switch(iType) {
		case MOV:
			var addr=null;
			if (iOp1===TAB) addr=getSource(SNB);
			if (iOp1===TAW) addr=getSource(SNW);
			setTarget(iOp1, getSource(iOp2), addr);
		break;
		case CMP:
			var result = getSource(iOp2) - getSource(iOp1);
			setFlag(zero_flag,0);
			setFlag(sign_flag,0);
			if (result===0) setFlag(zero_flag,1);
			else if (result>0) setFlag(sign_flag,1);
			else setFlag(sign_flag,0);
			break;
		case INC: setTarget(iOp1, getSource(iOp1)+1, null);	break;
		case DEC: setTarget(iOp1, getSource(iOp1)-1, null);	break;
		case JMP:
			if (instr==JMPW) {
				hw_pc = getSource(SNW);
			}
			if (instr==JMPEQ) {
				if (getFlag(zero_flag)) hw_pc = getSource(SNW);
				else hw_pc+=2; // skip word.
			}
			break;
		case PUB: pushByte(getSource(iOp1)); break;
		case PUW: pushWord(getSource(iOp1)); break;
		case POB: setTarget(iOp1,popByte()); break;
		case POW: setTarget(iOp1,popWord()); break;
		case ADD: setTarget(iOp1,(getSource(iOp1)+getSource(iOp2))&0xffff); break;
	}
};

var findInstructionInMap = function (pInst) {
	for (var i = 0 ; i < instructionMap.length;i++) {
		if (instructionMap[i][0] == pInst) return i;
	}
	return null;
};


// Set a bit (using the flag bit mask) in hw_flags to value (0|1)
var setFlag = function(flag, value)
{
	if (value>0) hw_flags |= flag;
	else hw_flags &= ~flag;
};

var getFlag = function(flag)
{
	return (hw_flags&flag)>0?1:0;
};

// Stack operations.
var pushByte = function(data)
{
	//console.log("Pushbyte Start hw_sp="+hw_sp);
	mem[hw_sp--] = data&0xff;
	//console.log("Pushbyte End hw_sp="+hw_sp);
};
var pushWord = function(data)
{
	pushByte((data>>8)&0xff);
	pushByte(data&0xff);
};
var popByte = function()
{
	//console.log("Popbyte START hw_sp="+hw_sp);
	var popValue = mem[++hw_sp]&0xff;
	//console.log("Value="+popValue);
	return popValue;
	//console.log("Popbyte END hw_sp="+hw_sp);
};
var popWord = function()
{
	var hi = mem[hw_sp++];
	var lo = mem[hw_sp++];
	return ((hi<<8)&0xff)+(lo&0xff);
};



var displayRegisters = function()
{
	var outHW = "PC:" + hw_pc + " \tSP:" + hw_sp;
	var outRegs =  " \tR1:" + hw_r1 + " \tR2:" + hw_r2  + " \tR3:" + hw_r3;
	var outStack = " \tST:"+mem[hw_sp+1]+","+mem[hw_sp+2]+","+mem[hw_sp+3]+","+mem[hw_sp+4];
	console.log(outHW + outRegs + outStack);

};

var dumpMemory = function ()
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
};

var getNextWord = function()
{
	var total = mem[hw_pc++];
	total = total<<8;
	total+= mem[hw_pc++];
	return total;
};



// parametrised function to set a value at given target.
var setTarget = function(trg, val, addr)
{
	switch (trg) {
		case TR1:	hw_r1 = val;	break;
		case TR2:	hw_r2 = val;	break;
		case TR3:	hw_r3 = val;	break;
		case TAR1B:	storeByte(hw_r1,val);	break;
		case TAR2B:	storeByte(hw_r2,val);	break;
		case TAR3B:	storeByte(hw_r3,val);	break;
		case TAR1W:	storeWord(hw_r1,val);	break;
		case TAR2W:	storeWord(hw_r2,val);	break;
		case TAR3W:	storeWord(hw_r3,val);	break;
		case TPC:	hw_pc = val; break;
		case TSP:	hw_sp = val; break;
		case TFL:	hw_flags = val; break;

		// We need two vars for these operations...
		case TAB:	mem[addr] = val; break;
		case TAW:	mem[addr] = val; break;
		//case TBY:	 break;	// TODO: throw an error if we try to write to a constant.
		//case TWO:	 break;
	}
};


// parametrised function to get a value at given target.
var getSource = function(src)
{
	switch (src) {
		case SR1: return hw_r1;
		case SR2: return hw_r2;
		case SR3: return hw_r3;
		case SNB: return mem[hw_pc++];
		case SNW: return (mem[hw_pc++]<<8)+mem[hw_pc++];
	}
};

// Store a byte in memory.
// TODO: bounds check on mem access for all these functions.
var storeByte = function(addr, val)
{
	mem[addr] = val&0xff;
};

// Store a word in memory.
var storeWord = function(addr, val)
{
	mem[addr] = (val>>8)&0xff;
	mem[addr+1] = val&0xff;
};

// Get a byte from memory.
var getByte = function(addr)
{
	return mem[addr];
};

// Get a word from memory.
var getWord = function(addr)
{
	var combined = 0;
	combined = (mem[addr]<<8)+mem[addr+1];
	return combined;
};



var loadTestBinary = function(number)
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

};
