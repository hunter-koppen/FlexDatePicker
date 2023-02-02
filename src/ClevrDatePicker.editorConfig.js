import { hidePropertyIn } from "@mendix/pluggable-widgets-tools";

export function getProperties(values, defaultProperties) {
    if (values.dateRange === false) {
        hidePropertyIn(defaultProperties, values, "dateAttributeEnd");
    }
    if (values.required === false) {
        hidePropertyIn(defaultProperties, values, "requiredMessage");
    }
    if (values.overwriteFirstDay === false) {
        hidePropertyIn(defaultProperties, values, "firstDayOfTheWeek");
    }
    if (values.overwriteMinimalDays === false) {
        hidePropertyIn(defaultProperties, values, "minimalDaysInFirstWeek");
    }
    if (values.excludeOrInclude === "exclude") {
        hidePropertyIn(defaultProperties, values, "includedDates");
        hidePropertyIn(defaultProperties, values, "includedDatesAttribute");
    } else if (values.excludeOrInclude === "include") {
        hidePropertyIn(defaultProperties, values, "excludedDates");
        hidePropertyIn(defaultProperties, values, "excludedDatesAttribute");
        hidePropertyIn(defaultProperties, values, "highlightExcludedDays");
    } else {
        hidePropertyIn(defaultProperties, values, "includedDates");
        hidePropertyIn(defaultProperties, values, "includedDatesAttribute");
        hidePropertyIn(defaultProperties, values, "excludedDates");
        hidePropertyIn(defaultProperties, values, "excludedDatesAttribute");
        hidePropertyIn(defaultProperties, values, "highlightExcludedDays");
    }
    return defaultProperties;
}

export function check(values) {
    const errors = [];
    // Add errors to the above array to throw errors in Studio and Studio Pro.
    /* Example
    if (values.myProperty !== "custom") {
        errors.push({
            property: `myProperty`,
            message: `The value of 'myProperty' is different of 'custom'.`,
            url: "https://github.com/myrepo/mywidget"
        });
    }
    */
    return errors;
}
