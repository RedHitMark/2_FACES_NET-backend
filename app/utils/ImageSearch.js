const request = require('request');
const cheerio = require('cheerio');

async function getImageByPhoneName(phoneName) {
    return new Promise((resolve, reject) => {
        const url = "https://www.google.com/search?tbm=isch&q=" + phoneName;

        request(url, {}, (err, res, body) => {
            if (err) {
                reject(err);
            }

            const $ = cheerio.load(body);

            const images = [];
            $('body').find('img').each((index, element) => {
                images.push($(element).attr('src'));
            });

            images.length > 1? resolve(images[1]) : reject();
        });
    });
}

module.exports = {
    getImageByPhoneName
}