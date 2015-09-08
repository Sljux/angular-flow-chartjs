'use strict';

angular.module('ngFlowChartJs', ['ngFlowChart'])
    .directive('flowChartJs', flowChartJsFactory);

function flowChartJsFactory() {
    return {
        restrict: 'E',
        require: '^flowChart',
        template: templateFunc,
        scope: {
            chartType:       '@',
            chartOptions:    '=',
            valueProperties: '=',
            valueDefaults:   '=',
            labelProperty:   '=',
            labelDefault:    '=',
            series:          '=',
            click:           '=?',
            hover:           '=?',
            legend:          '=',
            colours:         '=?'
        },
        link: link
    };

    function templateFunc(element, attrs) {
        var chartType = attrs.chartType;

        if (angular.isUndefined(chartType))
            return;

        return '<canvas class="chart chart-' + chartType + '" data="graphData" ' +
            'options="chartOptions" labels="labels" legend="legend" click="click" hover="hover" series="series" colours="colours"></canvas>';
    }

    function link(scope, element, attrs, flowChartCtrl) {
        var LabelMode = {
            NONE: 0,
            AUTO: 1,
            PROP: 2
        };

        if (Object.freeze) {
            Object.freeze(LabelMode)
        }

        var forEach   = angular.forEach,
            isDefined = angular.isDefined,
            isString  = angular.isString,
            isArray   = angular.isArray,
            isBool    = function (val) {
                return val === true || val === false || toString.call(val) === '[object Boolean]'
            };

        var valueProperties = parseValueProperty(),
            labelMode,
            labelProperty = parseLabelProperty(),
            valueDefaults = isDefined(scope.valueDefaults) ? scope.valueDefaults : null,
            labelDefault  = isDefined(scope.labelDefault)  ? scope.labelDefault  : null,
            limit         = flowChartCtrl.limit;

        scope.graphData = [];
        scope.labels    = [];

        scope.$on('flowChart:init', function (e, data) {
            scope.graphData = parseValues(data, valueProperties, valueDefaults);
            scope.labels = initLabels(data);
        });

        scope.$on('flowChart:newDrop', function (e, drop) {
            scope.labels.push(formNewLabel(drop));

            forEach(valueProperties, function (prop, i) {
                var valueDefault = isArray(valueDefaults) ? valueDefaults[i] : valueDefaults;
                scope.graphData[i].push(extractProperty(drop, prop, valueDefault));
            });

            if (scope.graphData[0].length > limit) {
                forEach(scope.graphData, function (_, i) {
                    scope.graphData[i] = scope.graphData[i].slice(1);
                });
                scope.labels = scope.labels.slice(1);
            }
        });

        function parseValueProperty() {
            var result = isArray(scope.valueProperties) ? scope.valueProperties : [scope.valueProperties];
            return result.map(formProperty)
        }

        function parseLabelProperty() {
            if (isBool(scope.labelProperty)) {
                labelMode = scope.labelProperty ? LabelMode.AUTO : LabelMode.NONE;
                return scope.labelProperty
            } else if (isString(scope.labelProperty)) {
                labelMode = LabelMode.PROP;
                return formProperty(scope.labelProperty)
            } else {
                labelMode = LabelMode.NONE;
                return false;
            }
        }

        function initLabels(data) {
            switch (labelMode) {
                case LabelMode.NONE:
                    return arrayOfEmptyStrings(data.length);
                case LabelMode.AUTO:
                    return range(Math.min(limit, data.length));
                case LabelMode.PROP:
                    return parseLabels(data, labelProperty, labelDefault);
                default:
                    return arrayOfEmptyStrings(data.length);
            }

            function arrayOfEmptyStrings(length) {
                return Array.apply(null, new Array(length)).map(String.prototype.valueOf, '');
            }
        }

        function formNewLabel(drop) {
            switch (labelMode) {
                case LabelMode.NONE:
                    return '';
                case LabelMode.AUTO:
                    return scope.labels[scope.labels.length - 1] + 1;
                case LabelMode.PROP:
                    return extractProperty(drop, labelProperty, labelDefault);
                default:
                    return '';
            }
        }

        function formProperty(prop) {
            if (!prop)
                return '';

            prop = prop.replace('.', '.value.');

            return ['elems'].concat(prop.split('.'), ['value']);
        }

        function parseValues(data, property, defaultValues) {
            data = data.slice(-limit);
            var result = Array(property.length);

            for (var i = 0; i < result.length; i++)
                result[i] = Array(data.length);

            forEach(data, function (item, i) {
                forEach(property, function (prop, j) {
                    var defaultValue = isArray(defaultValues) ? defaultValues[j] : defaultValues;
                    result[j][i] = extractProperty(item, prop, defaultValue)
                })
            });

            return result
        }

        function parseLabels(data, property, defaultValue) {
            data = data.slice(-limit);
            var result = Array(data.length);

            forEach(data, function (item, i) {
                result[i] = extractProperty(item, property, defaultValue)
            });

            return result
        }

        function extractProperty(object, path, defaultValue) {
            for (var i = 0, n = path.length; i < n; ++i) {
                var k = path[i];

                if (k in object) {
                    object = object[k];
                } else {
                    return defaultValue;
                }
            }
            return object;
        }

        function range(n) {
            var result = Array(n);

            for (var i = 0; i < n; i++) { result[i] = i }

            return result;
        }
    }
}