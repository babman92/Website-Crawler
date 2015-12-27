module.exports = new vnexpress;

var request = require('request');
var cheerio = require('cheerio');
var getdetail = require('./getdetail');
var conn = require('../connection.js');
conn.initConnectionToDB();

var url = 'http://thethao.vnexpress.net/page/%s.html';
var max_pages = 20;
var start_page = 1;
var number_article_added = 0;

var sql_insert_article_list = 'insert into article_list set ?';
var sql_insert_article_detail = 'insert into article_detail set ?';


require('events').EventEmitter.prototype._maxListeners = 1000000;

function vnexpress() {
    return this;
}

function buildUrl(index) {
    return url.replace('%s', index);
}

function startCrawl(i) {
    var link = buildUrl(i);
    request(link, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            var $ = cheerio.load(body);
            $('.thumb').each(function (i, element) {
                var thumb = $(this);
                var thumb_child = thumb.children();
                var a = $(thumb_child).eq(0);
                var title = a.attr('title');
                var url = a.attr('href');
                var a_child = a.children();
                var img = $(a_child).eq(0).attr('src');
                
                var news_lead = thumb.next();
                var description = news_lead.text().trim().replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, '');
                
                var article = {
                    title: title,
                    link: url,
                    thumb: img,
                    description: description
                }
                
                conn.excuteUpdate(sql_insert_article_list, article, function (row) {
                    getdetail.getData(url, function (contents) {
                        console.log('get detail completed - ' + row.insertId);
                        var article_detail = {
                            article_id: row.insertId,
                            content: JSON.stringify(contents)
                        }
                        conn.excuteUpdate(sql_insert_article_detail, article_detail, function () {
                            number_article_added++;
                            console.log('number article added - ' + number_article_added);
                            console.log('insert article completed - ' + row.insertId);
                        });
                    });
                });
            });
        }
        else {
            console.log('Error');
        }
    });
}

for (var i = start_page; i <= max_pages; i++) {
    startCrawl(i);
}

// var seconds = 0;
// setInterval(function() {
// 		seconds++;
// 		console.log(seconds);
// }, 1000);

