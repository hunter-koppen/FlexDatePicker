import { Component, createElement } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export class DatePickerContainer extends Component {
    state = {
        dateValue: null,
        editedvalue: null,
        placeholder: null,
        firstDayOfWeek: null,
        locale: null
    };

    componentDidMount() {
        const days = mx.session.sessionData.locale.dates.shortWeekdays;
        const months = mx.session.sessionData.locale.dates.months;
        const locale = {
            localize: {
                day: n => days[n],
                month: n => months[n]
            },
            formatLong: {
                date: () => mx.session.sessionData.locale.patterns.date
            }
        };

        this.setState({
            firstDayOfWeek: mx.session.sessionData.locale.firstDayOfWeek,
            locale: locale
        });
    }

    componentDidUpdate(prevProps) {
        console.log(this.props);
        if (this.props.dateAttribute && this.props.dateAttribute.status === "available") {
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
        }
    }

    onChange = newDate => {
        console.log(newDate);
        this.setState({ dateValue: newDate, editedvalue: newDate });
        this.props.dateAttribute.setValue(newDate);
    };

    render() {
        return (
            <DatePicker
                selected={this.state.dateValue}
                onChange={this.onChange}
                showWeekNumbers={this.props.showWeekNumbers}
                placeholderText={this.state.placeholder}
                calendarStartDay={this.state.firstDayOfWeek}
                locale={this.state.locale}
            />
        );
    }
}
