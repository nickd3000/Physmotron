

var OP_UNKNOWN = 0;
var OP_R1 = 1;
var OP_R2 = 2;
var OP_R3 = 3;
var OP_AR1 = 4; // R1 Address
var OP_AR2 = 5;
var OP_AR3 = 6;
var OP_NUM = 7;
var OP_ANUM = 8;


//compile()

function compile(source)
{
	"use strict";
	var byteCode = [];
	var compiledLine = [];

/*
	var source = "";
	//source += 'mov 0xff, [123] \n';
	source += 'mov	r3,0xff \n';
	source += "CMP	r1, 257 \n";
	source += "inc r1 \n";
	source += "pushb r3 \n";
	source += "pushw r3 \n";
	source += "popb r3 \n";
	source += "pushb 0xff \n";
	source += "goto 10 \n";
	//source += "jmp 1 ";
*/

	// Convert tabs to space.
	source = source.replace(/\t+/g, " ");

	// We probably want to split the source into lines first before tokenizing
	// that way we can know line numbers when finding errors.
	var lines = source.split(/\r?\n/);
	console.log(lines);

	// Spit string into tokens, removing spaces etc.

	var lineCount = lines.length;
	var op1,op2;
	for (var line = 0;line<lineCount;line++)
	{
		if (lines[line]==="") continue;
		var tokens = lines[line].trim().split(/[ ,/t]+/);
		var tokenCount = tokens.length;
		console.log("Line:"+line+" Tokens:"+tokenCount);

		// Debug: print each token in line.
		//for (var j=0;j<tokenCount;j++) console.log("Token:" + tokens[j]);

		op1 = null;
		op2 = null;
		opcode = null;
		if (tokenCount>1) op1 = parseOperand(tokens[1]);
		if (tokenCount>2) op2 = parseOperand(tokens[2]);
		//console.log("OP1: "+op1 + "   OP2: "+op2);

		switch (tokens[0].toLowerCase()) {
			case "mov":
				opcode = findInstruction(itype.MOV, op1, op2);
				break;
			case "cmp":
				opcode = findInstruction(itype.CMP, op1, op2);
				break;
			case "inc":
				opcode = findInstruction(itype.INC, op1, op2);
				break;
			case "dec":
				opcode = findInstruction(itype.DEC, op1, op2);
				break;
			case "pushb":
				opcode = findInstruction(itype.PUB, op1, op2);
				break;
			case "pushw":
				opcode = findInstruction(itype.PUW, op1, op2);
				break;
			case "popb":
				opcode = findInstruction(itype.POB, op1, op2);
				break;
			case "popw":
				opcode = findInstruction(itype.POW, op1, op2);
				break;
			default:
				console.log("COMPILE ERROR: Opcode not recognised at line " + line);
				console.log("  > " + lines[line]);
			}

		compiledLine = generateBytecodeLine(opcode,op1,op2);
		//byteCode += compiledLine;
		// Add compiled line to bytecode.
		for (var j=0;j<compiledLine.length;j++) {
			byteCode[byteCode.length]=compiledLine[j]|0;
		}
		//console.log("Bytecode:" + generateBytecodeLine(opcode,op1,op2));

	}

	return byteCode;
	//console.log(tokens);
};

function generateBytecodeLine(opcode, op1, op2)
{
	var outputCode = [];
	var pos=0;
	outputCode[pos++] = opcode;

	if (op1!=null && op1[0]===op.BY) outputCode[pos++] = op1[2]|0;
	if (op1!=null && (op1[0]===op.WO || op1[0]===op.AB || op1[0]===op.AW)) {
		outputCode[pos++] = ((op1[2]>>24)&0xff)|0;
		outputCode[pos++] = ((op1[2]>>16)&0xff)|0;
		outputCode[pos++] = ((op1[2]>>8)&0xff)|0;
		outputCode[pos++] = (op1[2]&0xff)|0;
	}



	if (op2!=null && op2[0]===op.BY) outputCode[pos++] = op2[2]|0;
	if (op2!=null && (op2[0]===op.WO || op2[0]===op.AB || op2[0]===op.AW)) {
		outputCode[pos++] = ((op2[2]>>24)&0xff)|0;
		outputCode[pos++] = ((op2[2]>>16)&0xff)|0;
		outputCode[pos++] = ((op2[2]>>8)&0xff)|0;
		outputCode[pos++] = (op2[2]&0xff)|0;
	}


	return outputCode;
}

function findInstruction(iType, op1, op2)
{
	var matchType = false;
	var matchOp1 = false;
	var matchOp2 = false;
	for (var i=0;i<imap.length;i++)
	{
		matchType=false;
		matchOp1=false;
		matchOp2=false;

		if (imap[i][1]==iType) matchType=true;
		else continue;

		if (op1==null && imap[i][2]==null) matchOp1=true;
		else if (op1!=null && imap[i][2]==op1[0]) matchOp1=true;
		else continue;

		if (op2==null && imap[i][3]==null) matchOp2=true;
		else if (op2!=null && imap[i][3]==op2[0]) matchOp2=true;
		else continue;


		return imap[i][0];

		/*
		{

			if (op1!=null && imap[i][2]==op1[0]){
				if (imap[i][3]==op2[0]){
					return imap[i][0];
				}
			} else
		}*/
	}

	console.log("No Matching instruction found.");
	return -1;
};

// are there two operands?
// are operands a valid source and target?
function parseCheckMov(line, lineNumber)
{
	if (line.length<2) return 1;

};


// r1 [r1] 12 0xff label
function parseOperand(operand)
{
	// Result contains the operand type id, the original string,
	// and the integer representation if applicable.
	var result = [0,operand,0];
	var strLength = operand.length;

	//console.log("parseOperand input:" + op + ":");

	// Detect the registers.
	switch (operand)
	{
		case "r1": result[0]=op.R1; break;
		case "r2": result[0]=op.R2; break;
		case "r3": result[0]=op.R3; break;
		case '[r1]': result[0]=op.AR1W; break;
		case "[r2]": result[0]=op.AR2W; break;
		case "[r3]": result[0]=op.AR3W; break;
		//
		case '[r1b]': result[0]=op.AR1B; break;
		case "[r2b]": result[0]=op.AR2B; break;
		case "[r3b]": result[0]=op.AR3B; break;
		case '[r1w]': result[0]=op.AR1W; break;
		case "[r2w]": result[0]=op.AR2W; break;
		case "[r3w]": result[0]=op.AR3W; break;
	}

	//console.log("parseOperand result:" + result[0]);

	if (result[0]!=0) return result;

	// Parse a number, works with hex also.
	// Makes heavy use of parseInt.
	if (isNaN(parseInt(operand))==false)
	{
		if (parseInt(operand)<=0xff) {
			result[0] = op.BY;	// Word
		} else {
			result[0] = op.WO;	// Word
		}
		result[2] = parseInt(operand);
		return result;
	}

	// Check for literal pointers, first check if string begins and ends with [].
	if (operand.substring(0,1)=='[' && operand.substring(operand.length-1,operand.length)==']')
	{
		var strMid = operand.substring(1,operand.length-1); // Extract the string between [ and ].
		if (isNaN(parseInt(strMid))==false)
		{
			result[0] = op.AW; // word address
			result[2] = parseInt(strMid);
			return result;
		}
	}

	return result;
}

// Check that this operand is a valid source operand.
function parseCheckValidSource(op)
{
	// is it a number
	// is it a register
	// is it a pointer to register
	// is it a memory pointer
	// is it a variable pointer
	// error
};

// Check that this operand is a valid target operand.
function parseCheckValidTarget(op)
{
	// is it a register
	// is it a pointer to register
	// is it a memory pointer
	// is it a variable pointer
	// error
};

// operand info
//	can modify
//	8bit or 16 bit required
// is it a literal
// is it a label
// register? address?
