'use strict';

angular.module('ngFlowChartJs', ['ngFlowChart'])
    .directive('flowChartJs', flowChartJsFactory);

function flowChartJsFactory() {
    return {
        restrict: 'E',
        require: '^flowChart',
        template: templateFunc,
        scope: {
            chartType:     '@',
            chartOptions:  '=',
            valueProperty: '=',
            valueDefault:  '=',
            labelProperty: '=',
            labelDefault:  '=',
            series:        '=',
            click:         '=?',
            hover:         '=?',
            legend:        '=',
            colours:       '=?'
        },
        link: link
    };

    function templateFunc(element, attrs) {
        var chartType = attrs.chartType;

        if (angular.isUndefined(chartType))
            return;

        return '<canvas class="chart chart-' + chartType + '" data="[graphData]" ' +
            'options="chartOptions" labels="labels" legend="legend" click="click" hover="hover" series="series" colours="colours"></canvas>';
    }

    function link(scope, element, attrs, flowChartCtrl) {
        var isDefined = angular.isDefined;

        var valueProperty = formProperty(scope.valueProperty),
            labelProperty = formProperty(scope.labelProperty),
            valueDefault  = isDefined(scope.valueDefault) ? scope.valueDefault : null,
            labelDefault  = isDefined(scope.labelDefault) ? scope.labelDefault : null,
            limit         = flowChartCtrl.limit;

        scope.graphData = [];
        scope.labels    = [];

        scope.$on('flowChart:init', function (e, data) {
            scope.graphData = parseData(data, valueProperty, valueDefault);
            scope.labels = labelProperty ? parseData(data, labelProperty, labelDefault) : range(scope.graphData.length);
        });

        scope.$on('flowChart:newDrop', function (e, drop) {
            var newItem  = extractProperty(drop, valueProperty, valueDefault),
                newLabel = labelProperty ? extractProperty(drop, labelProperty) : scope.labels[scope.labels.length - 1] + 1;

            scope.graphData.push(newItem);
            scope.labels.push(newLabel);

            if (scope.graphData.length > limit) {
                scope.graphData.shift();
                scope.labels.shift();
            }
        });

        function formProperty(prop) {
            if (!prop)
                return '';

            prop = prop.replace(/\./, '.value.');
            prop = 'elems.' + prop + '.value';

            return prop;
        }

        function parseData(data, property, defaultValue) {
            return data.slice(-limit).map(function (item) { return extractProperty(item, property, defaultValue) })
        }

        function extractProperty(object, path, defaultValue) {
            var a = path.split('.');

            for (var i = 0, n = a.length; i < n; ++i) {
                var k = a[i];

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