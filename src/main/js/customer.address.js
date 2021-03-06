angular.module('customer.address', ['angular.usecase.adapter', 'rest.client', 'config', 'notifications', 'ngRoute'])
    .controller('CustomerAddressController', ['$scope', 'usecaseAdapterFactory', 'restServiceHandler', 'config', 'topicMessageDispatcher', '$location', 'removeAddress', CustomerAddressController])
    .controller('EditCustomerAddressController', ['$scope', 'usecaseAdapterFactory', '$routeParams', 'restServiceHandler', 'config', 'topicMessageDispatcher', '$location', 'viewCustomerAddress', EditCustomerAddressController])
    .factory('removeAddress', ['usecaseAdapterFactory', 'restServiceHandler', 'config', RemoveAddressFactory])
    .factory('viewCustomerAddress', ['usecaseAdapterFactory', 'config', 'restServiceHandler', ViewCustomerAddressFactory])
    .filter('toCountryName', ['config', function (config) {
        return function (val) {
            if (!val) return '';
            return (config.countries || []).reduce(function (p, c) {
                return c.code == val ? c.country : p;
            }, '');
        }
    }]);

function CustomerAddressController($scope, usecaseAdapterFactory, restServiceHandler, config, topicMessageDispatcher, $location, removeAddress) {
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

    $scope.submit = function (args) {
        if ($scope.address && args && args.generateLabel) {
            $scope.address.label = '(' + $scope.address.zip + ') ' + $scope.address.street + ' ' + $scope.address.number;
        }

        var onSuccess = function () {
            topicMessageDispatcher.fire('system.success', {code: 'customer.address.add.success', default: 'Address was successfully added'});
            if (!(args && args.noRedirect)) $location.search().redirectTo ? $location.url(pathToRedirectTo()) : $location.path(pathToProfile());
        };
        var presenter = usecaseAdapterFactory($scope, onSuccess);
        var baseUri = config.baseUri || '';
        presenter.params = {
            method: 'PUT',
            withCredentials: true,
            url: baseUri + 'api/entity/customer-address',
            data: {
                addressee: $scope.address ? $scope.address.addressee : $scope.addressee || '',
                label: $scope.address ? $scope.address.label : $scope.label || '',
                street: $scope.address ? $scope.address.street : $scope.street || '',
                number: $scope.address ? $scope.address.number : $scope.number || '',
                zip: $scope.address ? $scope.address.zip : $scope.zip || '',
                city: $scope.address ? $scope.address.city : $scope.city || '',
                country: $scope.address ? $scope.address.country : $scope.country || ''
            }
        };
        restServiceHandler(presenter);
    };

    $scope.rejected = function () {
        return !$scope.violations.empty;
    };

    $scope.remove = function(label) {
        var onSuccess = function() {
            $scope.init();
            topicMessageDispatcher.fire('system.success', {code: 'customer.address.delete.success', default: 'Address was successfully removed'});
        };
        removeAddress({label: label}, onSuccess);
    };

    $scope.cancel = function () {
        if ($location.search().redirectTo) {
            $location.url(pathToRedirectTo());
        } else {
            $location.path(pathToProfile());
        }
    };

    function pathToProfile() {
        return ($scope.locale ? $scope.locale : '') + '/profile';
    }

    function pathToRedirectTo() {
        return ($scope.locale ? $scope.locale : '') + $location.search().redirectTo;
    }
}

function EditCustomerAddressController($scope, usecaseAdapterFactory, $routeParams, restServiceHandler, config, topicMessageDispatcher, $location, viewCustomerAddress) {
    $scope.countries = config.countries;

    $scope.init = function (args) {
        $scope.label = (args ? args.label : undefined) || $routeParams.label;
        var onSuccess = function (payload) {
            $scope.address = payload;
            $scope.label = payload.label;
        };
        viewCustomerAddress($scope, onSuccess);
    };

    $scope.submit = function (args) {
        if (args && args.generateLabel) {
            $scope.address.label = '(' + $scope.address.zip + ') ' + $scope.address.street + ' ' + $scope.address.number;
        }

        var onSuccess = function () {
            topicMessageDispatcher.fire('system.success', {code: 'customer.address.edit.success', default: 'Address was successfully edited'});
            if (!(args && args.noRedirect)) $location.search().redirectTo ? $location.url(pathToRedirectTo()) : $location.path(pathToProfile());
        };
        var presenter = usecaseAdapterFactory($scope, onSuccess);
        var baseUri = config.baseUri || '';
        presenter.params = {
            method: 'POST',
            withCredentials: true,
            url: baseUri + 'api/entity/customer-address',
            data: {
                id: {label: $scope.label},
                addressee: $scope.address.addressee,
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
    };

    $scope.cancel = function () {
        if ($location.search().redirectTo) {
            $location.url(pathToRedirectTo());
        } else {
            $location.path(pathToProfile());
        }
    };

    function pathToProfile() {
        return ($scope.locale ? $scope.locale : '') + '/profile';
    }

    function pathToRedirectTo() {
        return ($scope.locale ? $scope.locale : '') + $location.search().redirectTo;
    }
}

function RemoveAddressFactory(usecaseAdapterFactory, restServiceHandler, config) {
    return function(scope, onSuccess) {
        var presenter = usecaseAdapterFactory(scope);
        presenter.params = {
            method: 'DELETE',
            withCredentials: true,
            url: (config.baseUri || '') + 'api/entity/customer-address/'+scope.label,
            data: {
                id: {label: scope.label}
            }
        };
        presenter.success = onSuccess;
        restServiceHandler(presenter);
    }
}

function ViewCustomerAddressFactory(usecaseAdapterFactory, config, restServiceHandler) {
    function baseUri() {
        return config.baseUri || '';
    }
    return function(scope, onSuccess) {
        var context = usecaseAdapterFactory(scope, onSuccess);
        context.params = {
            method: 'GET',
            params: {
                label: scope.label
            },
            url: baseUri() + 'api/entity/customer-address',
            withCredentials: true
        };
        restServiceHandler(context);
    }
}