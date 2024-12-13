## Flex Date Picker
Datepicker with more flexible options than the default Mendix Datepicker

## Features
Next to the standard functionality like a placeholder and input events this widget also supports:
- Show weeknumbers
- Disable/Exclude or Include days in the picker itself (specify exactly which days are available for picking)
- Date ranges
- Time picker in combination with a datepicker
- Time only picker
- Month picker
- Year picker
- Show the picker inline on the page

It also takes all the date formatting and language from the Mendix session and validation messages on the input also work correctly.

## Usage
Simply drag the widget on a page with a date attribute and attach it to the widget

If you wish to use the date range you will have to supply a second attribute which will store the end date chosen in the picker
- Important to note that you cannot use a timepicker and the daterange at the same time.

The required validation and any other validation actions in nanoflows/microflows will work the same as with any other Mendix widget, just make sure you put the validation feedback on the normal date attribute and not the end date attribute when using ranges if you wish to display an error message.

## Issues, suggestions and feature requests
https://github.com/hunter-koppen/FlexDatePicker/issues

## To Do
- Overwrite week settings automatically
- Fix other pickers (next to date)
- Align picker to the left unless time picker
- Fix padding-top of picker
- Fix for brand-primary styling
- Add appearance settings
    - Improve standard icon, date and time icons seperately
    - Allow for uploading custom icon
    - Setting for spacing between button and input or not
- New datepicker type - No Picker (dont show the button, only typing)
- Sidebar in picker to quickly set a date or range of date (this week or today etc)