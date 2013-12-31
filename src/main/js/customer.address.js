angular.module('customer.address', ['angular.usecase.adapter', 'rest.client'])
    .controller('CustomerAddressController', ['$scope', 'usecaseAdapterFactory', 'restServiceHandler', 'config', 'topicMessageDispatcher', '$location', CustomerAddressController])
    .controller('EditCustomerAddressController', ['$scope', 'usecaseAdapterFactory', '$routeParams', 'restServiceHandler', 'config', 'topicMessageDispatcher', '$location', EditCustomerAddressController]);

function CustomerAddressController($scope, usecaseAdapterFactory, restServiceHandler, config, topicMessageDispatcher, $location) {
    $scope.countries = config.countries;
    $scope.countryFor = function (code) {
        return $scope.countries.forEach(function (c) {
            if (c.code == code) {
                return c.country;
            }
            return null;
        });
    };
    $scope.init = function () {
        var onSuccess = function (payload) {
            $scope.addresses = payload;
        };
        var presenter = usecaseAdapterFactory($scope, onSuccess);
        var baseUri = config.baseUri || '';
        presenter.params = {
            method: 'POST',
            data: {args: {dummy: 'dummy'}},
            url: baseUri + 'api/query/customer-address/listByPrincipal',
            withCredentials: true
        };
        restServiceHandler(presenter);
    };

    $scope.submit = function () {
        var onSuccess = function () {
            topicMessageDispatcher.fire('system.success', {code: 'customer.address.add.success', default: 'Address was successfully added'})
            $location.path(($scope.locale ? $scope.locale : '') + '/profile');
        };
        var presenter = usecaseAdapterFactory($scope, onSuccess);
        var baseUri = config.baseUri || '';
        presenter.params = {
            method: 'PUT',
            withCredentials: true,
            url: baseUri + 'api/entity/customer-address',
            data: {
                label: $scope.label || '',
                street: $scope.street || '',
                number: $scope.number || '',
                zip: $scope.zip || '',
                city: $scope.city || '',
                country: $scope.country || ''
            }
        };
        restServiceHandler(presenter);
    };

    $scope.rejected = function () {
        return !$scope.violations.empty;
    }
}

function EditCustomerAddressController($scope, usecaseAdapterFactory, $routeParams, restServiceHandler, config, topicMessageDispatcher, $location) {
    $scope.countries = config.countries;
    $scope.init = function () {
        var onSuccess = function (payload) {
            $scope.address = payload;
            $scope.label = payload.label;
        };
        var baseUri = config.baseUri || '';
        var presenter = usecaseAdapterFactory($scope, onSuccess);
        presenter.params = {
            method: 'GET',
            withCredentials: true,
            url: baseUri + 'api/entity/customer-address',
            params: {
                label: $routeParams.label
            }
        };

        restServiceHandler(presenter);
    };

    $scope.submit = function () {
        var onSuccess = function () {
            topicMessageDispatcher.fire('system.success', {code: 'customer.address.edit.success', default: 'Address was successfully edited'})
            $location.path(($scope.locale ? $scope.locale : '') + '/profile')
        };
        var presenter = usecaseAdapterFactory($scope, onSuccess);
        var baseUri = config.baseUri || '';
        presenter.params = {
            method: 'POST',
            withCredentials: true,
            url: baseUri + 'api/entity/customer-address',
            data: {
                id: {label: $scope.label},
                label: $scope.address.label,
                street: $scope.address.street,
                number: $scope.address.number,
                zip: $scope.address.zip,
                city: $scope.address.city,
                country: $scope.address.country,
                context: 'update'
            }
        };
        restServiceHandler(presenter);
    }
}