describe("Cytoscape", function() {

  beforeAll(function() {
    //console.log(window.DATA['log'])
  });

  beforeEach(function() {

  });

  it("check status", function() {
    var testValue = window.DATA.responses["status"]
    var expectedValue = { 
      allAppsStarted: true,
      apiVersion: 'v1'
    };
    expect(testValue).toEqual(expectedValue);
  });

  it("check version", function() {
    var testValue = window.DATA.responses["version"]
    var expectedValue = { 
      cytoscapeVersion: '3.7.0-SNAPSHOT',
      apiVersion: 'v1'
    };
    expect(testValue).toEqual(expectedValue);
  });

  it("check galFiltered counts", function() {
    var testValue = window.DATA.responses["galfiltered"]
    var expectedValue = 
      {'cyrestEdgeCount': 359, 
       'cyrestNodeCount': 330,
       'nodeCountMatches': true,
       'edgeCountMatches': true
      };
    expect(testValue).toEqual(expectedValue);
  });
});
