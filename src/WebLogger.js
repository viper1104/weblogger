import ms from 'ms';
import ReactDOM from 'react-dom';
import React from 'react';
import randomColor from 'randomcolor';
import EventEmitter from 'events';
import LogFilter from './view/LogFilter';
import LogLevel from './enum/LogLevel';
import LoggerEvent from './enum/LoggerEvent';

export default class WebLogger extends EventEmitter {

	constructor(opt = {}) {
		super();
		const {nameSpaces = [], storageKey = 'web-logger', disabledColors = false, defaultLogLevel = LogLevel.ERROR} = opt;

		this._storageKey = storageKey;
		this._defaultLogLevel = defaultLogLevel;
		this._console = this.createConsole();
		this._nameSpaces = nameSpaces;
		this._logLevels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
		this._currentLogLevels = {};
		this._numberSelectedRows = {};
		this._numberSelectedAllRows = 0;

		this._logLevelColors = {
			[LogLevel.DEBUG]: '#888888',
			[LogLevel.INFO]: '#000',
			[LogLevel.WARN]: '#cc8f27',
			[LogLevel.ERROR]: '#f00',
		};
		this._disabledColors = disabledColors || typeof navigator !== 'undefined' && navigator.userAgent
			&& navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/);
		this._colors = {};
		this._times = {};

		this.init();
	}

	error(...args) {
		const nameSpace = args.shift();
		if (this.isLogLevelSet(nameSpace, LogLevel.ERROR)) {
			args = this.decorate(nameSpace, args, LogLevel.ERROR);
			this._console.error(...args);
		}
	}

	warn(...args) {
		const nameSpace = args.shift();
		if (this.isLogLevelSet(nameSpace, LogLevel.WARN)) {
			args = this.decorate(nameSpace, args, LogLevel.WARN);
			this._console.warn(...args);
		}
	}

	info(...args) {
		const nameSpace = args.shift();
		if (this.isLogLevelSet(nameSpace, LogLevel.INFO)) {
			args = this.decorate(nameSpace, args, LogLevel.INFO);
			this._console.info(...args);
		}
	}

	debug(...args) {
		const nameSpace = args.shift();
		if (this.isLogLevelSet(nameSpace, LogLevel.DEBUG)) {
			args = this.decorate(nameSpace, args, LogLevel.DEBUG);
			this._console.debug(...args);
		}
	}

	//------------------------------------------------------------------------------------------------------------------

	decorate(nameSpace, args, logLevel) {
		const color = this._colors[nameSpace];
		const prevTime = this._times[nameSpace + logLevel];
		const curr = +new Date();
		const diff = curr - (prevTime || curr);
		this._times[nameSpace + logLevel] = curr;
		const timeStr = `+${ms(diff)}`;
		if (this._disabledColors) {
			return [`${nameSpace}`, ...args, timeStr];
		}
		const colorStr = `font-weight:bold;color:${color};`;
		const textColorStr = `font-weight:normal;color:${this._logLevelColors[logLevel]};`;
		let template = '%c%s %c';
		template = args.reduce((prev, current) => {
			let format = '%O ';
			if (typeof current === 'string' || typeof current === 'number') {
				format = '%s ';
			}
			return prev + format;
		}, template);
		template += ' %c%s';
		return [template, colorStr, nameSpace, textColorStr, ...args, colorStr, timeStr];
	}

	//------------------------------------------------------------------------------------------------------------------

	toggleValue(data) {
		const {nameSpace, logLevel} = data;
		let currentLogLevel = this._currentLogLevels[nameSpace];

		if (nameSpace === -1) {
			if (logLevel === LogLevel.ALL) {
				//toggle all
				const isSelectedAllRows = this.isSelectedAllRows();
				if (isSelectedAllRows) {
					this._currentLogLevels = {};
				} else {
					this._nameSpaces.forEach((nameSpace) => {
						this._currentLogLevels[nameSpace] = LogLevel.ALL;
					});
				}
			} else {
				//toggle column
				const isSelectedRows = this.isSelectedRows(logLevel);
				this._nameSpaces.forEach((nameSpace) => {
					if (isSelectedRows) {
						this._currentLogLevels[nameSpace] &= ~logLevel;
					} else {
						this._currentLogLevels[nameSpace] |= logLevel;
					}
				});
			}
		} else if (logLevel === LogLevel.ALL) {
			//toggle row
			this._currentLogLevels[nameSpace] = currentLogLevel === logLevel ? LogLevel.NONE : LogLevel.ALL;
		} else {
			//toggle cell
			if (!currentLogLevel) {
				currentLogLevel = logLevel;
			} else {
				currentLogLevel ^= logLevel;
			}
			this._currentLogLevels[nameSpace] = currentLogLevel;
		}
		localStorage.setItem(this._storageKey, JSON.stringify(this._currentLogLevels));

		this.updateSelectedData();

		this.emit(LoggerEvent.CURRENT_LOG_LEVELS_CHANGED);
	}

	showLogFilter() {
		this.emit(LoggerEvent.SHOW_LOG_FILTER);
	}

	hideLogFilter() {
		this.emit(LoggerEvent.HIDE_LOG_FILTER);
	}

	updateColors() {
		const nameSpaces = this._nameSpaces;
		nameSpaces.forEach((nameSpace, index) => {
			this._colors[nameSpace] = randomColor({
				alpha: 1,
				luminosity: 'dark',
				seed: index * 1000,
			});
		});
	}

	updateSelectedData() {
		this._numberSelectedRows = {};
		this._numberSelectedAllRows = 0;

		Object.values(this._currentLogLevels).forEach((currentLogLevel) => {
			if (this.hasFlag(currentLogLevel, LogLevel.ALL)) {
				this._numberSelectedAllRows += 1;
			}
			this._logLevels.forEach((logLevel) => {
				if (this.hasFlag(currentLogLevel, logLevel)) {
					if (!this._numberSelectedRows[logLevel]) {
						this._numberSelectedRows[logLevel] = 0;
					}
					this._numberSelectedRows[logLevel] += 1;
				}
			})
		})
	}

	//------------------------------------------------------------------------------------------------------------------

	init() {
		this._currentLogLevels = {};
		try {
			let logLevels = localStorage.getItem(this._storageKey);
			if (typeof logLevels === 'string') {
				logLevels = JSON.parse(logLevels) || {};
				Object.keys(logLevels).forEach((nameSpace) => {
					const logLevel = logLevels[nameSpace];
					if (this._nameSpaces.indexOf(nameSpace) > -1 && this.hasFlag(LogLevel.ALL, logLevel)) {
						this._currentLogLevels[nameSpace] = logLevel;
					}
				})
			}
		} catch (e) {
			console.error(e);
		}
		for (let i = 0, len = this._nameSpaces.length; i < len; i++) {
			let nameSpace = this._nameSpaces[i];
			if (typeof this._currentLogLevels[nameSpace] === 'undefined') {
				this._currentLogLevels[nameSpace] = this._defaultLogLevel;
			}
		}
		this.updateColors();
		this.updateSelectedData();

		const el = document.createElement('div');
		el.className = 'log-filter';
		el.style.width = '100%';
		el.style.height = '100%';
		el.style.top = '0';
		el.style.left = '0';
		el.style.pointerEvents = 'none';
		el.style.position = 'absolute';
		el.style.zIndex = '1000000';
		document.body.appendChild(el);
		ReactDOM.render(<LogFilter logger={this} />, el);
	}

	hasFlag(currentFlag, flags) {
		return (currentFlag & flags) === flags;
	}

	isLogLevelSet(nameSpace, logLevel, currentLogLevels) {
		if (!currentLogLevels) {
			currentLogLevels = this._currentLogLevels;
		}
		const currentLogLevel = currentLogLevels[nameSpace] || LogLevel.NONE;
		return this.hasFlag(currentLogLevel, logLevel);
	}

	isSelectedRows(logLevel) {
		return this._numberSelectedRows[logLevel] === this._nameSpaces.length;
	}

	isSelectedAllRows() {
		return this._numberSelectedAllRows === this._nameSpaces.length;
	}

	//------------------------------------------------------------------------------------------------------------------

	getNameSpaces() {
		return this._nameSpaces;
	}

	getLogLevels() {
		return this._logLevels;
	}

	getCurrentLogLevels() {
		return this._currentLogLevels;
	}

	getNumberSelectedRows() {
		return this._numberSelectedRows;
	}

	getNumberSelectedAllRows() {
		return this._numberSelectedAllRows;
	}

	//------------------------------------------------------------------------------------------------------------------

	createConsole() {
		return {
			error: (...args) => {
				console.error(...args);
			},

			warn: (...args) => {
				console.warn(...args);
			},

			info: (...args) => {
				console.info(...args);
			},

			debug: (...args) => {
				console.debug(...args);
			}
		};
	}
}
