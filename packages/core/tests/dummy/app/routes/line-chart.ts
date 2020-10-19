import { A } from '@ember/array';
import Route from '@ember/routing/route';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import { Grain } from 'navi-data/utils/date';
import { canonicalizeMetric } from 'navi-data/utils/metric';

/*eslint max-len: ["error", { "code": 250 }]*/
// prettier-ignore
const defaultRows = [
  { 'network.dateTime(grain=week)': '2015-12-14 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', uniqueIdentifier: 155191081, totalPageViews: 3072620639, 'revenue(currency=USD)': 1421982310.09 },
  { 'network.dateTime(grain=week)': '2015-12-21 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', uniqueIdentifier: 172724594, totalPageViews: 3697156058, 'revenue(currency=USD)': 2252948122.21 },
  { 'network.dateTime(grain=week)': '2015-12-28 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', uniqueIdentifier: 183380921, totalPageViews: 4024700302, 'revenue(currency=USD)': 2104188223.24 },
  { 'network.dateTime(grain=week)': '2016-01-11 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', uniqueIdentifier: 183206656, totalPageViews: 4088487125, 'revenue(currency=USD)': 2290494122.96 },
  { 'network.dateTime(grain=week)': '2016-01-18 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', uniqueIdentifier: 183380921, totalPageViews: null, 'revenue(currency=USD)': 1124124124.66 },
  { 'network.dateTime(grain=week)': '2016-01-25 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', uniqueIdentifier: null, totalPageViews: 3950276031, 'revenue(currency=USD)': 2032578202.2 },
  { 'network.dateTime(grain=week)': '2016-02-01 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', uniqueIdentifier: 172724594, totalPageViews: 3697156058, 'revenue(currency=USD)': 1250391422.72 },
  { 'network.dateTime(grain=week)': '2016-02-08 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', uniqueIdentifier: 152298735, totalPageViews: 3008425744, 'revenue(currency=USD)': null },
  { 'network.dateTime(grain=week)': '2016-02-15 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', uniqueIdentifier: 155191081, totalPageViews: 3072620639, 'revenue(currency=USD)': 1082313292.1 }
];

// prettier-ignore
const dimensionRows = [
  { 'network.dateTime(grain=day)': '2017-02-09 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', adClicks: 112619, 'revenue(currency=USD)': 93234.32304, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-10 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', adClicks: 102039, 'revenue(currency=USD)': 67234.12663, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-11 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', adClicks: 99890, 'revenue(currency=USD)': 12498.12298, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-12 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', adClicks: 95337, 'revenue(currency=USD)': 43992.9854, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-14 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', adClicks: 58507, 'revenue(currency=USD)': 78332.98822, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-15 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', adClicks: 47163, 'revenue(currency=USD)': 101242.53242, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-16 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', adClicks: 35183, 'revenue(currency=USD)': 120249.9384, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-17 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', adClicks: 32758, 'revenue(currency=USD)': 115234.33482, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-18 00:00:00.000', 'age(field=id)': '-3', 'age(field=desc)': 'All Other', adClicks: 32024, 'revenue(currency=USD)': 98123.34991, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-10 00:00:00.000', 'age(field=id)': '4', 'age(field=desc)': '21-24', adClicks: 62029, 'revenue(currency=USD)': 89129.75744, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-11 00:00:00.000', 'age(field=id)': '4', 'age(field=desc)': '21-24', adClicks: 95170, 'revenue(currency=USD)': 77234.99801, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-12 00:00:00.000', 'age(field=id)': '4', 'age(field=desc)': '21-24', adClicks: 135196, 'revenue(currency=USD)': 93221.1239, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-14 00:00:00.000', 'age(field=id)': '4', 'age(field=desc)': '21-24', adClicks: 158796, 'revenue(currency=USD)': 105882.99283, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-15 00:00:00.000', 'age(field=id)': '4', 'age(field=desc)': '21-24', adClicks: 166673, 'revenue(currency=USD)': 100000.12312, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-16 00:00:00.000', 'age(field=id)': '4', 'age(field=desc)': '21-24', adClicks: 186524, 'revenue(currency=USD)': 96234.09383, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-17 00:00:00.000', 'age(field=id)': '4', 'age(field=desc)': '21-24', adClicks: 164860, 'revenue(currency=USD)': 140243.77293, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-18 00:00:00.000', 'age(field=id)': '4', 'age(field=desc)': '21-24', adClicks: 167813, 'revenue(currency=USD)': 147992.84392, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-09 00:00:00.000', 'age(field=id)': '5', 'age(field=desc)': '25-29', adClicks: 184985, 'revenue(currency=USD)': 149234.88192, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-10 00:00:00.000', 'age(field=id)': '5', 'age(field=desc)': '25-29', adClicks: 196688, 'revenue(currency=USD)': 156234.88239, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-11 00:00:00.000', 'age(field=id)': '5', 'age(field=desc)': '25-29', adClicks: 176962, 'revenue(currency=USD)': 150532.81759, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-12 00:00:00.000', 'age(field=id)': '5', 'age(field=desc)': '25-29', adClicks: 151662, 'revenue(currency=USD)': 135998.37414, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-14 00:00:00.000', 'age(field=id)': '5', 'age(field=desc)': '25-29', adClicks: 141660, 'revenue(currency=USD)': 129352.9981, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-15 00:00:00.000', 'age(field=id)': '5', 'age(field=desc)': '25-29', adClicks: 130757, 'revenue(currency=USD)': 120342.84859, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-16 00:00:00.000', 'age(field=id)': '5', 'age(field=desc)': '25-29', adClicks: 115753, 'revenue(currency=USD)': 99157.66384, uniqueIdentifier: 100 },
  { 'network.dateTime(grain=day)': '2017-02-17 00:00:00.000', 'age(field=id)': '5', 'age(field=desc)': '25-29', adClicks: 93722, 'revenue(currency=USD)': 80500.77383, uniqueIdentifier: 100 }
];

const hourRows = [
  { 'network.dateTime(grain=hour)': '2017-02-09 00:00:00.000', adClicks: 112619 },
  { 'network.dateTime(grain=hour)': '2017-02-09 01:00:00.000', adClicks: 102039 },
  { 'network.dateTime(grain=hour)': '2017-02-09 02:00:00.000', adClicks: 99890 },
  { 'network.dateTime(grain=hour)': '2017-02-09 03:00:00.000', adClicks: 95337 },
  { 'network.dateTime(grain=hour)': '2017-02-09 04:00:00.000', adClicks: 77736 },
  { 'network.dateTime(grain=hour)': '2017-02-09 05:00:00.000', adClicks: 58507 },
  { 'network.dateTime(grain=hour)': '2017-02-09 06:00:00.000', adClicks: 47163 },
  { 'network.dateTime(grain=hour)': '2017-02-09 07:00:00.000', adClicks: 35183 },
  { 'network.dateTime(grain=hour)': '2017-02-09 08:00:00.000', adClicks: 32758 },
  { 'network.dateTime(grain=hour)': '2017-02-09 09:00:00.000', adClicks: 32024 },
  { 'network.dateTime(grain=hour)': '2017-02-09 10:00:00.000', adClicks: 44904 },
  { 'network.dateTime(grain=hour)': '2017-02-09 11:00:00.000', adClicks: 62029 },
  { 'network.dateTime(grain=hour)': '2017-02-09 12:00:00.000', adClicks: 95170 },
  { 'network.dateTime(grain=hour)': '2017-02-09 13:00:00.000', adClicks: 135196 },
  { 'network.dateTime(grain=hour)': '2017-02-09 14:00:00.000', adClicks: 163283 },
  { 'network.dateTime(grain=hour)': '2017-02-09 15:00:00.000', adClicks: 158796 },
  { 'network.dateTime(grain=hour)': '2017-02-09 16:00:00.000', adClicks: 166673 },
  { 'network.dateTime(grain=hour)': '2017-02-09 17:00:00.000', adClicks: 186524 },
  { 'network.dateTime(grain=hour)': '2017-02-09 18:00:00.000', adClicks: 164860 },
  { 'network.dateTime(grain=hour)': '2017-02-09 19:00:00.000', adClicks: 167813 },
  { 'network.dateTime(grain=hour)': '2017-02-09 20:00:00.000', adClicks: 184985 },
  { 'network.dateTime(grain=hour)': '2017-02-09 21:00:00.000', adClicks: 196688 },
  { 'network.dateTime(grain=hour)': '2017-02-09 22:00:00.000', adClicks: 176962 },
  { 'network.dateTime(grain=hour)': '2017-02-09 23:00:00.000', adClicks: 151662 },
  { 'network.dateTime(grain=hour)': '2017-02-10 00:00:00.000', adClicks: 156158 },
  { 'network.dateTime(grain=hour)': '2017-02-10 01:00:00.000', adClicks: 141660 },
  { 'network.dateTime(grain=hour)': '2017-02-10 02:00:00.000', adClicks: 130757 },
  { 'network.dateTime(grain=hour)': '2017-02-10 03:00:00.000', adClicks: 115753 },
  { 'network.dateTime(grain=hour)': '2017-02-10 04:00:00.000', adClicks: 93722 },
  { 'network.dateTime(grain=hour)': '2017-02-10 05:00:00.000', adClicks: 0 },
  { 'network.dateTime(grain=hour)': '2017-02-10 06:00:00.000', adClicks: 42930 },
  { 'network.dateTime(grain=hour)': '2017-02-10 07:00:00.000', adClicks: 38197 },
  { 'network.dateTime(grain=hour)': '2017-02-10 08:00:00.000', adClicks: 35524 },
  { 'network.dateTime(grain=hour)': '2017-02-10 09:00:00.000', adClicks: 33151 },
  { 'network.dateTime(grain=hour)': '2017-02-10 10:00:00.000', adClicks: 41540 },
  { 'network.dateTime(grain=hour)': '2017-02-10 11:00:00.000', adClicks: 67897 },
  { 'network.dateTime(grain=hour)': '2017-02-10 12:00:00.000', adClicks: 102692 },
  { 'network.dateTime(grain=hour)': '2017-02-10 13:00:00.000', adClicks: 148882 },
  { 'network.dateTime(grain=hour)': '2017-02-10 14:00:00.000', adClicks: 178171 },
  { 'network.dateTime(grain=hour)': '2017-02-10 15:00:00.000', adClicks: 195863 },
  { 'network.dateTime(grain=hour)': '2017-02-10 16:00:00.000', adClicks: 189377 },
  { 'network.dateTime(grain=hour)': '2017-02-10 17:00:00.000', adClicks: 210462 },
  { 'network.dateTime(grain=hour)': '2017-02-10 18:00:00.000', adClicks: 204357 },
  { 'network.dateTime(grain=hour)': '2017-02-10 19:00:00.000', adClicks: 195042 },
  { 'network.dateTime(grain=hour)': '2017-02-10 20:00:00.000', adClicks: 201723 },
  { 'network.dateTime(grain=hour)': '2017-02-10 21:00:00.000', adClicks: 190928 },
  { 'network.dateTime(grain=hour)': '2017-02-10 22:00:00.000', adClicks: 156252 },
  { 'network.dateTime(grain=hour)': '2017-02-10 23:00:00.000', adClicks: 132054 }
];

const minuteRows = [
  { 'network.dateTime(grain=minute)': '2017-02-09 00:00:00.000', adClicks: 112619 },
  { 'network.dateTime(grain=minute)': '2017-02-09 00:01:00.000', adClicks: 44904 },
  { 'network.dateTime(grain=minute)': '2017-02-09 00:02:00.000', adClicks: 102039 },
  { 'network.dateTime(grain=minute)': '2017-02-09 00:03:00.000', adClicks: 99890 },
  { 'network.dateTime(grain=minute)': '2017-02-09 00:04:00.000', adClicks: 95337 },
  { 'network.dateTime(grain=minute)': '2017-02-09 00:05:00.000', adClicks: 77736 },
  { 'network.dateTime(grain=minute)': '2017-02-09 00:06:00.000', adClicks: 58507 },
  { 'network.dateTime(grain=minute)': '2017-02-09 00:07:00.000', adClicks: 47163 },
  { 'network.dateTime(grain=minute)': '2017-02-09 00:08:00.000', adClicks: 35183 },
  { 'network.dateTime(grain=minute)': '2017-02-09 00:09:00.000', adClicks: 32758 },
  { 'network.dateTime(grain=minute)': '2017-02-09 00:10:00.000', adClicks: 32024 },
  { 'network.dateTime(grain=minute)': '2017-02-09 01:00:00.000', adClicks: 44904 },
  { 'network.dateTime(grain=minute)': '2017-02-09 01:01:00.000', adClicks: 62029 },
  { 'network.dateTime(grain=minute)': '2017-02-09 01:02:00.000', adClicks: 95170 },
  { 'network.dateTime(grain=minute)': '2017-02-09 01:03:00.000', adClicks: 135196 },
  { 'network.dateTime(grain=minute)': '2017-02-09 01:04:00.000', adClicks: 163283 },
  { 'network.dateTime(grain=minute)': '2017-02-09 01:05:00.000', adClicks: 158796 },
  { 'network.dateTime(grain=minute)': '2017-02-09 01:06:00.000', adClicks: 166673 },
  { 'network.dateTime(grain=minute)': '2017-02-09 01:07:00.000', adClicks: 186524 },
  { 'network.dateTime(grain=minute)': '2017-02-09 01:08:00.000', adClicks: 164860 },
  { 'network.dateTime(grain=minute)': '2017-02-09 01:09:00.000', adClicks: 167813 },
  { 'network.dateTime(grain=minute)': '2017-02-09 01:10:00.000', adClicks: 184985 },
  { 'network.dateTime(grain=minute)': '2017-02-09 02:00:00.000', adClicks: 196688 },
  { 'network.dateTime(grain=minute)': '2017-02-09 02:01:00.000', adClicks: 176962 },
  { 'network.dateTime(grain=minute)': '2017-02-09 02:02:00.000', adClicks: 151662 },
  { 'network.dateTime(grain=minute)': '2017-02-09 02:03:00.000', adClicks: 156158 },
  { 'network.dateTime(grain=minute)': '2017-02-09 02:04:00.000', adClicks: 141660 },
  { 'network.dateTime(grain=minute)': '2017-02-09 02:05:00.000', adClicks: 130757 },
  { 'network.dateTime(grain=minute)': '2017-02-09 02:06:00.000', adClicks: 115753 },
  { 'network.dateTime(grain=minute)': '2017-02-09 02:07:00.000', adClicks: 93722 },
  { 'network.dateTime(grain=minute)': '2017-02-09 02:08:00.000', adClicks: 61043 },
  { 'network.dateTime(grain=minute)': '2017-02-09 02:09:00.000', adClicks: 42930 },
  { 'network.dateTime(grain=minute)': '2017-02-09 02:10:00.000', adClicks: 38197 }
];

const secondRows = [
  { 'network.dateTime(grain=second)': '2017-02-09 00:00:00.000', adClicks: 112619 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:00:01.000', adClicks: 99890 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:00:02.000', adClicks: 102039 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:00:03.000', adClicks: 99890 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:00:04.000', adClicks: 95337 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:00:05.000', adClicks: 77736 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:00:06.000', adClicks: 58507 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:00:07.000', adClicks: 47163 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:00:08.000', adClicks: 35183 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:00:09.000', adClicks: 32758 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:00:10.000', adClicks: 32024 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:01:00.000', adClicks: 44904 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:01:01.000', adClicks: 62029 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:01:02.000', adClicks: 95170 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:01:03.000', adClicks: 135196 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:01:04.000', adClicks: 163283 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:01:05.000', adClicks: 158796 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:01:06.000', adClicks: 166673 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:01:07.000', adClicks: 186524 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:01:08.000', adClicks: 164860 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:01:09.000', adClicks: 167813 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:01:10.000', adClicks: 184985 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:02:00.000', adClicks: 196688 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:02:01.000', adClicks: 176962 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:02:02.000', adClicks: 151662 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:02:03.000', adClicks: 156158 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:02:04.000', adClicks: 141660 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:02:05.000', adClicks: 130757 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:02:06.000', adClicks: 115753 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:02:07.000', adClicks: 93722 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:02:08.000', adClicks: 61043 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:02:09.000', adClicks: 42930 },
  { 'network.dateTime(grain=second)': '2017-02-09 00:02:10.000', adClicks: 38197 }
];

const anomalousRows = [
  { 'network.dateTime(grain=day)': '2017-09-01 00:00:00.000', uniqueIdentifier: 155191081 },
  { 'network.dateTime(grain=day)': '2017-09-02 00:00:00.000', uniqueIdentifier: 172724594 },
  { 'network.dateTime(grain=day)': '2017-09-03 00:00:00.000', uniqueIdentifier: 183380921 },
  { 'network.dateTime(grain=day)': '2017-09-04 00:00:00.000', uniqueIdentifier: 172933788 },
  { 'network.dateTime(grain=day)': '2017-09-05 00:00:00.000', uniqueIdentifier: 183206656 },
  { 'network.dateTime(grain=day)': '2017-09-06 00:00:00.000', uniqueIdentifier: 183380921 },
  { 'network.dateTime(grain=day)': '2017-09-07 00:00:00.000', uniqueIdentifier: 180559793 }
];

export default class LineChartRoute extends Route {
  buildRequest(
    metrics: { field: string; parameters?: Record<string, string> }[],
    dimensions: { field: string; parameters?: Record<string, string> }[],
    grain: Grain,
    interval: { start: string; end: string }
  ) {
    return this.store.createFragment('bard-request-v2/request', {
      table: 'network',
      columns: [
        {
          cid: 'cid_network.dateTime',
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain },
          alias: null,
          source: 'bardOne'
        },
        ...metrics.map(({ field, parameters }) => {
          const canonical = canonicalizeMetric({ metric: field, parameters });
          return {
            cid: `cid_${canonical}`,
            type: 'metric',
            field,
            parameters: parameters || {},
            alias: null,
            source: 'bardOne'
          };
        }),
        ...dimensions.map(({ field, parameters }) => {
          const canonical = canonicalizeMetric({ metric: field, parameters });
          return {
            cid: `cid_${canonical}`,
            type: 'dimension',
            field,
            parameters: parameters || {},
            alias: null,
            source: 'bardOne'
          };
        })
      ],
      filters: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: grain },
          operator: 'bet',
          values: [interval.start, interval.end],
          source: 'bardOne'
        }
      ],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0'
    });
  }

  defaultRequest!: RequestFragment;

  get dimensionRequest() {
    return this.buildRequest(
      [{ field: 'adClicks' }, { field: 'uniqueIdentifier' }, { field: 'revenue', parameters: { currency: 'USD' } }],
      [
        { field: 'age', parameters: { field: 'id' } },
        { field: 'age', parameters: { field: 'desc' } }
      ],
      'day',
      { start: '2017-02-09 00:00:00.000', end: '2017-02-19 00:00:00.000' }
    );
  }

  get hourGrainRequest() {
    return this.buildRequest([{ field: 'adClicks' }], [], 'hour', {});
  }

  get minuteGrainRequest() {
    return this.buildRequest([{ field: 'adClicks' }], [], 'minute', {});
  }

  get secondGrainRequest() {
    return this.buildRequest([{ field: 'adClicks' }], [], 'second', {});
  }

  get anomalousRequest() {
    return this.buildRequest([{ field: 'uniqueIdentifier' }], [], 'day', {
      start: '2017-09-01 00:00:00.000',
      end: '2017-09-07 00:00:00.000'
    });
  }

  init() {
    this.defaultRequest = this.buildRequest(
      [
        { field: 'uniqueIdentifier' },
        { field: 'totalPageViews' },
        { field: 'revenue', parameters: { currency: 'USD' } }
      ],
      [],
      'week',
      { start: '2015-12-14 00:00:00.000', end: '2016-02-22 00:00:00.000' }
    );
  }

  model() {
    const {
      defaultRequest,
      dimensionRequest,
      hourGrainRequest,
      minuteGrainRequest,
      secondGrainRequest,
      anomalousRequest
    } = this;
    return {
      default: A([{ request: defaultRequest, response: { rows: defaultRows, meta: {} } }]),
      dimension: A([{ request: dimensionRequest, response: { rows: dimensionRows, meta: {} } }]),
      hourGrain: A([{ request: hourGrainRequest, response: { rows: hourRows, meta: {} } }]),
      minuteGrain: A([{ request: minuteGrainRequest, response: { rows: minuteRows, meta: {} } }]),
      secondGrain: A([{ request: secondGrainRequest, response: { rows: secondRows, meta: {} } }]),
      anomalous: A([
        { request: anomalousRequest, response: { rows: anomalousRows, meta: {} } },
        Promise.resolve(
          A([
            { index: 1, actual: 12, predicted: 172724594.12345, standardDeviation: 123.123456 },
            { index: 3, actual: 10, predicted: 172933788.12345, standardDeviation: 123.123456 },
            { index: 5, actual: 14, predicted: 183380921.12345, standardDeviation: 123.123456 }
          ])
        )
      ])
    };
  }
}
