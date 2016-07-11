define(["doh/runner", "BootstrapInputAddons/widget/BootstrapInputAddons"], function(doh, BootstrapInputAddons){

    doh.register("BootstrapInputAddonsTest", [
      function assertExample(){
        console.log("Log statement to easily find the file for debugging");
        doh.assertTrue(true);
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
    ]);

});
