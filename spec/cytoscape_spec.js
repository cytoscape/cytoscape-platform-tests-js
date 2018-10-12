describe("Cytoscape", function () {

  beforeAll(function () {
    // console.log(window.DATA.responses);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  beforeEach(function () {

  });
  afterAll(function () {
    setTimeout(() => {
      addResponse('runjasmine', { 'results': window.tests.innerText })
      showControls(document.getElementById('runjasmine'))

    }, 1000)
  })

  it("check status", function (done) {
    var testValue = window.DATA.responses["status"];
    var expectedValue = {
      allAppsStarted: true,
      apiVersion: 'v1'
    };
    cyCaller.get("/v1", function (v) {
      log(v, "status")
      v = JSON.parse(v)
      data = { "allAppsStarted": v['allAppsStarted'], "apiVersion": v['apiVersion'] }
      expect(data).toEqual(expectedValue);
      done();
    })
  });

  it("check version", function (done) {
    var expectedValue = {
      cytoscapeVersion: '3.7.0-RC2',
      apiVersion: 'v1'
    };
    cyCaller.get("/v1/version", function (v) {
      log(v, "version")
      v = JSON.parse(v)
      expect(v).toEqual(expectedValue);
      done();
    });
  });

  it("check close session", function () {
    const value = window.DATA.responses['close_session'];
    const expectedValue = { new_session: true };
    expect(value).toEqual(expectedValue);
  })

  it("check galFiltered counts", function () {
    var testValue = window.DATA.responses["galfiltered"]
    var expectedValue =
    {
      'cyrestEdgeCount': 359,
      'cyrestNodeCount': 330,
      'nodeCountMatches': true,
      'edgeCountMatches': true
    };
    expect(testValue).toEqual(expectedValue);
  });

  it("diffusion", function () {
    var testValue = window.DATA.responses["diffusion"]
    var expectedValue = {
      "diffused": true
    };
    expect(testValue).toEqual(expectedValue);
  });

  it("layout", function () {
    var testValue = window.DATA.responses["layout"]
    var expectedValue = {
      circular_layout: true
    };
    expect(testValue).toEqual(expectedValue);
  });

  it("verify app versions", function (done) {
    loadJSON("spec/core_apps.json", function (r1) {
      var expectedValues = JSON.parse(r1)
      var expectedCount = 0;
      for (value in expectedValues) {
        expectedCount++;
      }
      expect(expectedCount).toBeGreaterThan(1);
      cyCaller.post("/v1/commands/apps/list installed", [], function (r2) {
        var testValue = JSON.parse(r2);
       
        expect(testValue.data.length).toEqual(expectedCount);

        for (i in testValue.data) {
          var app = testValue.data[i];
          expect(app["version"]).toEqual(expectedValues[app["appName"]]);
        
        }
        
        done();
      });
    });
  });

  it("save session size", function () {
    const fileSize = window.DATA.responses['session_save']['file_size']
    expect(fileSize).toBeGreaterThan(60000);
  })
  // TODO: further automated testing...

});
