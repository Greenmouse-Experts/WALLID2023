/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-plusplus */
const QRcode = require('qrcode');

exports.generateWallID = () => {
  const length = 18;
  const characters = 'ABCDEFGHIJKLMOPQRSTUVWXYZ1234567890';
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result.trim();
};

exports.generateWallIdQrcode = async (id) => {
  const QRbase64 = await new Promise((resolve, reject) => {
    QRcode.toDataURL(id, function (err, code) {
      if (err) {
        reject(reject);
        return;
      }
      resolve(code);
    });
  });

  return QRbase64;
};
