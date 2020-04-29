/*global logger*/
/*
    BootstrapInputAddons
    ========================

    @file      : BootstrapInputAddons.js
    @version   : 1.0.3
    @author    : Martijn Raats
    @date      : Mon, 25 Apr 2016 09:29:56 GMT
    @copyright : JAM-IT B.V.
    @license   : Apache V2

    Documentation
    ========================
    This widget gives the possibility to use bootstrap input add-ons on normal fields.
*/

define([
    "dojo/_base/declare",
    "mendix/validator",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "dojo/_base/kernel",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/html",
    "dojo/_base/event",
    "dojo/text!BootstrapInputAddons/widget/template/BootstrapInputAddons.html",
    "BootstrapInputAddons/lib/jquery-1.11.2"
], function (declare, validator, _WidgetBase, _TemplatedMixin, dojo, dojoClass, dojoStyle, dojoConstruct, dojoAttr, dojoArray, dojoLang, dojoHtml, dojoEvent, widgetTemplate, jQuery) {
    "use strict";

    // Declare widget's prototype.
    return declare("BootstrapInputAddons.widget.BootstrapInputAddons", [_WidgetBase, _TemplatedMixin], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,
        jQuery: jQuery.noConflict(true),
        // DOM elements
        inputDiv: null,
        inputNodes: null,
        inputNode: null,
        formGroupNode: null,

        // Parameters configured in the Modeler.\
        hideEnumregEx: "",
        showEnumAs: "",
        formOrientation: "",
        labelWidth: 0,
        placeholderText: "",
        decimalPrecision: "",
        groupDigits: "",
        showNegativeAsPositive: "",
        visibilityAttribute: "",
        editable: "",
        readOnlyMode: "",
        editableAttribute: "",
        showLabel: "",
        tooltipText: "",
        tooltipPosition: "",
        labelCaption: "",
        negativeLabelCaption: "",
        negativeClass: "",
        showLeftAddon: "",
        leftAddonCaption: "",
        showRightAddon: "",
        rightAddonCaption: "",
        showRightButtonAddon: "",
        rightAddonButtonCaption: "",
        isRequired: "",
        requiredMessage: "",
        useRegExValidation: "",
        regEx: "",
        regExMessage: "",
        mfToExecute: "",
        messageString: "",
        fieldAttribute: "",
        radioOrientation: "",

        onChange: "",
        onChangeAbortOnValidationErrors: "",
        onEnter: "",
        onLeave: "",
        onClick: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _formValidateListener: null,
        _handles: null,
        _contextObj: null,
        _alertDiv: null,
        _leftAddonSpan: null,
        _rightAddonSpan: null,
        _rightButtonAddonSpan: null,
        _labelNode: null,
        _toolTipNode: null,
        _validationMessage: null,
        _tooltipSpace: 0,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            this._updateRendering();
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering();

            callback();
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function () {
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function () {
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function (box) {
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
            if (this._formValidateListener) {
                this.mxform.unlisten(this._formValidateListener);
            }
        },

        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function (e) {
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        // Attach events to HTML dom elements
        _setupEvents: function () {
            this.connect(this.inputNode, "change", function (event) {
                this._onChange(event);
            });

            this.connect(this.inputNode, "focus", function (e) {
                this._onEnter();
            });

            this.connect(this.inputNode, "blur", function (e) {
                this._onLeave();
            });

        },

        // Rerender the interface.
        _updateRendering: function () {
            if (this._isVisible()) {
                dojoStyle.set(this.domNode, "display", "block");
                dojoStyle.set(this.inputDiv, "display", "block");

                var value = this._getFormattedValueFromContextObject(this.fieldAttribute);
                this.inputNode.value = value;

                var originalValue = this._contextObj.get(this.fieldAttribute);
                if (originalValue < 0) {
                    dojoClass.add(this.formGroupNode, this.negativeClass);
                } else {
                    dojoClass.remove(this.formGroupNode, this.negativeClass);
                }

                this._addLabel();
                this._addLeftAddon();
                this._addRightAddon();
                this._addRightButtonAddon();

                if (this.tooltipPosition === "behindCaption") {
                    this._addTooltip(this._labelNode);
                } else {
                    this._addTooltip(this.inputNodes);
                }

                dojoClass.add(this.inputDiv, this._getInputDivClass());

                if (this._contextObj.getAttributeType(this.fieldAttribute) === "Enum" && this._isEditable()) {
                    if (this.showEnumAs === "radio") {
                        this._addEnumAsRadio();
                    } else {
                        this._addEnumAsDropDown();
                    }
                } else if (this._contextObj.getAttributeType(this.fieldAttribute) === "Boolean" && this._isEditable() && this.formOrientation == "horizontal") {
                    dojoClass.add(this.inputDiv, "checkbox");
                    dojoConstruct.place(this._labelNode, this.inputNodes, "first");
                    dojoConstruct.place(this.inputNode, this._labelNode, "first");
                    dojoAttr.set(this.inputNode, "type", "checkbox");
                    dojoAttr.remove(this.inputNode, "class");
                    dojoAttr.remove(this.inputNode, "value");

                    dojoClass.remove(this._labelNode, this._getLabelClass());
                    dojoClass.add(this._labelNode, "control-label");
                    dojoClass.add(this.inputDiv, this._getInputDivOffsetClass());

                    dojoStyle.set(this._toolTipNode, "display", "inline");
                    dojoStyle.set(this._toolTipNode, "vertical-align", "unset");

                    this.inputNode.checked = originalValue;

                } else {
                    if (!this._isEditable() && this.readOnlyMode == "textControl") {
                        dojoAttr.set(this.inputNode, "disabled", "disabled");
                    }

                    if (!this._isEmptyString(this.placeholderText)) {
                        dojoAttr.set(this.inputNode, "placeholder", this.placeholderText);
                    }

                    if (!this._isEditable() && this.readOnlyMode == "textLabel") {
                        this._setReadOnlyValue(value);
                    }
                }

            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            // Clear old validations
            var oldValidationShown = this._isValidationShown();
            this._clearValidations();

            // Show validation messages if the widget was already on the page            
            if (oldValidationShown && !this._isValid()) {
                this._addValidation(this._validationMessage);
            }
        },

        _getFormattedValueFromContextObject: function (attribute) {
            if (this._contextObj.isNumeric(attribute) || this._contextObj.getAttributeType(attribute) === "AutoNumber") {
                var numberOptions = {};
                numberOptions.places = this.decimalPrecision;
                if (this.groupDigits) {
                    numberOptions.locale = dojo.locale;
                    numberOptions.groups = true;
                }

                var value = this._contextObj.get(attribute);
                if (this.showNegativeAsPositive) {
                    if (value < 0) {
                        value = -1 * value;
                    }
                }

                return mx.parser.formatValue(value, this._contextObj.getAttributeType(attribute), numberOptions);
            }

            return mx.parser.formatAttribute(this._contextObj, attribute);
        },

        _getUnformattedValue: function (attribute, formattedValue) {
            if (typeof formattedValue !== 'undefined' && (typeof formattedValue === 'string' || formattedValue instanceof String) && this._contextObj.isNumeric(attribute)) {
                // Remove thousand separators
                formattedValue = formattedValue.replace(new RegExp('\\' + this._getThousandSeparator(), 'g'), '')
            }

            if (this._contextObj.getAttributeType(this.fieldAttribute) === "Boolean") {
                return formattedValue;
            }

            return mx.parser.parseValue(formattedValue, this._contextObj.getAttributeType(attribute));
        },

        _getThousandSeparator: function () {
            try {
                const numberWithGroupAndDecimalSeparator = 1000.1;
                return Intl.NumberFormat(mx.session.sessionData.locale.code.replace('_', '-'))
                    .formatToParts(numberWithGroupAndDecimalSeparator)
                    .find(function (part) { return part.type === 'group' })
                    .value;
            } catch (exception) {
                if (mx.session.sessionData.locale.code === 'nl_NL') {
                    return '.';
                }
                return ',';
            }
        },

        _setValueInContextObject: function (attribute, formattedValue) {
            var unformattedValue = this._getUnformattedValue(attribute, formattedValue);
            this._contextObj.set(attribute, unformattedValue);
        },

        _addEnumAsDropDown: function () {
            //dojoConstruct.destroy(this.inputNode);
            var toBeReplaced = this.inputNode;
            this.inputNode = dojoConstruct.create("select", {
                "class": "form-control"
            });
            dojoConstruct.place(this.inputNode, toBeReplaced, 'replace');

            this._addSingleOption("", "", this.inputNode);
            var enumMap = this._contextObj.getEnumMap(this.fieldAttribute);
            for (var i = 0; i < enumMap.length; i++) {
                var key = enumMap[i].key;
                if (!this._isEmptyString(this.hideEnumregEx)) {
                    var regExp = new RegExp(this.hideEnumregEx);
                    if (regExp.test(key)) {
                        continue;
                    }
                }
                this._addSingleOption(enumMap[i].caption, key, this.inputNode);
            }

            this.inputNode.value = this._contextObj.get(this.fieldAttribute);

            this.connect(this.inputNode, "change", function (event) {
                this._onChange(event);
            });
        },

        _addSingleOption: function (text, key, node) {
            dojoConstruct.create("option", {
                "innerHTML": text,
                "value": key
            }, node);
        },

        _addEnumAsRadio: function () {
            dojoAttr.set(this.inputNodes, "role", "radiogroup");
            dojoConstruct.empty(this.inputNodes);

            if (this.radioOrientation === 'horizontal') {
                dojoAttr.set(this.inputNodes, 'class', 'radiogroup');
            }

            var enumMap = this._contextObj.getEnumMap(this.fieldAttribute);
            var inputTypeName = Math.floor((Math.random() * 1000000));
            var arrayLength = enumMap.length;
            for (var i = 0; i < arrayLength; i++) {
                var key = enumMap[i].key;
                if (!this._isEmptyString(this.hideEnumregEx)) {
                    var regExp = new RegExp(this.hideEnumregEx);
                    if (regExp.test(key)) {
                        continue;
                    }
                }

                var radioDiv = dojoConstruct.create("div", {
                    "class": "radio"
                });

                var radioLabel = dojoConstruct.create("label", {
                    "innerHTML": enumMap[i].caption
                });
                var radioInput = dojoConstruct.create("input", {
                    "type": "radio",
                    "name": inputTypeName,
                    "value": enumMap[i].key
                });

                if (this._contextObj.get(this.fieldAttribute) === enumMap[i].key) {
                    dojoAttr.set(radioInput, "checked", "checked");
                }

                dojoConstruct.place(radioInput, radioLabel, 'first');
                dojoConstruct.place(radioLabel, radioDiv);
                dojoConstruct.place(radioDiv, this.inputNodes);

                this.connect(radioInput, "change", function (event) {
                    this._onChange(event);
                });

            }
        },

        _addLabel: function () {
            if (this.showLabel) {
                dojoConstruct.destroy(this._labelNode);
                this._labelNode = dojoConstruct.create("label", {
                    "class": this._getLabelClass(),
                    "innerHTML": this._getLabelCaption()
                });
                dojoConstruct.place(this._labelNode, this.formGroupNode, "first");
            }
        },

        _getLabelCaption: function () {
            var replaceFunction = dojoLang.hitch(this, function (replaceString, firstMatch, secondMatch) {
                var attributeValue = this._contextObj.get(secondMatch);
                return replaceString.replace(firstMatch, attributeValue);
            });

            var expression = /({(.+?)})/g;

            var label = this.labelCaption;
            if (this.showNegativeAsPositive) {
                var value = this._contextObj.get(this.fieldAttribute);
                if (value < 0) {
                    label = this.negativeLabelCaption;
                }
            }

            var result = label.replace(expression, replaceFunction);

            return result;
        },

        _getLabelClass: function () {
            var styleClass = "control-label";

            if (this.formOrientation == "horizontal") {
                styleClass += " col-sm-" + this.labelWidth;
            }

            return styleClass;
        },

        _getInputDivClass: function () {
            if (this.formOrientation == "horizontal") {
                return "col-sm-" + (12 - this.labelWidth);
            }

            return "";
        },

        _getInputDivOffsetClass: function () {
            if (this.formOrientation == "horizontal") {
                return "col-sm-offset-" + (12 - this.labelWidth);
            }

            return "";
        },

        _addLeftAddon: function () {
            if (this.showLeftAddon && (this._isEditable() || (!this._isEditable() && this.readOnlyMode == "textControl"))) {
                dojoConstruct.destroy(this._leftAddonSpan);
                this._leftAddonSpan = dojoConstruct.create("span", {
                    "class": "input-group-addon",
                    "innerHTML": this.leftAddonCaption
                });
                dojoConstruct.place(this._leftAddonSpan, this.inputNodes, "first");

                dojoClass.add(this.inputNodes, "input-group");
            }
        },

        _addRightAddon: function () {
            if (this.showRightAddon && (this._isEditable() || (!this._isEditable() && this.readOnlyMode == "textControl"))) {
                dojoConstruct.destroy(this._rightAddonSpan);
                this._rightAddonSpan = dojoConstruct.create("span", {
                    "class": "input-group-addon",
                    "innerHTML": this.rightAddonCaption
                });
                dojoConstruct.place(this._rightAddonSpan, this.inputNodes, "last");

                dojoClass.add(this.inputNodes, "input-group");
            }
        },

        _addRightButtonAddon: function () {
            if (this.showRightButtonAddon && (this._isEditable() || (!this._isEditable() && this.readOnlyMode == "textControl"))) {
                dojoConstruct.destroy(this._rightButtonAddonSpan);

                this._rightButtonAddonSpan = dojoConstruct.create("span", {
                    "class": "input-group-btn"
                });

                var button = dojoConstruct.create("button", {
                    "class": "btn btn-primary",
                    "type": "button",
                    "style": "padding-top: 7px; padding-bottom: 7px;",
                    "innerHTML": this.rightAddonButtonCaption
                });

                dojoConstruct.place(button, this._rightButtonAddonSpan, "last");
                dojoConstruct.place(this._rightButtonAddonSpan, this.inputNodes, "last");

                dojoClass.add(this.inputNodes, "input-group");

                this.connect(button, "click", function (e) {
                    this._onClick();
                });
            }
        },

        _setReadOnlyValue: function (value) {

            if (this.showLeftAddon) {
                value = this.leftAddonCaption + value;
            }

            if (this.showRightAddon) {
                value = value + this.rightAddonCaption;
            }

            if (this.showLabel) {
                var readOnlyField = dojoConstruct.create("p", {
                    "class": "form-control-static",
                    "innerHTML": value
                });
                dojoConstruct.place(readOnlyField, this.inputNodes, "only");
            } else {
                var readOnlyField = dojoConstruct.create("label", {
                    "innerHTML": value
                });
                dojoConstruct.place(readOnlyField, this.domNode, "only");
                this._addTooltip(this.domNode);
            }
        },

        _addTooltip: function (node) {
            if (this.tooltipText.length == 0) {
                return;
            }

            dojoConstruct.destroy(this._toolTipNode);
            this._toolTipNode = dojoConstruct.create("span", {
                "class": "glyphicon glyphicon-question-sign explain ",
                "data-content": this.tooltipText,
                "data-toggle": "popover",
                "data-trigger": "hover",
                "data-container": "body",
                "data-placement": (this.formOrientation === "horizontal" && this.tooltipPosition !== "behindValue") ? "bottom" : "right"
            });

            node.appendChild(this._toolTipNode);
            this.jQuery(this._toolTipNode).popover();
        },

        // Handle validations.
        _handleValidation: function (validations) {
            this._clearValidations();

            var validation = validations[0],
                message = validation.getReasonByAttribute(this.fieldAttribute);

            if (message) {
                this._addValidation(message);
                validation.removeAttribute(this.fieldAttribute);
            }
        },

        _isValidationShown: function () {
            return (this._alertDiv != null);
        },

        // Clear validations.
        _clearValidations: function () {
            dojoConstruct.destroy(this._alertDiv);
            this._alertDiv = null;
            dojoClass.remove(this.inputDiv, "has-error");
            dojoClass.remove(this.formGroupNode, "parent-error");
        },

        // Show an error message.
        _showError: function (message) {
            if (this._alertDiv !== null) {
                dojoHtml.set(this._alertDiv, message);
                return true;
            }
            this._alertDiv = dojoConstruct.create("div", {
                "class": "alert alert-danger",
                "innerHTML": message
            });
            dojoConstruct.place(this._alertDiv, this.inputDiv, "last");
            dojoClass.add(this.inputDiv, "has-error");
            dojoClass.add(this.formGroupNode, "parent-error");
        },

        _getCurrentValue: function () {
            if (this._contextObj.getAttributeType(this.fieldAttribute) === "Enum" && this._isEditable() && this.showEnumAs === "radio") {
                for (var i = 0; i < this.inputNodes.children.length; i++) {
                    var element = this.inputNodes.children[i];
                    var radioElement = element.firstElementChild.firstElementChild;
                    if (radioElement.checked) {
                        return radioElement.value;
                    }
                }
            }

            if (this._contextObj.getAttributeType(this.fieldAttribute) === "Boolean" && this._isEditable() && this.formOrientation == "horizontal") {
                return this.inputNode.checked;
            }

            var currentValue = this.inputNode.value;
            return currentValue;
        },

        // Check if validates
        _isValid: function () {
            var value = this._getCurrentValue();

            if (this._isEditable() && this.inputNode) {

                // Check for required
                if (this.isRequired) {
                    if (this._isEmptyString(value)) {

                        this._validationMessage = this.requiredMessage;
                        return false;
                    }
                }

                // Check for RegEx
                if (this.useRegExValidation && !this._isEmptyString(value)) {
                    var regExp = new RegExp(this.regEx);
                    if (!regExp.test(value)) {
                        this._validationMessage = this.regExMessage;
                        return false;
                    }
                }

                var isValidNumber = true;
                try {
                    if (this._contextObj.isNumeric(this.fieldAttribute)) {
                        var unformattedValue = this._getUnformattedValue(this.fieldAttribute, value);
                        if (!(validator.validate(unformattedValue, this._contextObj.getAttributeType(this.fieldAttribute)) === validator.validation.OK)) {
                            isValidNumber = false;
                        }
                    }
                } catch (exception) {
                    isValidNumber = false;
                }

                if (!isValidNumber) {

                    if (mx.session.sessionData.locale.code == "nl_NL") {
                        this._validationMessage = "Ongeldig nummer";
                    } else {
                        this._validationMessage = "Invalid number";
                    }
                    return false;
                }

            }

            return true;
        },

        _isEmptyString: function (str) {
            return (!str || 0 === str.trim().length);
        },

        // Add a validation.
        _addValidation: function (message) {
            this._showError(message);
        },

        // FieldEvent: onChange
        _onChange: function (event) {
            // Check validations
            var isValid = this._isValid();

            if (this.onChangeAbortOnValidationErrors == "no" || isValid) {
                // Set attribute value
                this._setValueInContextObject(this.fieldAttribute, this._getCurrentValue());

                // Call "on change" microflow
                this._callMicroflow(this.onChange);
            } else {
                if (!isValid) {
                    this._addValidation(this._validationMessage);
                }
            }

        },

        // FieldEvent: onEnter
        _onEnter: function () {
            if (this._leftAddonSpan) {
                dojoClass.add(this._leftAddonSpan, "focus");
            }
            // Call "on change" microflow
            this._callMicroflow(this.onEnter);

        },

        // FieldEvent: onLeave
        _onLeave: function () {
            if (this._leftAddonSpan) {
                dojoClass.remove(this._leftAddonSpan, "focus");
            }
            // Call "on change" microflow
            this._callMicroflow(this.onLeave);
        },

        // FieldEvent: onLeave
        _onClick: function () {
            this._callMicroflow(this.onClick);
        },

        _callMicroflow: function (microflow) {
            if (microflow) {
                mx.ui.action(microflow, {
                    params: {
                        applyto: "selection",
                        guids: [this._contextObj.getGuid()]
                    },
                    callback: dojoLang.hitch(this, function (obj) {
                        // Is called wHen all is ok
                        if (!this._isValid()) {
                            this._addValidation(this._validationMessage);
                        }
                    }),
                    error: dojoLang.hitch(this, function (error) {
                        logger.error(this.id + ": An error occurred while executing microflow: " + error.description);
                    })
                }, this);
            }
        },

        _isVisible: function () {
            return (this._contextObj !== null && this._contextObj.get(this.visibilityAttribute) !== false);
        },

        _isEditable: function () {
            switch (this.editable) {
                case "default":
                    return !this.readOnly;
                case "never":
                    return false;
                case "conditionally":
                    if (this._contextObj !== null) {
                        return this._contextObj.get(this.editableAttribute);
                    }
            }

            return false;

        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            // Release handles on previous object, if any.
            this.unsubscribeAll();

            if (this._formValidateListener) {
                this.mxform.unlisten(this._formValidateListener);
            }

            // When a mendix object exists and is visible create subscribtions.
            if (this._contextObj && this._isVisible()) {
                this._formValidateListener = this.mxform.listen("validate", dojoLang.hitch(this, function (callback, error) {
                    if (this._isValid()) {
                        callback();
                    } else {
                        this._addValidation(this._validationMessage);
                    }
                }));

                var objectHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });

                var attrHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.fieldAttribute,
                    callback: dojoLang.hitch(this, function (guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                var validationHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: dojoLang.hitch(this, this._handleValidation)
                });
            }
        }
    });
});

require(["BootstrapInputAddons/widget/BootstrapInputAddons"], function () {
    "use strict";
});
