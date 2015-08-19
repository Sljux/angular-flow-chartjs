## Flow ChartJS
__flowChartJs__ is an example of chart plugin, using [ChartJS](https://github.com/nnnick/Chart.js) via [Angular Chart](http://jtblin.github.io/angular-chart.js/)

### Options
- `chartType`: string representing one of chart types supported by ChartJS (line, bar, radar, pie, polar-area, doughnut)
- `chartOptions`: options to be passed to ChartJS
- `valueProperty`: path to property of the data point object to be used as chart value. Should be in `path.to.prop` form
- `valueDefault`: default value to be inserted if the data point object doesn't contain property in the given path. 
Defaults to `null`, resulting in graph point not being drawn 
- `labelProperty`: path to property of the data point object to be used as chart label. Should be in `path.to.prop` form.
If nothing is passed, the labels are auto incremented integers starting at 0
- `labelDefault`: used if `labelProperty` is passed. Default label value if the data point object doesn't contain property in the given label path
- `series`, `click`, `hover`, `legend` and `colours` are directly passed to [Angular Chart](http://jtblin.github.io/angular-chart.js/) directive