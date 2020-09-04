import { module, test } from 'qunit';
import { assignColors, fetchColor } from 'navi-core/utils/enums/denali-colors';

module('Unit | Utils | Denali Colors', () => {
  test('assignColors returns correct colors in correct order', assert => {
    assert.deepEqual(
      assignColors(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], []),
      ['#87d812', '#fed800', '#19c6f4', '#9a2ead', '#ff3390', '#0072df', '#f17603', '#6e2ebf', '#20c05b', '#e21717'],
      'assigns colors in correct order'
    );
    assert.deepEqual(
      assignColors(
        [
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
          '13',
          '14',
          '15',
          '16',
          '17',
          '18',
          '19',
          '20',
          '21',
          '22',
          '23',
          '24',
          '25'
        ],
        []
      ),
      [
        '#87d812',
        '#fed800',
        '#19c6f4',
        '#9a2ead',
        '#ff3390',
        '#0072df',
        '#f17603',
        '#6e2ebf',
        '#20c05b',
        '#e21717',
        '#6eac0f',
        '#f0b200',
        '#1499b5',
        '#6e227d',
        '#bf2874',
        '#0058a0',
        '#c85e03',
        '#40008b',
        '#1a9947',
        '#be0c0c',
        '#87d812',
        '#fed800',
        '#19c6f4',
        '#9a2ead',
        '#ff3390'
      ],
      'wraps through colors correctly'
    );
    assert.expect();
    assert.deepEqual(
      assignColors(
        ['Iron', 'Captain', 'Widow', 'Hulk', 'Spider', 'Witch'],
        [
          {
            color: '#000000',
            label: 'Widow'
          },
          {
            color: '#ff0000',
            label: 'Witch'
          }
        ]
      ),
      ['#87d812', '#fed800', '#000000', '#9a2ead', '#ff3390', '#ff0000'],
      'assignColors returns colors from config when labels from config are present'
    );
    assert.deepEqual(
      assignColors(
        ['Bat', 'Robin', 'Wonder', 'Super', 'Flash'],
        [
          {
            color: '#000000',
            label: 'Lantern'
          }
        ]
      ),
      ['#87d812', '#fed800', '#19c6f4', '#9a2ead', '#ff3390'],
      'assignColors returns colors from default when labels from config are not present'
    );
  });

  test('fetchColor assigns correct colors in correct order', assert => {
    assert.deepEqual(fetchColor(5), '#0072df', 'defaults to graph colors');
    assert.deepEqual(fetchColor(2, 'status'), '#15c046', 'responds to status colors');
    assert.deepEqual(fetchColor(5, 'status'), '#f4cb00', 'wraps through status colors correctly');
    assert.deepEqual(fetchColor(25), '#0072df', 'wraps through graph colors correctly');
  });
});
