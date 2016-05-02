'use strict';

angular.module('pizzaSwapApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('swap', {
        url: '/swap/new',
        templateUrl: 'app/swap/swap.html',
        controller: 'SwapController',
        controllerAs: 'swap'
      });
  });
