const URL = {
    DOMAIN: "http://vkool.net",
    DOMAIN_EMBED: `http://vkool.net/js/vkphp/plugins/gkpluginsphp.php`,
    SEARCH: (title) => {
    	return `http://vkool.net/search/${title}.html`;
    },
    HEADERS: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
        'Content-type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Host': 'vkool.net',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
    },
    HEADERS_RERFER: (rerfer = '') => {
    	return {
	        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
	        'Accept-Language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
	        'Cache-Control': 'max-age=0',
	        'Content-type': 'application/x-www-form-urlencoded',
	        'Connection': 'keep-alive',
	        'Host': 'vkool.net',
	        'Rerfer': rerfer,
	        'Upgrade-Insecure-Requests': 1,
	        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
    	}
    } 
};



class Vkool {
    constructor(props) {
        this.libs = props.libs;
        this.movieInfo = props.movieInfo;
        this.settings = props.settings;

        this.state = {};
    }



    async searchDetail() {
        const { httpRequest, cheerio, stringHelper, qs }    = this.libs; 
        let { title, year, season, episode, type }      = this.movieInfo;

        let videoMovieUrl  	= [];
        let arrHrefEpisode = []; 
        let videoTvshowUrl 	= false;
        let videoUrl 	   	= false;
        let detailUrl 		= [];
        let tvshowDetailUrl = false;

        let	urlSearch = URL.SEARCH(stringHelper.convertToSearchQueryString(title, '+'));
        let htmlSearch 	= await httpRequest.getHTML(urlSearch, URL.HEADERS);
        let $ 			= cheerio.load(htmlSearch);

        let itemSearch 	= $('.list-movie .movie-item');


        itemSearch.each(function() {

        	let hrefMovie  	= $(this).find('.block-wrapper').attr('href');
        	let titleMovie 	= $(this).find('.movie-title-2').text();
        	let status      = $(this).find('.movie-meta .ribbon').text().toLowerCase();
        	let seasonMovie = titleMovie.match(/\(* *season *([0-9]+)\)*/i);
           	titleMovie     	= titleMovie.replace(/\(* *season *[0-9]+\)*/i, '');
           	seasonMovie     = seasonMovie != null ? seasonMovie[1] : "0";

           	status = status.trim().replace('ậ', 'a');

        	if( stringHelper.shallowCompare(title, titleMovie) ) {

        		if( type == 'movie'  && status.indexOf('tap') == -1 && status.indexOf('-end') == -1 ) {
        			videoMovieUrl.push(hrefMovie);
        		} else if( type == 'tv' && seasonMovie == season ) {
        			videoTvshowUrl = hrefMovie;
        			return;
        		}
        	}
        });

       	if( type == 'movie' && videoMovieUrl.length > 0 )  {

       		let arrPromise = videoMovieUrl.map(async (val) => {

       			let htmlVideo = await httpRequest.getHTML(val, URL.HEADERS);
       			let $_2 	  = cheerio.load(htmlVideo);
       			let linkVideo  = $_2('#btn-film-watch').attr('href');

                if (linkVideo && linkVideo.indexOf('http://') == -1 && linkVideo.indexOf('https://') == -1) {
                    linkVideo = URL.DOMAIN +  linkVideo;
                }
       			let yearMovie = $_2('dt:contains(Năm)').next().find('a').text();

       			if (yearMovie == year) {

       				detailUrl.push(linkVideo);
       				return;
       			}
       		});

       		await Promise.all(arrPromise);
       		
       	}

       	if( type == 'tv' && videoTvshowUrl != false ) {

       		let htmlVideo = await httpRequest.getHTML(videoTvshowUrl, URL.HEADERS);
       		let $_2 	  = cheerio.load(htmlVideo);

       		let linkVideo  = $_2('#btn-film-watch').attr('href');
            if( linkVideo.indexOf('http://') == -1 && linkVideo.indexOf('https://') == -1 ) {
                linkVideo = URL.DOMAIN +  linkVideo;
            }

            let htmlDetail = await httpRequest.getHTML(linkVideo, URL.HEADERS);
            $_2 		   = cheerio.load(htmlDetail);
            let itemEpisode  = $_2('.list_ep');
            

            itemEpisode.each(function() {

                let itemA = $_2(this).find('a');

                itemA.each(function() {

                    let numberEpisode = $_2(this).text();
                    let hrefDetail   = $_2(this).attr('href');

                    if( hrefDetail.indexOf('http://') == -1 && hrefDetail.indexOf('https://') == -1 ) {
                        hrefDetail =  URL.DOMAIN + '/' + hrefDetail;
                    }

                    if( episode == numberEpisode ) {
                    	arrHrefEpisode.push(hrefDetail);
                    }
                });

            });

            detailUrl = arrHrefEpisode;

       	}

        this.state.detailUrl = detailUrl;
        return;
    }


    async getHostFromDetail() {

        const { httpRequest, cheerio, qs, gibberish } = this.libs;
        const {type} 								  = this.movieInfo;

    	if(this.state.detailUrl.length == 0) throw new Error("NOT_FOUND");
        

        let hosts       = [];
        let vkool   	= this;

        for( let item of this.state.detailUrl ) {

        	let list_link   = {
	            link: [] 
	        };

	        let html_video  = await httpRequest.getHTML(item, URL.HEADERS);
	        let $           = cheerio.load(html_video);

	        if( $('#VkoolMovie').length == 0 ) continue;

	        let script      = $('#VkoolMovie').next().html();


	        let info_video  = script.match(/gkpluginsphp\(\"VkoolMovie\"\ *, *([^\)]+)/i);
	        info_video      = info_video[1];

	        eval(`info_video = ${info_video}`);

	        if (info_video.link) {
	            let linkdatap = info_video.link.replace(/&/g, '%26');

	            let body_post = {
	                link: linkdatap
	            };
	            let result_post = await httpRequest.post(URL.DOMAIN_EMBED, URL.HEADERS_RERFER(item), body_post);
	            result_post 	= result_post.data;
	            list_link 		= result_post;
	        } else if (info_video.gklist) {

	        } else if (info_video.list) {

	        }

	        if (list_link.link && list_link.link.length > 0) {
	            for ( let item1 in list_link.link ) {

	                let link_direct = gibberish.dec(list_link.link[item1].link, 'decolivkool');

	            	link_direct && hosts.push({
	                    provider: {
	                        url: item,
	                        name: "Server 5"
	                    },
	                    result: {
	                        file: link_direct,
	                        label: list_link.link[item1].label,
	                        type: 'direct'
	                    }
	                });
	            }

	        }
        }

        console.log(hosts); process.exit();
        
        this.state.hosts = hosts;
        return;
    }



}

exports.default = async (libs, movieInfo, settings) => {

    const vkool = new Vkool({
        libs: libs,
        movieInfo: movieInfo,
        settings: settings
    });
    await vkool.searchDetail();
    await vkool.getHostFromDetail();
    return vkool.state.hosts;
}

exports.testing = Vkool;