export default function () {
  let count = 0;

  this.get('/notAnotherRickRoll', function () {
    return {
      fileId: 'rickRoll',
      url: 'https://youtu.be/dQw4w9WgXcQ',
    };
  });

  this.get('/gsheet-export/status/:fileId', function () {
    count = count + 1;
    return {
      spreadsheetId: 'rickRoll',
      hasMovedToTeamDrive: count % 3 === 0,
      createdTime: '2021-09-10T21:12:31.000Z',
      modifiedTime: '2021-09-10T21:22:00.000Z',
    };
  });
}
