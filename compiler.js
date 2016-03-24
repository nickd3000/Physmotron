
var compile = function ()
{
	var source = '';
	source += 'mov_r2	[r1],r2 \n';
	source += "mov_R1	12, 12 \n";
	source += "INC_R1 \n";
	source += "jmp 1 ";


	// Convert tabs to space.
	source = source.replace(/\t+/g, " ");

	// We probably want to split the source into lines first before tokenizing
	// that way we can know line numbers when finding errors.
	var lines = source.split(/\r?\n/);
	console.log(lines);

	// Spit string into tokens, removing spaces etc.

	var lineCount = lines.length;

	for (var line = 0;line<lineCount;line++)
	{
		if (lines[line]==="") continue;

		//var tokens = lines[i].match(/\S+/g); // /\S+/g
		var tokens = lines[line].trim().split(/[ ,/t]+/); // /[ ,.]+/

		var tokenCount = tokens.length;
		console.log("Line:"+line+" Tokens:"+tokenCount);

		for (var j=0;j<tokenCount;j++) console.log("Token:" + tokens[j]);

		// mov instruction
		// EX:	mov r1,[r2]
		//		mov r2,123
		if (tokens[0].toLowerCase()=="mov")
		{
			parseCheckMov(lines[line],line);
			// what order does this work in?
		}
	}

	//console.log(tokens);
};

// are there two operands?
// are operands a valid source and target?
var parseCheckMov = function(line, lineNumber)
{
	if (line.length<2) return 1;

};

// Check that this operand is a valid source operand.
var parseCheckValidSource = function(op)
{
	// is it a number
	// is it a register
	// is it a pointer to register
	// is it a memory pointer
	// is it a variable pointer
	// error
};

// Check that this operand is a valid target operand.
var parseCheckValidTarget = function(op)
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
