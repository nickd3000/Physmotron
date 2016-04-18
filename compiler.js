

// Short answer describing 6502 use of labels.
// http://forum.6502.org/viewtopic.php?t=945
// Binary relocation proposal in 6502
// http://www.6502.org/users/andre/o65/fileformat.html

// proposed method for declaring data
// pos:		db 0xff 			// db= define byte
// list:	db 0x01,0x02,0x04
// name:	db "nick",0,2,3
// how to declare n bytes?
// these need to be placed after our code, we could enforce data always being declared at the end,
// or we could create a pre processor that moves db's to end of file?


// org 0x100 // assembler directive - tells assembler where to store program.



// Register labels [String Name, source line, binary location]
var labelList = [];

// Used to track when a label is referred to. [label ID, codeLocation]
var labelUsedList = [];

//compile()
var compileOutput = ".";

function compile(source)
{
	"use strict";
	var byteCode = [];
	var compiledLine = [];
	var sourceToCodeMap = [];

	// reset these:
	labelList = [];
	labelUsedList = [];
	compileOutput = "";

	// Convert tabs to space.
	source = source.replace(/\t+/g, " ");

	// We probably want to split the source into lines first before tokenizing
	// that way we can know line numbers when finding errors.
	var lines = source.split(/\r?\n/);
	//console.log(lines);

	// Spit string into tokens, removing spaces etc.
	scanLinesForLabels(lines);

	var lineCount = lines.length;
	var op1,op2,oc;
	for (var line = 0;line<lineCount;line++)
	{
		sourceToCodeMap[line]=[null,null];

		registerCurrentLineWithLabels(line, byteCode.length);

		if (lines[line]==="") continue;

		var strLine = stripCommentFromLine(lines[line]);
		var tokens = strLine.trim().split(/[ ,/\t]+/); // (/[ ,/t]+/)
		var tokenCount = tokens.length;
		//console.log("Line:"+line+" Tokens:"+tokenCount);

		// Debug: print each token in line.
		//for (var j=0;j<tokenCount;j++) console.log("Token:" + tokens[j]);

		// We may have consumed a label or comment statement which resulted in a blank line.
		if (tokens[0]==="") continue; // So skip empty lines.

		// Hande data declarations.
		if (tokens[0]=="db") {
			compiledLine = declareBytes(lines[line]);

			// Copied this from down below, should probs make it a function.
			//for (var j=0;j<compiledLine.length;j++) {
			//	byteCode[byteCode.length]=compiledLine[j]|0;
			//}
			copyBytesToByteCode(byteCode, compiledLine);
			
			continue;
		}

		op1 = null;
		op2 = null;
		oc = null;
		var isWord=false;
		var ti=1; // token iterator.
		for (ti=1;ti<tokenCount;ti++) {
			if (tokens[ti]=="byte") {
				 isWord=false;
				 ti++;
			 }
			 else if (tokens[ti]=="word") {
				 isWord=true;
				 ti++;
			 }
			 if (ti==tokenCount) break;
			 if (op1===null) {
				  op1 = parseOperand(tokens[ti], isWord);
				  isWord=false;
			  }
			 else {  
				 op2 = parseOperand(tokens[ti], isWord);
				 isWord = false;
			 }
		}

		// Keep old method for now...
		//if (tokenCount>1) op1 = parseOperand(tokens[1]);
		//if (tokenCount>2) op2 = parseOperand(tokens[2]);
		//console.log("OP1: "+op1 + "   OP2: "+op2);


		// Get instruction type id from string.
		var itp = finditypeFromName(tokens[0].toLowerCase());
		//console.log("FOUND : " + itp + " for " + tokens[0].toLowerCase());

		// Search for opcode using instruction type and operand types.
		//oc = findInstruction(itp, op1, op2);

		
		// Detect error, unrecognised opcode.
		if (itp===-1) {
			console.log("COMPILE ERROR: Opcode not recognised at line " + line);
			console.log("  > " + lines[line]);
			compileOutput = compileOutput + "COMPILE ERROR: Instruction not recognised at line " + line + "\n";
			compileOutput = compileOutput + "  > " + lines[line] + "\n";
		} else  { // Error - wrong number of operands
			
			var numExpOperands = imapNew[instructionQuickLookup[itp]][1];
			if ((numExpOperands==2 && op2===null) || (numExpOperands==1 && op1===null)) {
				compileOutput = compileOutput + "COMPILE ERROR: Expected " + numExpOperands + " operands at " + line + "\n";
				compileOutput = compileOutput + "  > " + lines[line] + " \n";
			}
		}

		//compiledLine = generateBytecodeLine(oc,op1,op2,byteCode.length);
		compiledLine = generateBytecodeLineNew(itp,op1,op2,byteCode.length);

		//byteCode += compiledLine;
		// Add compiled line to bytecode.
		sourceToCodeMap[line]=[byteCode.length, compiledLine.length];
		
		//for (var j=0;j<compiledLine.length;j++) {
		//	byteCode[byteCode.length]=compiledLine[j]|0;
		//}
		copyBytesToByteCode(byteCode, compiledLine);
		
		//console.log("Bytecode:" + generateBytecodeLine(oc,op1,op2));



	}

	refactorLabelsUsedInBytecode(byteCode);

	/*
	for (var k=0;k<labelList.length;k++) {
		console.log("LL: "+labelList[k]);
	}
	*/

	console.log("Finished compiling  " + lines.length + " lines to " + byteCode.length + " bytes.");


	// Prepare compiler debug output
	for (line = 0;line<sourceToCodeMap.length;line++)
	{
		var byteLine = "";
		var hex="";
		if (sourceToCodeMap[line][0]===null) continue;
		for (var i=0;i<sourceToCodeMap[line][1];i++) {
			//console.log("sTcM: "+byteCode[sourceToCodeMap[line][0]+i]);
			hex = byteCode[sourceToCodeMap[line][0]+i].toString(16);
			if (hex.length===1) hex = "0"+hex;
			byteLine += " "+padString(hex,3);
		}

		var outp = "s[" + line + "]";
		outp = padString(outp,6);
		outp = outp + "b[" + toHex((sourceToCodeMap[line][0]+hw_programDataStart),8) + "]";
		outp = padString(outp,12);
		outp+=byteLine;
		outp = padString(outp,45);
		outp+=lines[line];
		console.log(outp);
		compileOutput = compileOutput + outp + "\n";
	}




	return byteCode;
	//console.log(tokens);
}

function copyBytesToByteCode(byteCode, barray)
{
	for (var i=0;i<barray.length;i++) {
		byteCode[byteCode.length]=barray[i]|0;
	}
}
		
		
function padString(str,size)
{
	while(str.length<size) str=str+" ";
	return str;
}

// Only supports // at the moment.
function stripCommentFromLine(str)
{
	var pos = str.indexOf("//");
	if (pos!==-1) str = str.substring(0,pos);

	pos = str.indexOf(";");
	if (pos!==-1) str = str.substring(0,pos);

	return str;
}

// Called while compiling, if the label list has a label for the
// current source line, update the list to represent where in
// the compiled bytecode the label is.
function registerCurrentLineWithLabels(curLine, curBytecodePos)
{
	for (var i=0;i<labelList.length;i++) {
		if (labelList[i][1]==curLine) {
			labelList[i][2]=curBytecodePos;
		}
	}
}

// called when the use of a label has been detected
// when generating bytecode for a source line.
function registerLabelUse(labelId, bytecodePos) {
	var newRow = new Array(labelId, bytecodePos);
	labelUsedList.push(newRow);
}

// Apply a final operation to generated bytecode,
// scan through code for places that a label was
// used and replace the placeholder address with
// the label address.
function refactorLabelsUsedInBytecode(bc)
{
	for (var i=0;i<labelUsedList.length;i++) {
		var labelId = labelUsedList[i][0];
		var codeLoc = labelUsedList[i][1];
		var targetAddress = labelList[labelId][2] + hw_programDataStart;
		bc[codeLoc++] = ((targetAddress>>24)&0xff)|0;
		bc[codeLoc++] = ((targetAddress>>16)&0xff)|0;
		bc[codeLoc++] = ((targetAddress>>8)&0xff)|0;
		bc[codeLoc++] = (targetAddress&0xff)|0;
	}
}

// When the compiler detects a line with db (declare byte) at the start,
// this function is called to parse the line.
function declareBytes(line)
{
	var result = [], strMid="", curTok;
	// Tokenise the line, preserving quoted text.
	tokens = line.match(/\w+|"[^"]+"/g);
	//console.log("** declareBytes");
	for (var i=1;i<tokens.length;i++) {
		curTok=tokens[i];
		//console.log(">" + i + ">"+curTok+"<");
		if (isNaN(parseInt(curTok))===false)
		{
			result[result.length] = parseInt(curTok)|0;
		}

		if (curTok.substring(0,1)=='"' && curTok.substring(curTok.length-1,curTok.length)=='"')
		{
			strMid = curTok.substring(1,curTok.length-1); // Extract the string between [ and ].
			for (var c=0;c<strMid.length;c++) {
				result[result.length] = strMid.charCodeAt(c);
			}
		}
	}
	//console.log("** declareBytes end");
	//for (i=0;i<result.length;i++) { console.log(result[i]); }
	return result;
}

function scanLinesForLabels(lines)
{
	for (var i=0;i<lines.length;i++) {
		if (lines[i]==="") continue;
		var tokens = lines[i].trim().split(/[ ,/\t]+/);

		for (var t=0;t<tokens.length;t++)
		{
			if (tokens[t].length<2) continue;

			// If this token looks like a label:
			// 1. Remove it from the source line.
			// 2. Add a new row to the labelList.
			if (tokens[t][tokens[t].length-1] == ":") {
				// console.log("Found a label: {" + tokens[t] + "}");
				//console.log("Before: "+lines[i]);
				// Remove label from the line.
				lines[i] = lines[i].replace(tokens[t],'');
				//console.log("After: "+lines[i]);
				var newRow = new Array(tokens[t].replace(':',''),i,-1);
				labelList.push(newRow);

			}
		}
	}

	//console.log("labelList --> "+labelList);

}


// Return an itype value based on instruction name string.
function finditypeFromName(str)
{
	for (var i=0;i<instNames.length;i++)
	{
		for (var j=1;j<instNames[i].length;j++) // Note: starts at 1.
		{
			if (str==instNames[i][j]) return instNames[i][0];
		}
	}
	console.log("finditypeFromName - ERROR: could not find instruction " + str);
	return -1;
}


function generateBytecodeLineNew(opcode, op1, op2, curCodeLength)
{
	var outputCode = [];
	var pos=0;
	outputCode[pos++] = opcode;

	// [opType, string, value, label ID, regId]
	if (op1!==null) {
		 encoded1 = encodeOperator(op1[0],op1[1],op1[2],op1[4]);
		 outputCode[pos++]=encoded1[0];
	}
	if (op2!==null) {
		 encoded2 = encodeOperator(op2[0],op2[1],op2[2],op2[4]);
		 outputCode[pos++]=encoded2[0];
	}
	if (op1!==null) {
		if (encoded1[1]==1) {	// Byte of data
			outputCode[pos++]=encoded1[2]; // Output byte value
		} else if (encoded1[1]==2 || encoded1[1]==3) {		// Word of data or address
			if (op1[3]!==-1) registerLabelUse(op1[3], pos+curCodeLength);
			//if (encoded1[3]!==-1) registerLabelUse(encoded1[3], pos+curCodeLength);
			outputCode[pos++] = ((encoded1[2]>>24)&0xff)|0;
			outputCode[pos++] = ((encoded1[2]>>16)&0xff)|0;
			outputCode[pos++] = ((encoded1[2]>>8)&0xff)|0;
			outputCode[pos++] = (encoded1[2]&0xff)|0;
		}
	}

	if (op2!==null) {
		if (encoded2[1]==1) {	// Byte of data
			outputCode[pos++]=encoded2[2]; // Output byte value
		} else if (encoded2[1]==2 || encoded2[1]==3) {		// Word of data or address
			//debugger;
			if (op2[3]!==-1) registerLabelUse(op2[3], pos+curCodeLength);
			//if (encoded2[3]!==-1) registerLabelUse(encoded2[3], pos+curCodeLength);
			outputCode[pos++] = ((encoded2[2]>>24)&0xff)|0;
			outputCode[pos++] = ((encoded2[2]>>16)&0xff)|0;
			outputCode[pos++] = ((encoded2[2]>>8)&0xff)|0;
			outputCode[pos++] = (encoded2[2]&0xff)|0;
		}
	}


/*
	if (op1!==null && op1[0]===op.BY) outputCode[pos++] = op1[2]|0;
	if (op1!==null && (op1[0]===op.WO || op1[0]===op.AB || op1[0]===op.AW)) {
		if (op1[3]!==-1) registerLabelUse(op1[3], pos+curCodeLength);
		outputCode[pos++] = ((op1[2]>>24)&0xff)|0;
		outputCode[pos++] = ((op1[2]>>16)&0xff)|0;
		outputCode[pos++] = ((op1[2]>>8)&0xff)|0;
		outputCode[pos++] = (op1[2]&0xff)|0;
	}

	if (op2!==null && op2[0]===op.BY) outputCode[pos++] = op2[2]|0;
	if (op2!==null && (op2[0]===op.WO || op2[0]===op.AB || op2[0]===op.AW)) {
		if (op2[3]!==-1) registerLabelUse(op2[3], pos+curCodeLength);
		outputCode[pos++] = ((op2[2]>>24)&0xff)|0;
		outputCode[pos++] = ((op2[2]>>16)&0xff)|0;
		outputCode[pos++] = ((op2[2]>>8)&0xff)|0;
		outputCode[pos++] = (op2[2]&0xff)|0;
	}
*/
	return outputCode;
}

function encodeOperator(opType, string, value, regId) {

	// EDM: extra data mode (0, 1=next byte, 2=next word, 3=next address)
	// format = [byte, edm, data ]
	var encoded = [0,0,0];

	if (regId<1) regId=0;
	if (regId>8) regId=8;
	if (opType===opTypes.REG) {
		encoded[0] = 0 + regId;
		return encoded;
	}
	if (opType===opTypes.BAREG) {
		encoded[0] = 8 + regId;
		return encoded;
	}
	if (opType===opTypes.WAREG) {
		encoded[0] = 16 + regId;
		return encoded;
	}
	if (opType===opTypes.BLIT) {
		encoded[0] = 40;
		encoded[1] = 1; // Byte
		encoded[2] = value;
		return encoded;
	}
	if (opType===opTypes.WLIT) {
		encoded[0] = 41;
		encoded[1] = 2; // Word
		encoded[2] = value;
		return encoded;
	}
	if (opType===opTypes.BADDR) {
		encoded[0] = 42;
		encoded[1] = 3; // value is address
		encoded[2] = value;
		return encoded;
	}
	if (opType===opTypes.WADDR) {
		encoded[0] = 43;
		encoded[1] = 3; // value is address
		encoded[2] = value;
		return encoded;
	}
	return encoded;
}

function decodeOperator(val)
{
	// format [opType, regId]
	var decoded = [-1,-1];
	if (val>-1 && val<8) {
		decoded[0] = opTypes.REG;
		decoded[1] = val;
		return decoded;
	}
	if (val>7 && val<16) {
		decoded[0] = opTypes.BAREG;
		decoded[1] = val-8;
		return decoded;
	}
	if (val>15 && val<32) {
		decoded[0] = opTypes.WAREG;
		decoded[1] = val-16;
		return decoded;
	}

	if (val==40) {
		decoded[0] = opTypes.BLIT;
		return decoded;
	}
	if (val==41) {
		decoded[0] = opTypes.WLIT;
		return decoded;
	}
	if (val==42) {
		decoded[0] = opTypes.BADDR;
		return decoded;
	}
	if (val==43) {
		decoded[0] = opTypes.WADDR;
		return decoded;
	}

	return decoded;
}

function generateBytecodeLine(opcode, op1, op2, curCodeLength)
{
	// remove this function soon
	/*
	var outputCode = [];
	var pos=0;
	outputCode[pos++] = opcode;

	if (op1!==null && op1[0]===op.BY) outputCode[pos++] = op1[2]|0;
	if (op1!==null && (op1[0]===op.WO || op1[0]===op.AB || op1[0]===op.AW)) {
		if (op1[3]!==-1) registerLabelUse(op1[3], pos+curCodeLength);
		outputCode[pos++] = ((op1[2]>>24)&0xff)|0;
		outputCode[pos++] = ((op1[2]>>16)&0xff)|0;
		outputCode[pos++] = ((op1[2]>>8)&0xff)|0;
		outputCode[pos++] = (op1[2]&0xff)|0;
	}

	if (op2!==null && op2[0]===op.BY) outputCode[pos++] = op2[2]|0;
	if (op2!==null && (op2[0]===op.WO || op2[0]===op.AB || op2[0]===op.AW)) {
		if (op2[3]!==-1) registerLabelUse(op2[3], pos+curCodeLength);
		outputCode[pos++] = ((op2[2]>>24)&0xff)|0;
		outputCode[pos++] = ((op2[2]>>16)&0xff)|0;
		outputCode[pos++] = ((op2[2]>>8)&0xff)|0;
		outputCode[pos++] = (op2[2]&0xff)|0;
	}

	return outputCode; */
}

/*
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

		if (op1===null && imap[i][2]===null) matchOp1=true;
		else if (op1!==null && imap[i][2]==op1[0]) matchOp1=true;
		else continue;

		if (op2===null && imap[i][3]===null) matchOp2=true;
		else if (op2!==null && imap[i][3]==op2[0]) matchOp2=true;
		else continue;


		return imap[i][0];

	}

	console.log("No Matching instruction found." + " iType:" + iType + " op1:" + op1 + " op2:" + op2);
	return -1;
}
*/


// are there two operands?
// are operands a valid source and target?
/*function parseCheckMov(line, lineNumber)
{
	if (line.length<2) return 1;

}*/


// r1 [r1] 12 0xff label
function parseOperand(operand, isWord)
{
	// Result contains the operand type id, the original string,
	// and the integer representation if applicable.
	var result = [0,operand,0,-1,0]; // [opType, string, value, label ID, regId]
	var strLength = operand.length;

	//console.log("parseOperand input:" + op + ":");

	// Detect the registers.
	switch (operand) {
		case "r1": result[0]=opTypes.REG; result[4]=0; break;
		case "r2": result[0]=opTypes.REG; result[4]=1; break;
		case "r3": result[0]=opTypes.REG; result[4]=2; break;
		case "r4": result[0]=opTypes.REG; result[4]=3; break;
		case "r5": result[0]=opTypes.REG; result[4]=4; break;
		case "r6": result[0]=opTypes.REG; result[4]=5; break;
		case "r7": result[0]=opTypes.REG; result[4]=6; break;
		case "r8": result[0]=opTypes.REG; result[4]=7; break;
		case '[r1]': result[0]=opTypes.BAREG; result[4]=0; break;
		case '[r2]': result[0]=opTypes.BAREG; result[4]=1; break;
		case '[r3]': result[0]=opTypes.BAREG; result[4]=2; break;
		case '[r4]': result[0]=opTypes.BAREG; result[4]=3; break;
		case '[r5]': result[0]=opTypes.BAREG; result[4]=4; break;
		case '[r6]': result[0]=opTypes.BAREG; result[4]=5; break;
		case '[r7]': result[0]=opTypes.BAREG; result[4]=6; break;
		case '[r8]': result[0]=opTypes.BAREG; result[4]=7; break;
	}
	if (isWord===true) {
		if (result[0]==opTypes.BAREG) result[0]=opTypes.WAREG;
	}

	if (result[0]!==0) return result;


	//console.log("parseOperand result:" + result[0]);

	var strMid = "";

	// Parse a number, works with hex also.
	// Makes heavy use of parseInt.
	if (isNaN(parseInt(operand))===false)
	{
		if (isWord===true) {
			result[0] = opTypes.WLIT;	// Word literal
		} else {
			result[0] = opTypes.BLIT;	// Byte literal
		}
		result[2] = parseInt(operand)|0;
		return result;
	}


	// Check for literal pointers, first check if string begins and ends with [].
	if (operand.substring(0,1)=='[' && operand.substring(operand.length-1,operand.length)==']')
	{
		strMid = operand.substring(1,operand.length-1); // Extract the string between [ and ].
		if (isNaN(parseInt(strMid))===false)
		{
			if (isWord===true) result[0] = opTypes.WADDR; // word address
			else result[0] = opTypes.BADDR; // word address
			result[2] = parseInt(strMid);
			return result;
		}
	}

	// Hmm, labels should always be 4 byte pointers, but what they reference might
	// be 1 byte...

	// check for label - should always be word?
	for (var i=0;i<labelList.length;i++)
	{
		if (labelList[i][0]==operand) {
			//console.log("LABEL USE FOUND!! " + operand);

			//if (isWord===true) result[0] = opTypes.WADDR;
			//else result[0] = opTypes.BADDR;
			// test:
			result[0] = opTypes.WLIT;
			//else result[0] = opTypes.BADDR;

			result[2] = 0xffffffff;
			result[3] = i; //record the label id for the detected label.
			//var newRow = new Array(i, );
			//labelUsedList.push(newRow);
			return result;
		}
	}

	// check for label pointer
	if (operand.substring(0,1)=='[' && operand.substring(operand.length-1,operand.length)==']') {
		strMid = operand.substring(1,operand.length-1); // Extract the string between [ and ].
		for (var j=0;j<labelList.length;j++)
		{
			if (labelList[j][0]==strMid) {
				// console.log("LABEL (pointer) USE FOUND!! " + operand);

				if (isWord===true) result[0] = opTypes.WADDR; // word address
				else result[0] = opTypes.BADDR;
				result[2] = 0xffffffff;
				result[3] = j; //record the label id for the detected label.
				//var newRow = new Array(i, );
				//labelUsedList.push(newRow);
				return result;
			}
		}
	}
// var newRow = new Array(tokens[t].replace(':',''),i,-1);
// labelList.push(newRow);

	return result;
}
