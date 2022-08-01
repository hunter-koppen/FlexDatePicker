import { Component, createElement } from "react";
import moment_ from "moment";
const moment = moment_;

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export class DatePickerContainer extends Component {
    state = {
        dateValue: null,
        dateValueInitial: null,
        editedvalue: null,
        placeholder: null,
        firstDayOfWeek: null,
        locale: null,
        open: false,
        dateFormat: null
    };

    componentDidMount() {
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
        if (this.props.dateAttribute && this.props.dateAttribute.status === "available") {
            if (this.state.dateValueInitial === null) {
                this.setState({ dateValueInitial: this.props.dateAttribute.value });
            }
            if (
                prevProps.dateAttribute !== this.props.dateAttribute &&
                this.props.dateAttribute !== this.state.editedvalue
            ) {
                this.setState({ dateValue: this.props.dateAttribute.value });
            }
        }
        if (this.props.placeholder && this.props.placeholder.status === "available") {
            if (this.state.placeholder !== this.props.placeholder.value) {
                this.setState({ placeholder: this.props.placeholder.value });
            }
        } else if (!this.props.placeholder) {
            if (this.state.placeholder !== this.state.dateFormat) {
                this.setState({ placeholder: this.state.dateFormat });
            }
        }
    }

    onChange = newDate => {
        this.setState({ dateValue: newDate, editedvalue: newDate });
        if (this.isDate(newDate) === true) {
            this.props.dateAttribute.setValue(newDate);
        }
    };

    onBlur = () => {
        this.props.onLeaveAction(this.state.dateValueInitial, this.state.dateValue);
    };

    togglePicker = () => {
        this.setState({ open: !this.state.open });
    };

    isDate = date => {
        return moment(date, this.state.dateFormat, true).isValid();
    };

    render() {
        return (
            <div className="mx-compound-control" onFocus={this.props.onEnterAction} onBlur={this.onBlur}>
                <DatePicker
                    selected={this.state.dateValue}
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
                />
                <button type="button" class="btn mx-button" tabindex="-1" onClick={this.togglePicker}>
                    <span class="glyphicon glyphicon-calendar"></span>
                </button>
            </div>
        );
    }
}
