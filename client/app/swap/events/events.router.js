'use strict';

angular.module('pizzaSwapApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('events', {
        url: '/swap/{id:string}/events',
        templateUrl: 'app/swap/events/events.html',
        controller: 'EventsController',
        controllerAs: 'Events'
      });
  });
