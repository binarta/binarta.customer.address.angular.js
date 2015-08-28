angular.module("customer.address.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("bin-customer-address-form-groups.html","<div class=form-group ng-class=\"{\'has-error\': violations.addressee}\"><label class=control-label for=addressee i18n code=customer.address.addressee.label read-only>{{::var}}</label> <input id=addressee class=form-control ng-model=address.addressee required><p class=help-block ng-repeat=\"v in violations.addressee\" i18n code=customer.address.addressee.{{::v}} default=\"Addressee {{::v}}\" read-only>{{::var}}</p></div><div class=row><div class=col-sm-8><div class=form-group ng-class=\"{\'has-error\': violations.street}\"><label class=control-label for=street i18n code=customer.address.street.label read-only>{{::var}}</label> <input id=street class=form-control ng-model=address.street required><p class=help-block ng-repeat=\"v in violations.street\" i18n code=customer.address.street.{{::v}} default=\"Street {{::v}}\" read-only>{{::var}}</p></div></div><div class=col-sm-4><div class=form-group ng-class=\"{\'has-error\': violations.number}\"><label class=control-label for=number i18n code=customer.address.number.label read-only>{{::var}}</label> <input id=number class=form-control ng-model=address.number required><p class=help-block ng-repeat=\"v in violations.number\" i18n code=customer.address.number.{{::v}} default=\"Number {{::v}}\" read-only>{{::var}}</p></div></div></div><div class=row><div class=col-sm-8><div class=form-group ng-class=\"{\'has-error\': violations.city}\"><label class=control-label for=city i18n code=customer.address.city.label read-only>{{::var}}</label> <input id=city class=form-control ng-model=address.city required><p class=help-block ng-repeat=\"v in violations.city\" i18n code=customer.address.city.{{::v}} default=\"City {{::v}}\" read-only>{{::var}}</p></div></div><div class=col-sm-4><div class=form-group ng-class=\"{\'has-error\': violations.zip}\"><label class=control-label for=zip i18n code=customer.address.zip.label read-only>{{::var}}</label> <input id=zip class=form-control ng-model=address.zip required><p class=help-block ng-repeat=\"v in violations.zip\" i18n code=customer.address.zip.{{::v}} default=\"Zip {{::v}}\" read-only>{{::var}}</p></div></div></div><div class=form-group ng-class=\"{\'has-error\': violations.country}\"><label class=control-label for=country i18n code=customer.address.country.label read-only>{{::var}}</label><select id=country class=form-control ng-model=address.country ng-options=\"c.code as c.country for c in countries\" required></select><p class=help-block ng-repeat=\"v in violations.country\" i18n code=customer.address.country.{{::v}} default=\"Country {{::v}}\" read-only>{{::var}}</p></div>");}]);