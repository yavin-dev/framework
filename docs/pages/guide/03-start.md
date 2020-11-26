---
layout: guide
group: guide
title: Setup and Installation Guide
---

* TOC
{:toc}


Yavin UI browser support
-------------------------------------------------

Yavin UI is an HTML-based browser application that is
supported on the most recent three major versions of the following
browsers:
-   Chrome
-   Firefox
-   Safari

Yavin installation guide
-------------------------------------------------

The “Quick Start Guide” link
takes you through the step-by-step guide in installing all the packages
and files needed to have a full operational Yavin on your system.

About data ingestion and data sources
--------------------------------------------------------------

Before you can use Yavin to visualize and analyze data, you need to
configure the Elide portion of Yavin to access the data you wish to
report on. You do so by defining a data
source including the database connection
configuration itself and its schema.

### Data source dialects

Elide analytic APIs generate SQL queries against your
target database(s). Elide must be configured with a Dialect to correctly
generate native SQL that matches the database grammar. Elide supports
the following dialects by default:


|      Name                       |  Availability                         |
|---------------------------------|---------------------------------------|
| H2     | Now          |
| Hive   | Now          |
| Presto | Now          |
| MySQL  | Now          |
{:.table}

More information on dialects and how to use them can be found at:
<a href="https://www.google.com/url?q=https://elide.io/pages/guide/v5/04-analytics.html%23dialects&amp;sa=D&amp;ust=1606228594025000&amp;usg=AOvVaw3kCKuvbnXUCJCPe8SCcGF7" >https://elide.io/pages/guide/v5/04-analytics.html#dialects</a>

About data models
------------------------------------------

A semantic model is a simplified representation of the data that resides
in your database.  Semantic models consist of concepts like Tables,
Dimensions, and Measures.  While the physical database schema (The
schema describes the data, how it is organized and managed in the
physical data source) can be complex, the semantic model is flat (there
are no relationships between tables) and the columns are referenced by
simple names (as opposed to complex formulas or derivations). A data model is an abstraction
which describes how you can use the data once it has been loaded. Note
that the model need not be a one to one match to the schema in the Data
source! While models can correspond to your underlying data store schema
as a one-to-one representation, Yavin does not require this and the
operating model of Yavin encourages you to think of data models as being
isolated on a per service basis. We recommend creating data models that
only support precisely the bits of data you need from your underlying
schema and no more!  A design that emphasizes isolation makes Yavin an
effective tool to reduce interdependency among services and maximizing
the separation of reporting, from physical data design.

Aspects of the data source you can configure include Tables, Dimensions and Measures.

More  information on the Elide Analytics query support and data
modeling can be found at this URL: <a href="https://www.google.com/url?q=https://elide.io/pages/guide/v5/04-analytics.html%23overview&amp;sa=D&amp;ust=1606228594027000&amp;usg=AOvVaw2q1sp9bx_xpv3bXaEJGwG4" >https://elide.io/pages/guide/v5/04-analytics.html#overview</a> 

### Writing your first data model

The “<a href="https://www.google.com/url?q=https://elide.io/pages/guide/v5/04-analytics.html%23model-configuration&amp;sa=D&amp;ust=1606228594028000&amp;usg=AOvVaw1vAW2xdLnJnsUQnKsE9jO5" >Getting Started Docs</a>”
on models takes you, in depth, through the step to step instruction on
writing your Elide data model and testing it appropriately. Yavin
leverages the Elide HJSON configuration language to define the semantic
model.  For complete documentation on the language, visit <a href="https://www.google.com/url?q=https://elide.io/pages/guide/v5/04-analytics.html%23model-configuration&amp;sa=D&amp;ust=1606228594029000&amp;usg=AOvVaw0bWaOa678DAXH4CB2iucYe" >https://elide.io/pages/guide/v5/04-analytics.html#model-configuration</a>.
 For a getting started tutorial, visit <a href="https://www.google.com/url?q=https://elide.io/pages/guide/v5/04-analytics.html%23example-configuration&amp;sa=D&amp;ust=1606228594029000&amp;usg=AOvVaw2kw5ry4iUdA4oVVcADetKl" >https://elide.io/pages/guide/v5/04-analytics.html#example-configuration</a>.

Yavin comes bundled with example Netflix data for movies and television shows.  The following sections will illustrate how Yavin is configured to explore this data.

#### Our example use case

Analytics on Netflix movie and TV shows titles

#### Connections, Tables, Dimensions, Measures and Joins

Your connection can be set up as: dialect: H2

```
{
  dbconfigs: [
    {
      name: DemoConnection
      url: jdbc:h2:mem:DemoDB;DB_CLOSE_DELAY=-1;INIT=RUNSCRIPT FROM 'classpath:create-demo-data.sql'
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
          name: title_id
          type: TEXT
          definition: '{{title_id}}'
        }
        {
          name: show_type
          type: TEXT
          definition: '{{type}}'
        }
......
```

Defining your Measures/Metrics count, total_seasons, movie_duration  (What are Measures/Metrics?)

```
measures: [
        {
          name: count
          type: INTEGER
          definition: 'count({{title_id}})'
        }
        {
          name: total_seasons
          type: INTEGER
          definition: "sum(cast (case when {{duration}} like '% Seasons' then REPLACE({{duration}}, ' Seasons', '') else '0' end AS INT))"
        }
        {
          name: movie_duration
          type: INTEGER
          definition: "sum(cast (case when {{duration}} like '% min' then REPLACE({{duration}}, ' min', '') else '0' end AS INT))"
        }
```

Defining your Joins NA for this demo. Since there is no joins with the "Netflix data set", this is jus Sample on how it can be :

```
      joins: [
        {
          name:
          to:
          type:
          definition: '{{X_id}} = {{Y.p_id}}'
        }
      ]
```
Putting it all together, the MySQL data model will be written as:     

```
      name:  NetflixTitles
      table: netflix_titles
      dbConnectionName: DemoConnection
      dimensions: [
        {
          name: title_id
          type: TEXT
          definition: '{{title_id}}'
        }
        {
          name: show_type
          type: TEXT
          definition: '{{type}}'
        }
        {
          name: title
          type: TEXT
          definition: '{{title}}'
        }
        {
          name: director
          type: TEXT
          definition: '{{director}}'
        }
        {
          name: cast
          type: TEXT
          definition: '{{cast_list}}'
        }
        {
          name: country
          type: TEXT
          definition: '{{country}}'
        }
        {
          name: date_available
          type: TIME
          definition: '{{date_added}}'
          grain: {
            type: DAY
          }
        }
        {
          name: release_year
          type: TIME
          definition: '{{release_year}}'
          grain: {
            type: YEAR
          }
        }
        {
          name: film_rating
          type: TEXT
          definition: '{{rating}}'
        }
        {
          name: genres
          type: TEXT
          definition: '{{listed_in}}'
        }
        {
          name: description
          type: TEXT
          definition: '{{description}}'
        }
      ]
      measures: [
        {
          name: count
          type: INTEGER
          definition: 'count({{title_id}})'
        }
        {
          name: total_seasons
          type: INTEGER
          definition: "sum(cast (case when {{duration}} like '% Seasons' then REPLACE({{duration}}, ' Seasons', '') else '0' end AS INT))"
        }
        {
          name: movie_duration
          type: INTEGER
          definition: "sum(cast (case when {{duration}} like '% min' then REPLACE({{duration}}, ' min', '') else '0' end AS INT))"
        }
      ]
    }
```

Yavin pulls and presents all of the semantic model
metadata from Elide.

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/SAI_Model_in_UI.png" width="200" /><figcaption>Result of the model in the UI</figcaption> </figure>

Yavin Quick Start Guide
-----------------------------------------------

Here is the complete quick start steps for setting up Yavin with your data source and your data models:
1.  Check the "Quick Start Guide" to install Yavin on your local host
1.  Upon installation (Step 1) you will have the Yavin repo on your
    local machine: <a href="https://www.google.com/url?q=https://github.com/yahoo/navi/&amp;sa=D&amp;ust=1606228594056000&amp;usg=AOvVaw10XIwf--cXX0UU921zZVk3" >https://github.com/yahoo/navi/</a>.
1.  Your repo will include the following key subdirectories:


|      Path                      |  Purpose                       |
|---------------------------------|---------------------------------------|
| ```navi/Packages/webservice/app/src/main/resources/ ```  | Your sample data can reside         |
| ```navi/Packages/webservice/app/src/main/resources/ ``` | Your SQL queries can reside          |
| ```navi/Packages/webservice/app/src/main/resources/demo-configs/db/sql``` | Your dialect connection can reside          |
| ```navi/Packages/webservice/app/src/main/resources/demo-configs/models/tables```  | Your data Models can reside         |
| ```navi/docs``` | The markdown of Yavin product overview and user documentation.          |
| ```navi/scripts```  | The publish script of Yavin        |
{:.table}

1.  🛑  STOP, If your purpose is check how Yavin works using the demo app provided (Without adding any new data sources or data models). Then, you should be all set to Jump to step 10.
2.  Select the correct “Data Dialect”. More information on data dialects can be found here: <a href="https://www.google.com/url?q=https://elide.io/pages/guide/v5/04-analytics.html%23dialects&amp;sa=D&amp;ust=1606228594063000&amp;usg=AOvVaw0ii-yOQH1vOGRIOQATpedn" >https://elide.io/pages/guide/v5/04-analytics.html#dialects</a>.
3.  You must set both the “enable analytic queries” and the “Hjson configuration” feature flags. Reference: <a href="https://www.google.com/url?q=https://elide.io/pages/guide/v5/04-analytics.html%23feature-flags&amp;sa=D&amp;ust=1606228594064000&amp;usg=AOvVaw2hVc2JUMB02Pvo3Qw-khHC" >https://elide.io/pages/guide/v5/04-analytics.html#feature-flags</a>. Path:  
4.  Configure the files layout: Analytic model configuration can either be specified through JVM classes decorated with Elide annotations or Hjson configuration files. <a href="https://www.google.com/url?q=https://elide.io/pages/guide/v5/04-analytics.html%23file-layout&amp;sa=D&amp;ust=1606228594064000&amp;usg=AOvVaw24D_tV9i7GwhO1RcFecYB0" >https://elide.io/pages/guide/v5/04-analytics.html#file-layout</a>.Path:  ../navi/Packages/
5.  Set the data source configuration for the Data Source(s) you will be using: <a href="https://www.google.com/url?q=https://elide.io/pages/guide/v5/04-analytics.html%23data-source-configuration&amp;sa=D&amp;ust=1606228594065000&amp;usg=AOvVaw24MdH1Y7-7eGfI1aWGjL6G" >https://elide.io/pages/guide/v5/04-analytics.html#data-source-configuration</a>. Path on where your data source connection can reside: ../navi/Packages/webservice/app/src/main/resources/demo-configs/db/sql/
6.  Model your data. Your model may be mapped to one or more physical databases, tables, and columns and need not be a “one to one” mirror of the source data models. More details on this step can be found at: <a href="https://www.google.com/url?q=https://elide.io/pages/guide/v5/04-analytics.html%23model-configuration&amp;sa=D&amp;ust=1606228594066000&amp;usg=AOvVaw3z90BeVO5sO_dvqiUivp0o" >https://elide.io/pages/guide/v5/04-analytics.html#model-configuration</a>. Path on where your data models can reside: ../navi/Packages/webservice/app/src/main/resources/demo-configs/models/tables

7.  Decide what roles users will need and then configure your security model as per these instructions: <a href="https://www.google.com/url?q=https://elide.io/pages/guide/v5/04-analytics.html%23security-configuration&amp;sa=D&amp;ust=1606228594067000&amp;usg=AOvVaw2oLF9OrpETKWP9ac8EdlTZ" >https://elide.io/pages/guide/v5/04-analytics.html#security-configuration</a>. Path:  
8.  To avoid having to repeat the same configuration block information multiple times, all Hjson files (table, security, and data source) support a variable substitution feature that allows a JSON structure to be associated to a variable name, and then that variable to be used in configuration files. Details can be found at:<a href="https://www.google.com/url?q=https://elide.io/pages/guide/v5/04-analytics.html%23variable-substitution&amp;sa=D&amp;ust=1606228594067000&amp;usg=AOvVaw38PY8IV7HYVX639BIKv00r" >https://elide.io/pages/guide/v5/04-analytics.html#variable-substitution</a> 
9.  Before proceeding further, you should validate all of your configuration files. All of the Hjson configuration files are validated by a JSON schema. To validate you configuration, run the following command line:
10. To run Yavin, execute the following command: ```cd packages/webservice && ./gradlew```

Within minutes, you will be able to launch Yavin on your local browser connection to the “Netflix movies and TV shows data source”, by launching the  following URL: <a href="https://www.google.com/url?q=http://localhost:8080/&amp;sa=D&amp;ust=1606228594068000&amp;usg=AOvVaw2gdZXVvyL6hXTtw2z4ml8p" >http://localhost:8080</a>

This quick start video takes you through the steps on configuring, loading data through Presto, using data models and starting to use Yavin. Enjoy!
