var searchBar = document.createElement('input');
var canvas = document.createElement('div');
var blockCount;
var clipList = [];
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
	clipList = [];
	blockCount = parseInt(document.documentElement.clientWidth/310);
	scriptRequest('http://gdata.youtube.com/feeds/api/videos/', searchRequest, convertYouTubeResponseToClipList);
	canvas.style.height = document.documentElement.clientHeight - 76 + 'px';
});

function convertYouTubeResponseToClipList(rawYouTubeData) {
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
    	onSuccess(data);
    	drawPage(blockCount);
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

function drawPage(count) {
	for (var i=0; i < count; i++) {
		var div = document.createElement('div');
		var title = document.createElement('p');
		var description = document.createElement('div');
		var author = document.createElement('div');
		var publishDate = document.createElement('div');
		var viewCount = document.createElement('div');
		var p = document.createElement('p');
		canvas.appendChild(div);
		var youtubeLink = document.createElement('a');
		var thumbnail = document.createElement('img');
		thumbnail.src = clipList[i].thumbnail;
		youtubeLink.href = clipList[i].youtubeLink;
		youtubeLink.target = '_blank';
		title.innerHTML = clipList[i].title;
		description.innerHTML = clipList[i].description;
		author.innerHTML = ' ' + clipList[i].author;
		publishDate.innerHTML = ' ' + clipList[i].publishDate;
		viewCount.innerHTML = ' ' + clipList[i].viewCount;
		div.appendChild(youtubeLink);
		div.appendChild(p);
		p.appendChild(author);
		p.appendChild(publishDate);
		p.appendChild(viewCount);
		p.appendChild(description);
		youtubeLink.appendChild(thumbnail);
		youtubeLink.appendChild(title);
		author.classList.add('icon-user');
		publishDate.classList.add('icon-calendar');
		viewCount.classList.add('icon-eye');
		description.classList.add('description');
	};
};

window.addEventListener('resize', function(){
	var count = parseInt(document.documentElement.clientWidth/310);
	if (count!==blockCount){
		canvas.innerHTML = '';
		blockCount=count;
		drawPage(count);
	}
	canvas.style.height = document.documentElement.clientHeight - 76 + 'px';
});