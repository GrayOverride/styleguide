(function() {

    'use strict';

    angular.module('wfm.daterangepicker', ['styleguide.templates']).directive('dateRangePicker', ['$filter', '$timeout', dateRangePicker]);

    
    function dateRangePicker($filter, $timeout) {
        return {           
            templateUrl: 'directives/date-range-picker/date-range-picker.tpl.html',
            scope: {
                'templateType': '=?',
                'testStopUi': '@?'
            },
            controller: ['$element', dateRangePickerCtrl],
            require: ['ngModel', 'dateRangePicker'],
            link: postlink
        };

        function dateRangePickerCtrl($element) {
            var ctrl = this;
            $element.addClass('wfm-date-range-picker-wrap');           
        }

        function postlink(scope, elem, attrs, ctrls) {
            var ngModelCtrl = ctrls[0],
                dateRangeCtrl = ctrls[1];

            scope.displayPopup = function() {
                return scope.templateType === 'popup';
            };
            
            popupSetup(scope);
                      
            scope.dateFormat = 'shortDate';
            attrs.$observe('dateFormat', function(v) {                
                scope.dateFormat = v;
            });

            scope.setRangeClass = setRangeClass;
            
            ngModelCtrl.$validators.empty = validateByValidDates;
            ngModelCtrl.$validators.order = validateByValidOrder;

            scope.$watchCollection(function() {
                if (!scope.startDate || !scope.endDate) return [null, null];
                return [
                  $filter('date')(scope.startDate, 'yyyy-MM-dd'),
                  $filter('date')(scope.endDate, 'yyyy-MM-dd')
                ];
            }, function(v) {
                if (scope.testStopUi) return;
                updateViewModelFromUi();                                         
                refreshDatepickers();               
            });
                       
            function validateByValidDates(modelValue, viewValue) {
                
                if (modelValue && angular.isDate(modelValue.startDate) && angular.isDate(modelValue.endDate)) {
                    return true;
                }
                return false;
            }

            function validateByValidOrder(modelValue, viewValue) {
                if (validateByValidDates(modelValue, viewValue)) 
                  return modelValue.startDate <= modelValue.endDate;
                return true;
            }

            function render() {
                scope.startDate = ngModelCtrl.$viewValue.startDate;
                scope.endDate = ngModelCtrl.$viewValue.endDate;
            }

            function updateViewModelFromUi() {
                ngModelCtrl.$setViewValue({
                    startDate: scope.startDate,
                    endDate: scope.endDate
                });                
            }
            
            function refreshDatepickers() {
                if (!scope.startDate || !scope.endDate) return;
                
                $timeout(function() {
                    var activeSelections = elem[0].querySelectorAll('button.active');
                    angular.forEach(activeSelections, function(selection) {
                        angular.element(selection).triggerHandler('click');
                    });                    
                }, 50);

                if (scope.dropDownState) {
		    if (!scope.dropDownState.showAllDatePickers) {
			scope.dropDownState.showStartDatePicker = false;
			scope.dropDownState.showEndDatePicker = false;
		    }
		}                
            }
                          
            function setRangeClass(date, mode) {
                if (!scope.startDate || !scope.endDate || moment(scope.startDate).isAfter(scope.endDate, 'day'))
                  return '';
                
                if (mode === 'day') {
                    if (! moment(date).isBefore(scope.startDate, 'day') && ! moment(date).isAfter(scope.endDate, 'day'))
                      return 'in-date-range';
                }
                return '';
            }                      
        }


        function popupSetup(scope) {
                      
            scope.dropDownState = {
		showAllDatePickers : false,
		showStartDatePicker: false,
		showEndDatePicker: false
	    };

	    scope.onClickShowAllDates = function () {
		$timeout(function() {
		    if (!scope.dropDownState.showAllDatePickers) {
			scope.dropDownState.showStartDatePicker = scope.dropDownState.showEndDatePicker = scope.dropDownState.showAllDatePickers = true;
		    } else {
			scope.dropDownState.showStartDatePicker = scope.dropDownState.showEndDatePicker = scope.dropDownState.showAllDatePickers = false;
		    }
		}, 100);				
	    }

	    scope.onClickStartDateInput = function () {
		scope.dropDownState.showStartDatePicker = !scope.dropDownState.showStartDatePicker;
		$timeout(function() {
		    scope.dropDownState.showAllDatePickers = (scope.dropDownState.showStartDatePicker === true) && (scope.dropDownState.showEndDatePicker === true);
		}, 100);
	    }

	    scope.onClickEndDateInput = function() {
		scope.dropDownState.showEndDatePicker = !scope.dropDownState.showEndDatePicker;
		$timeout(function() {
		    scope.dropDownState.showAllDatePickers = (scope.dropDownState.showStartDatePicker === true) && (scope.dropDownState.showEndDatePicker === true);
		}, 100);
	    }		

        }
}

})();
