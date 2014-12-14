var searchBar = document.createElement('input');
var canvas = document.createElement('div');
var CallbackRegistry = {};

(function () {
	var logo = document.createElement('div');
	var div = document.createElement('div');
	var img = document.createElement('img');
	var p = document.createElement('p');
	img.src = 'YouTube_logo.png';
	p.innerHTML = 'Viewer';
	searchBar.type = 'text';
	searchBar.placeholder = 'Enter the name of the video';
	div.classList.add('searchBar');
	logo.classList.add('logo');
	logo.classList.add('clearfix');
	canvas.classList.add('canvas');
	document.body.appendChild(logo);
	document.body.appendChild(div);
	document.body.appendChild(canvas);
	logo.appendChild(img);
	logo.appendChild(p);
	div.appendChild(searchBar);
})();

searchBar.addEventListener('input', function() {
	var searchRequest = searchBar.value;
	canvas.innerHTML = '';
	scriptRequest('http://gdata.youtube.com/feeds/api/videos/', searchRequest, convertYouTubeResponseToClipList);

});

function convertYouTubeResponseToClipList(rawYouTubeData) {
    var clipList = [];
    var entries = rawYouTubeData.feed.entry;
    if (entries) {
        for (var i = 0, l = entries.length; i < l; i++) {
            var entry = entries[i];
            var date = new Date(Date.parse(entry.updated.$t));
            var shortId = entry.id.$t.match(/video:.*/).toString().split(":")[1];
            clipList.push({
                id: shortId,
                youtubeLink: "http://www.youtube.com/watch?v=" + shortId,
                title: entry.title.$t,
                thumbnail: entry.media$group.media$thumbnail[1].url,
                description: entry.media$group.media$description.$t,
                author: entry.author[0].name.$t,
                publishDate: date.toUTCString(),
                viewCount: entry.yt$statistics.viewCount
            });
        }
    }
    return clipList;
};

function scriptRequest(url, searchRequest, onSuccess) {
	var script = document.createElement('script');
	var scriptOk = false;
  	var callbackName = 'myJsonPCallback';
  	url += '?callback=CallbackRegistry.'+callbackName;
 	url += '&v=2&alt=json&max-results=15&start-index=1&q=';
 	url += searchRequest;

  	CallbackRegistry[callbackName] = function(data) {       
    	scriptOk = true;
    	delete CallbackRegistry[callbackName];
    	drawPage(onSuccess(data));
  	};

 	function checkCallback() {      
    	if (scriptOk) return;
    	delete CallbackRegistry[callbackName]; 
 //   	onError(url);
  	};

  	script.onreadystatechange = function() {    
    	if (this.readyState == 'complete' || this.readyState == 'loaded'){   
     		this.onreadystatechange = null;   
     		setTimeout(checkCallback, 0);
    	}
  	}

	script.onload = script.onerror = checkCallback;
 	script.src = url;
	document.body.appendChild(script);
	script.parentNode.removeChild(script);
};

function drawPage(clipList) {
	var count = document.documentElement.clientWidth/300;
	count = count.toFixed();

	for (var i=0; i < count; i++) {
		var div = document.createElement('div');
		var title = document.createElement('p');
		canvas.appendChild(div);
		var youtubeLink = document.createElement('a');
		var thumbnail = document.createElement('img');
		thumbnail.src = clipList[i].thumbnail;
		youtubeLink.href = clipList[i].youtubeLink;
		youtubeLink.target = '_blank';
		title.innerHTML = clipList[i].title;
		div.appendChild(youtubeLink);
		youtubeLink.appendChild(thumbnail);
		youtubeLink.appendChild(title);
	};
};