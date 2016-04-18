// instructions.js
//'use strict';

// http://www.masswerk.at/6502/6502_instruction_set.html

// Machine instruction definitions.


// Operator classes
var opTypes = {
	REG: 0,		// Register
	BAREG:1,	// BYTE [register]
	WAREG:2,	// WORD [register]
	BAREGO:3,	// BYTE [register+offset]	(offset is next word)
	WAREGO:4,	// WORD [register+offset]	(offset is next word)
	BLIT:5,		// BYTE LITERAL
	WLIT:6,		// WORD LITERAL
	BADDR:7,	// BYTE at [ADDRESS]
	WADDR:8,	// WORD at [ADDRESS]
	PC:9,		// PC
	FLAGS:10,	// FLAGS
	SP:11,		// SP
	ASP:12,		// [SP]
	ASPO:13,	// [SP+offset]				(offset is next word)
	PLIT:14		// Literal packed into operator byte.
};

// Instruction types.
// These actually represent the new OPCODES
var itype = {
	NOP: 0,
	MOV: 1,

	// Compare and Jumps
	CMP: 10,		// Compare
	JMP: 11,		// Jump
	JE: 12,		// Jump if equal.
	JNE: 13,		// Jump if equal.
	JL: 14,		// Jump if equal.
	JLE: 15,		// Jump if equal.
	JG: 16,		// Jump if equal.
	JGE: 17,		// Jump if equal.
	JC: 18,		// Jump if carry is set.
	JCC: 19,		// Jump if carry is clear.
	CAL: 20,		// Call
	RET: 21,		// return from call

	// Stack
	PUB: 30,		// Push byte
	PUW: 31,		// Push word (4 bytes)
	POB: 32,		// Pop byte
	POW: 33,		// Pop word.
	PUA: 34,		// Push all regs
	POA: 35,		// Pop all regs

	// Maths
	ADD: 40,
	SUB: 41,
	MUL: 42,
	DIV: 43,
	INC: 44,
	DEC: 45,
	SHL: 46,
	SHR: 47,

	// Bitwise
	AND: 60,
	OR: 61,
	XOR: 62,
	NOT: 63,
	TEST: 64,

	// Flags
	CLC: 70,	// clear carry flag
	CLZ: 71, 	// clear zero flag
	CLS: 72, 	// clear sign flag
	CLB: 73, 	// clear break flag*/

	SYS: 128,
	BRK: 129,
};

// NOTE: the above instruction types should represent groups of instructions
// that perform a similar action and only differ by their operands.

// map instruction types to names used by the assembly language.
var instNames = [
	[itype.MOV,	'mov', 'move', 'load'],
	[itype.CMP, 'cmp','compare'],
	[itype.INC, 'inc'],
	[itype.DEC, 'dec'],
	[itype.JMP, 'jmp', 'jump'],
	[itype.JE, 'je','jeq','be'],
	[itype.JNE, 'jne','bne'],
	[itype.JL, 'jl','bl'],
	[itype.JLE, 'jle','ble'],
	[itype.JG, 'jg','bg'],
	[itype.JGE, 'jge','bge'],
	[itype.JC, 'jc','bc'],
	[itype.JCC, 'jcc','bcc'],
	[itype.PUB, 'pushb','pub'],
	[itype.PUW, 'pushw','puw'],
	[itype.POB, 'popb','pob'],
	[itype.POW, 'popw','pow'],
	[itype.PUA, 'pua','pusha','pushall'],
	[itype.POA, 'poa','popa','popall'],
	[itype.ADD, 'add'],
	[itype.SUB, 'sub'],
	[itype.MUL, 'mul'],
	[itype.DIV, 'div'],
	[itype.SYS, 'sys', 'syscall'],
	[itype.CAL, 'cal', 'call'],
	[itype.RET, 'ret', 'return'],
	[itype.BRK, 'brk', 'break'],
	[itype.AND, 'and'],
	[itype.SHL, 'shl'],
	[itype.SHR, 'shr'],
	[itype.CLC, 'clc'],
	[itype.CLZ, 'clz'],
	[itype.CLS, 'cls'],
	[itype.CLB, 'clb'],
	[itype.OR, 'or'],
	[itype.XOR, 'xor'],
	[itype.NOT, 'not'],
	[itype.TEST, 'test'],
];

// table of valid opcodes, and how many operands it takes
var imapNew = [
	[itype.NOP, 0],
	[itype.MOV, 2],

	// Compare and jumps
	[itype.CMP, 2],
	[itype.JMP, 1],
	[itype.JE,1],		// Jump if equal.
	[itype.JNE,1],		// Jump if equal.
	[itype.JL,1],		// Jump if equal.
	[itype.JLE,1],		// Jump if equal.
	[itype.JG,1],		// Jump if equal.
	[itype.JGE,1],		// Jump if equal.
	[itype.JC,1],		// Jump if carry is set.
	[itype.JCC,1],		// Jump if carry is clear.
	[itype.CAL,1],
	[itype.RET,0],

	// Stack
	[itype.PUB, 1],
	[itype.PUW, 1],
	[itype.POB, 1],
	[itype.POW, 1],
	[itype.PUA, 0],
	[itype.POA, 0],

	// Maths
	[itype.ADD, 2],
	[itype.SUB, 2],
	[itype.MUL, 2],
	[itype.DIV, 2],
	[itype.INC, 1],
	[itype.DEC, 1],
	[itype.SHL, 2],
	[itype.SHR, 2],

	// Bitwise
	[itype.AND,2],
	[itype.OR,2],
	[itype.XOR,2],
	[itype.NOT,1],
	[itype.TEST,2],

	// Flags
	[itype.CLC,0],
	[itype.CLZ,0],
	[itype.CLS,0],
	[itype.CLB,0],

	// Misc
	[itype.SYS, 1],
	[itype.BRK, 0],
];


// Creat a table to quickly find instruction rows in the instruction map.
var instructionMapLength = imapNew.length;
var instructionQuickLookup = [];
for (var ql = 0; ql<imapNew.length;ql++) {
	instructionQuickLookup[imapNew[ql][0]]=ql;
}

// Packed opcode literals.
// we can have 64 different literals, they will be duplicated to include negative versions.
var packedLiterals = [
	0,1,2,3,4,5,6,7,8,9,10,
	20,30,40,50,60,70,80,90,
	100,200,300,400,500,
	16,32,64,128,255,512,1024,2048,4096,
	320,240
];


// 1,60,106,0,2,256,0xa,0x9,7,16,0,6,7,0xf,32,1024,0xff00,0x1000
