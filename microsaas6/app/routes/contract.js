var express = require('express');
var helper = require('../lib/contract-helpers.js');
var router = express.Router();
var Promise = require('bluebird');
var Solidity = require('blockapps-js').Solidity;
var api = require('blockapps-js');
var cors = require('cors');
var traverse = require('traverse');
var fs = require('fs');

var yaml = require('js-yaml');

var config = yaml.safeLoad(fs.readFileSync('config.yaml'));
var apiURI = config.apiURL;

api.query.serverURI =  process.env.API || apiURI;

require('marko/node-require').install();

var homeTemplate = require('marko').load(require.resolve('../components/home/home.marko'));
var contractTemplate = require('marko').load(require.resolve('../components/contracts/template.marko'));

/* accept header used */

router.get('/', cors(), function(req, res) {
    helper.contractDirsStream()
	.pipe( helper.collect() )
	.pipe( es.map(function (data,cb) {
   var directoryTree = {};
    data.map(function (item) {
    
    var createdAt = Date.parse(item.stat.birthtime);
    
    var entries = item.path.split('/');
    if (directoryTree[entries[0]] === undefined) { 
      directoryTree[entries[0]] = [];
    }
    // Remove .json 
    var address = entries[1].replace('.json', '');

    var contractObj = {
      "address": address,
      "createdAt": createdAt
    };

    directoryTree[entries[0]].push(contractObj);
    //entries[0].sort(function(a, b) {return b - a});
  });

	    cb(null,directoryTree);
        }))				   
       .on('data', function (data) {
                      res.format({
                          html: function() {
                              homeTemplate.render(data, res);
                          },

                          json: function() {
                              res.send(JSON.stringify(data));
                          } 
                      })
       })
});

router.get('/:contractName', cors(), function (req, res) {
    var contractName = req.params.contractName;
    helper.contractAddressesStream(contractName)
      .pipe( helper.collect() )
      .pipe( es.map(function (data,cb) {
	    var names = data.map(function (item) {
	             return item.split('.')[0];
	    });

	    cb(null,JSON.stringify(names));
       }))
      .pipe(res)
});

/* accept header not used, explicit extension expected */

router.get('/:contractName/:contractAddress\.:extension?', function (req, res) {
  var contractName = req.params.contractName;
  var extension = req.params.extension;
  var contractAddress = req.params.contractAddress;

  console.log('extension was matched: ' + extension);

  var contractMetaAddressStream = helper.contractsMetaAddressStream(contractName,contractAddress)
      .pipe( helper.collect() )
      .pipe( es.map(function (data,cb) {
            var contractData = {};
            contractData.contractMeta = data[0];

            console.log("contractData: " + JSON.stringify(contractData));
	    cb(null,contractData);
       }))

  var configStream = helper.configStream();

  helper.fuseStream([configStream,contractMetaAddressStream])
       .on('data', function (data) {
                      if (extension === 'html') { 
                          data.txFailedHandlerCode = "function txFailHandler(e) { $('#passwordModal').modal('show'); }";
                          data.txFailedHandlerName = "txFailHandler";
                          contractTemplate.render(data, res); 
                      } else { res.send(JSON.stringify(data.contractMeta)); }
          });
});


router.get('/:contractName/:contractAddress/functions', cors(), function (req, res) {
    var contractName = req.params.contractName;
    var contractAddress = req.params.contractAddress;

    helper.contractsMetaAddressStream(contractName,contractAddress)
        .pipe( es.map(function (data,cb) {	    
            if (data.name == contractName) {
		var sym = data.symTab;
		var funcs = Object.keys(sym).filter(function (item) {
                    return (sym[item].jsType == 'Function');
		});
                cb(null,JSON.stringify(funcs));
	    }
            else cb();                      
          }))
        .pipe(res)
});

router.get('/:contractName/:contractAddress/symbols', cors(), function (req, res) {
    var contractName = req.params.contractName;
    var contractAddress = req.params.contractAddress;

    helper.contractsMetaAddressStream(contractName,contractAddress)
        .pipe( es.map(function (data,cb) {	    
            if (data.name == contractName) {
		var sym = data.symTab;
		var funcs = Object.keys(sym).filter(function (item) {
                    return (sym[item].jsType !== 'Function');
		});
                cb(null,JSON.stringify(funcs));
	    }
            else cb();                      
          }))
        .pipe(res)
});

router.get('/:contractName/:contractAddress/state', cors(), function (req, res) {
    var contractName = req.params.contractName;
    var contractAddress = req.params.contractAddress;
    
    helper.contractsMetaAddressStream(contractName,contractAddress)
      .pipe( es.map(function (data,cb) {
	          if (data.name == contractName) cb(null,data);
                  else cb();                      
        }))

      .on('data', function(data) {
	    var contract = Solidity.attach(data);
	    return Promise.props(contract.state).then(function(sVars) {

                var parsed = traverse(sVars).forEach(function (x) { 
                    if (Buffer.isBuffer(x)) { 
                        this.update(x.toString());
                    }
                });
             
		res.send(parsed);
	    });
	});

});

module.exports = router;
