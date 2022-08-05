import React, { Component, createElement } from "react";
import { Alert } from "./Alert";

import DatePicker from "react-datepicker";
import { setHours, setMinutes } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
const nodeRef = React.createRef();
const now = new Date();

export class ReactDatePicker extends Component {
    state = {
        dateValueStart: null,
        dateValueStartInitial: null,
        dateValueEnd: null,
        dateValueEndInitial: null,
        editedValueStart: null,
        editedValueEnd: null,
        placeholder: null,
        firstDayOfTheWeek: null,
        locale: null,
        open: false,
        dateFormat: null,
        timeFormat: null,
        readOnly: false,
        validationFeedback: null,
        minDate: null,
        maxDate: null,
        minTime: setHours(setMinutes(now, 0), 0),
        maxTime: setHours(setMinutes(now, 59), 23),
        timeTranslation: null
    };

    componentDidMount() {
        const parentNode = nodeRef.current.parentNode;
        parentNode.classList.add("mx-datepicker");

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
            match: {}
        };

        let dateFormat = null;
        let timeFormat = null;
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

        let firstDayOfTheWeek = mx.session.sessionData.locale.firstDayOfWeek;
        if (this.props.overwriteFirstDay && this.props.firstDayOfTheWeek >= 0 && this.props.firstDayOfTheWeek <= 6) {
            firstDayOfTheWeek = this.props.firstDayOfTheWeek;
        }

        this.setState({
            firstDayOfTheWeek,
            locale,
            dateFormat,
            timeFormat
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.dateRange) {
            if (this.props.dateAttributeEnd && this.props.dateAttributeEnd.status === "available") {
                // update date end value if prop is different from widget, only needed if we use daterange
                if (
                    prevProps.dateAttributeEnd !== this.props.dateAttributeEnd &&
                    this.props.dateAttributeEnd !== this.state.editedValueEnd
                ) {
                    this.setState({ dateValueEnd: this.props.dateAttributeEnd.value });
                }
                if (this.state.dateValueEndInitial === null) {
                    this.setState({
                        dateValueEndInitial: this.props.dateAttributeEnd.value
                    });
                }
            }
        }
        if (this.props.dateAttribute && this.props.dateAttribute.status === "available") {
            // set initial values, the end initial is set but not used if there is no range
            if (this.state.dateValueStartInitial === null) {
                this.setState({
                    dateValueStartInitial: this.props.dateAttribute.value,
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
                this.setState({ dateValueStart: this.props.dateAttribute.value });
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
        if (this.props.maxDate && this.props.maxDate.status === "available") {
            if (this.state.maxDate !== this.props.maxDate.value) {
                this.setState({ maxDate: this.props.maxDate.value });
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

    onChange = newDate => {
        if (this.props.dateRange) {
            if (this.props.pickerType === "time" || this.props.pickerType === "datetime") {
                console.error("cannot use date range and time picker at the same time");
            } else {
                const [newDateStart, newDateEnd] = newDate;
                this.setState({
                    dateValueStart: newDateStart,
                    dateValueEnd: newDateEnd,
                    editedValueStart: newDateStart,
                    editedValueEnd: newDateEnd
                });
                // Mendix will error if you try to push null into the datevalue
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
        } else {
            this.setState({ dateValueStart: newDate, editedValueStart: newDate });
            if (newDate === null && this.props.dateAttribute !== undefined) {
                this.props.dateAttribute.setValue(undefined);
            } else if (this.props.dateAttribute !== newDate) {
                this.props.dateAttribute.setValue(newDate);
            }
        }
    };

    onSelect = () => {
        if (!this.props.dateRange) {
            this.setState({ open: false });
        }
    };

    onBlur = () => {
        // provide the initial and current values for the Mendix OnChange action
        this.props.onLeaveAction(this.state.dateValueStartInitial, this.state.dateValueStart);
    };

    togglePicker = () => {
        if (this.state.readOnly === false) {
            this.setState({ open: !this.state.open });
        }
    };

    render() {
        return (
            <div className="mx-compound-control" onFocus={this.props.onEnterAction} onBlur={this.onBlur} ref={nodeRef}>
                <DatePicker
                    tabIndex={this.props.tabIndex}
                    selected={this.state.dateValueStart}
                    selectsRange={this.props.dateRange}
                    startDate={this.state.dateValueStart}
                    endDate={this.state.dateValueEnd}
                    onChange={this.onChange}
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
                />
                <button
                    type="button"
                    className="btn mx-button"
                    tabIndex={-1}
                    disabled={this.state.readOnly}
                    onClick={this.togglePicker}
                >
                    <span className="glyphicon glyphicon-calendar"></span>
                </button>
                <Alert
                    bootstrapStyle={"danger"}
                    message={this.state.validationFeedback}
                    className={"mx-validation-message"}
                >
                    {this.state.validationFeedback}
                </Alert>
            </div>
        );
    }
}
