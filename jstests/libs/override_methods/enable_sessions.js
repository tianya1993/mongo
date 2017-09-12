/**
 * Enables sessions on the db object
 */
(function() {
    "use strict";

    let sessionOptions = {};
    if (typeof TestData !== "undefined" && TestData.hasOwnProperty("sessionOptions")) {
        sessionOptions = TestData.sessionOptions;
    }

    const driverSession = db.getMongo().startSession(sessionOptions);
    // Override the endSession function to be a no-op so fuzzer doesn't accidentally end the
    // session.
    driverSession.endSession = Function.prototype;
    db = driverSession.getDatabase(db.getName());

    var originalStartParallelShell = startParallelShell;
    startParallelShell = function(jsCode, port, noConnect) {
        var newCode;
        var overridesFile = "jstests/libs/override_methods/enable_sessions.js";
        if (typeof(jsCode) === "function") {
            // Load the override file and immediately invoke the supplied function.
            newCode = `load("${overridesFile}"); (${jsCode})();`;
        } else {
            newCode = `load("${overridesFile}"); ${jsCode};`;
        }

        return originalStartParallelShell(newCode, port, noConnect);
    };
})();
