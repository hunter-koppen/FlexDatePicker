import { Component, createElement } from "react";

import { ReactDatePicker } from "./components/ReactDatePicker";
import "./ui/ReactDatePicker.scss";

export class ClevrDatePicker extends Component {
    onEnterHandler = this.onEnter.bind(this);
    onLeaveHandler = this.onLeave.bind(this);

    componentDidMount() {
        if (this.props.required) {
            this.props.dateAttribute.setValidator(this.validator);
        }
    }

    render() {
        return (
            <ReactDatePicker
                dateAttribute={this.props.dateAttribute}
                dateAttributeEnd={this.props.dateAttributeEnd}
                showWeekNumbers={this.props.showWeekNumbers}
                placeholder={this.props.placeholder}
                dateRange={this.props.dateRange}
                onEnterAction={this.onEnterHandler}
                onLeaveAction={this.onLeaveHandler}
                minDate={this.props.minDate}
                maxDate={this.props.maxDate}
                pickerType={this.props.pickerType}
                overwriteFirstDay={this.props.overwriteFirstDay}
                firstDayOfTheWeek={this.props.firstDayOfTheWeek}
                overwriteMinimalDays={this.props.overwriteMinimalDays}
                minimalDaysInFirstWeek={this.props.minimalDaysInFirstWeek}
                timeTranslation={this.props.timeTranslation}
                timeInterval={this.props.timeInterval}
                minTime={this.props.minTime}
                maxTime={this.props.maxTime}
                customFormat={this.props.customFormat}
                excludedDates={this.props.excludedDates}
                excludedDatesAttribute={this.props.excludedDatesAttribute}
                highlightExcludedDays={this.props.highlightExcludedDays}
                inline={this.props.inline}
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

    // eslint-disable-next-line consistent-return
    validator = value => {
        const { requiredMessage } = this.props;
        if (requiredMessage && requiredMessage.value && !value) {
            return requiredMessage.value;
        }
    };
}
