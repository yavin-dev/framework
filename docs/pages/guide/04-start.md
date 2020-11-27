---
layout: guide
group: guide
title: Getting Started with the UI
---

* TOC
{:toc}

After you have Yavin configured and running, we’ll begin detailing how to use the platform.  

Yavin landing Page
------------------------------------------
The default landing page of Yavin is the start of your data exploration. From there you can go to the directory listing (Listing all visualizations and visualization groups), or go to saved/shared reports (visualization) lists, the dashboards (group of visualization) list or start building your data analytics and reporting visualizations with the “Start Exploring” button.

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/GS_Yavin_landing_page.png" width="800"/><figcaption>Figure - Yavin landing page </figcaption> </figure>

Directory / “My Data”
----------------------------------------------
The Directory/“My Data” view carries all the active reports/Dashboards that you have previously created as well as any reports and dashboards that have been shared with you. Within the “My Data” page you can:
-   Create new Reports and/or Dashboards
-   Filter based on your “Favorites” Reports/Dashboards
-   Search for specific Reports/Dashboards
-   Filter by Reports/Dashboards
-   Perform actions on a report (Clone, Export, Share,Schedule, Delete)
-   Perform actions on a dashboard (Clone, Export, Share,Delete)

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/GS_my_data_list.gif" width="800"/><figcaption>Gif animation - Browsing the directory view </figcaption> </figure>

#### Directory view operations
What can you do in the directory view of Yavin. Let’s go through some of these options one at a time.

##### Perform actions on a report:
<img  src="assets/images/GS_report_options.png" />

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/GS_navigating_my_data.gif" width="800"/><figcaption>Gif animation - From the list of reports in the  directory, you can clone, export, share and delete </figcaption> </figure>

|      Operation                      |  Availability                       |
|---------------------------------|---------------------------------------|
| <img src="assets/images/GS_my_data_new.png" width="100"/>  | Now         |
| Clone <img  src="assets/images/GS_clone.png" /> | Now          |
| Export <img  src="assets/images/GS_download.png" /> | Q1  2021        |
| Share <img  src="assets/images/GS_share.png" />  | Now        |
| Delete <img  src="assets/images/GS_delete_icon.png" /> | Now         |
{:.table}

##### Perform actions on a Dashboard:
<img  src="assets/images/GS_dashboard_options.png" />

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/GS_my_data_browse.gif" width="800"/><figcaption>Gif animation - From the list of dashboards in the  directory, you can clone, share and delete </figcaption> </figure>

|      Operation                      |  Availability                       |
|---------------------------------|---------------------------------------|
| <img src="assets/images/GS_my_data_new.png" width="100"/>  | Now         |
| <img  src="assets/images/GS_new_dashboard.png" />        |     Now          |
| Clone <img  src="assets/images/GS_clone.png" /> | Now          |
| Share <img  src="assets/images/GS_share.png" />  | Now        |
| Delete <img  src="assets/images/GS_delete_icon.png" /> | Now         |
{:.table}

Reports
-------------------------------
A report is a user defined query coupled with a visual representation (table, graph, etc) of the returned query result. With a report, you can freely explore the various dimensions and measures in your data. Shown below is a line chart visualization from a report showing the “Netflix TV shows release dates”, filtering only for TV shows, and release date = 2014. With “Release Date” as dimension and “Total Seasons” and “Count”  as metrics.

A sample Yavin report

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/GS_Yavin_report_in_action.gif" width="800"/><figcaption>Gif animation - Yavin report in action </figcaption> </figure>

High level operations on a report :

<img  src="assets/images/GS_report_action_long_list.png" width="800"/>

From within the report you have multiple options. Each option is shown with its associated screen icon. You can do any of the following:
You can rename, add to favorite, add to dashboard, copy API query, clone, export, share and delete


|      Operation                      |  Availability                       |
|---------------------------------|---------------------------------------|
| Rename   <img  src="assets/images/GS_edit.png" width="50"/>  | Now         |
| Add too Favorite     <img  src="assets/images/GS_star.png" width="50"/>       |     Now          |
| <img  src="assets/images/GS_add_to_dashboard_withText.png" width="150"/> | Now          |
| <img  src="assets/images/GS_copy_api_query_withText.png" width="150"/>  | Now        |
| <img  src="assets/images/GS_clone_with_text.png" width="100"/> | Now         |
| <img  src="assets/images/GS_export_with_text.png" width="100"/>     |   Q1 2021   |
| <img  src="assets/images/GS_share_withText.png" width="100"/>     |  Now    |
| <img  src="assets/images/GS_delete.png" width="100"/>     |  Now    |
{:.table}

With tooltips guide:
<figure  style="font-size:1vw; color:DodgerBlue;"><img src="assets/images/GS_report_action_anima.gif" width="800"/><figcaption>Gif animation - Tooltips will guide you to the actions in a report </figcaption> </figure>

You can always take any of the following actions on a report:

<img  src="assets/images/GS_report_action.png" width="400"/>

### Exploring Reports
Reports are designed to be explored intuitively, easily and quickly.

1.  Create a new report from Yavin’s directory view
<img  src="assets/images/GS_my_data_newreport.png" />
1.  Select a table
<img  src="assets/images/GS_table_selector.png" />
1.  Select a dimension
<img  src="assets/images/GS_dimension_selector.png" />
1.  Select a metrics
<img  src="assets/images/GS_metric_selector.png" />
1.  Update your filters
<img  src="assets/images/GS_report_filter_sample.png" width="800"/>
1.  Select run report button
<img  src="assets/images/GS_run_saveReport.png" />

Here is a brief, animated demo of exploring and running a Yavin report :

<figure  style="font-size:1vw; color:DodgerBlue;"> <img style="border:2px solid black;" src="assets/images/GS_managing_reports.gif" width="800"/><figcaption>Gif animation - Exploring reports “in action” </figcaption> </figure>

Dashboards
----------------------------------
Yavin lets you take multiple reports and organize them into a dashboard even if the reports have different visualizations. Dashboards allow you to position and size the individual reports as you desire. They are useful when your user may need to compare various reports or when their decision making requires taking multiple views of the data into account.

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/GS_dashboard_sample.png" width="800" /><figcaption>Figure - A Typical Yavin Dashboard with a collection of widgets/reports </figcaption> </figure>

From within a Dashboard, you can do all of the following. As always, the on-screen icon is shown beside the command:

<figure  style="font-size:1vw; color:DodgerBlue;"><img src="assets/images/GS_dashboard_options_long_list.png" width="800" /><figcaption>Figure - From the dashboard view, you can rename, add to favorite, clone, share, delete, add widgets </figcaption> </figure>

|      Operation                      |  Availability                       |
|---------------------------------|---------------------------------------|
| Rename   <img  src="assets/images/GS_edit.png" width="50"/>  | Now         |
| Add too Favorite     <img  src="assets/images/GS_star.png" width="50"/>       |     Now          |
| <img  src="assets/images/GS_clone_with_text.png" width="100"/> | Now         |
| <img  src="assets/images/GS_share_withText.png" width="100"/>     |  Now    |
| <img  src="assets/images/GS_delete.png" width="100"/>     |  Now    |
| <img  src="assets/images/GS_add_widget.png" width="150"/>    |  Now    |
| <img  src="assets/images/GS_settings_add_filter.png" width="100"/>     |  Now    |
{:.table}
These Actions are available on the Dashboard:
<img  src="assets/images/GS_dashboard_action.png" width="300"/>

### Exploring Dashboards:
Dashboards are designed to be explored intuitively, easily and quickly.

The reports/widgets in a dashboard can be organized, resized, explored, filtered and edited to align with how we want the Dashboard to look like. Below is a brief, animated demo of the different action you can do on a Yavin report :

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/GS_managing_dashboard.gif" width="800"/><figcaption>Gif animation - Exploring dashboards “in action” </figcaption> </figure>

1.  Select <img  src="assets/images/GS_add_widget.png" width ="150"/> to add an already existing report to the Dashboard
1.  Select the report, like this: <img  src="assets/images/GS_add_widget_dialog.png" width="500"/>
1.  The Report will be added to the dashboard as a widget: <img  src="assets/images/GS_table_row.png" width="700"/>
1.  The Report / Widget can be resized, edited and deleted: <img  src="assets/images/GS_table_sample.png" width="700"/>

### Managing Dashboards:

#### Adding Reports to a Dashboard:
Dashboards are built by adding reports to them one at a time. There are two ways of adding a report to a dashboard.

1.  A report can be added to the dashboard by selecting a previously saved report through the “Add to Dashboard” option as illustrated below:
<br>
<img  src="assets/images/GS_dashboard_tool_tip.png" width="300"/>
<br>    
From report view, adding reports to dashboards <br>
<figure  style="font-size:1vw; color:DodgerBlue;"><img  src="assets/images/GS_add_to_dashboard.png" width="300"/>
<img  src="assets/images/GS_add_to_dashboard_select_widget.png" width="300"/><figcaption>Figure - From the report view, adding a report to a dashboard flow</figcaption> </figure>
1.  From the dashboard itself, use the “+ Add Widget” feature as illustrated: <img  src="assets/images/GS_add_widget.png" width="150"/> <br>
<figure  style="font-size:1vw; color:DodgerBlue;"><img  src="assets/images/GS_add_widget2.png" width="300"/>
<img  src="assets/images/GS_add_search_widget.png" width="300"/><figcaption>Figure - From the dashboard view, adding a report to a dashboard flow</figcaption> </figure>

#### Modifying / Editing Dashboards:
Reports in a Dashboard can be edited by clicking on the pencil icon (<img  src="assets/images/GS_edit.png" width="50"/>) in the header of the widget/report. This will activate the edit mode for that report. Reports in a dashboard can also be resized, re-arranged and deleted.
<figure  style="font-size:1vw; color:DodgerBlue;"><img  style="border:2px solid black;" src="assets/images/GS_dashboard_explore_reports.png" width="800"/><figcaption>Figure - Editing reports on a dashboard</figcaption> </figure>

Dimensions
----------------------------------
Dimensions are the primary concept when exploring your data. Dimensions are attributes and characteristics of your data. For example: In the domain of web analytics, dimensions might include properties of your website users - gender, age, location, etc. Dimension represents some quality that can distinguish one part of your data from another. Dimensions can be used to slice your data into slices, and to focus on a specific slice using filters. In Yavin, Dimensions live in the dimension panel in the report. They can be searched for, filtered by and added to the report for insight and reporting.

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/GS_Dimensions.gif" /><figcaption>Gif animation - Yavin dimensions explorer / selector</figcaption> </figure>

<a href="">How to define dimensions in your model language?</a>

Metrics
-------------------------------
Metrics provide a numeric value to associate to dimensions. Yavin has the ability to support these kinds of Metrics and many others {a number, a Count (a total or a sum), an average, a Ratio (one number divided by another number)}. Metrics are measurable. Metrics are math formulas applied over the zero or more dimensions that are selected to break down your data for a particular query, view, or report. They can give you an overview of the components of your data , and help distinguish important components from less important ones. In Yavin, Metrics live in the Metrics Panel in the report. They can be searched for, filtered by, and added to the report.

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/GS_metrics.gif" /><figcaption>Gif animation - Yavin metrics explorer / selector</figcaption> </figure>

<a href="">How to define metrics in your model language?</a>
