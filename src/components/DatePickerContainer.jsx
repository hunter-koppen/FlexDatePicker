import { Component, createElement } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

export class DatePickerContainer extends Component {
    state = {
        dateValue: null,
        editedvalue: null
    };

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
    }

    onChange = (newDate) => {
        console.log(newDate);
        this.setState({ dateValue: newDate, editedvalue: newDate });
        this.props.dateAttribute.setValue(newDate);
    };

    render() {
        return <DatePicker selected={this.state.dateValue} onChange={this.onChange} />;
    }
}
