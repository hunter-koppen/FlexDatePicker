import React, { Component, createElement } from "react";
import { Alert } from "./Alert";
import DatePicker from "react-datepicker";
import { parse, setHours, setMinutes, setSeconds } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

import prevIcon from "../ui/arrow-left.svg";
import nextIcon from "../ui/arrow-right.svg";
import arrowIcon from "../ui/arrow-up.svg";
import crossIcon from "../ui/cross-icon.svg";

/* global mx */

const now = new Date();

export class ReactDatePicker extends Component {
    constructor(props) {
        super(props);
        this.nodeRef = React.createRef();
        this.popperRef = React.createRef();
        this.headerRef = React.createRef();
    }

    state = {
        dateValueStart: null,
        dateValueEnd: null,
        editedValueStart: null,
        editedValueEnd: null,
        placeholder: null,
        firstDayOfTheWeek: null,
        locale: null,
        open: false,
        dateFormat: null,
        timeFormat: null,
        readOnly: null,
        validationFeedback: null,
        minDate: null,
        maxDate: null,
        minTime: setHours(setMinutes(now, 0), 0),
        maxTime: setHours(setMinutes(now, 59), 23),
        timeTranslation: null,
        excludedDates: [],
        excludedDatesFound: null,
        includedDates: null,
        includedDatesFound: null,
        invalidDate: false,
        showMonthPicker: false,
        showYearPicker: false
    };

    componentDidMount() {
        this.setClasses();

        const firstDayOfTheWeek = mx.session.sessionData.locale.firstDayOfWeek;
        const minimalDaysInFirstWeek = mx.session.sessionData.locale.minimalDaysInFirstWeek;
        const eras = mx.session.sessionData.locale.dates.eras;
        const quarters = ["1", "2", "3", "4"];
        const months = mx.session.sessionData.locale.dates.months;
        const shortMonths = mx.session.sessionData.locale.dates.shortMonths;
        const days = mx.session.sessionData.locale.dates.shortWeekdays;
        const dayPeriods = mx.session.sessionData.locale.dates.dayPeriods;

        const customLocale = {
            localize: {
                era: n => eras[n],
                quarter: n => quarters[n],
                month: n => months[n],
                shortMonth: n => shortMonths[n],
                day: n => days[n],
                dayPeriod: n => dayPeriods[n]
            },
            formatLong: {
                date: () => mx.session.sessionData.locale.patterns.date,
                dateTime: () => mx.session.sessionData.locale.patterns.datetime,
                time: () => mx.session.sessionData.locale.patterns.time
            },
            match: {
                month: string => {
                    const matchIndex = months.findIndex(month => month.toLowerCase() === string.toLowerCase());
                    return matchIndex !== -1 ? { value: matchIndex } : null;
                },
                shortMonth: string => {
                    const matchIndex = shortMonths.findIndex(month => month.toLowerCase() === string.toLowerCase());
                    return matchIndex !== -1 ? { value: matchIndex } : null;
                }
            },
            options: {
                weekStartsOn: firstDayOfTheWeek,
                firstWeekContainsDate: minimalDaysInFirstWeek
            }
        };

        let dateFormat = null;
        let timeFormat = null;
        if (this.props.customFormat) {
            dateFormat = this.props.customFormat;
            timeFormat = this.props.customFormat;
        } else {
            switch (this.props.pickerType) {
                case "date":
                    dateFormat = mx.session.sessionData.locale.patterns.date;
                    break;
                case "time":
                    dateFormat = mx.session.sessionData.locale.patterns.time;
                    timeFormat = mx.session.sessionData.locale.patterns.time;
                    break;
                case "datetime":
                    dateFormat = mx.session.sessionData.locale.patterns.datetime;
                    timeFormat = mx.session.sessionData.locale.patterns.time;
                    break;
                case "month":
                    dateFormat = "MMMM";
                    break;
                case "year":
                    dateFormat = "yyyy";
                    break;
                default:
                    dateFormat = mx.session.sessionData.locale.patterns.date;
            }
        }

        this.setState({
            firstDayOfTheWeek,
            locale: customLocale,
            dateFormat,
            timeFormat
        });
    }

    componentDidUpdate(prevProps, prevState) {
        this.setClasses();

        if (this.props.excludeOrInclude === "exclude" && this.props.excludedDates) {
            if (this.props.excludedDates.status === "available") {
                if (
                    prevProps.excludedDates !== this.props.excludedDates &&
                    this.props.excludedDates.items !== this.state.excludedDates
                ) {
                    const sortInstrs = [[this.props.excludedDatesAttribute.id, "asc"]];
                    this.props.excludedDates.setSortOrder(sortInstrs);
                    const excludedDates = this.props.excludedDates.items.map(item => {
                        const dateValue = this.props.excludedDatesAttribute.get(item).value;
                        return dateValue;
                    });
                    this.setState({
                        excludedDates
                    });
                }
            }
        }
        if (this.props.excludeOrInclude === "include" && this.props.includedDates) {
            if (this.props.includedDates.status === "available") {
                if (
                    prevProps.includedDates !== this.props.includedDates &&
                    this.props.includedDates.items !== this.state.includedDates
                ) {
                    const includedDates = this.props.includedDates.items.map(item => {
                        const dateValue = this.props.includedDatesAttribute.get(item).value;
                        return dateValue;
                    });
                    this.setState({
                        includedDates
                    });
                }
            }
        }
        if (this.props.dateRange) {
            if (this.props.dateAttributeEnd && this.props.dateAttributeEnd.status === "available") {
                // update date end value if prop is different from widget, only needed if we use daterange
                if (
                    prevProps.dateAttributeEnd !== this.props.dateAttributeEnd &&
                    this.props.dateAttributeEnd !== this.state.editedValueEnd
                ) {
                    this.setState({ dateValueEnd: this.props.dateAttributeEnd.value });
                }
            }
        }
        if (this.props.dateAttribute && this.props.dateAttribute.status === "available") {
            // set initial values
            if (this.state.readOnly === null) {
                this.setState({
                    dateValueStart: this.props.dateAttribute.value,
                    readOnly: this.props.dateAttribute.readOnly
                });
            }
            // set validation
            if (prevProps.dateAttribute.validation !== this.props.dateAttribute.validation) {
                this.setState({ validationFeedback: this.props.dateAttribute.validation });
            }
            // update date value if prop is different from widget
            if (
                prevProps.dateAttribute !== this.props.dateAttribute &&
                this.props.dateAttribute !== this.state.editedValueStart
            ) {
                if (this.state.excludedDatesFound) {
                    this.setState({
                        dateValueStart: this.props.dateAttribute.value,
                        excludedDatesFound: false,
                        maxDate: null
                    });
                } else {
                    this.setState({ dateValueStart: this.props.dateAttribute.value });
                }
            }
        }

        // set placeholder
        if (this.props.placeholder && this.props.placeholder.status === "available") {
            if (this.state.placeholder !== this.props.placeholder.value) {
                this.setState({ placeholder: this.props.placeholder.value });
            }
        } else if (!this.props.placeholder) {
            const dateFormat = this.state.dateFormat;
            const placeholder = dateFormat.toLowerCase();
            if (this.state.placeholder !== placeholder) {
                this.setState({ placeholder });
            }
        }

        // set min and max date/time
        if (this.props.minDate && this.props.minDate.status === "available") {
            if (this.state.minDate !== this.props.minDate.value) {
                this.setState({ minDate: this.props.minDate.value });
            }
        }

        if (
            this.props.dateRange &&
            this.props.excludeOrInclude === "exclude" &&
            this.state.excludedDates &&
            this.state.dateValueStart &&
            !this.state.dateValueEnd
        ) {
            if (!this.state.excludedDatesFound) {
                for (let i = 0; i < this.state.excludedDates.length; i++) {
                    const date = this.state.excludedDates[i];
                    if (this.state.maxDate) {
                        if (date <= this.state.maxDate && date > this.state.dateValueStart) {
                            this.setState({ maxDate: date, excludedDatesFound: true });
                            break;
                        }
                    } else {
                        if (date > this.state.dateValueStart) {
                            this.setState({ maxDate: date, excludedDatesFound: true });
                            break;
                        }
                    }
                }
            }
        } else if (this.props.maxDate && this.props.maxDate.status === "available") {
            if (this.state.maxDate !== this.props.maxDate.value) {
                this.setState({ maxDate: this.props.maxDate.value, excludedDatesFound: false });
            }
        }
        if (this.props.minTime && this.props.minTime.status === "available") {
            const minTimeString = this.props.minTime.value;
            const minTime = setSeconds(
                setHours(setMinutes(now, minTimeString.substring(3, 5)), minTimeString.substring(0, 2)),
                0
            );
            if (this.state.minTime.getTime() !== minTime.getTime()) {
                this.setState({ minTime });
            }
        }
        if (this.props.maxTime && this.props.maxTime.status === "available") {
            const maxTimeString = this.props.maxTime.value;
            const maxTime = setHours(setMinutes(now, maxTimeString.substring(3, 5)), maxTimeString.substring(0, 2));
            if (this.state.maxTime.getTime() !== maxTime.getTime()) {
                this.setState({ maxTime });
            }
        }

        // set translations
        if (this.props.timeTranslation && this.props.timeTranslation.status === "available") {
            if (this.state.timeTranslation !== this.props.timeTranslation.value) {
                this.setState({ timeTranslation: this.props.timeTranslation.value });
            }
        }

        const openYearPickerOverlay = () => {
            const overlay = this.headerRef.current.querySelector(".flex-datepicker-overlay");
            if (overlay) {
                const overlayContainer = overlay.querySelector(".flex-datepicker-overlay-container");
                overlayContainer.classList.add("open");
                const selectedYearButton = overlay.querySelector(".selected");
                if (selectedYearButton) {
                    const yearPickerHeight = overlay.clientHeight;
                    const buttonHeight = selectedYearButton.clientHeight;
                    const scrollPosition = selectedYearButton.offsetTop - yearPickerHeight / 2 + buttonHeight / 2;
                    overlayContainer.scrollTop = scrollPosition;
                }
            }
        };

        if (this.state.open && this.props.pickerType === "year" && !prevState.open) {
            openYearPickerOverlay();
        } else if (this.state.open && this.state.showYearPicker && !prevState.open) {
            setTimeout(openYearPickerOverlay, 0);
        }
    }

    onChangeRaw = newDate => {
        if (newDate.type === "click") {
            // Event was triggered by clicking in the picker, ignore it
            return;
        }
        const { dateFormat } = this.state;
        const inputValue = newDate.target ? newDate.target.value : newDate;

        if (this.props.dateRange) {
            const [start, end] = inputValue.split(" - ");
            const parsedStartDate = start ? parse(start, dateFormat, new Date()) : NaN;
            const parsedEndDate = end ? parse(end, dateFormat, new Date()) : NaN;

            if (!isNaN(parsedStartDate) && (!end || !isNaN(parsedEndDate))) {
                this.setState({
                    dateValueStart: parsedStartDate,
                    dateValueEnd: end ? parsedEndDate : null,
                    editedValueStart: parsedStartDate,
                    editedValueEnd: end ? parsedEndDate : null,
                    invalidDate: false
                });
                if (this.props.dateAttribute !== parsedStartDate) {
                    this.props.dateAttribute.setValue(parsedStartDate);
                }
                if (this.props.dateAttributeEnd !== parsedEndDate) {
                    this.props.dateAttributeEnd.setValue(parsedEndDate);
                }
            } else {
                this.setState({ invalidDate: true });
            }
        } else {
            const parsedDate = parse(inputValue, dateFormat, new Date());
            if (!isNaN(parsedDate)) {
                this.setState({
                    dateValueStart: parsedDate,
                    editedValueStart: parsedDate,
                    invalidDate: false
                });
                if (this.props.dateAttribute !== parsedDate) {
                    this.props.dateAttribute.setValue(parsedDate);
                }
            } else {
                this.setState({ invalidDate: true });
            }
        }
    };

    onChange = (date, event) => {
        if (event && event.target && event.target.value) {
            // Event was triggered by typing, ignore it
            return;
        }

        if (this.props.dateRange) {
            const [start, end] = date || [];
            this.setState({
                dateValueStart: start,
                dateValueEnd: end,
                editedValueStart: start,
                editedValueEnd: end,
                invalidDate: false
            });
            if (start === null && this.props.dateAttribute !== undefined) {
                this.props.dateAttribute.setValue(undefined);
            } else if (this.props.dateAttribute !== start) {
                this.props.dateAttribute.setValue(start);
            }
            if (end === null && this.props.dateAttributeEnd !== undefined) {
                this.props.dateAttributeEnd.setValue(undefined);
            } else if (this.props.dateAttributeEnd && this.props.dateAttributeEnd !== end) {
                this.props.dateAttributeEnd.setValue(end);
            }
        } else {
            this.setState({ dateValueStart: date, editedValueStart: date, invalidDate: false });
            if (date === null && this.props.dateAttribute !== undefined) {
                this.props.dateAttribute.setValue(undefined);
            } else if (this.props.dateAttribute !== date) {
                this.props.dateAttribute.setValue(date);
            }
        }
    };

    onSelect = () => {
        if (!this.props.dateRange && this.props.pickerType !== "datetime") {
            this.setState({ open: false });
        }
    };

    onBlur = () => {
        const inputField = this.nodeRef.current.querySelector(".form-control");
        const { dateFormat } = this.state;
        let parsedDate = null;

        if (inputField && inputField.value.trim() !== "") {
            parsedDate = parse(inputField.value, dateFormat, new Date());
        }

        if (this.props.dateRange) {
            const [start, end] = inputField ? inputField.value.split(" - ") : ["", ""];
            const parsedStartDate = start ? parse(start, dateFormat, new Date()) : "";
            const parsedEndDate = end ? parse(end, dateFormat, new Date()) : "";

            if (isNaN(parsedStartDate)) {
                this.setState({ invalidDate: true });
            } else {
                this.setState({ invalidDate: false });
                if (isNaN(parsedEndDate) && end.trim() !== "") {
                    this.setState({ dateValueEnd: null });
                }
            }
        } else {
            if (isNaN(parsedDate) && inputField && inputField.value.trim() !== "") {
                this.setState({ invalidDate: true });
            } else {
                this.setState({ invalidDate: false });
            }
        }

        // use a timeout to make sure the onchange logic has finished
        setTimeout(() => {
            this.props.onLeaveAction();
        }, 200);
    };

    togglePicker = () => {
        if (this.state.readOnly === false && !this.props.inline) {
            const inputField = this.nodeRef.current.querySelector(".form-control");
            const { dateFormat } = this.state;
            if (inputField.value.trim() !== "") {
                // check if the entered date is valid otherwise reset the date
                if (this.props.dateRange) {
                    const [start, end] = inputField.value.split(" - ");
                    const parsedStartDate = start ? parse(start, dateFormat, new Date()) : NaN;
                    const parsedEndDate = end ? parse(end, dateFormat, new Date()) : NaN;

                    if (isNaN(parsedStartDate)) {
                        this.setState({ dateValueStart: now, dateValueEnd: now }, () => {
                            this.setState({ dateValueStart: null, dateValueEnd: null });
                        });
                    } else if (isNaN(parsedEndDate) && end.trim() !== "") {
                        this.setState({ dateValueEnd: now }, () => {
                            this.setState({ dateValueEnd: null });
                        });
                    }
                } else {
                    const parsedDate = parse(inputField.value, dateFormat, new Date());
                    if (isNaN(parsedDate)) {
                        this.setState({ dateValueStart: now, editedValueStart: now }, () => {
                            this.setState({ dateValueStart: null, editedValueStart: null });
                        });
                    }
                }
            }
            this.setState(prevState => ({
                open: !prevState.open,
                showMonthPicker: false,
                showYearPicker: false
            }));
        }
    };

    setClasses = () => {
        if (this.nodeRef.current) {
            const parentNode = this.nodeRef.current.parentNode;
            parentNode.classList.add("mx-datepicker");
            parentNode.classList.add("flex-datepicker");
            if (this.state.invalidDate || this.state.validationFeedback) {
                parentNode.classList.add("has-error");
            } else {
                parentNode.classList.remove("has-error");
            }
            const pickerElement = parentNode.querySelector(".react-datepicker");
            if (pickerElement) {
                pickerElement.classList.remove("react-datepicker");
            }
        }
        if (this.popperRef.current) {
            const pickerElement = this.popperRef.current.querySelector(".react-datepicker");
            if (pickerElement) {
                pickerElement.classList.remove("react-datepicker");
            }
        }
    };

    toggleMonthPicker = () => {
        this.setState(
            prevState => ({
                showMonthPicker: !prevState.showMonthPicker,
                showYearPicker: false
            }),
            () => {
                if (this.state.showMonthPicker) {
                    setTimeout(() => {
                        const overlayContainer = this.headerRef.current.querySelector(
                            ".flex-datepicker-overlay-container"
                        );
                        if (overlayContainer) {
                            overlayContainer.classList.add("open");
                        }
                    }, 0);
                }
            }
        );
    };

    toggleYearPicker = () => {
        this.setState(
            prevState => ({
                showYearPicker: !prevState.showYearPicker,
                showMonthPicker: false
            }),
            () => {
                if (this.state.showYearPicker) {
                    setTimeout(() => {
                        const overlay = this.headerRef.current.querySelector(".flex-datepicker-overlay");
                        if (overlay) {
                            const overlayContainer = overlay.querySelector(".flex-datepicker-overlay-container");
                            overlayContainer.classList.add("open");
                            const selectedYearButton = overlay.querySelector(".selected");
                            if (selectedYearButton) {
                                const yearPickerHeight = overlay.clientHeight;
                                const buttonHeight = selectedYearButton.clientHeight;
                                const scrollPosition =
                                    selectedYearButton.offsetTop - yearPickerHeight / 2 + buttonHeight / 2;
                                overlayContainer.scrollTop = scrollPosition;
                            }
                        }
                    }, 0);
                }
            }
        );
    };

    handleYearChange = (year, date) => {
        const newDate = new Date(date);
        newDate.setFullYear(year);
        this.setState({ dateValueStart: newDate, editedValueStart: newDate }, () => {
            this.onChange(newDate);
            this.togglePicker();
        });
    };

    handlePresetClick = preset => {
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0); // Set to start of the day
        let endDate = new Date();
        endDate.setHours(23, 59, 59, 0); // Set to last second of the day

        // Calculate the offset based on preset type and direction
        const calculateOffset = (date, offset, unit, isEndDate) => {
            const newDate = new Date(date);
            const firstDayOfWeek = mx.session.sessionData.locale.firstDayOfWeek;

            switch (unit) {
                case "days":
                    newDate.setDate(date.getDate() + offset);
                    break;

                case "weeks":
                    if (isEndDate) {
                        // For end date, first move to the start of the target week
                        newDate.setDate(date.getDate() + offset * 7);

                        // Then adjust to the end of that week
                        const currentDay = newDate.getDay();
                        const daysToEnd =
                            firstDayOfWeek > currentDay
                                ? 6 - (7 - (firstDayOfWeek - currentDay))
                                : 6 - (currentDay - firstDayOfWeek);
                        newDate.setDate(newDate.getDate() + daysToEnd);
                    } else {
                        // For start date, move to start of the target week
                        newDate.setDate(date.getDate() + offset * 7);

                        const currentDay = newDate.getDay();
                        const diff =
                            currentDay >= firstDayOfWeek
                                ? currentDay - firstDayOfWeek
                                : 7 - (firstDayOfWeek - currentDay);
                        newDate.setDate(newDate.getDate() - diff);
                    }
                    break;

                case "months":
                    newDate.setMonth(newDate.getMonth() + offset);
                    if (isEndDate) {
                        // For end date, set to last day of month
                        newDate.setMonth(newDate.getMonth() + 1, 0);
                    } else {
                        // For start date, set to first day of month
                        newDate.setDate(1);
                    }
                    break;

                case "years":
                    newDate.setFullYear(newDate.getFullYear() + offset);
                    if (isEndDate) {
                        // Set to December 31st of that year
                        newDate.setMonth(11, 31);
                    } else {
                        // Set to January 1st of that year
                        newDate.setMonth(0, 1);
                    }
                    break;

                default:
                    // Handle default case
                    break;
            }
            return newDate;
        };

        if (this.props.dateRange) {
            startDate = calculateOffset(startDate, preset.presetOffsetStart, preset.presetRange, false);
            endDate = calculateOffset(endDate, preset.presetOffsetEnd, preset.presetRange, true);
            this.onChange([startDate, endDate]);
        } else {
            startDate = calculateOffset(startDate, preset.presetOffsetStart, preset.presetRange, false);
            this.onChange(startDate);
        }

        this.togglePicker();
    };

    renderPresets = () => {
        if (!this.props.presetList || this.props.presetList.length === 0) {
            return null;
        }

        return (
            <div className="flex-datepicker-presets">
                {this.props.presetList.map((preset, index) => (
                    <span
                        key={index}
                        className="flex-datepicker-preset-button"
                        onClick={() => this.handlePresetClick(preset)}
                    >
                        {preset.presetName.value}
                    </span>
                ))}
            </div>
        );
    };

    customHeader = ({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled
    }) => {
        const isYearPicker = this.props.pickerType === "year";
        const showYearPicker = this.state.showYearPicker || isYearPicker;

        return (
            <div className="flex-datepicker-header" ref={this.headerRef}>
                <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="flex-datepicker-arrow">
                    <img src={prevIcon} alt="Previous Month" />
                </button>
                <div>
                    <button
                        onClick={this.toggleMonthPicker}
                        className={`flex-datepicker-header-button ${this.state.showMonthPicker ? "open" : ""}`}
                    >
                        {new Date(date).toLocaleString("default", { month: "long" })}
                        <img src={arrowIcon} alt="Arrow" />
                    </button>
                    <button
                        onClick={this.toggleYearPicker}
                        className={`flex-datepicker-header-button ${showYearPicker ? "open" : ""}`}
                    >
                        {date.getFullYear()}
                        <img src={arrowIcon} alt="Arrow" />
                    </button>
                </div>
                <button onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="flex-datepicker-arrow">
                    <img src={nextIcon} alt="Next Month" />
                </button>
                {this.state.showMonthPicker && (
                    <div className="flex-datepicker-overlay">
                        <div className="flex-datepicker-overlay-container">
                            {Array.from({ length: 12 }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        changeMonth(i);
                                        this.toggleMonthPicker();
                                    }}
                                    className={i === date.getMonth() ? "selected" : ""}
                                >
                                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                                </button>
                            ))}
                        </div>
                        <div className="flex-datepicker-underlay"></div>
                    </div>
                )}
                {showYearPicker && (
                    <div className="flex-datepicker-overlay">
                        <div className="flex-datepicker-overlay-container">
                            {Array.from({ length: 201 }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        changeYear(1900 + i);
                                        if (isYearPicker) {
                                            this.handleYearChange(1900 + i, date);
                                        } else {
                                            this.toggleYearPicker();
                                        }
                                    }}
                                    className={1900 + i === date.getFullYear() ? "selected" : ""}
                                >
                                    {1900 + i}
                                </button>
                            ))}
                        </div>
                        <div className="flex-datepicker-underlay"></div>
                    </div>
                )}
            </div>
        );
    };

    renderPopperContainer = ({ children }) => <div ref={this.popperRef}>{children}</div>;

    renderCalendarContainer = ({ className, children }) => (
        <div className={className}>
            <div className="flex-datepicker-container">
                {this.renderPresets()}
                {children}
            </div>
        </div>
    );

    render() {
        let highlightDates;
        if (this.props.excludeOrInclude === "exclude" && this.props.highlightExcludedDays) {
            highlightDates = [
                { "react-datepicker__excluded": this.state.excludedDates ? this.state.excludedDates : [] }
            ];
        }
        let includedDates;
        if (this.props.excludeOrInclude === "include") {
            if (this.state.includedDates) {
                includedDates = this.state.includedDates;
            } else {
                includedDates = [];
            }
        }
        return (
            <div className="mx-compound-control" onBlur={this.onBlur} ref={this.nodeRef}>
                <DatePicker
                    onInputClick={this.props.onEnterAction}
                    tabIndex={this.props.tabIndex}
                    selected={this.state.dateValueStart}
                    selectsRange={this.props.dateRange}
                    startDate={this.state.dateValueStart}
                    endDate={this.state.dateValueEnd}
                    onChange={this.onChange}
                    onChangeRaw={this.onChangeRaw}
                    onSelect={this.onSelect}
                    showWeekNumbers={this.props.showWeekNumbers}
                    placeholderText={this.state.placeholder}
                    calendarStartDay={this.state.firstDayOfTheWeek}
                    locale={this.state.locale}
                    showPopperArrow={false}
                    onClickOutside={this.togglePicker}
                    open={this.state.open}
                    showYearDropdown={true}
                    showMonthDropdown={true}
                    dropdownMode="select"
                    readOnly={this.state.readOnly}
                    disabled={this.state.readOnly}
                    minDate={this.state.minDate}
                    maxDate={this.state.maxDate}
                    openToDate={this.state.minDate ? this.state.minDate : this.state.dateValueStart}
                    excludeDates={this.state.excludedDates ? this.state.excludedDates : null}
                    includeDates={includedDates}
                    highlightDates={highlightDates}
                    dateFormat={this.state.dateFormat}
                    dateFormatCalendar="MMMM"
                    timeFormat={this.state.timeFormat}
                    timeCaption={this.state.timeTranslation}
                    timeIntervals={this.props.timeInterval}
                    minTime={this.state.minTime}
                    maxTime={this.state.maxTime}
                    showTimeSelect={this.props.pickerType === "time" || this.props.pickerType === "datetime"}
                    showTimeSelectOnly={this.props.pickerType === "time"}
                    showYearPicker={this.props.pickerType === "year"}
                    disabledKeyboardNavigation={true}
                    className="form-control"
                    calendarClassName={
                        this.props.pickerType === "year"
                            ? "flex-datepicker-calendar react-datepicker--year-only"
                            : "flex-datepicker-calendar"
                    }
                    popperClassName="flex-datepicker-popper"
                    popperPlacement={this.props.pickerType === "time" ? "bottom-end" : "bottom-start"}
                    portalId="root-portal"
                    isClearable={false}
                    inline={this.props.inline}
                    renderCustomHeader={props => <this.customHeader {...props} />}
                    popperContainer={this.renderPopperContainer}
                    calendarContainer={this.renderCalendarContainer}
                />
                {!this.props.inline && this.props.clearable && this.state.dateValueStart && (
                    <button type="button" className="flex-datepicker-clear-icon" onClick={() => this.onChange(null)}>
                        <img src={crossIcon} alt="Clear" />
                    </button>
                )}
                {!this.props.inline ? (
                    <button
                        type="button"
                        className="btn mx-button"
                        tabIndex={-1}
                        disabled={this.state.readOnly}
                        onClick={this.togglePicker}
                        onFocus={this.props.onEnterAction}
                    >
                        <span className="glyphicon glyphicon-calendar"></span>
                    </button>
                ) : null}
                <Alert
                    bootstrapStyle={"danger"}
                    message={this.state.invalidDate ? this.props.invalidDateMessage : this.state.validationFeedback}
                    className={"mx-validation-message"}
                >
                    {this.state.invalidDate ? this.props.invalidDateMessage : this.state.validationFeedback}
                </Alert>
            </div>
        );
    }
}
