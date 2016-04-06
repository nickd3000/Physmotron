
function getSampleAssemblerCode(id) {

	var NL=" \n", str = "";


		// Simple scanline colour change.
		if (id==9)
		{
			str = 	'movb byte [503], byte 13 ' + NL +
					'start: ' + NL +
					'movb byte [503], byte 1' + NL +
					'movb byte [503], byte 0' + NL +
					'jmp word start' + NL +
					'brk' + NL ;
			return str;
		}

		// Simple scanline colour change.
		if (id==8)
		{
			str = 	'start: ' + NL +
					'cmp byte [504], byte 10' + NL +
					'jeq word match' + NL +
					'' + NL +
					'' + NL +
					'movb byte [503], byte r1' + NL +
					'jmp word start' + NL +
					'match: inc r1' + NL +
					'' + NL +
					'jmp word start';
			return str;
		}

		// Wait for scanline.
		if (id==7)
		{
			str = 'start: inc r1' + NL +
						'and r1, 0xff' + NL +
						//'movb [503], r1' + NL +
						'inc r2' + NL +
						'pushb r2' + NL +
						'pushb 5' + NL +
						'pushw text1' + NL +
						'sys b5' + NL +
						'' + NL +
						'' + NL +
						'' + NL +
						'wait: movb r3,[504]' + NL +
						'cmp r3,254' + NL +
						'jeq start' + NL +
						'jmp wait' + NL +
						'' + NL +
						'text1: db " Hello ",0';
			return str;
		}

		// Simple scanline colour change.
		if (id==6)
		{
			str = 	'start: movb byte [503], byte 3' + NL +
					'movb byte [503], byte [504]' + NL +
					'jmp word start';
					//'brk';
					/*'start: inc word r1' + NL +
					'and r1, 0x0f' + NL +
					'movb byte [503], byte 12' + NL +
					'jmp word start';*/
			return str;
		}

	// Test SYS_TEXT
	if (id==5)
	{
		str = 	'start: pushb b10' + NL +
				'pushb b20' + NL +
				'pushw text2' + NL +
				'sys b5' + NL +
				'pushb b10' + NL +
				'pushb b20' + NL +
				'pushw text1' + NL +
				'sys b5' + NL +
				'pushb b10' + NL +
				'pushb b21' + NL +
				'pushw text1' + NL +
				'sys b5' + NL +
				'movb r1,[504]' + NL +
				'and r1,31' + NL +
				'pushb r1' + NL +
				'pushb b22' + NL +
				'pushw text1' + NL +
				'sys b5' + NL +
				'movb r3,[504]' + NL +
				'movb [503],r3' + NL +
				'jmp start' + NL +
				'text1: db " Oh Man!. ",0' + NL +
				'text2: db " Cool!.   ",0' + NL;
		return str;
	}


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
		str = 	'call word printn' + NL +
				'call word printd' + NL +
				'call word printn' + NL +
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
