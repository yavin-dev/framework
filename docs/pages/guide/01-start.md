---
layout: guide
group: guide
title: Product Overview
---

## <span class="c5">Yavin overview</span>

<img src="assets/images/Yavin_logo.png" width="200"/>

Yavin is a framework for rapidly building custom data applications that
offers both a UI and an API. In addition, Yavin can be deployed as a
standalone Business Intelligence tool. It is <span class="c1">scalable
and secure</span> and it’s <span
class="c1">intuitive</span> visualization interface allows for <span
class="c1">fast drill-downs</span> of very large data sets through
simple interface and visualization blocks. With Yavin, you can easily
and intuitively create <span class="c1">reports</span>, which focus on
arbitrary drill downs for a single visualization, or <span
class="c1">dashboards</span>, which are collections of visualizations,
for <span class="c1">rapidly distilling information</span><span
class="c0">. </span>

<span class="c0"></span>

Disclaimer : For the sample demos that come with Yavin, we are using the
“<span
class="c17"><a href="https://www.google.com/url?q=https://www.kaggle.com/shivamb/netflix-shows&amp;sa=D&amp;ust=1606182367630000&amp;usg=AOvVaw0vjjwg_hSHcq80D3AjOpp1" class="c3">Netflix Movie and TV Shows</a></span>”
data set that is sourced from <span
class="c17"><a href="https://www.google.com/url?q=https://www.kaggle.com/&amp;sa=D&amp;ust=1606182367630000&amp;usg=AOvVaw2MS0pMaHmAABG0JmQABGOV" class="c3">Kaggle</a></span><span
class="c0"> (Timestamped 11/2020). The use of this data is only for
demonstrating the ease of onboarding any dataset to Yavin. And has no
correlation with Yavin as a product or an Open Source Software.</span>

<span class="c0"></span>

<span class="c0">Yavin is a combination of three major modules.  They
are:</span>

- <span class="c0 c15">Denali (The design layer) </span>
- <span class="c0 c15">Elide (The Web Service layer) </span>
- <span class="c0 c15">Navi (The UI layer)</span>

<span class="c0"></span>

<span class="c0">Here is a short video of Yavin “in action” : </span>

<img style="border:2px solid black;" src="assets/images/Get_to_know_yavin.gif" width="800" />
<span class="c18"> Yavin simplicity “in action”</span>

<span class="c0"></span>

## <span class="c5">Building with Legos ® & Duplos ®</span>

<span class="c0">In the software industry, when discovering patterns, we
often build abstractions and libraries to provide reusable software. The
D3.JS charting library, Spring Security, and the Flask web framework are
all great examples. We often use the metaphor building with Legos ® to
illustrate the process of building software with many libraries and
frameworks. While this provides a significant productivity gain,
especially when compared to writing everything from scratch, it still is
costly to build applications. When building applications, it takes time
to design a system, wire together libraries, test your logic, handle
security concerns, develop a great user interface, build features, and
battle test your system. With Carbon, we aim to package fully featured
and reusable experiences called Duplos®, or large Legos®, that can be
installed in your application with a few commands.  The following
diagram illustrates the Duplos available in Yavin today:</span>

<span class="c0"></span>

<img src="assets/images/Duplos_img.png" width="800" border=5px/>

<span class="c18">Yavin Duplos</span>

<span class="c0"></span>

## <span class="c5">An Overview of Yavin’s Main Components</span>

### <span class="c2">Denali Overview</span>

### <span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 145.47px; height: 39.28px;">![](assets/images/Denali_logo.png)</span>

Yavin uses Denali's themeable design system. Denali was developed as a
way to quickly create unified product families with intuitive user
experiences. Denali components are built to be themeable by nature,
which means we aren’t tied to their components visual design. For more
information on denali, visit <span
class="c17"><a href="https://www.google.com/url?q=http://denali.design&amp;sa=D&amp;ust=1606182367633000&amp;usg=AOvVaw3vxbzIhWRHGVWve5Y_S6bE" class="c3">denali.design</a></span><span
class="c0">.</span>

### <span class="c2">Elide Overview</span>

### <span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 2.67px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 131.51px; height: 43.84px;">![](assets/images/Elide_logo.png)</span>

<span class="c0">Yavin uses Elide as its web service and data model
building language. Elide is a Java library that lets you setup model
driven GraphQL or JSON-API web services with minimal effort. Elide
supports two variants of APIs:</span>

1.  <span class="c0">A CRUD (Create, Read, Update, Delete) API for
    reading and manipulating models.</span>
2.  <span class="c0">An analytic API for aggregating measures over zero
    or more model dimensions.</span>

<span class="c0"></span>

For more information on Elide, visit <span
class="c17"><a href="https://www.google.com/url?q=http://elide.io&amp;sa=D&amp;ust=1606182367634000&amp;usg=AOvVaw2jtjGW202zysi6LjUbgJng" class="c3">elide.io</a></span><span
class="c0">.</span>

### <span class="c2">Navi Overview </span>

<span
style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 154.00px; height: 39.00px;">![](assets/images/Navi_logo.png)</span>

Navi represents the UI layer of Yavin. Navi is an open source analytics
reporting UI. Navi uses Ember, which is a JavaScript framework for
building modern web applications. It includes everything you need to
build rich UIs that work on any device. (<span
class="c17"><a href="https://www.google.com/url?q=https://guides.emberjs.com/release/&amp;sa=D&amp;ust=1606182367634000&amp;usg=AOvVaw0WaN1j1olmMWQvD7Y9spa6" class="c3">Ember Guide</a></span><span
class="c0">)</span>
