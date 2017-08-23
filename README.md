# Mendix Bootstrap Input Addons Widget

This widget extends form controls by adding text on either side of textual input's (as described [here](http://getbootstrap.com/components/#input-groups)).

This would be useful when working with constant values that always apply on a field, for example the '€' symbol when working with currencies.

To use the widget, place it in a Entity context (like a dataview) and configure the widget's properties.

## Features
* Add text before, after, or on both sides of any text-based input
* Optional show the label of an input field
* Optional set field as required
* Format numbers with configurable groups and digits
* Optional show negative numbers as positive
* onChange, onEnter and onLeave events
* Visibility and editable parameter
* Use of variables in the label (syntax: {attributeName})

## Limitations
* Buttons, checkboxes, radiobuttons and dropdowns (as add-on) are not yet implemented

For any request or bug please create an issue at [GitHub](https://github.com/JAM-IT-NL/MendixBootstrapInputAddons).

# Build project
* npm install
* grunt watch

# Run unittest
Start webserver (in project root)
* python -m SimpleHTTPServer &

Open testrunner, for BootstrapInputAddons
* http://localhost:8000/unittest/util/doh/runner.html?boot=../../config.js,../../mxui/mxui.js&test=../../BootstrapInputAddonsTest.js&paths=BootstrapInputAddons/widget,../../src/BootstrapInputAddons/widget