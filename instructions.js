// instructions.js


// INSTRUCTIONS
var MOVB_R1 = 1;	// move next byte to register r1
var MOVB_R2 = 2;
var MOVB_R3 = 3;
var MOVW_R1 = 4;	// move next word to register.
var MOVW_R2 = 5;
var MOVW_R3 = 6;
var MOV_R1_R2 = 10;	// move reg to reg.
var MOV_R1_R3 = 11;
var MOV_R2_R1 = 12;
var MOV_R2_R3 = 13;
var MOV_R3_R1 = 14;
var MOV_R3_R2 = 15;

var MOV_AW_R1 = 16;		// Move r1 to word address
var MOV_AW_R2 = 17;
var MOV_AW_R3 = 18;


var CMP_R1_R2 = 30;		// compare registers
var CMP_R1_R3 = 31;
var CMP_R2_R1 = 32;
var CMP_R2_R3 = 33;
var CMP_R3_R1 = 34;
var CMP_R3_R2 = 35;
var INC_R1 = 20;		// Incriment
var INC_R2 = 21;
var INC_R3 = 22;
var DEC_R1 = 23;		// Incriment
var DEC_R2 = 24;
var DEC_R3 = 25;
var JMPW = 40;			// Jump to next word.
var JMPEQ = 41;			// jump on equals
var PUSHB_R1 = 50;
var PUSHB_R2 = 51;
var PUSHB_R3 = 52;
var PUSHW_R1 = 53;
var PUSHW_R2 = 54;
var PUSHW_R3 = 55;
var POPB_R1 = 56;
var POPB_R2 = 57;
var POPB_R3 = 58;
var POPW_R1 = 59;
var POPW_R2 = 60;
var POPW_R3 = 61;
var ADD_R1_R2 = 70;		// ADD : R1 = R1 + R2
var ADD_R1_R3 = 71;
var ADD_R2_R1 = 72;
var ADD_R2_R3 = 73;
var ADD_R3_R1 = 74;
var ADD_R3_R2 = 75;

// Target and source selectors for setTarget(..) and getSource(..)
var TR1 = 0;	// Target R1
var TR2 = 1;
var TR3 = 2;
var TAR1B = 3;	// Byte Address at R1
var TAR2B = 4;
var TAR3B = 5;
var TAR1W = 6;	// Word Address at R1
var TAR2W = 7;
var TAR3W = 8;
var TPC = 9;	// Program counter.
var TSP = 10;	// Stack pointer
var TFL = 11;	// Flags
var TAB = 12;	// Byte address
var TAW = 13;	// Word address
var TBY = 14;
var TWO = 15;
//
var SR1 = 0;	// Source R1
var SR2 = 1;	// Source R2
var SR3 = 2;	// Source R3
var SAR1B = 3;	// Byte Address at R1
var SAR2B = 4;
var SAR3B = 5;
var SAR1W = 6;	// Word Address at R1
var SAR2W = 7;
var SAR3W = 8;
var SNB = 111;	// Source next byte
var SNW = 112;	// Source next word

// Instruction map main type codes.
var MOV= 1;
var CMP = 2;
var INC = 5;
var DEC = 6;
var JMP = 7;
var PUB = 8;
var PUW = 9;
var POB = 10;
var POW = 11;
var ADD = 12;
// TODO: Maths: ADD, SUB, MUL
// SYS (system call)
// binary logic


// 	ID				Type	oprnd1	oprnd2
var instructionMap =
[	[MOVB_R1,		MOV,	TR1,	SNB],	// Move next byte into register.
	[MOVB_R2,		MOV,	TR2,	SNB],
	[MOVB_R3,		MOV,	TR3,	SNB],
	[MOVW_R1,		MOV,	TR1,	SNW],	// Move next word into register.
	[MOVW_R2,		MOV,	TR2,	SNW],
	[MOVW_R3,		MOV,	TR3,	SNW],
	//
	[MOV_R1_R2,		MOV,	TR1,	SR2],	// Move reg to reg.
	[MOV_R1_R3,		MOV,	TR1,	SR3],
	[MOV_R2_R1,		MOV,	TR2,	SR1],
	[MOV_R2_R3,		MOV,	TR2,	SR3],
	[MOV_R3_R1,		MOV,	TR3,	SR1],
	[MOV_R3_R2,		MOV,	TR3,	SR2],
	//
	[MOV_AW_R1,		MOV,	TAW,	SR1],	// Move r1 to word address
	[MOV_AW_R2,		MOV,	TAW,	SR2],
	[MOV_AW_R3,		MOV,	TAW,	SR3],
	//
	[CMP_R1_R2,		CMP,	SR1,	SR2],	// Compare registers.
	[CMP_R1_R3,		CMP,	SR1,	SR3],
	[CMP_R2_R1,		CMP,	SR2,	SR1],
	[CMP_R2_R3,		CMP,	SR2,	SR3],
	[CMP_R3_R1,		CMP,	SR3,	SR1],
	[CMP_R3_R2,		CMP,	SR3,	SR2],
	//
	[INC_R1,		INC,	TR1,	null],	// Incriment
	[INC_R2,		INC,	TR2,	null],
	[INC_R3,		INC,	TR3,	null],
	[DEC_R1,		DEC,	TR1,	null],	// Decriment
	[DEC_R2,		DEC,	TR2,	null],
	[DEC_R3,		DEC,	TR3,	null],
	//
	[JMPW,			JMP,	SNW,	null],
	[JMPEQ,			JMP,	SNW,	null],
	//
	[PUSHB_R1,		PUB,	SR1,	null],	// Push register Byte to stack
	[PUSHB_R2,		PUB,	SR2,	null],
	[PUSHB_R3,		PUB,	SR3,	null],
	[PUSHW_R1,		PUW,	SR1,	null],	// Push register Word to stack
	[PUSHW_R2,		PUW,	SR2,	null],
	[PUSHW_R3,		PUW,	SR3,	null],
	[POPB_R1,		POB,	TR1,	null],
	[POPB_R2,		POB,	TR2,	null],
	[POPB_R3,		POB,	TR3,	null],
	[POPW_R1,		POW,	TR1,	null],
	[POPW_R2,		POW,	TR2,	null],
	[POPW_R3,		POW,	TR3,	null],
	[ADD_R1_R2,		ADD,	TR1,	SR2],	// ADD : R1 = R1 + R2
	[ADD_R1_R3,		ADD,	TR1,	SR3],
	[ADD_R2_R1,		ADD,	TR2,	SR1],
	[ADD_R2_R3,		ADD,	TR2,	SR3],
	[ADD_R3_R1,		ADD,	TR3,	SR1],
	[ADD_R3_R2,		ADD,	TR3,	SR2],
];
