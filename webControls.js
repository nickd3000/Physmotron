// Web controls

function webCompile()
{
	resetMachine();

	var source = document.getElementById("source").value;

	//loadBytecode(compile(getSampleAssemblerCode(7)),0);

	var output = "output";
	var code = compile(source,output);

	document.getElementById("output").value = compileOutput;

	loadBytecode(code,0);

	//requestAnimationFrame(draw);
}
