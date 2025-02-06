import { changePropertyIn, hideNestedPropertiesIn, hidePropertyIn } from "@mendix/pluggable-widgets-tools";

export function getProperties(values, defaultProperties) {
    if (values.dateRange === false) {
        hidePropertyIn(defaultProperties, values, "dateAttributeEnd");
        hidePropertyIn(defaultProperties, values, "onChangeActionEnd");
        values.presetList.forEach((preset, index) =>
            hideNestedPropertiesIn(defaultProperties, values, "presetList", index, ["presetOffsetEnd"])
        );
        changePropertyIn(
            defaultProperties,
            values,
            prop => {
                prop.objects?.forEach(object => {
                    object.properties?.forEach(propertyGroup => {
                        propertyGroup.properties?.forEach(property => {
                            if (property.key === "presetOffsetStart") {
                                property.caption = "Offset";
                                property.description =
                                    "When clicking on the preset, the date will be offset by this amount based on the current datetime.";
                            }
                        });
                    });
                });
            },
            "presetList"
        );
        changePropertyIn(
            defaultProperties,
            values,
            prop => {
                prop.caption = "Date attribute";
            },
            "dateAttribute"
        );
    }
    if (values.pickerType === "date") {
        hidePropertyIn(defaultProperties, values, "timeTranslation");
        hidePropertyIn(defaultProperties, values, "minTime");
        hidePropertyIn(defaultProperties, values, "maxTime");
        hidePropertyIn(defaultProperties, values, "timeInterval");
    } else if (values.pickerType === "year") {
        hidePropertyIn(defaultProperties, values, "showWeekNumbers");
        hidePropertyIn(defaultProperties, values, "timeTranslation");
        hidePropertyIn(defaultProperties, values, "minTime");
        hidePropertyIn(defaultProperties, values, "maxTime");
        hidePropertyIn(defaultProperties, values, "timeInterval");
    } else if (values.pickerType === "time") {
        hidePropertyIn(defaultProperties, values, "showWeekNumbers");
        hidePropertyIn(defaultProperties, values, "minDate");
        hidePropertyIn(defaultProperties, values, "maxDate");
        hidePropertyIn(defaultProperties, values, "excludeOrInclude");
        hidePropertyIn(defaultProperties, values, "includedDates");
        hidePropertyIn(defaultProperties, values, "includedDatesAttribute");
        hidePropertyIn(defaultProperties, values, "excludedDates");
        hidePropertyIn(defaultProperties, values, "excludedDatesAttribute");
        hidePropertyIn(defaultProperties, values, "highlightExcludedDays");
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
