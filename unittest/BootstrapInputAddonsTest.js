define(["doh/runner", "BootstrapInputAddons/widget/BootstrapInputAddons"], function(doh, BootstrapInputAddons){

    doh.register("BootstrapInputAddonsTest", [
      function assertExample(){
        console.log("Log statement to easily find the file for debugging");
        doh.assertTrue(true);
      },

      function testFormatingValue(){
        var contextObjectValue = "";

        mx.parser.formatValue = function(unformattedValue){
            if (unformattedValue === "1000.12"){
                return "1.000,12";
            }
            return null;    
        };
        mx.parser.parseValue = function(formattedValue){
            if (formattedValue === "1.000,12"){
                return "1000.12";
            } 
            return null;     
        };

        var bootstrapInputAddons = new BootstrapInputAddons();
        bootstrapInputAddons.isRequired = false;
        bootstrapInputAddons.editable = "default";
        bootstrapInputAddons.readOnly = false;
        bootstrapInputAddons._contextObj = {};
        bootstrapInputAddons._contextObj.getAttributeType = function(){
            return "Decimal";
        };
        bootstrapInputAddons._contextObj.isNumeric = function(){
            return true;
        };
        bootstrapInputAddons._contextObj.get = function(){
            return contextObjectValue;
        };
        bootstrapInputAddons._contextObj.set = function(attribute, unformattedValue){
            contextObjectValue = unformattedValue;
        };
        
        bootstrapInputAddons._setValueInContextObject("attribute", "1.000,12");
        doh.assertEqual("1000.12", contextObjectValue);

        var formattedValue = bootstrapInputAddons._getFormattedValueFromContextObject("attribute");
        doh.assertEqual("1.000,12", formattedValue);

        bootstrapInputAddons.inputNode.value = "1.000,12";
        bootstrapInputAddons._onChange();
        doh.assertEqual("1000.12", contextObjectValue);

        // Unvalid input
        bootstrapInputAddons.inputNode.value = "1000,12.34";
        bootstrapInputAddons._onChange();
        doh.assertEqual("1000.12", contextObjectValue);
        doh.assertTrue(bootstrapInputAddons._isValidationShown());
      },

      function testIsValidRequiredEmpty(){
        var bootstrapInputAddons = new BootstrapInputAddons();
        bootstrapInputAddons.isRequired = true;
        bootstrapInputAddons.editable = "default";
        bootstrapInputAddons.readOnly = false;

        var isValid = bootstrapInputAddons._isValid();

        doh.assertFalse(isValid);
      },

      function testGetLabelClass(){
        var bootstrapInputAddons = new BootstrapInputAddons();
        var labelClass = bootstrapInputAddons._getLabelClass();
        doh.assertEqual("control-label", labelClass);

        var bootstrapInputAddons = new BootstrapInputAddons();
        bootstrapInputAddons.formOrientation = "horizontal";
        bootstrapInputAddons.labelWidth = 3;
        var labelClass = bootstrapInputAddons._getLabelClass();
        doh.assertEqual("control-label col-sm-3", labelClass);
      },

      function testGetInputDivClass(){
        var bootstrapInputAddons = new BootstrapInputAddons();
        var labelClass = bootstrapInputAddons._getInputDivClass();
        doh.assertEqual("", labelClass);

        var bootstrapInputAddons = new BootstrapInputAddons();
        bootstrapInputAddons.formOrientation = "horizontal";
        bootstrapInputAddons.labelWidth = 3;
        var labelClass = bootstrapInputAddons._getInputDivClass();
        doh.assertEqual("col-sm-9", labelClass);
      },

      function testIsValidationShown(){
        var bootstrapInputAddons = new BootstrapInputAddons();
        doh.assertFalse(bootstrapInputAddons._isValidationShown());

        bootstrapInputAddons._addValidation("Validation message");
        doh.assertTrue(bootstrapInputAddons._isValidationShown());
      },

      function testUpdateRendering(){
        var bootstrapInputAddons = new BootstrapInputAddons();

        // Everything is valid, so not expecting a validation message
        bootstrapInputAddons._addValidation("Field is required");
        bootstrapInputAddons._updateRendering();
        doh.assertFalse(bootstrapInputAddons._isValidationShown());

        // Field is invalid for the first time, so not expecting a validation message
        bootstrapInputAddons.isRequired = true;
        bootstrapInputAddons.editable = "default";
        bootstrapInputAddons.readOnly = false;
        bootstrapInputAddons._updateRendering();
        doh.assertFalse(bootstrapInputAddons._isValidationShown());

        // Field is invalid for the second time, so expecting a validation message
        bootstrapInputAddons._addValidation("Field is required");
        bootstrapInputAddons._updateRendering();
        doh.assertTrue(bootstrapInputAddons._isValidationShown());
      },

      function testOnChange(){
        var bootstrapInputAddons = new BootstrapInputAddons();
        bootstrapInputAddons._setValueInContextObject = function(){};

        var microflowCalled = false;
        bootstrapInputAddons._callMicroflow = function(){ 
          microflowCalled = true;
        };

        // All is valid, so microflow should be called
        bootstrapInputAddons._onChange();
        doh.assertTrue(microflowCalled);
        doh.assertFalse(bootstrapInputAddons._isValidationShown());
        microflowCalled = false;

        // All is invalid, so microflow should not be called
        bootstrapInputAddons.isRequired = true;
        bootstrapInputAddons.editable = "default";
        bootstrapInputAddons.readOnly = false;
        bootstrapInputAddons._onChange();
        doh.assertFalse(microflowCalled);
        doh.assertTrue(bootstrapInputAddons._isValidationShown());

        // All is invalid, but abort on error is false so microflow should be called
        bootstrapInputAddons.onChangeAbortOnValidationErrors = "no";
        bootstrapInputAddons._onChange();
        doh.assertTrue(microflowCalled);
        doh.assertTrue(bootstrapInputAddons._isValidationShown());
      },

    ]);

});
