describe('customer address', function() {
    var ctrl;
    var scope;
    var usecaseAdapter;
    var presenter = {};
    var rest;
    var configMock = {};
    var dispatcher;
    var dispatcherMock;
    var location;
    var service;

    beforeEach(module('customer.address'));
    beforeEach(module('angular.usecase.adapter'));
    beforeEach(module('rest.client'));
    beforeEach(module('notifications'));
    beforeEach(module('config'));
    beforeEach(inject(function($rootScope, $location, usecaseAdapterFactory, restServiceHandler, topicMessageDispatcher, topicMessageDispatcherMock, config) {
        scope = $rootScope.$new();
        usecaseAdapter = usecaseAdapterFactory;
        usecaseAdapter.andReturn(presenter);
        rest = restServiceHandler;
        dispatcher = topicMessageDispatcher;
        dispatcherMock = topicMessageDispatcherMock;
        location = $location;
        configMock = config;
    }));

    describe('CustomerAddressController', function() {
        var removeAddress = jasmine.createSpy('removeAddressSpy');
        beforeEach(inject(function($controller) {
            configMock = {};
            ctrl = $controller(CustomerAddressController, {$scope: scope, config: configMock, removeAddress: removeAddress});
        }));

        describe('on init', function() {
            beforeEach(function() {
                scope.init();
            });

            it('passes the scope to usecase adapter factory', function() {
                expect(usecaseAdapter.calls[0].args[0]).toEqual(scope);
            });

            it('calls the rest service with the presenter', function() {
                expect(rest.calls[0].args[0]).toEqual(presenter);
            });

            it('puts fetched addresses on the scope', function() {
                var addresses = [{property: 'prop1'}, {property: 'prop2'}]
                usecaseAdapter.calls[0].args[1](addresses);

                expect(scope.addresses).toEqual(addresses);
            });

            describe('without baseUri', function() {
                it('url is not prefixed', function () {
                    expect(presenter.params).toEqual({method: 'POST',
                        data: {args: {dummy:'dummy'}},
                        url: 'api/query/customer-address/listByPrincipal',
                        withCredentials:true});
                });
            });

            describe('with baseUri', function() {
                beforeEach(function() {
                    configMock.baseUri = 'base-uri/';
                    scope.init();
                });

                it('url is prefixed', function () {
                    expect(presenter.params).toEqual({method: 'POST',
                        data: {args: {dummy:'dummy'}},
                        url: 'base-uri/api/query/customer-address/listByPrincipal',
                        withCredentials:true});
                });
            });
        });

        describe('on delete', function() {
            beforeEach(function() {
                scope.remove('label');
            });

            it('calls remove address with label', function() {
                expect(removeAddress.calls[0].args[0]).toEqual({label: 'label'});
            });

            it('presenter sends notification', function() {
                removeAddress.calls[1].args[1]();
                expect(dispatcherMock['system.success']).toEqual({code:'customer.address.delete.success', default:'Address was successfully removed'})
            })
        });

        describe('on submit', function() {
            beforeEach(function() {
                scope.addressee = 'addressee';
                scope.label = 'label';
                scope.street = 'street-name';
                scope.number = '1';
                scope.zip = '1234';
                scope.city = 'city-name';
                scope.country = 'country-name';
                scope.submit();
            });

            it('usecase adapter receives scope', function() {
                expect(usecaseAdapter.calls[0].args[0]).toEqual(scope);
            });

            it('presenter params get populated', function() {
                expect(presenter.params).toEqual({method: 'PUT', withCredentials: true, url: 'api/entity/customer-address',
                    data: {
                        addressee: scope.addressee,
                        label: scope.label,
                        street: scope.street,
                        number: scope.number,
                        zip: scope.zip,
                        city: scope.city,
                        country: scope.country
                    }})
            });

            ['addressee', 'label', 'street', 'number', 'city', 'country'].forEach(function(item) {
                it("when " + item + " is null then it's passed as empty string", function() {
                    scope[item] = null;
                    scope.submit();

                    expect(presenter.params.data[item]).toEqual('');
                });
            });

            it('rest service receives presenter', function() {
                expect(rest.calls[0].args[0]).toEqual(presenter);
            });

            describe('on success put payload on scope ', function() {
                describe('when locale is known', function() {
                    beforeEach(function () {
                        scope.locale = 'locale';
                        usecaseAdapter.calls[0].args[1]();
                    });

                    it('dispatcher fires success message', function () {
                        expect(dispatcherMock['system.success']).toEqual({code:'customer.address.add.success', default:'Address was successfully added'});
                    });

                    it('and redirectTo is set redirect to profile', function () {
                        usecaseAdapter.calls[0].args[1]();

                        expect(location.path()).toEqual('/locale/profile');
                    });
                });

                it('when locale is undefined', function() {
                    scope.locale = undefined;
                    usecaseAdapter.calls[0].args[1]();

                    expect(location.path()).toEqual('/profile');
                });

                it('when redirectTo is set in query string and locale is known', function () {
                    scope.locale = 'locale';
                    location.search().redirectTo = '/current/path';
                    usecaseAdapter.calls[0].args[1]();

                    expect(location.path()).toEqual('/locale/current/path');
                });

                it('when redirectTo is set in query string and locale is unknown', function () {
                    scope.locale = undefined;
                    location.search().redirectTo = '/current/path';
                    usecaseAdapter.calls[0].args[1]();

                    expect(location.path()).toEqual('/current/path');
                });

                it('when redirectTo is not set redirect to profile', function () {
                    usecaseAdapter.calls[0].args[1]();

                    expect(location.path()).toEqual('/profile');
                });

                it('when type is not set in query string', function () {
                    location.search().redirectTo = '/path';
                    scope.label = 'label';

                    usecaseAdapter.calls[0].args[1]();

                    expect(location.search().type).toBeUndefined();
                });
            });

            describe('with noRedirect arg and on success', function() {
                beforeEach(function () {
                    usecaseAdapter.reset();
                    location.path('/');
                    scope.submit({noRedirect: true});
                    usecaseAdapter.calls[0].args[1]();
                });

                it('do not redirect', function () {
                    expect(location.path()).toEqual('/');
                });
            });

            it('with base-uri', function() {
                configMock.baseUri = 'base-uri/';
                scope.submit();

                expect(presenter.params.url).toEqual('base-uri/api/entity/customer-address');
            });

        });

        describe('on submit with address object', function() {
            beforeEach(function() {
                scope.address = {
                    addressee: 'addressee',
                    label: 'label',
                    street: 'street-name',
                    number: '1',
                    zip: '1234',
                    city: 'city-name',
                    country: 'country-name'
                };
                scope.submit();
            });

            it('presenter params get populated', function() {
                expect(presenter.params).toEqual({method: 'PUT', withCredentials: true, url: 'api/entity/customer-address',
                    data: {
                        addressee: scope.address.addressee,
                        label: scope.address.label,
                        street: scope.address.street,
                        number: scope.address.number,
                        zip: scope.address.zip,
                        city: scope.address.city,
                        country: scope.address.country
                    }});
            });
        });

        describe('on cancel', function () {
            describe('and redirectTo is set in query string and locale is known', function () {
                beforeEach(function () {
                    scope.locale = 'locale';
                    location.search().redirectTo = '/current/path';
                    scope.cancel();
                });

                it('redirect to path', function () {
                    expect(location.path()).toEqual('/locale/current/path');
                });
            });

            describe('and redirectTo is set in query string and locale is unknown', function () {
                beforeEach(function () {
                    scope.locale = undefined;
                    location.search().redirectTo = '/current/path';
                    scope.cancel();
                });

                it('redirect to path', function () {
                    expect(location.path()).toEqual('/current/path');
                });
            });

            describe('and redirectTo is not set in query string and locale is known', function () {
                beforeEach(function () {
                    scope.locale = 'locale';
                    scope.cancel();
                });

                it('redirect to profile', function () {
                    expect(location.path()).toEqual('/locale/profile');
                });
            });

            describe('and redirectTo is not set in query string and locale is unknown', function () {
                beforeEach(function () {
                    scope.locale = undefined;
                    scope.cancel();
                });

                it('redirect to profile', function () {
                    expect(location.path()).toEqual('/profile');
                });
            });
        });
    });

    describe('viewCustomerAddress', function() {
        var success = function() {}

        beforeEach(inject(function(viewCustomerAddress) {
            service = viewCustomerAddress;
            scope.label = 'label';
            service(scope, success);
        }));

        it('passes the scope to usecase adapter factory', function() {
            expect(usecaseAdapter.mostRecentCall.args[0]).toEqual(scope);
        });

        it('test', function() {
            expect(usecaseAdapter.mostRecentCall.args[1]).toEqual(success);
        });

        it('url is not prefixed', function () {
            expect(presenter.params.method).toEqual('GET');
            expect(presenter.params.params).toEqual({label:scope.label});
            expect(presenter.params.url).toEqual('api/entity/customer-address');
            expect(presenter.params.withCredentials).toEqual(true);
        });

        it('url is prefixed', function() {
            configMock.baseUri = 'baseUri/';
            service(scope);

            expect(presenter.params.url).toEqual('baseUri/api/entity/customer-address');
        });

        it('calls the rest service with the presenter', function() {
            expect(rest.calls[0].args[0]).toEqual(presenter);
        });
    });

    describe('EditCustomerAddressController', function() {
        var routeParams = {};
        var viewCustomerAddress = jasmine.createSpy('viewCustomerAddress');
        var address = {};

        beforeEach(inject(function($controller) {
            configMock = {};
            routeParams.label = 'label';
            ctrl = $controller(EditCustomerAddressController, {$scope: scope, $routeParams: routeParams, config: configMock, viewCustomerAddress: viewCustomerAddress});
        }));

        describe('on init', function() {
            beforeEach(function() {
                scope.init();
            });

            it('puts label from route on scope', function() {
                expect(scope.label).toEqual(routeParams.label);
            });

            it('test', function() {
                scope.init({label:'L'});
                expect(scope.label).toEqual('L');
            });

            it('passes scope to view customer address', function() {
                expect(viewCustomerAddress.mostRecentCall.args[0]).toEqual(scope);
            });

            describe('when executing success callback', function() {
                beforeEach(inject(function() {
                    viewCustomerAddress.mostRecentCall.args[1](address);
                }));

                it('payload gets put on scope as address', function() {
                    expect(scope.address).toEqual(address);
                });

                it('payload label gets put on scope', function() {
                    expect(scope.label).toEqual(address.label);
                });
            });
        });

        describe('on submit', function() {
            beforeEach(function() {
                scope.address = {};
                scope.address.addressee = 'addressee';
                scope.address.label = 'label';
                scope.address.street = 'street';
                scope.address.number = '1';
                scope.address.zip = '1234';
                scope.address.city = 'city';
                scope.address.country = 'country';
                scope.submit();
            });

            it('passes the scope to usecase adapter factory', function() {
                expect(usecaseAdapter.calls[0].args[0]).toEqual(scope);
            });

            it('calls the rest service with the presenter', function() {
                expect(rest.calls[0].args[0]).toEqual(presenter);
            });

            it('url is not prefixed', function () {
                expect(presenter.params).toEqual({method: 'POST',
                    data: {
                        id: {label: scope.label},
                        addressee: scope.address.addressee,
                        label: scope.address.label,
                        street: scope.address.street,
                        number: scope.address.number,
                        zip: scope.address.zip,
                        city: scope.address.city,
                        country: scope.address.country,
                        context: 'update'
                    },
                    url: 'api/entity/customer-address',
                    withCredentials:true});
            });

            it('url is prefixed', function() {
                configMock.baseUri = 'baseUri/';
                scope.submit();

                expect(presenter.params).toEqual({method: 'POST',
                    data: {
                        id: {label:scope.label},
                        addressee: scope.address.addressee,
                        label: scope.address.label,
                        street: scope.address.street,
                        number: scope.address.number,
                        zip: scope.address.zip,
                        city: scope.address.city,
                        country: scope.address.country,
                        context: 'update'
                    },
                    url: 'baseUri/api/entity/customer-address',
                    withCredentials:true});
            });

            it('on success put payload on scope', function() {
                scope.locale = 'locale';
                usecaseAdapter.calls[0].args[1]();
                expect(dispatcherMock['system.success']).toEqual({code:'customer.address.edit.success', default:'Address was successfully edited'});
                expect(location.path()).toEqual('/locale/profile');
            });

            describe('on success put payload on scope and redirect to profile', function() {
                describe('when locale is known', function() {
                    beforeEach(function () {
                        scope.locale = 'locale';
                    });

                    it('dispatcher fires success message', function () {
                        usecaseAdapter.calls[0].args[1]();

                        expect(dispatcherMock['system.success']).toEqual({code:'customer.address.edit.success', default:'Address was successfully edited'});
                    });

                    it('and redirectTo is set in query string', function () {
                        location.search().redirectTo = '/path';
                        usecaseAdapter.calls[0].args[1]();

                        expect(location.path()).toEqual('/locale/path');
                    });

                    it('and redirectTo is not set in query string', function () {
                        usecaseAdapter.calls[0].args[1]();

                        expect(location.path()).toEqual('/locale/profile');
                    });
                });

                describe('when locale is undefined', function() {
                    beforeEach(function () {
                        scope.locale = undefined;
                    });

                    it('and redirectTo is set in query string', function () {
                        location.search().redirectTo = '/path';
                        usecaseAdapter.calls[0].args[1]();

                        expect(location.path()).toEqual('/path');
                    });

                    it('and redirectTo is not set in query string', function () {
                        usecaseAdapter.calls[0].args[1]();

                        expect(location.path()).toEqual('/profile');
                    });
                });
            });

            describe('with noRedirect arg and on success', function() {
                beforeEach(function () {
                    usecaseAdapter.reset();
                    location.path('/');
                    scope.submit({noRedirect: true});
                    usecaseAdapter.calls[0].args[1]();
                });

                it('do not redirect', function () {
                    expect(location.path()).toEqual('/');
                });
            });
        });

        describe('on cancel', function () {
            describe('and redirectTo is set in query string and locale is known', function () {
                beforeEach(function () {
                    scope.locale = 'locale';
                    location.search().redirectTo = '/current/path';
                    scope.cancel();
                });

                it('redirect to path', function () {
                    expect(location.path()).toEqual('/locale/current/path');
                });
            });

            describe('and redirectTo is set in query string and locale is unknown', function () {
                beforeEach(function () {
                    scope.locale = undefined;
                    location.search().redirectTo = '/current/path';
                    scope.cancel();
                });

                it('redirect to path', function () {
                    expect(location.path()).toEqual('/current/path');
                });
            });

            describe('and redirectTo is not set in query string and locale is known', function () {
                beforeEach(function () {
                    scope.locale = 'locale';
                    scope.cancel();
                });

                it('redirect to profile', function () {
                    expect(location.path()).toEqual('/locale/profile');
                });
            });

            describe('and redirectTo is not set in query string and locale is unknown', function () {
                beforeEach(function () {
                    scope.locale = undefined;
                    scope.cancel();
                });

                it('redirect to profile', function () {
                    expect(location.path()).toEqual('/profile');
                });
            });
        });

    });

    describe('RemoveAddress', function() {
        var service;
        var onSuccess = function() {};

        beforeEach(function() {
            scope.label = 'label';
            service = RemoveAddressFactory(usecaseAdapter, rest, {baseUri: 'base-uri/'});
            service(scope, onSuccess);
        });

        it('passes the scope to the usecase factory', function() {
            expect(usecaseAdapter.calls[0].args[0]).toEqual(scope);
        });

        it('sends DELETE request', function() {
            expect(presenter.params.method).toEqual('DELETE');
        });

        it('sends credentials', function() {
            expect(presenter.params.withCredentials).toEqual(true);
        });

        it('sends request to entity resource with base uri', function() {
            expect(presenter.params.url).toEqual('base-uri/api/entity/customer-address/'+scope.label);
        });

        it('sends request to entity resource without base uri', function() {
            service = RemoveAddressFactory(usecaseAdapter, rest, {});
            service(scope, onSuccess);

            expect(presenter.params.url).toEqual('api/entity/customer-address/'+scope.label);
        });

        it('sets the success handler', function() {
            expect(presenter.success).toEqual(onSuccess);
        });

        it('test', function() {
            expect(rest.calls[0].args[0]).toEqual(presenter);
        })
    });
});