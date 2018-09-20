describe("Cytoscape", function() {

  beforeAll(function() {
    console.log(window.DATA.responses);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  beforeEach(function() {

  });

  it("check status", function(done) {
    var testValue = window.DATA.responses["status"];
    var expectedValue = { 
      allAppsStarted: true,
      apiVersion: 'v1'
    };
    cyCaller.get("/v1", function(v){
      log(v)
      v = JSON.parse(v)
      data = {"allAppsStarted": v['allAppsStarted'], "apiVersion": v['apiVersion']}
      expect(data).toEqual(expectedValue);
      done();
    })
  });

  it("check version", function(done) {
    var expectedValue = { 
      cytoscapeVersion: '3.7.0-SNAPSHOT',
      apiVersion: 'v1'
    };
    cyCaller.get("/v1/version", function(v){
      log(v)
      v = JSON.parse(v)
      expect(v).toEqual(expectedValue);
      done();
    });
  });
  
  it("check close session", function(){
    const value = window.DATA.responses['close_session'];
    const expectedValue = {new_session: true};
    expect(value).toEqual(expectedValue);
  })

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

  it("diffusion", function() {
    var testValue = window.DATA.responses["diffusion"]
    var expectedValue = { 
      "diffused" : true
    };
    expect(testValue).toEqual(expectedValue);
  });
 
  it("layout", function() {
    var testValue = window.DATA.responses["layout"]
    var expectedValue = { 
      circular_layout: true
    };
    expect(testValue).toEqual(expectedValue);
  });

  it("verify app versions", function(done) {
    var expectedValues =
    {
      'NetworkAnalyzer': "3.3.2",
      'Biomart Web Service Client': "3.3.2",
      'CyNDEx-2': "2.2.4.SNAPSHOT",
      'cyREST': "3.8.0",
      'CyCL': "3.5.0",
      'Welcome Screen': "3.5.2",
      'ID Mapper': "3.6.3",
      'JSON Support': "3.6.2",
      'Network Merge': "3.3.4",
      'Core Apps': "3.4.0",
      'copycatLayout': "1.2.3",
      'cyBrowser': "1.0.4",
      'BioPAX Reader': "3.3.3",
      'PSICQUIC Web Service Client': "3.4.0",
      'Diffusion': "1.5.4.SNAPSHOT",
      'PSI-MI Reader': "3.3.3",
      'SBML Reader': "3.3.4",
      'OpenCL Prefuse Layout': "3.5.0",
      'CX Support': "2.2.4"
  };
    cyCaller.post("/v1/commands/apps/list installed", [], function(r){
      var testValue = JSON.parse(r);
      for (app in testValue.data) {
        expect(app['version']).toEqual(expectedValues[app['name']]);
      }
      done();
    });
  });
  
  it("save session size", function(){
    const fileSize = window.DATA.responses['session_save']['file_size']
    expect(fileSize).toBeGreaterThan(200000);
  })
  // TODO: further automated testing...
  
});
