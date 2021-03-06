

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var URL = {
    DOMAIN: "https://www.filmxy.one/",
    SEARCH: function SEARCH(title) {
        return 'https://www.filmxy.one/?s=' + title;
    },
    HEADERS: function HEADERS(referer) {
        return {
            'User-Agent': 'Firefox 59',
            'Referer': referer
        };
    }
};

var getDomain = function getDomain(url) {
    var m = url.match(/\/\/([^\/]+)/);
    if (m == null) return 'xyzzyx.com';
    return m[1] != undefined ? m[1] : 'xyzzyx.com';
};

var Filmxy = function () {
    function Filmxy(props) {
        _classCallCheck(this, Filmxy);

        this.libs = props.libs;
        this.movieInfo = props.movieInfo;
        this.settings = props.settings;

        this.state = {};
    }

    _createClass(Filmxy, [{
        key: 'searchDetail',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                var _libs, httpRequest, cheerio, stringHelper, qs, _movieInfo, title, year, season, episode, type, detailUrl, urlSearch, resultSearch, js, i, t;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _libs = this.libs, httpRequest = _libs.httpRequest, cheerio = _libs.cheerio, stringHelper = _libs.stringHelper, qs = _libs.qs;
                                _movieInfo = this.movieInfo, title = _movieInfo.title, year = _movieInfo.year, season = _movieInfo.season, episode = _movieInfo.episode, type = _movieInfo.type;
                                detailUrl = false;
                                urlSearch = URL.SEARCH(stringHelper.convertToSearchQueryString(title, '+'));
                                _context.next = 6;
                                return httpRequest.getHTML('https://raw.githubusercontent.com/Teatvandroid/TeaTV_Android/master/posts.json', URL.HEADERS(URL.DOMAIN));

                            case 6:
                                resultSearch = _context.sent;


                                /*
                                let $ = cheerio.load(resultSearch);
                                $('.single-post').each(function() {
                                     let hrefMovie   = $(this).find('.post-thumbnail a').attr('href');
                                    let titleMovie  = $(this).find('.post-title h2').text();
                                    let m           = titleMovie.match(/(.*)\s(\(([0-9]{4})\))/);
                                    let yearMovie   = (m != undefined) ? m[3] : 2018;
                                    titleMovie      = (m != undefined) ? m[1] : '';
                                     if( stringHelper.shallowCompare(titleMovie, title) && year == yearMovie ) {
                                        detailUrl = hrefMovie;
                                    }
                                    
                                });
                                */
                                js = JSON.parse(resultSearch);
                                i = 0;

                            case 9:
                                if (!(i < js.length)) {
                                    _context.next = 17;
                                    break;
                                }

                                t = js[i]['name'].toLowerCase();

                                if (!(t.indexOf(title.toLowerCase()) != -1 && t.indexOf(year) != -1)) {
                                    _context.next = 14;
                                    break;
                                }

                                detailUrl = js[i]['link'].replace('cdn.', 'www.');
                                return _context.abrupt('break', 17);

                            case 14:
                                i++;
                                _context.next = 9;
                                break;

                            case 17:

                                this.state.detailUrl = detailUrl;

                                return _context.abrupt('return');

                            case 19:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function searchDetail() {
                return _ref.apply(this, arguments);
            }

            return searchDetail;
        }()
    }, {
        key: 'getHostFromDetail',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var _libs2, httpRequest, cheerio, qs, hosts, type, htmlDetail, detailUrl, url, alloweds, m, i, l;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _libs2 = this.libs, httpRequest = _libs2.httpRequest, cheerio = _libs2.cheerio, qs = _libs2.qs;

                                if (this.state.detailUrl) {
                                    _context2.next = 3;
                                    break;
                                }

                                throw new Error("NOT_FOUND");

                            case 3:
                                hosts = [];
                                type = this.movieInfo.type;
                                _context2.next = 7;
                                return httpRequest.getHTML(this.state.detailUrl);

                            case 7:
                                htmlDetail = _context2.sent;
                                detailUrl = this.state.detailUrl;
                                url = detailUrl;

                                if (!(url.indexOf('http://') != 0 && url.indexOf('https://') != 0)) {
                                    _context2.next = 12;
                                    break;
                                }

                                throw new Error('NOT_FOUND');

                            case 12:
                                alloweds = ['vidoza.net', 'streamango.com', 'www.rapidvideo.com', 'ok.ru'];
                                m = htmlDetail.split('&quot;');


                                for (i = 0; i < m.length; i++) {
                                    l = m[i];

                                    if (l.indexOf('http') == 0 && alloweds.includes(getDomain(l))) {
                                        hosts.push({
                                            provider: {
                                                url: detailUrl,
                                                name: "Filmxyz"
                                            },
                                            result: {
                                                file: l.replace('/e/', '/v/'),
                                                label: "embed",
                                                type: 'embed'
                                            }
                                        });
                                    }
                                }

                                this.state.hosts = hosts;

                            case 16:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function getHostFromDetail() {
                return _ref2.apply(this, arguments);
            }

            return getHostFromDetail;
        }()
    }]);

    return Filmxy;
}();

thisSource.function = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(libs, movieInfo, settings) {
        var httpRequest, source, bodyPost, res, js, hosts;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        httpRequest = libs.httpRequest;
                        source = new Filmxy({
                            libs: libs,
                            movieInfo: movieInfo,
                            settings: settings
                        });
                        bodyPost = {
                            name_source: 'Filmxyz',
                            is_link: 0,
                            type: movieInfo.type,
                            season: movieInfo.season,
                            episode: movieInfo.episode,
                            title: movieInfo.title,
                            year: movieInfo.year,
                            hash: libs.cryptoJs.MD5(movieInfo.title.toLowerCase() + movieInfo.season.toString() + "aloha" + movieInfo.episode.toString()).toString()
                        };
                        _context3.next = 5;
                        return httpRequest.post('https://vvv.teatv.net/source/get', {}, bodyPost);

                    case 5:
                        res = _context3.sent;
                        js = void 0, hosts = [];


                        try {
                            res = res['data'];
                            if (res['status']) {
                                hosts = JSON.parse(res['hosts']);
                            }
                        } catch (err) {
                            console.log('err', err);
                        }

                        if (movieInfo.checker != undefined) hosts = [];

                        if (!(hosts.length == 0)) {
                            _context3.next = 22;
                            break;
                        }

                        _context3.next = 12;
                        return source.searchDetail();

                    case 12:
                        _context3.next = 14;
                        return source.getHostFromDetail();

                    case 14:
                        hosts = source.state.hosts;

                        if (!(movieInfo.checker != undefined)) {
                            _context3.next = 17;
                            break;
                        }

                        return _context3.abrupt('return', hosts);

                    case 17:
                        if (!(hosts.length > 0)) {
                            _context3.next = 22;
                            break;
                        }

                        bodyPost['hosts'] = JSON.stringify(hosts);
                        bodyPost['expired'] = 10800;
                        _context3.next = 22;
                        return httpRequest.post('https://vvv.teatv.net/source/set', {}, bodyPost);

                    case 22:

                        if (movieInfo.ss != undefined) {
                            movieInfo.ss.to(movieInfo.cs.id).emit(movieInfo.c, hosts);
                        }

                        return _context3.abrupt('return', hosts);

                    case 24:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    }));

    return function (_x, _x2, _x3) {
        return _ref3.apply(this, arguments);
    };
}();

thisSource.testing = Filmxy;