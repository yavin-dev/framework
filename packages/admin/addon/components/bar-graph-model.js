import Component from '@ember/component';

export default Component.extend({
  type: 'bar',
  width: '800px',
  height: '400px',
  series: [
    {
      name: 'Sales',
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
    }
  ],
  barOptions: {
    chart: {
      toolbar: {
        show: false
      }
    },
    title: {
      text: 'Bar Chart'
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
    }
  },
  actions: {
    clickHandler() {
      console.log('Click handler triggered');
    },
    beforeMountHandler() {
      console.log('Before Mount handler triggered');
    }
  }
});
