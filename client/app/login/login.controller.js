'use strict';

(function() {

class LoginController {



  constructor($http, appConfig, $scope, $location, localStorageService, $state) {
    this.$http = $http;
    this.awesomeThings = [];

    var saveUserToStorage = function(user){
      return localStorageService.set('user', user);
    }

    $http.get(appConfig.keyserver + 'users').then(response => {
      console.log("we have users");
      $scope.users = response.data;
      console.log(response);

    });

    $scope.submit = function(user){

      console.log(user);
      if (user === undefined) {
        alert("Please Choose A User");
        return;
      }

      if (saveUserToStorage(user)){
        $state.transitionTo('dashboard', {name: user}, {
          reload: true, 
          inherit: false, 
          notify: true
        });
        //$location.path('/dashboard/' + user);
      } else {
        alert('Something Went Wrong Please Try Again.')
      }

    }

   // CREATE NEW USER
    //================
    $scope.createUser = function(){

      var dataString = "password=" + $scope.password+"&faucet=1";

      var req = {
       method: 'POST',
       url: appConfig.keyserver + 'users/'+$scope.newUser,
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
       },
       data: dataString
      };

      $http(req).then(response => {
        console.log('created user');
        $state.transitionTo('dashboard', {name: $scope.newUser});
      }, response => {
          $scope.data = response.data || "Request failed";
          $scope.status = response.status;
      });
    } 
    
  }

  

}

angular.module('pizzaSwapApp')
  .controller('LoginController', LoginController);

})();
