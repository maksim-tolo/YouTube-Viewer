var searchBar = document.createElement('input');
var canvas = document.createElement('div');
var footer = document.createElement('footer');
var blockCount;
var elCount;
var clipList = [];
var CallbackRegistry = {};
var swipe = {};
var pageNumber;
var shiftList;

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
	document.body.appendChild(footer);
	logo.appendChild(img);
	logo.appendChild(p);
	div.appendChild(searchBar);
})();

searchBar.addEventListener('input', function() {
	searchRequest = searchBar.value;
	var startIndex=1;
	canvas.innerHTML = '';
	footer.innerHTML = '';
	shiftList = 0;
	pageNumber = 1;
	clipList = [];
	blockCount = parseInt(document.documentElement.clientWidth/310);
	elCount = 0;
	scriptRequest('http://gdata.youtube.com/feeds/api/videos/', startIndex, searchRequest, convertYouTubeResponseToClipList);
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

function scriptRequest(url, startIndex, searchRequest, onSuccess, start, finish, anim) {
	var script = document.createElement('script');
	var scriptOk = false;
  	var callbackName = 'myJsonPCallback';
  	url += '?callback=CallbackRegistry.'+callbackName;
 	url += '&v=2&alt=json&max-results=15&start-index='
 	url += startIndex;
 	url += '&q=';
 	url += searchRequest;
 	start = typeof start !== 'undefined' ? start : 0;
   	finish = typeof finish !== 'undefined' ? finish : blockCount;
   	anim = typeof anim !== 'undefined' ? anim : 'left';

  	CallbackRegistry[callbackName] = function(data) {       
    	scriptOk = true;
    	delete CallbackRegistry[callbackName];
    	onSuccess(data);
    	drawPage(start, finish, anim);
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

function drawPage(start, count, anim) {
	anim = typeof anim !== 'undefined' ? anim : 'left';
	var tmp;
	if (anim==='left') tmp = 0;
	else tmp = count-start-1;
	for (var i=start; i < count; i++) {
		var div = document.createElement('div');
		var title = document.createElement('p');
		var description = document.createElement('div');
		var author = document.createElement('div');
		var publishDate = document.createElement('div');
		var viewCount = document.createElement('div');
		var descr = document.createElement('div');
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
		descr.innerHTML = 'Description:'
		div.appendChild(youtubeLink);
		div.appendChild(p);
		div.style.animation = anim+' 1s cubic-bezier(0,0,0.25,1) '+2*tmp+'00ms';
		div.style.webkitAnimation = anim+' 1s cubic-bezier(0,0,0.25,1) '+2*tmp+'00ms';
		p.appendChild(author);
		p.appendChild(publishDate);
		p.appendChild(viewCount);
		p.appendChild(descr);
		p.appendChild(description);
		youtubeLink.appendChild(thumbnail);
		youtubeLink.appendChild(title);
		author.classList.add('icon-user');
		descr.classList.add('descr');
		publishDate.classList.add('icon-calendar');
		viewCount.classList.add('icon-eye');
		description.classList.add('description');
		if (anim==='left') tmp++;
		else tmp--;
	};
	var left = document.createElement('div');
	left.classList.add('leftPage');
	footer.appendChild(left);
	var right = document.createElement('div');
	right.classList.add('rightPage');
	footer.appendChild(right);
};

window.addEventListener('resize', function(){
	var count = parseInt(document.documentElement.clientWidth/310);
	if (count>blockCount){
		if(elCount+count>pageNumber*15-shiftList) {
			shiftList=pageNumber*15-elCount;
			clipList = [];
			scriptRequest('http://gdata.youtube.com/feeds/api/videos/', elCount+1, searchBar.value, convertYouTubeResponseToClipList);
			canvas.innerHTML = '';
			footer.innerHTML = '';
			pageNumber++;
			blockCount=count;
		}
		else {
			canvas.innerHTML = '';
			footer.innerHTML = '';
			drawPage (elCount-15*(pageNumber-1)+shiftList, (elCount-15*(pageNumber-1))+count+shiftList);
			blockCount=count;
		}
	}
	else if (count<blockCount) {
		if (pageNumber>=((elCount+shiftList)/15+1)) {
			canvas.innerHTML = '';
			footer.innerHTML = '';
			blockCount=count;
			drawPage(0,count);
		}
		else {
			canvas.innerHTML = '';
			footer.innerHTML = '';
			drawPage (elCount-15*(pageNumber-1)+shiftList, (elCount-15*(pageNumber-1))+count+shiftList);
			blockCount=count;
		}
	};
});

footer.addEventListener('click', function(e) {
	if(e.target.className==='rightPage') pageRight();
	if(e.target.className==='leftPage') pageLeft();
});

canvas.addEventListener('mousedown', function(e) {
	swipe.mouseDown = true;
	swipe.tmpX = e.pageX;
	swipe.tmpY = e.pageY;
});
canvas.addEventListener('mouseup', function(e) {
	if(swipe.mouseDown) {
		var deltaX = e.pageX-swipe.tmpX;
		var deltaY = e.pageY-swipe.tmpY;
		if(deltaX > 150 && deltaX > Math.abs(2*deltaY)) pageRight();
		if(deltaX < 150 && Math.abs(deltaX) > Math.abs(2*deltaY)) pageLeft();
		swipe.mouseDown=false;
	};
});

canvas.addEventListener('touchstart', function(e) {
	swipe.mouseDown = true;
	swipe.tmpX = e.touches[0].pageX;
	swipe.tmpY = e.touches[0].pageY;
});
canvas.addEventListener('touchmove', function(e) {
	if(swipe.mouseDown) {
		var deltaX = e.touches[0].pageX-swipe.tmpX;
		var deltaY = e.touches[0].pageY-swipe.tmpY;
		if(deltaX > 20 && deltaX > Math.abs(2*deltaY)) pageRight();
		if(deltaX < 20 && Math.abs(deltaX) > Math.abs(2*deltaY)) pageLeft();
		swipe.mouseDown=false;
	};
});

function pageRight() {
	elCount+=blockCount;
	if(elCount+blockCount>pageNumber*15-shiftList) {
		if(elCount!==pageNumber*15-shiftList) shiftList=pageNumber*15-elCount;
		clipList = [];
		canvas.innerHTML = '';
		footer.innerHTML = '';
		scriptRequest('http://gdata.youtube.com/feeds/api/videos/', elCount+1, searchBar.value, convertYouTubeResponseToClipList, 0, blockCount, 'right');
		pageNumber++;
	}
	else {
		canvas.innerHTML = '';
		footer.innerHTML = '';
		drawPage (elCount-15*(pageNumber-1)+shiftList, (elCount-15*(pageNumber-1))+blockCount+shiftList, 'right');
	}
};

function pageLeft() {
	if (elCount>0) {
		elCount-=blockCount;
		if (elCount-15*(pageNumber-1)+shiftList<0) {
			var tmp = parseInt(15/blockCount);
			var tmp2;
			canvas.innerHTML = '';
			footer.innerHTML = '';
			clipList = [];
			if(elCount<0) tmp2=1;
			else tmp2 = 15*(pageNumber-1)-blockCount*tmp-shiftList+1;
			pageNumber--;
			if(elCount+2*blockCount) shiftList=15*(pageNumber-1)-tmp2+1;
			scriptRequest('http://gdata.youtube.com/feeds/api/videos/', tmp2, searchBar.value, convertYouTubeResponseToClipList, tmp2-1+(tmp-1)*blockCount-(pageNumber-1)*15+shiftList, tmp2-1+(tmp-1)*blockCount+blockCount-(pageNumber-1)*15+shiftList);
		}
		else {
			canvas.innerHTML = '';
			footer.innerHTML = '';
			drawPage (elCount-15*(pageNumber-1)+shiftList, (elCount-15*(pageNumber-1))+blockCount+shiftList);
		}
	}
};
canvas.addEventListener('webkitAnimationEnd', function (e) {
	if (e.animationName == 'left'||'right') {
		e.target.style.opacity = '1';
	}
});

canvas.addEventListener('animationend', function (e) {
	if (e.animationName == 'display'||'right') {
		e.target.style.opacity = '1';
	}
});