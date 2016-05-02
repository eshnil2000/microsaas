'use strict';

angular.module('pizzaSwapApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('issuance', {
        url: '/swap/{id:string}/issuance',
        templateUrl: 'app/swap/issuance/issuance.html',
        controller: 'IssuanceController',
        controllerAs: 'issuance'
      });
  });
