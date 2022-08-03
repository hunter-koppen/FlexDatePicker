import { Component, createElement } from "react";

import { DatePickerContainer } from "./components/DatePickerContainer";
import "./ui/ReactDatePicker.css";

export class ReactDatePicker extends Component {
    onEnterHandler = this.onEnter.bind(this);
    onLeaveHandler = this.onLeave.bind(this);

    componentDidMount() {
        if (this.props.required) {
            this.props.dateAttribute.setValidator(this.validator);
        }
    }

    render() {
        return (
            <DatePickerContainer
                dateAttribute={this.props.dateAttribute}
                dateAttributeEnd={this.props.dateAttributeEnd}
                showWeekNumbers={this.props.showWeekNumbers}
                placeholder={this.props.placeholder}
                dateRange={this.props.dateRange}
                onEnterAction={this.onEnterHandler}
                onLeaveAction={this.onLeaveHandler}
                minDate={this.props.minDate}
                maxDate={this.props.maxDate}
            />
        );
    }

    onEnter() {
        if (this.props.onEnterAction && this.props.onEnterAction.canExecute) {
            this.props.onEnterAction.execute();
        }

    }

    onLeave(initialvalue, currentvalue) {
        if (this.props.onLeaveAction && this.props.onLeaveAction.canExecute) {
            this.props.onLeaveAction.execute();
        }
        this.onChange(initialvalue, currentvalue);
    }

    onChange(initialvalue, currentvalue) {
        if (this.props.onChangeAction && this.props.onChangeAction.canExecute) {
            if (initialvalue !== currentvalue) {
                this.props.onChangeAction.execute();
            }
        }
    }

    validator = value => {
        const { requiredMessage } = this.props;
        if (requiredMessage && requiredMessage.value && !value) {
            return requiredMessage.value;
        }
        return;
    };
}
