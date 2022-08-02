import React, { Component, createElement } from "react";
import { Alert } from "./Alert";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
const nodeRef = React.createRef();

export class DatePickerContainer extends Component {
    state = {
        dateValueStart: null,
        dateValueStartInitial: null,
        dateValueEnd: null,
        dateValueEndInitial: null,
        editedValueStart: null,
        editedValueEnd: null,
        placeholder: null,
        firstDayOfWeek: null,
        locale: null,
        open: false,
        dateFormat: null,
        readOnly: false,
        validationFeedback: null,
        minDate: null,
        maxDate: null
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

        this.setState({
            firstDayOfWeek: mx.session.sessionData.locale.firstDayOfWeek,
            locale: locale,
            dateFormat: mx.session.sessionData.locale.patterns.date
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
            }
        }
        if (this.props.dateAttribute && this.props.dateAttribute.status === "available") {
            // set initial values, the end initial is set but not used if there is no range
            if (this.state.dateValueStartInitial === null) {
                this.setState({
                    dateValueStartInitial: this.props.dateAttribute.value,
                    dateValueEndInitial: this.props.dateAttributeEnd.value,
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
            if (this.state.placeholder !== this.state.dateFormat) {
                this.setState({ placeholder: this.state.dateFormat });
            }
        }

        // set min and max date
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
    }

    onChange = newDate => {
        if (this.props.dateRange) {
            const [newDateStart, newDateEnd] = newDate;
            this.setState({
                dateValueStart: newDateStart,
                dateValueEnd: newDateEnd,
                editedValueStart: newDateStart,
                editedValueEnd: newDateEnd
            });
            // Mendix will error if you try to push null into the datevalue
            if (newDateStart === null) {
                this.props.dateAttribute.setValue(undefined);
            } else {
                this.props.dateAttribute.setValue(newDateStart);
            }
            if (newDateEnd === null) {
                this.props.dateAttributeEnd.setValue(undefined);
            } else {
                this.props.dateAttributeEnd.setValue(newDateEnd);
            }
        } else {
            this.setState({ dateValueStart: newDate, editedValueStart: newDate });
            if (newDate === null) {
                this.props.dateAttribute.setValue(undefined);
            } else {
                this.props.dateAttribute.setValue(newDate);
            }
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
                    selected={this.state.dateValueStart}
                    selectsRange={this.props.dateRange}
                    startDate={this.state.dateValueStart}
                    endDate={this.state.dateValueEnd}
                    onChange={this.onChange}
                    showWeekNumbers={this.props.showWeekNumbers}
                    placeholderText={this.state.placeholder}
                    calendarStartDay={this.state.firstDayOfWeek}
                    locale={this.state.locale}
                    showPopperArrow={false}
                    onClickOutside={this.togglePicker}
                    open={this.state.open}
                    className="form-control"
                    dateFormat={this.state.dateFormat}
                    dateFormatCalendar="MMMM"
                    showYearDropdown={true}
                    showMonthDropdown={true}
                    dropdownMode="select"
                    readOnly={this.state.readOnly}
                    disabled={this.state.readOnly}
                    minDate={this.state.minDate}
                    maxDate={this.state.maxDate}
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
