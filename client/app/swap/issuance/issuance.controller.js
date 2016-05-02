'use strict';

(function() {

class IssuanceController {

  constructor($http, $stateParams, $scope, appConfig, cfpLoadingBar, localStorageService, $interval, ngToast) {
    $scope.contractState = {};
    $scope.contract = {};
    $scope.lastState = 0;
    $scope.eventLink = '/swap/' + $stateParams.id + '/events';

    var getDate = function() {
      var currentdate = new Date(); 
      var datetime = (currentdate.getMonth()+1)  + "/" 
                + currentdate.getDate()+ "/"
                + currentdate.getFullYear();
      return datetime;
    };

    var getTime = function(){
      var currentdate = new Date(); 
      var time =  currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
      return time;
    }

    $scope.date = getDate();
    $scope.time = getTime();

    var name = localStorageService.get('user');
    $scope.name = name;

    if (name === 'fixedPayer') {
      $scope.isFixedRatePayer = true;
    } else {
      $scope.isFloatingRatePayer = true;
    }

    $scope.id = $stateParams.id;


    /**
     * Here we are using the `state` route from bloc server.
     * We are polling the state of the contract to see if it
     * has changed. When the state of the contract changes
     * we can reflect these changes in the UI.
     */
    $scope.getContractState = function() {

      $http.get(appConfig.keyserver + 'contracts/microAPI/' + $stateParams.id + '/state/',{
        ignoreLoadingBar: true
      }).then(response => {
        $scope.contractState = response.data;
        $scope.state = $scope.contractState.stateInt;
        if ($scope.lastState == $scope.stateInt) {
          // Contract state has not changed
        }  else { // Contract state has changed
          $scope.lastState = $scope.state;
          $scope.getContractBalances();
        }
      });
    };


    /**
     * getContractBalances queries the STRATO API were my contract is deployed
     * to get the current balance of the contract. This can be useful to show 
     * users when contract balances change. 
     */
    $scope.getContractBalances = function() {
      $http.get(appConfig.apiEndPoint + 'account?address=' + $stateParams.id).then(response => {
        $scope.contract = response.data[0];
        $scope.contract.balance = (response.data[0].balance / 1000000000000000000).toFixed(3);
      });
    };

    $scope.getContractState();
    $scope.getContractBalances();


    var fetchState = $interval($scope.getContractState, 3000);

    $scope.$on("$destroy", function handler() {
        $interval.cancel(fetchState);
    });
    
    $scope.showOrderModal = function() {
      $('#sign-transaction').modal('show');
    };

    /**
     * Buyer order's the pizza by funding the smart contract 
     */
    $scope.orderPizza = function() {
      /**
       * Pass nessecary contract data to call smart contract method.
       */
      $('#sign-transaction').modal('hide');
      $('#mining-transaction').modal('show');
      var data = {
        "password": $scope.password,
        "method": "buyerAcceptsPizzaContract",
        "args": {},
        "contract": "microAPI",
        "value": $scope.contractState.pizzaPrice
      };
      var req = {
       method: 'POST',
       url: appConfig.keyserver + 'users/' + localStorageService.get('user')+ '/'+ localStorageService.get('address') + '/contract/microAPI/' + $stateParams.id + '/call',
       headers: {
         'Content-Type': 'application/json'
       },
       data: JSON.stringify(data)
      };
  
      $http(req).then(response => {
        $scope.getContractState();
        $('#mining-transaction').modal('hide');
      }, response => {
          $scope.data = response.data || "Request failed";
          $scope.status = response.status;
      });
    }
  }
}

angular.module('pizzaSwapApp')
  .controller('IssuanceController', IssuanceController);

})();
