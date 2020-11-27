---
layout: guide
group: guide
title: User Guide
---

* TOC
{:toc}

Supported Visualizations
------------------------------------------------
Yavin provides much more than static charts. Yavin provides a wide array of expressive visualizations that enable fast, interactive exploration of your data.   

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_viz_sample.png" width="800"/><figcaption>Figure - A sample of visualizations supported by Yavin </figcaption> </figure>

You can interact directly with your charts  by clicking on various graphical elements to select data components for drill-down and deeper analysis. When you change the dimensions, the possible visualization for the selected dimensions will appear. You can choose the visualization you prefer by clicking the different visualization icons  ![](assets/images/UG_all_viz.png)  , which are located at the top of visualization
results.  

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_general_viz.gif" width="800"/><figcaption>Gif animation - Yavin reports are interactive visualizations  </figcaption> </figure>  

###  Metric label  
 This is the overview visualization that’s shown when there are no dimensions selected to be shown. It presents a numeric summary of the currently selected measures, applying any selected filter criteria.  

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_metric_sample.png" width="800"/><figcaption>Figure - Sample Yavin metric label visualization </figcaption> </figure>

 The metric label can be edited to change any of these items: Label, Format Type and Format  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_metric_viz.png" width="800"/><figcaption>Figure - Editing Yavin metric label  </figcaption> </figure>   

###  Gauge Chart  
The <span class="c7 c31">Gauge visualization is a chart that displays the major contributors or key influencers for a selected result or value. The Gauge chart then displays progress toward a measurable goal.   

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_gauge_viz.png" width="800"/><figcaption>Figure - Sample Yavin gauge chart visualization </figcaption> </figure>

 The gauge chart can be edited to change any of these: label, baseline and goals  

  <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_gauge_viz2.png" width="250"/><img style="border:2px solid black;" src="assets/images/UG_gauge_viz3.png" width="250"/><img style="border:2px solid black;" src="assets/images/UG_gauge_viz4.png" width="250"/><figcaption> Figure - Editing Yavin gauge chart visualization and changing the baseline </figcaption> </figure>  

###  Table  
 **The table visualization is the default view for a dimension**. It presents a table view of the data with ordering capabilities that aids in visualization of measure magnitude. The Table is available for all Dimension/Metric combinations.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_table_viz.png" width="800"/><figcaption>Figure - Sample Yavin table visualization </figcaption> </figure>

The table visualization can show multiple dimensions, as well as multiple measures, as columns. Here is an example:

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_table_viz3.png" width="800"/><figcaption>Figure - Multiple metrics in a table visualization </figcaption> </figure>  

 The table properties can be edited, including changing the column name, the format type, the  format, the layout and the sort order of the columns.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_customize_table.png" width="800"/><figcaption>Figure - Editing Yavin table visualization </figcaption> </figure>

 “**Grand Total**” and “**Subtotals**” of measures by dimension, can be added to the table calculation if desired. The option to add them can be done from the (  ![](assets/images/UG_edit_table.png)  ) option.

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_add_total.png" width="800"/><figcaption>Figure - Table Visualization with no “Grand Total” and “Subtotal” applied  </figcaption> </figure>  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_add_total2.png" width="800"/><figcaption>Figure - Table Visualization with “Grand Total” and “Subtotal” applied </figcaption> </figure>  

###  Line chart  
 The line chart is the most common and natural visualization to show temporal (trend over time) dimensions. The chart lets you see what all the component values add up to when charted together. This lets you see the overall trend, while also showing the individual contributions of different dimensions.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_line_chart_sample2.png" width="800"/><figcaption>Figure - Sample Yavin line chart visualization </figcaption> </figure>   

 The line chart also has the ability to compare the values of the first shown dimension to one or more different dimensions over time. Note the different colored lines in the chart below. They each chart an individual dimension.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_time_series.png" width="800"/><figcaption>Figure - Line charts are interactive visualizations </figcaption> </figure>  

The line chart line style can be changed to an area spline.  The stacked area chart is similar to the regular line chart, and can be used in similar situations.   

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_change_line_chart.png" width="800"/><figcaption>Figure - Converting a Yavin line chart to a spline chart </figcaption> </figure>   

 Or an area step  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_line_chang.png" width="800"/><figcaption>Figure - Converting a Yavin line char to a step chart </figcaption> </figure>   

###  Bar chart  
 The bar chart is selected for numeric visualizations. It naturally acts as a histogram, showing the frequency distribution of occurrences over numeric buckets.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_bar_chart1.png" width="800"/><figcaption>Figure X - Sample Yavin bar chart visualization </figcaption> </figure>

 The bar chart can be edited, allowing you to change the metrics and having them stacked:  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_bar_viz.png" width="800"/><figcaption>Figure - Editing a Yavin bar chart visualization </figcaption> </figure>

###  Pie chart  
 The pie chart is a visualization that represents the ratios between the values of a dimension.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_pie_viz2.png" width="800"/><figcaption>Figure - Sample Yavin pie chart visualization </figcaption> </figure>  

 The pie chart can be edited, allowing you to change the metrics:  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_piechart_change.png" width="800"/><figcaption>Figure -Yavin pie chart are interactive visualizations </figcaption> </figure>  

 When there are multiple dimensions being rendered, the permutation below the chart shows the proportional representation. Clicking on each one will hide that one from the chart.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_pie_highlight.png" width="800"/><figcaption>Figure - Yavin pie chart proportional representation with multiple representations </figcaption> </figure>   

###  When can you select each of the visualizations?  

|  Visualization                     |  When is it available for selection?  |
|------------------------------------|---------------------------------------|
|  <img src="assets/images/UG_table_icon2.png" width="100"/>  |  When no dimension is added.           |
|  <img src="assets/images/UG_gauge_icon.png" width="100" />  |  When no dimension is added.          |
|  <img src="assets/images/UG_table_icon.png" width="100"/>  |  Table visualization is available in all cases. It is the default visualization.   |
|  <img src="assets/images/UG_line_icon.png" width="100"/>  |  When at least one time dimension is added.           |
|  <img src="assets/images/UG_bar_icon.png" width="100"/>   |  hen at least one dimension is added.      |
|  <img src="assets/images/UG_pie_icon.png" width="100"/>   |  When there is no time dimension added.       |
{:.table}

 Time Series
-----------------------------------
 It is often useful to be able to see how one value of a dimension can be compared to another within a time span. This type of data is frequently referred to as a time series data <span class="c33 c24">. A time series is a sequence of numerical data points in successive chronological order. For example, in checking audience data, a time series could be used to track the total clicks of the different genders over a specified period of time, with data points recorded at regular time intervals. Time series allows the user to specify a time interval - an inclusive start and exclusive end time or date. In the example below, we show how gender can be compared to  total clicks over a 90 day time period with “day” being the time interval.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_time_series2.png" width="800"/><figcaption>Figure - Time series chart in Yavin </figcaption> </figure>  

 The time series can be filtered further to focus on one or more specific dimensions. For example, the time series chart below shows how the focus is only on the  “Male” and “Female” gender, hiding “Unknown” and “All Other”.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_line_chart_sample.png" width="800"/><figcaption> Figure - Yavin time series chart filtered Filters </figcaption> </figure>

 Filters limit the data returned in a report. It could be a period or time, a certain country or a number of countries, or any other value of a dimension in your data. The filters live in the filter bar  . We can filter by either dimensions, metrics, or both at the same time . It is often useful to filter out outlying data and edge cases, especially when evaluating any kind of rate data such as click rates. With Yavin, you can filter results against a metric threshold or against a dimension value.   

 To add a dimension or metric to a filter criteria, select the filter icon (  ![](assets/images/UG_filter_icon.png)  ) next to the metric   

 <figure  style="font-size:1vw; color:DodgerBlue;"><img src="assets/images/UG_add_filter_tooltip.png" width="300"/><figcaption> Figure - Adding a filter </figcaption> </figure>   

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_add_dim.gif" width="800"/><figcaption> Gif animation - Filter flow in Yavin </figcaption> </figure>  

To remove a dimension or metric from the filter, click the filter icon for the corresponding Dimension or Metric. Or select the (x) ![](assets/images/UG_filters_how.png) icon on the filter section.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img src="assets/images/UG_remove_filter.png" width="300"/><figcaption> Figure - Removing a filter from the dimension/metrics selector list </figcaption> </figure>   

 <figure  style="font-size:1vw; color:DodgerBlue;"><img src="assets/images/UG_remove_filters.gif" width="800"/><figcaption> Gif animation - Removing a filter from the filter box </figcaption> </figure>   

###  Editing filters  
Filters can be updated and edited in the filter section of the report. Some dimension filters support “Type Ahead” search in which  you can select one or more strings to filter on based on the suggested values.   Dimension filters which are “String filters” can support “Type Ahead”, but not all dimensions are a “String Filter”. It all depends on how the Yavin user configured the dimension during setup.  

In the example below, gender, which is a dimension, has a limited number of values, and is a String filter. You can exclude certain dimensions or select only the values that contain a specified text.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_filter_change.gif" width="800"/><figcaption>Gif animation - Exploring the filter operations </figcaption> </figure>   

###  Supported filter operation for Dimensions (String filters)  

|  Operation    | Availability   |
|---------------|----------------|
|  Equals       |  Now           |
|  Not equals   |  Now           |
|  Is Empty     |  Now           |
|  Is not empty |  Now           |
|  Contains     |  Now           |
{:.table}

###  Supported filter operation for Metrics (Number or range filters)  

|  Operation                     |  Availability  |
|--------------------------------|----------------|
|  &gt;                          |  Now           |
|  &lt;                          |  Now           |
|  =                             |  Now           |
|  !=                            |  Now           |
|  &lt; = &gt; (in between)      |  Q1 2020       |
|  !&lt; = &gt; (not in between) |  Q1 2020       |
|  &gt;=                         |  Now           |
|  &lt;=                         |  Now           |
{:.table}

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_filters.gif" width="800"/><figcaption>Gif animation - Filter operation for metrics </figcaption> </figure>

###  Supported filter operation for Dates (Time filters)   
 Time filters are used for timestamp and date dimensions. You can filter on time and select a filter that is relative to the most recent time of the data.  

 The supported Filter Operations for Dates (Time Filters) are:  

|  Operation                                                                                       |  Availability  |
|--------------------------------------------------------------------------------------------------|----------------|
|  Current                                                                                         |  Now           |
|  In the past                                                                                     |  Now           |
|  Since                                                                                           |  Now           |
|  Between                                                                                         |  Now           |
|  Advanced ( Advanced time ranges allows for between dates and selecting  a specific time range)  |  Q1 2020       |
{:.table}

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_line_filter_change.gif" width="800"/><figcaption>Gif animation - Filter operation for dates </figcaption> </figure>

###  Dashboard filter:  
 You can add a filter to an interactive collection by clicking on the (  ![](assets/images/UG_settings_icon.png)  ) icon then (  ![](assets/images/UG_add_filter.png)  ) to  select the dimension, the operation and the value.

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_dashboard_filter.gif" width="800"/><figcaption> Gif animation -  Dashboard filters </figcaption> </figure>

 Operations on Reports
---------------------------------------------
### Change column name
 As dimensions ![](assets/images/GS_dim_symbol.png) and metics ![](assets/images/GS_metric_symbol.png) get added to the report, there column-name can be updated in the column tab section ![](assets/images/GS_column_expand.png). The column tab section can minimized and expanded.

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/GS_report_change_column_name.gif" width="800"/><figcaption> Gif animation -  Changing column name of a report </figcaption> </figure>

###  Add to Favorites  
 Add your Report to the favorite bucket.  

###  Add To Dashboard  
 Adds the Report to a new or existing Dashboard.  

###  Clone  
 Creates an exact copy of a Report with the name “Copy of ….”.  

###  Copy API Query  
 Allows you to copy the API query of your Report, or run it in a new Tab.  

 <figure  style="font-size:1vw; color:DodgerBlue;"> <img style="border:2px solid black;" src="assets/images/UG_api.png" width="300"/>
 <figcaption>Figure - Copy API query dialog </figcaption></figure>   

### Export <img src="assets/images/UG_coming_soon.png" width="100"/>  
 Allows you export your Report as CSV, PDF or PNG.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img src="assets/images/UG_export_report.png" width="200"/><figcaption>Figure - Export options </figcaption> </figure>   

###  Share  
 Allows you to share the link of your Report.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_share.png" width="400"/><figcaption>Figure - Share dialog </figcaption> </figure>   

### Schedule <img src="assets/images/UG_coming_soon.png" width="100"/>  
 Allows you to schedule your Report by specifying the rules of scheduling including format (CSV, PDF or PNG), the email recipients and the frequency:  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_schedule_report.png" width="400"/><figcaption> Figure - Report schedule dialog </figcaption> </figure>  

### Delete
 Allows you to delete your Report.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_delete_widget.png" width="400"/><figcaption> Figure - Delete dialog </figcaption> </figure>

 Operations on Dashboards
------------------------------------------------
###  Add to Favorites  
 Allows you to add your dashboard to the favorite bucket.  

###  + Add Widget  
 Allows you to add a widget to the dashboard.  

###  Clone  
 Creates an exact copy of a dashboard with the name “Copy of ….”.  

### Export <img src="assets/images/UG_coming_soon.png" width="100"/>  
 Allows you export your Dashboard as PDF or PNG.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img src="assets/images/UG_export.png" width="200"/><figcaption>Figure - Dashboard export options </figcaption> </figure>  

###  Share  
 Allows you to share the link of your Dashboard.  

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_share_dashboard.png" width="400"/><figcaption> Figure - Dashboard share dialog </figcaption> </figure>   

### Schedule <img src="assets/images/UG_coming_soon.png" width="100"/>  
 Allows you to schedule your Dashboard by specifying the rules of scheduling including format (PDF or PNG), the email recipients and the frequency:

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_schedule_dashboard.png" width="400"/><figcaption> Figure - Dashboard schedule dialog </figcaption> </figure>  

### Delete
 Allows you to delete your Dashboard.

 <figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/UG_delete_widget.png" width="400"/><figcaption>Figure - Dashboard delete dialog </figcaption> </figure>
