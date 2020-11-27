---
layout: guide
group: guide
title: Quick Start Guide
---

* TOC
{:toc}

Quick start with demo data ready to view/use
-------------------------------------------------

### To Know Links

| What?                    |  Link  |
|---------------------------------|--------|
| Getting Started - First-Time Git Setup  | <a href="https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup">https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup</a> |
| Prerequisite - JDK 8 or higher  |  <a href="https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html"> https://www.oracle.com/java/technologies/javase/javase-jdk8-downloads.html  </a>    |
| Yavin Git Repo  |  <a href="https://github.com/yahoo/navi.git"> https://github.com/yahoo/navi.git </a>                                                                                       |
| "Netflix Movies and TV Shows" data set used for the demo | <a href="https://www.kaggle.com/shivamb/netflix-shows"> https://www.kaggle.com/shivamb/netflix-shows</a? |
{:.table}

### Steps
```
$ git clone https://github.com/yahoo/navi.git
$ cd navi
$ cd packages/webservice
$ ./gradlew bootRun

** Ctrl-C to Exit **
```

<center>
  <figure style="font-size:1vw; color:DodgerBlue;">
    <video width="800" controls> <source src="assets/images/QS_installation_and_run.mp4" type="video/mp4"></video>
    <figcaption>📹A quick video that shows how each step is being executed.</figcaption>
  </figure>
</center>

### Result
***Congratulations you are all set, you can now Open <a href="http://localhost:8080"> http://localhost:8080</a>.*** This will launch the **Yavin** application into your browser with the built in data set for “<a href="https://www.kaggle.com/shivamb/netflix-shows" >Netflix Movie and TV Shows</a>” that is sourced from <a href="https://www.kaggle.com/" >Kaggle</a> data.
