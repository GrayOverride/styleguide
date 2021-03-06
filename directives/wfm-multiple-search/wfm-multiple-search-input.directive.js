(function () {

    'use strict';

    var searchExpressionSeprator = ';';
    var keyValueSeprator = ':';

    var multipleSearchInputCtrl = function () {
        var vm = this;
        vm.advancedSearchForm = {};

        vm.validateSearchKeywordChanged = function () {
            vm.focusSearch();
            vm.searchOptions.searchKeywordChanged = true;
            parseSearchExpressionInputted();
        };
        vm.turnOffAdvancedSearch = function () {
            vm.showAdvancedSearchOption = false;
        };

        vm.openAdvancedSearchOption = function ($event) {
            vm.showAdvancedSearchOption = true;
            $event.stopPropagation();
            parseSearchExpressionInputted();
        };
        vm.advancedSearch = function () {
            vm.showAdvancedSearchOption = false;

            var expression = '';
            angular.forEach(vm.searchOptions.searchFields, function (searchType) {
                var title = searchType;
                expression += getSearchCriteria(title, vm.advancedSearchForm[searchType]);
            });

            expression = expression.trim().slice(0, -1);
            if (expression !== '' && expression !== vm.searchOptions.keyword) {
                vm.searchOptions.searchKeywordChanged = true;
            }
            vm.searchOptions.keyword = expression;
            if (vm.searchCallback) {
                vm.searchCallback(expression);
            }
        };

        vm.handleAdvanceSearchShowup = function () {
            vm.showAdvancedSearchOption = !vm.searchOptions.keyword;
        };

        vm.focusSearch = function () {
            vm.searchOptions.focusingSearch = true;
        };

        vm.resetFocusSearch = function () {
            vm.searchOptions.focusingSearch = false;
            return true;
        };

        vm.searchTextChange = function () {
            vm.validateSearchKeywordChanged();
            vm.handleAdvanceSearchShowup();
        };

        vm.searchTextInputKeyup = function (event) {
            if (event.which === 13) {
                vm.resetFocusSearch();
                vm.searchCallback(vm.searchOptions.keyword);
                vm.turnOffAdvancedSearch();
                return;
            }
        };

        function setSearchFormProperty(searchType, searchValue) {
            angular.forEach(vm.searchOptions.searchFields, function (propName) {
                if (propName.toUpperCase() === searchType.toUpperCase()) {
                    vm.advancedSearchForm[propName] = searchValue;
                }
            });
        }

        function parseSearchValue(value) {
            if (value === undefined || value === null || value.trim().length === 0) {
                return '';
            }
            var displayValue = value.trim();

            var quotedKeywords = '';
            var pattern = /['"](.*?)['"]/ig;
            var match;
            while ((match = pattern.exec(displayValue))) {
                var keyword = match[1].trim();
                if (keyword.length > 0) {
                    quotedKeywords = quotedKeywords + ' "' + keyword + '"';
                }
            }
            quotedKeywords = quotedKeywords.trim();

            var unquotedKeywords = displayValue
                .replace(pattern, '').trim()
                .replace('"', '').trim();

            return (quotedKeywords + ' ' + unquotedKeywords).trim();
        }

        function parseSearchExpressionInputted() {
            vm.advancedSearchForm = {};
            if (vm.searchOptions.keyword.indexOf(keyValueSeprator) !== -1) {
                var expression = vm.searchOptions.keyword.trim();
                if (expression.charAt(expression.length - 1) !== searchExpressionSeprator) {
                    expression = expression + searchExpressionSeprator;
                }
                var regex = /(\S*?):\s{0,}(.*?);/ig;
                var match;
                while ((match = regex.exec(expression))) {
                    var searchType = match[1].trim();
                    var searchValue = parseSearchValue(match[2].trim());
                    setSearchFormProperty(searchType, searchValue);
                }
            }
        }

        function getSearchCriteria(title, value) {
            var keyWords = parseSearchValue(value);
            return keyWords.length > 0 ? title + keyValueSeprator + ' ' + keyWords + searchExpressionSeprator + ' ' : '';
        }
    };

    var multipleSearchInputDirective = function () {
        return {
            controller: 'multipleSearchInputCtrl',
            controllerAs: 'vm',
            bindToController: true,
            templateUrl: 'directives/wfm-multiple-search/wfm-multiple-search-input.tpl.html',
            scope: {
                title: '=',
                searchOptions: '=?',
                searchCallback: '=?'
            }
        };
    };

    angular.module('wfm.multiplesearchinput', ['wfm.helpingDirectives'])
        .directive('wfmMultipleSearchInput', multipleSearchInputDirective)
        .controller('multipleSearchInputCtrl', multipleSearchInputCtrl);

})();
