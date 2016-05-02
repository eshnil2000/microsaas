'use strict';

(function() {
class EventsController {
  constructor($http, $stateParams, $scope, appConfig, cfpLoadingBar, localStorageService, $state) {
    var name = localStorageService.get('user');
    $scope.pizzaSwap = {};
    $scope.id = $stateParams.id;
    $scope.isHappy = false;

    /**
     * Get the current state of the contract.
     */
    $scope.getContractState = function() {
      $http.get(appConfig.keyserver + 'contracts/microAPI/' + $stateParams.id + '/state/').then(response => {
        $scope.pizzaState = response.data;
      });
    }
    $scope.getContractState();

    /**
     * Get the public address for the oracle. 
     */
    $scope.getPcs = function(){
      $http.get(appConfig.keyserver + 'users/oracle' ).then(response =>{
        $scope.pcs = response.data[0];
      });
    };
    $scope.getPcs();

    /**
     * Rate Satisfaction 
     */
    $scope.rateSatisfaction = function(choice) {
      $('#mining-transaction').modal('show');
      $scope.isHappy = choice;
      var data = {
        "password": "thepass",
        "method": "rateSatisfaction",
        "args": {
          "isHappy": $scope.isHappy
        },
        "contract": "PizzaContract"
      };

      var req = {
       method: 'POST',
       url: appConfig.keyserver + 'users/oracle/'+ $scope.pcs + '/contract/microAPI/' + $stateParams.id + '/call',
       headers: {
         'Content-Type': 'application/json'
       },
       data: JSON.stringify(data)
      };
      console.log(req);

      for (var i = 0; i < 10; i++) { 

      $http(req).then(response => {
        $scope.getContractState();
        $('#mining-transaction').modal('hide');
        $('#pizzaConfirmation').modal('show');
      }, response => {
          $scope.data = response.data || "Request failed";
          $scope.status = response.status;
      });
    };

    }
    $('#pizzaConfirmation').on('hidden.bs.modal', function () {
      $state.transitionTo('issuance', {id:$stateParams.id});
    });
  }
}

angular.module('pizzaSwapApp')
  .controller('EventsController', EventsController);
})();
