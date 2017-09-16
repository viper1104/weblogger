const LogLevel = {
	NONE: 0,
	ERROR: 1,
	WARN: 2,
	INFO: 4,
	DEBUG: 8,
};

LogLevel.ALL = LogLevel.ERROR | LogLevel.WARN | LogLevel.INFO | LogLevel.DEBUG;

export default LogLevel;