import React, {Component} from 'react';
import classNames from "classnames";
import styles from "../less/logger.less";
import LoggerEvent from '../enum/LoggerEvent';
import LogLevel from '../enum/LogLevel';

export default class LogFilter extends Component {
	
	constructor(props) {
		super(props);
		
		this.state = this.getFirstState();
		
		this.renderRow = this.renderRow.bind(this);
		this.renderHeaderCell = this.renderHeaderCell.bind(this);
		this.handleClosePopup = this.handleClosePopup.bind(this);
		this.onCurrentLogLevelsChanged = this.onCurrentLogLevelsChanged.bind(this);
		this.onShowLogFilter = this.onShowLogFilter.bind(this);
		this.onHideLogFilter = this.onHideLogFilter.bind(this);
	}
	
	getFirstState() {
		return {
			visible: false,
			
			nameSpaces: [-1].concat(this.getLogger().getNameSpaces()),
			logLevels: [LogLevel.ALL].concat(this.getLogger().getLogLevels()),
			currentLogLevels: this.getLogger().getCurrentLogLevels(),
			numberSelectedRows: this.getLogger().getNumberSelectedRows(),
			numberSelectedAllRows: this.getLogger().getNumberSelectedAllRows(),
		}
	}
	
	componentDidMount() {
		const logger = this.getLogger();
		logger.on(LoggerEvent.CURRENT_LOG_LEVELS_CHANGED, this.onCurrentLogLevelsChanged);
		logger.on(LoggerEvent.SHOW_LOG_FILTER, this.onShowLogFilter);
		logger.on(LoggerEvent.HIDE_LOG_FILTER, this.onHideLogFilter);
	}
	
	componentWillUnmount() {
		const logger = this.getLogger();
		logger.removeListener(LoggerEvent.CURRENT_LOG_LEVELS_CHANGED, this.onCurrentLogLevelsChanged);
		logger.removeListener(LoggerEvent.SHOW_LOG_FILTER, this.onShowLogFilter);
		logger.removeListener(LoggerEvent.HIDE_LOG_FILTER, this.onHideLogFilter);
	}
	
	onCurrentLogLevelsChanged() {
		this.setState({
			currentLogLevels: this.getLogger().getCurrentLogLevels(),
			numberSelectedRows: this.getLogger().getNumberSelectedRows(),
			numberSelectedAllRows: this.getLogger().getNumberSelectedAllRows(),
		});
	}
	
	onShowLogFilter() {
		this.setState({visible: true});
	}
	
	onHideLogFilter() {
		this.setState({visible: false});
	}
	
	//------------------------------------------------------------------------------------------------------------------
	
	handleClosePopup() {
		this.setState({visible: false});
	}
	
	handleToggleValue(data) {
		this.getLogger().toggleValue(data);
	}
	
	//------------------------------------------------------------------------------------------------------------------
	
	getLogger() {
		return this.props.logger;
	}
	
	getLogLevelText(logLevel) {
		switch (logLevel) {
			case LogLevel.ALL:
				return 'all';
			case LogLevel.ERROR:
				return 'error';
			case LogLevel.WARN:
				return 'warn';
			case LogLevel.INFO:
				return 'info';
			case LogLevel.DEBUG:
				return 'debug';
			default:
				return '';
		}
	}
	
	getNameRowText(nameSpace) {
		return nameSpace === -1 ? 'all' : nameSpace;
	}
	
	getNameColText(logLevel) {
		return this.getLogLevelText(logLevel);
	}
	
	getNameColShortText(logLevel) {
		return this.getLogLevelText(logLevel).substr(0, 1).toUpperCase();
	}
	
	isSelectedCheckBox(nameSpace, logLevel) {
		const {currentLogLevels, numberSelectedRows, numberSelectedAllRows, nameSpaces, logLevels} = this.state;
		if (nameSpace === -1) {
			if (logLevel === LogLevel.ALL) {
				return numberSelectedAllRows === nameSpaces.length - 1;
			}
			return numberSelectedRows[logLevel] === nameSpaces.length - 1;
		}
		return this.getLogger().isLogLevelSet(nameSpace, logLevel, currentLogLevels);
	}
	
	//------------------------------------------------------------------------------------------------------------------
	
	renderCheckBox(nameSpace, logLevel, value) {
		return (
			<div className={classNames(styles.checkBox)} onClick={this.handleToggleValue.bind(this, {nameSpace, logLevel})}>
				<div className={classNames(styles.checkBoxValue, {[styles.checkBoxValueActive]: value})} />
			</div>
		)
	}
	
	renderHeaderCell(logLevel) {
		return (
			<div className={classNames(styles.tableCell, styles.tableHeaderCell, styles.colLogLevel)} key={logLevel}>
				<span className={classNames(styles.headColText)}>{this.getNameColText(logLevel)}</span>
				<span className={classNames(styles.headColShortText)}>{this.getNameColShortText(logLevel)}</span>
			</div>
		)
	}
	
	renderHeaderRow() {
		return (
			<div className={classNames(styles.tableRow)}>
				<div className={classNames(styles.tableCell, styles.tableHeaderCell, styles.colName)}>name \ level</div>
				{this.state.logLevels.map(this.renderHeaderCell)}
			</div>
		)
	}
	
	
	renderCell(nameSpace, logLevel) {
		return (
			<div className={classNames(styles.tableCell, styles.colLogLevel)} key={logLevel}>
				{this.renderCheckBox(nameSpace, logLevel, this.isSelectedCheckBox(nameSpace, logLevel))}
			</div>
		)
	}
	
	renderRow(nameSpace) {
		return (
			<div className={styles.tableRow} key={nameSpace}>
				<div className={classNames(styles.tableCell, styles.colName)}>{this.getNameRowText(nameSpace)}</div>
				{this.state.logLevels.map(this.renderCell.bind(this, nameSpace))}
			</div>
		)
	}
	
	renderTableHeader() {
		return (
			<div className={styles.table}>
				{this.renderHeaderRow()}
			</div>
		)
	}
	
	renderTable() {
		return (
			<div className={styles.table}>
				{this.state.nameSpaces.map(this.renderRow)}
			</div>
		)
	}
	
	closeButton() {
		return (
			<div className={styles.closeButton} onClick={this.handleClosePopup}>
				X
			</div>
		)
	}
	
	renderTitle() {
		return (
			<div className={styles.title}>
				LOGGER
			</div>
		)
	}
	
	renderPopup() {
		return (
			<div className={styles.loggerPopup}>
				{this.renderTitle()}
				{this.renderTableHeader()}
				<div className={styles.tableBlock}>
					{this.renderTable()}
				</div>
				{this.closeButton()}
			</div>
		)
	}
	
	render() {
		return (
			<div className={styles.loggerSettings}>
				{this.state.visible ? this.renderPopup() : null}
			</div>
		);
	}
}