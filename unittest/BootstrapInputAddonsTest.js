define(["doh/runner", "BootstrapInputAddons/widget/BootstrapInputAddons"], function(doh, BootstrapInputAddons){

    doh.register("BootstrapInputAddonsTest", [
      function assertExample(){
        console.log("Log statement to easily find the file for debugging");
        doh.assertTrue(true);
      },
      function assertIsValidRequiredEmpty(){
        var bootstrapInputAddons = new BootstrapInputAddons();
        bootstrapInputAddons.isRequired = true;
        bootstrapInputAddons.editable = "default";
        bootstrapInputAddons.readOnly = false;

        var isValid = bootstrapInputAddons._isValid();

        doh.assertFalse(isValid);
      },
    ]);

});
