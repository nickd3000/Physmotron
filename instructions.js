// instructions.js
//'use strict';

// Machine instruction definitions.

// TODO: split up mov into byte and word operations?

var opcode = { NO_OP: 0,
	MOVB_R1: 1,	// move next byte to register r1
	MOVB_R2: 2,
	MOVB_R3: 3,
	MOVW_R1: 4,	// move next word to register.
	MOVW_R2: 5,
	MOVW_R3: 6,
	MOVW_R1_R2: 10,	// move reg to reg.
	MOVW_R1_R3: 11,
	MOVW_R2_R1: 12,
	MOVW_R2_R3: 13,
	MOVW_R3_R1: 14,
	MOVW_R3_R2: 15,
	MOVB_AW_R1: 16,		// Move r1 to word address
	MOVB_AW_R2: 17,
	MOVB_AW_R3: 18,
	MOVB_R1_AW: 19,		// Move byte at word address to R1
	MOVB_R2_AW: 20,
	MOVB_R3_AW: 21,
	MOVB_AR1_R2: 22,	// Move r2 to address in r1
	MOVB_AW_BY: 25,		// Move next byte to word address
	CMP_R1_R2: 30,		// compare registers
	CMP_R1_R3: 31,
	CMP_R2_R1: 32,
	CMP_R2_R3: 33,
	CMP_R3_R1: 34,
	CMP_R3_R2: 35,
	CMP_R1_WO: 36,		// Compare R1 to next word
	CMP_R2_WO: 37,
	CMP_R3_WO: 38,
	CMP_R1_BY: 39,		// Compare R1 to next byte
	CMP_R2_BY: 40,
	CMP_R3_BY: 41,
	INC_R1: 50,		// Incriment
	INC_R2: 51,
	INC_R3: 52,
	DEC_R1: 53,		// Decriment
	DEC_R2: 54,
	DEC_R3: 55,
	JMPW: 60,			// Jump to next word.
	JMPEQ: 61,			// jump on equals
	PUSHB_R1: 70,
	PUSHB_R2: 71,
	PUSHB_R3: 72,
	PUSHW_R1: 73,
	PUSHW_R2: 74,
	PUSHW_R3: 75,
	PUSHB: 76,			// push next byte to stack.
	PUSHW: 77,
	POPB_R1: 78,
	POPB_R2: 79,
	POPB_R3: 80,
	POPW_R1: 81,
	POPW_R2: 82,
	POPW_R3: 83,
	ADD_R1_R2: 90,		// ADD : R1: R1 + R2
	ADD_R1_R3: 91,
	ADD_R2_R1: 92,
	ADD_R2_R3: 93,
	ADD_R3_R1: 94,
	ADD_R3_R2: 95,
	SYSCALL: 100,		// Syscall, next byte specifies what syscall.
	BRK: 101,			// Set Break flag
};

// Id's used for source and dest for instructions.
var op = {
	R1: 1,		// Target R1
	R2: 2,
	R3: 3,
	AR1B: 4,	// Byte Address at R1
	AR2B: 5,
	AR3B: 6,
	AR1W: 7,	// Word Address at R1 (words are going to be 4 bytes)
	AR2W: 8,
	AR3W: 9,
	PC: 10,		// Program counter.
	SP: 11,		// Stack pointer
	FL: 12,		// Flags
	AB: 13,		// Byte at address
	AW: 14,		// Word at address
	BY: 15,		// Next byte
	WO: 16		// Next word
};

// Instruction types.
var itype = {
	MOVB: 1,
	MOVW: 2,
	CMP: 3,
	INC: 4,
	DEC: 5,
	JMP: 6,
	PUB: 8,		// Push byte
	PUW: 9,		// Push word (4 bytes)
	POB: 10,		// Pop byte
	POW: 11,		// Pop word.
	ADD: 12,
	SYS: 15,
	BRK: 16,

};

// NOTE: the above instruction types should represent groups of instructions
// that perform a similar action and only differ by their operands.

// map instruction types to names used by the assembly language.
var instNames = [
	[itype.MOVB,	'movb'],
	[itype.MOVW,	'movw'],
	[itype.CMP, 'cmp','compare'],
	[itype.INC, 'inc'],
	[itype.DEC, 'dec'],
	[itype.JMP, 'jmp', 'jump'],
	[itype.PUB, 'pushb'],
	[itype.PUW, 'pushw'],
	[itype.POB, 'popb'],
	[itype.POW, 'popw'],
	[itype.ADD, 'add'],
	[itype.SYS, 'sys', 'syscall'],
	[itype.BRK, 'brk', 'break'],
];


// Instruction map.
var imap = [
	[opcode.NO_OP,			null,	null,	null],
	[opcode.MOVB_R1,		itype.MOVB,	op.R1,	op.BY],	// Move next byte into register.
	[opcode.MOVB_R2,		itype.MOVB,	op.R2,	op.BY],
	[opcode.MOVB_R3,		itype.MOVB,	op.R3,	op.BY],
	[opcode.MOVW_R1,		itype.MOVW,	op.R1,	op.WO],	// Move next word into register.
	[opcode.MOVW_R2,		itype.MOVW,	op.R2,	op.WO],
	[opcode.MOVW_R3,		itype.MOVW,	op.R3,	op.WO],
	//
	[opcode.MOVW_R1_R2,		itype.MOVW,	op.R1,	op.R2],	// Move reg to reg.
	[opcode.MOVW_R1_R3,		itype.MOVW,	op.R1,	op.R3],
	[opcode.MOVW_R2_R1,		itype.MOVW,	op.R2,	op.R1],
	[opcode.MOVW_R2_R3,		itype.MOVW,	op.R2,	op.R3],
	[opcode.MOVW_R3_R1,		itype.MOVW,	op.R3,	op.R1],
	[opcode.MOVW_R3_R2,		itype.MOVW,	op.R3,	op.R2],
	//
	[opcode.MOVB_AW_R1,		itype.MOVB,	op.AW,	op.R1],	// Move byte r1 to address
	[opcode.MOVB_AW_R2,		itype.MOVB,	op.AW,	op.R2],
	[opcode.MOVB_AW_R3,		itype.MOVB,	op.AW,	op.R3],
	//
	[opcode.MOVB_R1_AW,		itype.MOVB,	op.R1,	op.AW],	// Move byte at address to r1.
	[opcode.MOVB_R2_AW,		itype.MOVB,	op.R2,	op.AW],
	[opcode.MOVB_R3_AW,		itype.MOVB,	op.R3,	op.AW],
	//
	[opcode.MOVB_AR1_R2,	itype.MOVB,	op.AR1B,	op.R2],	// Move r2 to address in r1
	[opcode.MOVB_AW_BY,		itype.MOVB,	op.AW,	op.BY], // Move next byte to word address
	//
	[opcode.CMP_R1_R2,		itype.CMP,	op.R1,	op.R2],	// Compare registers.
	[opcode.CMP_R1_R3,		itype.CMP,	op.R1,	op.R3],
	[opcode.CMP_R2_R1,		itype.CMP,	op.R2,	op.R1],
	[opcode.CMP_R2_R3,		itype.CMP,	op.R2,	op.R3],
	[opcode.CMP_R3_R1,		itype.CMP,	op.R3,	op.R1],
	[opcode.CMP_R3_R2,		itype.CMP,	op.R3,	op.R2],
	[opcode.CMP_R1_WO,		itype.CMP,	op.R1,	op.WO], // Compare R1 to next word.
	[opcode.CMP_R2_WO,		itype.CMP,	op.R1,	op.WO],
	[opcode.CMP_R3_WO,		itype.CMP,	op.R1,	op.WO],
	[opcode.CMP_R1_BY,		itype.CMP,	op.R1,	op.BY], // Compare R1 to next byte.
	[opcode.CMP_R2_BY,		itype.CMP,	op.R1,	op.BY],
	[opcode.CMP_R3_BY,		itype.CMP,	op.R1,	op.BY],
	//
	[opcode.INC_R1,			itype.INC,	op.R1,	null],	// Incriment
	[opcode.INC_R2,			itype.INC,	op.R2,	null],
	[opcode.INC_R3,			itype.INC,	op.R3,	null],
	[opcode.DEC_R1,			itype.DEC,	op.R1,	null],	// Decriment
	[opcode.DEC_R2,			itype.DEC,	op.R2,	null],
	[opcode.DEC_R3,			itype.DEC,	op.R3,	null],
	//
	[opcode.JMPW,			itype.JMP,	op.WO,	null],
	[opcode.JMPEQ,			itype.JMP,	op.WO,	null],
	//
	[opcode.PUSHB_R1,		itype.PUB,	op.R1,	null],	// Push register Byte to stack
	[opcode.PUSHB_R2,		itype.PUB,	op.R2,	null],
	[opcode.PUSHB_R3,		itype.PUB,	op.R3,	null],
	[opcode.PUSHW_R1,		itype.PUW,	op.R1,	null],	// Push register Word to stack
	[opcode.PUSHW_R2,		itype.PUW,	op.R2,	null],
	[opcode.PUSHW_R3,		itype.PUW,	op.R3,	null],
	[opcode.PUSHB,			itype.PUB,	op.BY,	null],	// Push next byte to stack
	[opcode.PUSHW,			itype.PUB,	op.WO,	null],	// Push next byte to stack
	[opcode.POPB_R1,		itype.POB,	op.R1,	null],
	[opcode.POPB_R2,		itype.POB,	op.R2,	null],
	[opcode.POPB_R3,		itype.POB,	op.R3,	null],
	[opcode.POPW_R1,		itype.POW,	op.R1,	null],
	[opcode.POPW_R2,		itype.POW,	op.R2,	null],
	[opcode.POPW_R3,		itype.POW,	op.R3,	null],
	[opcode.ADD_R1_R2,		itype.ADD,	op.R1,	op.R2],	// ADD : R1 = R1 + R2
	[opcode.ADD_R1_R3,		itype.ADD,	op.R1,	op.R3],
	[opcode.ADD_R2_R1,		itype.ADD,	op.R2,	op.R1],
	[opcode.ADD_R2_R3,		itype.ADD,	op.R2,	op.R3],
	[opcode.ADD_R3_R1,		itype.ADD,	op.R3,	op.R1],
	[opcode.ADD_R3_R2,		itype.ADD,	op.R3,	op.R2],
	//
	[opcode.SYSCALL,		itype.SYS,	op.BY,	null],
	[opcode.BRK,			itype.BRK,	null,	null],
];


// Creat a table to quickly find instruction rows in the instruction map.
var instructionMapLength = imap.length;
var instructionQuickLookup = [];
for (var ql = 0; ql<imap.length;ql++) {
	instructionQuickLookup[imap[ql][0]]=ql;
}


// test
//console.log("Test data: " + TVMLang.imap[1]);
//console.log("Test data: " + imap[2][0] + "  "+ imap[2][1] + "  "+ imap[2][2] + "  "+ imap[2][3] + "  ");
