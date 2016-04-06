// Web controls

function webCompile()
{
	resetMachine();

	var source = document.getElementById("source").value;

	//loadBytecode(compile(getSampleAssemblerCode(7)),0);

	var code = compile(source);

	loadBytecode(code,0);

	//requestAnimationFrame(draw);
}
