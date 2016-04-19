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
	
	webShowRegs();
}


function webShowRegs()
{
	var strDisplayRegisters = displayRegisters();
	//strDisplayRegisters = strDisplayRegisters.replace(new RegExp('\n','g'), '<br />');
	document.getElementById("regs").value = strDisplayRegisters;
}

function webStep() {
	tick();
	redrawScreen(1);
	webShowRegs();
}

function webStepCheckbox() {
	
	var checkedValue = document.getElementById("step").checked;
	if (checkedValue==false) {
		//console.log("false");
		setSteppingMode(false);
		draw();
	} else {
		//console.log("true");
		setSteppingMode(true);
	}
	
}

function webWarpCheckbox() {
	
	var checkedValue = document.getElementById("warp").checked;
	if (checkedValue==false) {
		//console.log("false");
		setWarpMode(false);
	} else {
		//console.log("true");
		setWarpMode(true);
	}
	
}
