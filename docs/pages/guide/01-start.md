---
layout: guide
group: guide
title: Product Overview
---

* TOC
{:toc}

## Yavin overview

<img src="assets/images/Yavin_logo.png" width="200"/>

Yavin is a framework for rapidly building custom data applications that offers both a UI and an API. In addition, Yavin can be deployed as a standalone Business Intelligence tool. It is scalable and secure and it’s intuitive visualization interface allows for fast drill-downs of very large data sets through simple interface and visualization blocks. With Yavin, you can easily and intuitively create reports, which focus on arbitrary drill downs for a single visualization, or dashboards, which are collections of visualizations, for rapidly distilling information.

Disclaimer : For the sample demos that come with Yavin, we are using the
“<a href="https://www.google.com/url?q=https://www.kaggle.com/shivamb/netflix-shows&amp;sa=D&amp;ust=1606182367630000&amp;usg=AOvVaw0vjjwg_hSHcq80D3AjOpp1" >Netflix Movie and TV Shows</a>” data set that is sourced from <a href="https://www.google.com/url?q=https://www.kaggle.com/&amp;sa=D&amp;ust=1606182367630000&amp;usg=AOvVaw2MS0pMaHmAABG0JmQABGOV" >Kaggle</a> (Timestamped 11/2020). The use of this data is only for demonstrating the ease of onboarding any dataset to Yavin. And has no correlation with Yavin as a product or an Open Source Software.

Yavin is a combination of three major modules.  They are:
- Denali (The design layer)
- Elide (The Web Service layer)
- Navi (The UI layer)

Here is a short video of Yavin “in action” :

<figure  style="font-size:1vw; color:DodgerBlue;"><img style="border:2px solid black;" src="assets/images/Get_to_know_yavin.gif" width="800" /><figcaption>Yavin simplicity “in action”</figcaption></figure>

## Building with Duplos ®

In the software industry, when discovering patterns, we often build abstractions and libraries to provide reusable software. The D3.JS charting library, Spring Security, and the Flask web framework are all great examples. We often use the metaphor building with Legos ® to illustrate the process of building software with many libraries and frameworks. While this provides a significant productivity gain, especially when compared to writing everything from scratch, it still is costly to build applications. When building applications, it takes time to design a system, wire together libraries, test your logic, handle security concerns, develop a great user interface, build features, and battle test your system. With Carbon, we aim to package fully featured and reusable experiences called Duplos®, or large Legos®, that can be installed in your application with a few commands.  The following diagram illustrates the Duplos available in Yavin today:

<figure  style="font-size:1vw; color:DodgerBlue;"><img src="assets/images/Duplos_img.png" width="800" border=5px/><figcaption>Yavin Duplos</figcaption></figure>

## An Overview of Yavin’s Main Components

### Denali Overview
<img src="assets/images/Denali_logo.png" width="200"/>

Yavin uses Denali's themeable design system. Denali was developed as a way to quickly create unified product families with intuitive user  experiences. Denali components are built to be themeable by nature, which means we aren’t tied to their components visual design. For more information on denali, visit <a href="https://www.google.com/url?q=http://denali.design&amp;sa=D&amp;ust=1606182367633000&amp;usg=AOvVaw3vxbzIhWRHGVWve5Y_S6bE" >denali.design</a>.

### Elide Overview
<img src="assets/images/Elide_logo.png" width="200"/>

Yavin uses Elide as its web service and data model building language. Elide is a Java library that lets you setup model  driven GraphQL or JSON-API web services with minimal effort. Elide supports two variants of APIs:
1.  A CRUD (Create, Read, Update, Delete) API for reading and manipulating models.
1.  An analytic API for aggregating measures over zero or more model dimensions.

For more information on Elide, visit <a href="https://www.google.com/url?q=http://elide.io&amp;sa=D&amp;ust=1606182367634000&amp;usg=AOvVaw2jtjGW202zysi6LjUbgJng">elide.io</a>

### Navi Overview
<img src="assets/images/Navi_logo.png" width="200"/>

Navi represents the UI layer of Yavin. Navi is an open source analytics reporting UI. Navi uses Ember, which is a JavaScript framework for  building modern web applications. It includes everything you need to build rich UIs that work on any device. (<a href="https://www.google.com/url?q=https://guides.emberjs.com/release/&amp;sa=D&amp;ust=1606182367634000&amp;usg=AOvVaw0WaN1j1olmMWQvD7Y9spa6">Ember Guide</a>)
