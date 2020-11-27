---
layout: guide
group: guide
title: Setup and Installation Guide
---

* TOC
{:toc}

Yavin UI browser support
-------------------------------------------------

Yavin UI is an HTML-based browser application that is supported on the 3 recent versions of the following browsers:
-   ***Chrome***
-   ***Firefox***
-   ***Safari***

About data ingestion and data sources
--------------------------------------------------------------

Before you can use Yavin to **visualize and analyze data**, you need to define your **semantic model** and database configuration in Elide. You do so by defining a data source and including the database connection configuration itself and its schema.

### Data source dialects

Elide analytic APIs **generate SQL queries** against your target database(s). Elide must be **configured with a Dialect** to correctly generate native SQL that matches the database grammar. Elide supports the following dialects by default:

|      Name     |  Availability         |
|---------------|-----------------------|
| H2     | Now          |
| Hive   | Now          |
| Presto | Now          |
| MySQL  | Now          |
{:.table}

More information on dialects and how to use them can be found at: <a href="https://elide.io/pages/guide/v5/04-analytics.html#dialects" >https://elide.io/pages/guide/v5/04-analytics.html#dialects</a>

About semantic models
------------------------------------------
- ***A semantic model*** is an abstraction which describes how you can use the data once it has been loaded (how data is presented to the user). It is flat (no relationships), and simple (no formulas - just names).
- ***A schema*** describes the data, how it is organized and managed in the physical data source.
- ***A physical model*** is how data is arranged in your database. It could be relational or involve complex SQL expressions.
- Note: A model need not be a one to one match to the schema in the Data source. While models can correspond to your underlying data store schema as a one-to-one representation, Yavin does not require this and the operating model of Yavin encourages you to think of semantic models as being isolated on a per service basis.
- ***Building a semantic model*** in yavin involves three things:
    - Defining the tables, measures, and dimensions you want to expose to the end user (the semantic model).
    - Adding metadata like descriptions, categories, and tags to the semantic model to help users understand it.
    - Mapping the simple semantic model to the potentially more complex physical model. Every concept (table, measure, dimension) in the semantic model can be assigned a native SQL fragment that is used to generate queries against the physical model.

More information on the Elide Analytics query support and data-modeling can be found at this URL: <a href="https://elide.io/pages/guide/v5/04-analytics.html#overview" >https://elide.io/pages/guide/v5/04-analytics.html#overview</a> 

### Writing your first semantic model

The “<a href="https://elide.io/" >Getting Started with Elide semantic model docs</a>” on models takes you, in depth, through the step to step instruction on writing your Elide semantic model and testing it appropriately. Yavin leverages the Elide HJSON configuration language to define the semantic model.  For complete documentation on the language, visit <a href="https://elide.io/pages/guide/v5/04-analytics.html#model-configuration" >https://elide.io/pages/guide/v5/04-analytics.html#model-configuration</a>.

For a getting started tutorial, visit <a href="https://elide.io/pages/guide/v5/04-analytics.html#example-configuration" >https://elide.io/pages/guide/v5/04-analytics.html#example-configuration</a>.

Yavin comes bundled with a “<a href="https://www.kaggle.com/shivamb/netflix-shows" >Netflix Movie and TV Shows</a>” data example. The following sections will illustrate how Yavin is configured to explore this data.

#### Our example use case
Analytics on Netflix movie and TV shows titles

#### Connections, Tables, Dimensions, Measures and Joins
Your connection can be set up as: dialect: H2

```
{
  dbconfigs: [
    {
      name: DemoConnection
      url: jdbc:h2:mem:DemoDB;  DB_CLOSE_DELAY=-1;  INIT=RUNSCRIPT FROM 'classpath:create-demo-data.sql'
      driver: org.h2.Driver
      user: guest
      dialect: H2
    }
  ]
}

```


Defining your Table/s: netflix_titles

```
name:  NetflixTitles
table: netflix_titles
```

Defining your Dimensions title_id, show_type, title  (What are Dimensions?)

```
  dimensions: [
        {
          category: Attributes
          name: title_id
          type: TEXT
          definition: '{ {title_id} }'
        }
        {
          category: Attributes
          name: show_type
          type: TEXT
          definition: '{ {type} }'
        }
......
```

Defining your Measures/Metrics count, total_seasons, movie_duration  (What are Measures/Metrics?)

```
measures: [
        {
          category: Stats
          name: count
          type: INTEGER
          definition: 'count({ {title_id} })'
        }
        {
          category: Stats
          name: total_seasons
          type: INTEGER
          definition: "sum(cast (case when { {duration} } like '% Seasons' then REPLACE({ {duration} }, ' Seasons', '') else '0' end AS INT))"
        }
        {
          category: Stats
          name: movie_duration
          type: INTEGER
          definition: "sum(cast (case when { {duration} } like '% min' then REPLACE({ {duration} }, ' min', '') else '0' end AS INT))"
        }
```

Putting it all together, the H2 semantic model will be written as:     

```
      name:  NetflixTitles
      table: netflix_titles
      dbConnectionName: DemoConnection
      dimensions: [
        {
          category: Attributes
          name: title_id
          type: TEXT
          definition: '{ {title_id} }'
        }
        {
          category: Attributes
          name: show_type
          type: TEXT
          definition: '{ {type} }'
        }
        {
          category: Attributes
          name: title
          type: TEXT
          definition: '{ {title} }'
        }
        {
          category: Attributes
          name: director
          type: TEXT
          definition: '{ {director} }'
        }
        {
          category: Attributes
          name: cast
          type: TEXT
          definition: '{ {cast_list} }'
        }
        {
          category: Attributes
          name: country
          type: TEXT
          definition: '{ {country} }'
        }
        {
          category: Date
          name: date_available
          type: TIME
          definition: '{ {date_added} }'
          grain: {
            type: DAY
          }
        }
        {
          category: Date
          name: release_year
          type: TIME
          definition: '{ {release_year} }'
          grain: {
            type: YEAR
          }
        }
        {
          category: Attributes
          name: film_rating
          type: TEXT
          definition: '{ {rating} }'
        }
        {
          category: Attributes
          name: genres
          type: TEXT
          definition: '{ {listed_in} }'
        }
        {
          category: Attributes
          name: description
          type: TEXT
          definition: '{ {description} }'
        }
      ]
      measures: [
        {
          category: Stats
          name: count
          type: INTEGER
          definition: 'count({ {title_id} })'
        }
        {
          category: Stats
          name: total_seasons
          type: INTEGER
          definition: "sum(cast (case when { {duration} } like '% Seasons' then REPLACE({ {duration} }, ' Seasons', '') else '0' end AS INT))"
        }
        {
          category: Stats
          name: movie_duration
          type: INTEGER
          definition: "sum(cast (case when { {duration} } like '% min' then REPLACE({ {duration} }, ' min', '') else '0' end AS INT))"
        }
      ]
    }
```

Note: Joins was not applicable for the demo app. But, Elide supports Join with the following attributes:
<pre>      
   joins: [
        {
          name:
          to:
          type:
          definition: ' { { X_id } } = { { Y.p_id } }'
        }
      ]
</pre>

Yavin pulls and presents all of the semantic model metadata from Elide.

<figure style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/SAI_Model_in_UI.png" width="200" /><figcaption>Figure - Result of the UI pulling the model (Table, Dimension, Metrics, Joins)</figcaption> </figure>

Yavin Example Key Elements
-----------------------------------------------
The Yavin example project consists of the following key elements :

1. HJSON configuration for 1 or more database.
1. HJSON configuration for 1 or more tables (and their respective measures and dimensions).
1. HJSON configuration for any security roles you want defined.
1. A liquibase script that sets up your database with relevant tables needed for Yavin.
1. Test data that is initialized in the database.
1. Example integration tests that verify the Yavin APIs are working correctly.
1. An application configuration file that configures web service routes, security, and other service level controls.

Yavin Detailed Installation Guide
-----------------------------------------------
Here is the complete steps for installing and setting up **Yavin** with **your data-source** and your **semantic models**:
-  ***Installation***: The “<a href="">Quick Start Guide</a>” walks you through the **steps to setup Yavin** on your system with a built in "*Netflix and TV Shows*" data.
-  Upon installation (Step 1) you will have the **Yavin** repo on your local machine: <a href="https://github.com/yahoo/navi" >https://github.com/yahoo/navi/</a>.
-  Your repo will include the following key subdirectories:

|      Path                      |  Purpose                       |
|---------------------------------|---------------------------------------|
| ```navi/docs``` | The markdown of Yavin product overview and user documentation.          |
| ```navi/scripts```  | The published script of Yavin        |
| ```navi/Packages/webservice/app/src/main/resources/ ```  | Your sample data can reside here       |
| ```navi/Packages/webservice/app/src/main/resources/ ``` | Your SQL queries can reside here          |
| ```navi/Packages/webservice/app/src/main/resources/demo-configs/db/sql``` | Your dialect connection can reside here        |
| ```navi/Packages/webservice/app/src/main/resources/demo-configs/models/tables```  | Your semantic models can reside here       |
{:.table}
1.  🛑  STOP, **If your purpose is check how Yavin works using the demo app provided (Without adding any new data sources or semantic models). Then, you should be all set to Jump to step 10.**
2.  Select the correct “Data Dialect”. More information on data dialects can be found here: <a href="https://elide.io/pages/guide/v5/04-analytics.html#dialects" >https://elide.io/pages/guide/v5/04-analytics.html#dialects</a>.
3.  You must set both the “enable analytic queries” and the “Hjson configuration” feature flags. Reference: <a href="https://elide.io/pages/guide/v5/04-analytics.html#feature-flags" >https://elide.io/pages/guide/v5/04-analytics.html#feature-flags</a>.  
4.  Configure the files layout: Analytic model configuration can either be specified through JVM classes decorated with Elide annotations or Hjson configuration files. <a href="https://elide.io/pages/guide/v5/04-analytics.html#file-layout" >https://elide.io/pages/guide/v5/04-analytics.html#file-layout</a>.Path:  ../navi/Packages/
5.  Set the data source configuration for the Data Source(s) you will be using: <a href="https://elide.io/pages/guide/v5/04-analytics.html#data-source-configuration" >https://elide.io/pages/guide/v5/04-analytics.html#data-source-configuration</a>. Path on where your data source connection can reside: ../navi/Packages/webservice/app/src/main/resources/demo-configs/db/sql/
6.  Model your data. Your model may be mapped to one or more physical databases, tables, and columns and need not be a “one to one” mirror of the source semantic models. More details on this step can be found at: <a href="https://elide.io/pages/guide/v5/04-analytics.html#model-configuration" >https://elide.io/pages/guide/v5/04-analytics.html#model-configuration</a>. Path on where your semantic models can reside: ../navi/Packages/webservice/app/src/main/resources/demo-configs/models/tables
7.  Decide what roles users will need and then configure your security model as per these instructions: <a href="https://elide.io/pages/guide/v5/04-analytics.html#security-configuration" >https://elide.io/pages/guide/v5/04-analytics.html#security-configuration</a>.  
8.  To avoid having to repeat the same configuration block information multiple times, all Hjson files (table, security, and data source) support a variable substitution feature that allows a JSON structure to be associated to a variable name, and then that variable to be used in configuration files. Details can be found at:<a href="https://elide.io/pages/guide/v5/04-analytics.html#variable-substitution" >https://elide.io/pages/guide/v5/04-analytics.html#variable-substitution</a> 
9.  Before proceeding further, you should validate all of your configuration files. All of the Hjson configuration files are validated by a JSON schema. To validate you configuration, run the following command line:
10. To run Yavin, execute the following command: ```cd packages/webservice && ./gradlew```

⏱Within minutes, you will be able to launch Yavin on your local browser connection to the “Netflix movies and TV shows data source”, by launching the  following URL: <a href="http://localhost:8080">http://localhost:8080</a>
