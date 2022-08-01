import { Component, createElement } from "react";

import { DatePickerContainer } from "./components/DatePickerContainer";
import "./ui/ReactDatePicker.css";

export class ReactDatePicker extends Component {
    render() {
        return (
            <DatePickerContainer
                dateAttribute={this.props.dateAttribute}
                showWeekNumbers={this.props.showWeekNumbers}
                placeholder={this.props.placeholder}
            />
        );
    }
}
