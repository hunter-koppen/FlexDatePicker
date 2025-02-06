## Flex Date Picker
Datepicker with more flexible options than the default Mendix Datepicker that also looks great!

## Features
Next to the standard functionality like a placeholder and input events this widget also supports:
- Date ranges
- Show weeknumbers
- Disable/Exclude or Include days in the picker itself (specify exactly which days are available for picking)
- Time picker in combination with a datepicker
- Time only picker
- Year picker
- Show the picker inline on the page
- Presets

## Usage
Simply drag the widget on a page with a date attribute and attach it to the widget

If you wish to use the date range you will have to supply a second attribute which will store the end date chosen in the picker
- Important to note that you cannot use a timepicker and the daterange at the same time.

The required validation and any other validation actions in nanoflows/microflows will work the same as with any other Mendix widget, just make sure you put the validation feedback on the normal date attribute and not the end date attribute when using ranges if you wish to display an error message.

## Styling
If you wish to change the primary color in the picker simply add the following css rule to your stylesheet
```css
:root {
    --flex-calendar-primary: #264ae5;
}
```

## Issues, suggestions and feature requests
https://github.com/hunter-koppen/FlexDatePicker/issues
