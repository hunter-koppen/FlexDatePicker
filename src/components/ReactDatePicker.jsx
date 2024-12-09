import React, { Component, createElement } from "react";
import { Alert } from "./Alert";
import DatePicker from "react-datepicker";
import { setHours, setMinutes, parse } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
const now = new Date();

export class ReactDatePicker extends Component {
    constructor(props) {
        super(props);
        this.nodeRef = React.createRef();
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
        invalidDate: false
    };

    componentDidMount() {
        this.setParentClasses();

        let firstDayOfTheWeek = mx.session.sessionData.locale.firstDayOfWeek;
        if (this.props.overwriteFirstDay && this.props.firstDayOfTheWeek >= 0 && this.props.firstDayOfTheWeek <= 6) {
            firstDayOfTheWeek = this.props.firstDayOfTheWeek;
        }

        let minimalDaysInFirstWeek = mx.session.sessionData.locale.minimalDaysInFirstWeek;
        if (
            this.props.overwriteMinimalDays &&
            this.props.minimalDaysInFirstWeek >= 0 &&
            this.props.minimalDaysInFirstWeek <= 6
        ) {
            minimalDaysInFirstWeek = this.props.minimalDaysInFirstWeek;
        }

        const eras = mx.session.sessionData.locale.dates.eras;
        const quarters = ["1", "2", "3", "4"];
        const months = mx.session.sessionData.locale.dates.months;
        const days = mx.session.sessionData.locale.dates.shortWeekdays;
        const dayPeriods = mx.session.sessionData.locale.dates.dayPeriods;
        const locale = {
            localize: {
                era: n => eras[n],
                quarter: n => quarters[n],
                month: n => months[n],
                day: n => days[n],
                dayPeriod: n => dayPeriods[n]
            },
            formatLong: {
                date: () => mx.session.sessionData.locale.patterns.date
            },
            match: {},
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
            locale,
            dateFormat,
            timeFormat
        });
    }

    componentDidUpdate(prevProps) {
        this.setParentClasses();

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
            const minTime = setHours(setMinutes(now, minTimeString.substring(3, 5)), minTimeString.substring(0, 2));
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
    }

    onChangeRaw = newDate => {
        if (newDate.type === "click") {
            // Event was triggered by clicking in the picker, ignore it
            return;
        }
        const { dateFormat } = this.state;
        const parsedDate = parse(newDate.target ? newDate.target.value : newDate, dateFormat, new Date());

        if (!isNaN(parsedDate)) {
            if (this.props.dateRange) {
                if (this.props.pickerType === "time" || this.props.pickerType === "datetime") {
                    console.error("cannot use date range and time picker at the same time");
                } else {
                    if (newDate.target && newDate.target.value === "") {
                        this.props.dateAttribute.setValue(undefined);
                        this.props.dateAttributeEnd.setValue(undefined);
                    } else {
                        const [newDateStart, newDateEnd] = newDate;
                        this.setState({
                            dateValueStart: newDateStart,
                            dateValueEnd: newDateEnd,
                            editedValueStart: newDateStart,
                            editedValueEnd: newDateEnd
                        });
                        if (newDateStart === null && this.props.dateAttribute !== undefined) {
                            this.props.dateAttribute.setValue(undefined);
                        } else if (this.props.dateAttribute !== newDateStart) {
                            this.props.dateAttribute.setValue(newDateStart);
                        }
                        if (newDateEnd === null && this.props.dateAttributeEnd !== undefined) {
                            this.props.dateAttributeEnd.setValue(undefined);
                        } else if (this.props.dateAttributeEnd !== newDateEnd) {
                            this.props.dateAttributeEnd.setValue(newDateEnd);
                        }
                    }
                }
            } else {
                this.setState({ dateValueStart: parsedDate, editedValueStart: parsedDate });
                if (newDate.target && newDate.target.value === "" && this.props.dateAttribute !== undefined) {
                    this.props.dateAttribute.setValue(undefined);
                } else if (this.props.dateAttribute !== parsedDate) {
                    this.props.dateAttribute.setValue(parsedDate);
                }
            }
        } else {
            if (this.props.dateRange) {
                this.props.dateAttribute.setValue(undefined);
                this.props.dateAttributeEnd.setValue(undefined);
            } else {
                this.props.dateAttribute.setValue(undefined);
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
            } else if (this.props.dateAttributeEnd !== end) {
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
        if (!this.props.dateRange) {
            this.setState({ open: false });
        }
    };

    onBlur = () => {
        const inputField = this.nodeRef.current.querySelector(".form-control");
        const { dateFormat } = this.state;
        const parsedDate = parse(inputField.value, dateFormat, new Date());

        if (this.props.dateRange) {
            const [start, end] = inputField.value.split(" - ");
            const parsedStartDate = start ? parse(start, dateFormat, new Date()) : '';
            const parsedEndDate = end ? parse(end, dateFormat, new Date()) : '';

            if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
                this.setState({ invalidDate: true });
            } else {
                this.setState({ invalidDate: false });
            }
        } else {
            if (isNaN(parsedDate) && inputField.value.trim() !== "") {
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

                    if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
                        this.setState({ dateValueStart: now, dateValueEnd: now }, () => {
                            this.setState({ dateValueStart: null, dateValueEnd: null });
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
            this.setState({ open: !this.state.open });
        }
    };

    setParentClasses = () => {
        if (this.nodeRef.current) {
            const parentNode = this.nodeRef.current.parentNode;
            parentNode.classList.add("mx-datepicker");
            if (this.state.invalidDate || this.state.validationFeedback) {
                parentNode.classList.add("has-error");
            } else {
                parentNode.classList.remove("has-error");
            }
        }
    };

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
                    className="form-control"
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
                    showMonthYearPicker={this.props.pickerType === "month"}
                    showYearPicker={this.props.pickerType === "year"}
                    disabledKeyboardNavigation={true}
                    portalId="root-portal"
                    isClearable={this.props.clearable}
                    inline={this.props.inline}
                />
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
