// Web controls

function webCompile()
{
	resetMachine();

	var source = document.getElementById("source").value;

	//loadBytecode(compile(getSampleAssemblerCode(7)),0);

	var output = "output";
	var code = compile(source,output);

	document.getElementById("output").value = compileOutput;

	loadBytecode(code,hw_programDataStart);

	document.getElementById("canvas").focus();
	//requestAnimationFrame(draw);
}


function webShowRegs()
{
	var strDisplayRegisters = displayRegisters();
	//strDisplayRegisters = strDisplayRegisters.replace(new RegExp('\n','g'), '<br />');
	document.getElementById("regs").value = strDisplayRegisters;
}
