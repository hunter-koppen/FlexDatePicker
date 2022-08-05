## CLEVR DatePicker
Datepicker with more options than the default Mendix Datepicker

## Features
Next to the standard functionality like a placeholder and input events this widget also supports:
- Show weeknumbers
- Disable days in the picker itself (e.g. only future days)
- Date ranges
- Time picker in combination with a datepicker
- Time only picker
- Month picker
- Year picker

It also takes all the date formatting and language from the Mendix session and validation messages on the input also work correctly.

## Usage
Simply drag the widget on a page with a date attribute and attach it to the widget

If you wish to use the date range you will have to supply a second attribute which will store the end date chosen in the picker
- Important to note that you cannot use a timepicker and the daterange at the same time.

The required validation and any other validation actions in nanoflows/microflows will work the same as with any other Mendix widget, just make sure you put the validation feedback on the normal date attribute and not the end date attribute when using ranges if you wish to display an error message.

## Issues, suggestions and feature requests
https://github.com/hunterkoppenclevr/Clevr-DatePicker/issues