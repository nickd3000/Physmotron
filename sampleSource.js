
function getSampleAssemblerCode(id) {

	var NL=" \n", str = "";


	// string print function.
	if (id==4)
	{
		str = 	'movw r1,text1' + NL +
				'call print' + NL +
				'movw r1,text2' + NL +
				'call print' + NL +
				'brk' + NL +

				'print:' + NL +
				'movb r2,[r1b]' + NL +
				'cmp r2,0' + NL +
				'jeq endprint' + NL +
				'pushb r2' + NL +
				'sys 3' + NL +
				'inc r1' + NL +
				'jmp print' + NL +
				'endprint: ret' + NL +

				'text1: db "Hello World.",0' + NL +
				'text2: db "Compiler.",0' + NL;
		return str;
	}

	// test function calling and return.
	if (id==3)
	{
		str = 	'call printn' + NL +
				'call printd' + NL +
				'call printn' + NL +
				'brk' + NL +
				'printn: pushb 110' + NL +
				'syscall 3' + NL +
				'ret' + NL +
				'printd: pushb 100' + NL +
				'syscall 3' + NL +
				'ret' + NL ;

		return str;
	}

	// Fill screen with coloured pixels while testing
	// some features.
	if (id==2)
	{
		str = 	'movw r1,1024' + NL +
				'start:  inc r1' + NL +
				'cmp r2, 0xff' + NL +
				'jeq resetr2' + NL +
				'movb [r1b], r3' + NL +
				'inc r2' + NL +
				'jmp start' + NL +
				'resetr2:' + NL +
				'movb r2,0' + NL +
				'inc r3' + NL +
				'jmp start' + NL ;

		return str;
	}

	// Print hello world using syscall.
	if (id==1)
	{
		str = 	'movw r1,text' + NL +
				'loopStart:' + NL +
				'movb r2,[r1b]' + NL +
				'cmp r2, 0' + NL +
				'jeq end' + NL +
				'pushb r2' + NL +
				'sys 3' + NL +
				'inc r1' + NL +

				'jmp loopStart' + NL +
				'end: brk' + NL +
				'text: db "Hello World.",0' + NL;
		return str;
	}



}
