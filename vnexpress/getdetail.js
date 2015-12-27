module.exports = new getdetail;

var request = require('request');
var cheerio = require('cheerio');

function getdetail() {
    return this;
}

getdetail.prototype.getData = function (link, getDataDone) {
    var content = {};
    request(link, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            content.status = true;
            var $ = cheerio.load(html);
            var create_date = $('.block_timer_share').children().eq(0).text().trim().replace(/\n/, '').replace(/\r/, '').replace(/\t/, '');
            content.create_date = create_date;
            var slides = $('.block_thumb_slide_show');
            if (slides.children().length > 0) { // lay bai slide anh
                getDataSlide(html, function (data) {
                    content.is_slide_show = true;
                    content.data = data;
                    getDataDone(content);
                });
            } else {// lay bai binh thuong
                getDataNormal(html, function (data) {
                    content.is_slide_show = false;
                    content.data = data;
                    getDataDone(content);
                });
            }
        } else {
            content.status = false;
            content.message = error;
            getDataDone(content);
        }
    });
};

function getDataSlide(html, getDataDone) {
    var contents = [];
    var $ = cheerio.load(html);
    $('.block_thumb_slide_show').each(function (i, element) {
        var thumb = $(this);
        var img = thumb.children().eq(0).attr('src');
        var desc = thumb.next().text().trim().replace(/\n/, '').replace(/\r/, '').replace(/\t/, '');
        var slide = {
            image: img,
            description: desc
        }
        contents[i] = slide;
    });
    getDataDone(contents);
};

function getDataNormal(html, getDataDone) {
    var contents = [];
    var $ = cheerio.load(html);
    var details = $('#left_calculator > div.fck_detail.width_common').children();
    details.each(function (i, element) {
        var item = $(this);
        var content = {};
        if (item.is('table')) {
            var image = item.children().eq(0).children().eq(0).children().eq(0).children().eq(0).attr('src');
            if (image != undefined) {
                content.is_image = true;
                content.data = image;
                contents[i] = content;
            }
        } else {
            var text = item.text().trim().replace(/\n/, '').replace(/\r/, '').replace(/\t/, '');
            if (text.length > 0) {
                content.is_image = false;
                content.data = text;
                contents[i] = content;
            }
        }
    });
    getDataDone(contents);
}