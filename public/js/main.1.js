"use strict";

(function () {
    var sampleTitle = "Accelerometer JS Sample";

    var scenarios = [{ url: "/erpdesigner/html/scenario0_Choose.html", title: "Choose accelerometer" }, { url: "/erpdesigner/html/scenario1_DataEvents.html", title: "Data Events" }, { url: "/erpdesigner/html/scenario2_ShakeEvents.html", title: "Shake Events" }, { url: "/erpdesigner/html/scenario3_Polling.html", title: "Polling" }, { url: "/erpdesigner/html/scenario4_OrientationChanged.html", title: "OrientationChanged Handling" }, { url: "/erpdesigner/html/scenario5_DataEventsBatching.html", title: "Data Events Batching" }];

    function setReadingText(e, reading) {
        e.innerText = "X: " + reading.accelerationX.toFixed(2) + ", Y: " + reading.accelerationY.toFixed(2) + ", Z: " + reading.accelerationZ.toFixed(2);
    }

    WinJS.Namespace.define("SdkSample", {
        sampleTitle: sampleTitle,
        scenarios: new WinJS.Binding.List(scenarios),
        setReadingText: setReadingText,
        accelerometerReadingType: "standard"
    });

    var currentScenarioUrl = null;

    WinJS.Navigation.addEventListener("navigating", function (evt) {
        currentScenarioUrl = evt.detail.location;
    });

    var lastError, lastStatus;
    WinJS.log = function (message, tag, type) {
        var isError = type === "error";
        var isStatus = type === "status";

        if (isError || isStatus) {
            var statusDiv = /* @type(HTMLElement) */document.getElementById("statusMessage");
            if (statusDiv) {
                statusDiv.innerText = message;
                if (statusDiv.innerText.length > 0) {
                    if (isError) {
                        lastError = message;
                        statusDiv.style.backgroundColor = "red";
                    } else if (isStatus) {
                        lastStatus = message;
                        statusDiv.style.backgroundColor = "green";
                    }
                } else {
                    statusDiv.style.backgroundColor = "";
                }
            }
        }
    };

    var header = WinJS.UI.Pages.define("/erpdesigner/html/header.html", {
        processed: function processed(element, options) {
            return WinJS.Binding.processAll(element);
        }
    });

    // Control that populates and runs the scenario selector
    var ScenarioSelect = WinJS.UI.Pages.define("/erpdesigner/html/scenario-select.html", {
        ready: function ready(element, options) {
            var that = this;

            element.addEventListener("selectionchanging", function (evt) {
                if (evt.detail.newSelection.count() === 0) {
                    evt.preventDefault();
                }
            });
            element.addEventListener("iteminvoked", function (evt) {
                evt.detail.itemPromise.then(function (item) {
                    that._selectedIndex = item.index;
                    var newUrl = item.data.url;
                    if (currentScenarioUrl !== newUrl) {
                        WinJS.Navigation.navigate(newUrl);
                        var splitView = document.querySelector("#root.win-splitview-openeddisplayoverlay");
                        splitView && splitView.winControl.closePane();
                    }
                });
            });
            element.addEventListener("keyboardnavigating", function (evt) {
                var listview = evt.target.winControl;
                listview.elementFromIndex(evt.detail.newFocus).click();
            });

            this._selectedIndex = 0;

            var lastUrl = WinJS.Application.sessionState.lastUrl;
            SdkSample.scenarios.forEach(function (s, index) {
                s.scenarioNumber = index + 1;
                if (s.url === lastUrl && index !== that._selectedIndex) {
                    that._selectedIndex = index;
                }
            });

            this._listview = element.querySelector(".win-listview").winControl;
            this._listview.selection.set([this._selectedIndex]);
            this._listview.currentItem = { index: this._selectedIndex, hasFocus: true };
        }
    });

    // SDK Sample Test helper
    document.TestSdkSample = {
        getLastError: function getLastError() {
            return lastError;
        },

        getLastStatus: function getLastStatus() {
            return lastStatus;
        },

        selectScenario: function selectScenario(scenarioID) {
            scenarioID = scenarioID >> 0;
            var scenarioIndex = scenarioID - 1;
            var scenarioControl = document.querySelector("#scenarioControl").winControl;
            scenarioControl.elementFromIndex(scenarioIndex).click();
        }
    };

    var app = WinJS.Application;
    var nav = WinJS.Navigation;
    var splitView;

    function activated(eventObject) {
        var activationKind = eventObject.detail.kind;
        var activatedEventArgs = eventObject.detail.detail;

        SdkSample.paneOpenInitially = window.innerWidth > 768;
        var p = WinJS.UI.processAll().then(function () {
            splitView = document.querySelector("#root").winControl;
            splitView.onbeforeclose = function () {
                WinJS.Utilities.addClass(splitView.element, "hiding");
            };
            splitView.onafterclose = function () {
                WinJS.Utilities.removeClass(splitView.element, "hiding");
            };
            splitView.onafteropen = handleOpened;
            window.addEventListener("resize", handleResize);
            handleResize();

            var buttons = document.querySelectorAll(".splitViewButton");
            for (var i = 0, len = buttons.length; i < len; i++) {
                buttons[i].addEventListener("click", handleSplitViewButton);
            }

            // Navigate to either the first scenario or to the last running scenario
            // before suspension or termination.
            var url = SdkSample.scenarios.getAt(0).url;
            var initialState = {};
            var navHistory = app.sessionState.navigationHistory;
            if (navHistory) {
                nav.history = navHistory;
                url = navHistory.current.location;
                initialState = navHistory.current.state || initialState;
            }
            initialState.activationKind = activationKind;
            initialState.activatedEventArgs = activatedEventArgs;
            nav.history.current.initialPlaceholder = true;
            return nav.navigate(url, initialState);
        });

        // Calling done on a promise chain allows unhandled exceptions to propagate.
        p.done();

        // Use setPromise to indicate to the system that the splash screen must not be torn down
        // until after processAll and navigate complete asynchronously.
        eventObject.setPromise(p);
    }

    function navigating(eventObject) {
        var url = eventObject.detail.location;
        var host = document.getElementById("contentHost");
        // Call unload and dispose methods on current scenario, if any exist
        if (host.winControl) {
            host.winControl.unload && host.winControl.unload();
            host.winControl.dispose && host.winControl.dispose();
        }
        WinJS.Utilities.disposeSubTree(host);
        WinJS.Utilities.empty(host);
        WinJS.log && WinJS.log("", "", "status");

        var p = WinJS.UI.Pages.render(url, host, eventObject.detail.state).then(function () {
            var navHistory = nav.history;
            app.sessionState.navigationHistory = {
                backStack: navHistory.backStack.slice(0),
                forwardStack: navHistory.forwardStack.slice(0),
                current: navHistory.current
            };
            app.sessionState.lastUrl = url;
        });
        p.done();
        eventObject.detail.setPromise(p);
    }

    function handleSplitViewButton() {
        splitView.paneOpened = !splitView.paneOpened;
    }

    function handleOpened() {
        // Different SplitView openedDisplayModes handle focus differently when opened.
        // Normalize them and always put focus onto the SplitView pane element when opened.
        splitView.element.querySelector(".win-splitview-pane").focus();
    }

    function handleResize() {
        if (window.innerWidth > 768) {
            splitView.closedDisplayMode = WinJS.UI.SplitView.ClosedDisplayMode.none;
            splitView.openedDisplayMode = WinJS.UI.SplitView.OpenedDisplayMode.inline;
        } else {
            splitView.closedDisplayMode = WinJS.UI.SplitView.ClosedDisplayMode.none;
            splitView.openedDisplayMode = WinJS.UI.SplitView.OpenedDisplayMode.overlay;
            splitView.closePane();
        }
    }

    nav.addEventListener("navigating", navigating);
    app.addEventListener("activated", activated, false);
    app.start();
})();

window.onerror = function (E) {
    debugger;
};